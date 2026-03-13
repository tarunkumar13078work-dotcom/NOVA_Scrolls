import React, { createContext, useCallback, useEffect, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import localAdapter from '../services/localAdapter';
import {
  enqueueOfflineAction,
  flushOfflineQueue,
  readSnapshotCache,
  writeSnapshotCache,
} from '../services/offlineSync';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

type Status = 'reading' | 'completed' | 'on-hold' | 'dropped' | 'planning' | string;

type GenericRecord = Record<string, unknown>;

interface ManhwaItem extends GenericRecord {
  _id: string;
  title: string;
  cover?: string;
  totalChapters?: number;
  currentChapter?: number;
  status?: Status;
  updatedAt?: string;
  favorite?: boolean;
  tags?: string[];
  collection?: string;
  unread?: number;
}

interface UpdateItem extends GenericRecord {
  id?: string;
  _id?: string;
  manhwaId: string;
  title?: string;
  cover?: string;
  currentChapter?: number;
  latestChapter?: number;
  unread?: number;
  lastChecked?: string;
}

interface AnalyticsSnapshot extends GenericRecord {
  totalChaptersRead: number;
  readingStreak: number;
  favoriteGenres: string[];
  completionRate: number;
  readingSpeed: number;
  chaptersPerWeek: number;
  dailySeries: Array<{ date: string; chaptersRead: number }>;
  heatmap: Array<{ date: string; chaptersRead: number }>;
}

interface AiRecommendation extends GenericRecord {
  title: string;
  tags: string[];
  reason: string;
  score?: number;
}

interface AiPrediction extends GenericRecord {
  title: string;
  remainingChapters: number;
  estimatedDays: number | null;
  insight: string;
}

interface LibrarySnapshot {
  manhwa: ManhwaItem[];
  updates: UpdateItem[];
  error: string | null;
}

interface StatsSummary {
  total: number;
  reading: number;
  completed: number;
  onHold: number;
  dropped: number;
}

interface ExportRecord {
  title: string;
  cover: string;
  totalChapters: number;
  currentChapter: number;
  latestChapter: number;
  status: string;
  favorite: boolean;
  collection: string;
  tags: string[];
}

interface ImportRecord extends ExportRecord {}

interface DataContextValue {
  manhwa: ManhwaItem[];
  updates: UpdateItem[];
  stats: StatsSummary;
  loading: boolean;
  error: string | null;
  analytics: AnalyticsSnapshot | null;
  aiRecommendations: AiRecommendation[];
  aiPredictions: AiPrediction[];
  aiReadingSpeed: number;
  refresh: () => Promise<unknown>;
  addManhwa: (payload: GenericRecord) => Promise<unknown>;
  updateProgress: (manhwaId: string, currentChapter: number) => Promise<unknown>;
  markAsRead: (manhwaId: string) => Promise<unknown>;
  toggleFavorite: (manhwaId: string, favorite: boolean) => Promise<unknown>;
  aiAutofillMetadata: (url: string) => Promise<GenericRecord | null>;
  exportLibraryJSON: () => void;
  exportLibraryCSV: () => void;
  importLibraryJSON: (fileText: string) => Promise<void>;
  importLibraryCSV: (fileText: string) => Promise<void>;
  importLibraryBackup: (payload: { fileText: string; fileName?: string }) => Promise<void>;
}

type ApiErrorLike = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

const hasApiResponse = (error: unknown): error is ApiErrorLike =>
  typeof error === 'object' && error !== null && 'response' in error;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (hasApiResponse(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
};

const demoManhwa: ManhwaItem[] = [
  {
    _id: 'demo-orion',
    title: 'Orion Drift',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    totalChapters: 120,
    currentChapter: 58,
    status: 'reading',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-aether',
    title: 'Aether Bloom',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    totalChapters: 86,
    currentChapter: 86,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-void',
    title: 'Voidwalkers',
    cover: 'https://images.unsplash.com/photo-1447430617419-95715602278e?auto=format&fit=crop&w=600&q=80',
    totalChapters: 45,
    currentChapter: 10,
    status: 'on-hold',
    updatedAt: new Date().toISOString(),
  },
];

const demoUpdates: UpdateItem[] = [
  {
    id: 'upd-orion',
    manhwaId: 'demo-orion',
    title: 'Orion Drift',
    cover: demoManhwa[0].cover,
    currentChapter: 58,
    latestChapter: 61,
    unread: 3,
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'upd-void',
    manhwaId: 'demo-void',
    title: 'Voidwalkers',
    cover: demoManhwa[2].cover,
    currentChapter: 10,
    latestChapter: 14,
    unread: 4,
    lastChecked: new Date().toISOString(),
  },
];

const localAiCatalog: AiRecommendation[] = [
  { title: 'Return of the Mount Hua Sect', tags: ['Murim', 'Action'], reason: 'High overlap with your Murim and Action interests' },
  { title: 'Omniscient Reader', tags: ['System', 'Regression', 'Action'], reason: 'Strong match for System/Regression taste' },
  { title: 'Legend of the Northern Blade', tags: ['Murim', 'Action'], reason: 'Recommended for martial arc pacing' },
  { title: 'Villains Are Destined to Die', tags: ['Romance', 'Fantasy'], reason: 'Adds Romance-Fantasy variety to your library' },
  { title: 'The Beginning After the End', tags: ['Fantasy', 'Action'], reason: 'Top fit for Fantasy progression arcs' },
];

const DataContext = createContext<DataContextValue | null>(null);

const toExportRecord = (item: ManhwaItem): ExportRecord => ({
  title: item.title || '',
  cover: item.cover || '',
  totalChapters: Number(item.totalChapters) || 0,
  currentChapter: Number(item.currentChapter) || 0,
  latestChapter: Number(item.currentChapter || item.totalChapters) || 0,
  status: String(item.status || 'reading'),
  favorite: Boolean(item.favorite),
  collection: String(item.collection || ''),
  tags: Array.isArray(item.tags) ? item.tags : [],
});

const normalizeImportRecord = (item: GenericRecord): ImportRecord => ({
  title: String(item.title || '').trim(),
  cover: String(item.cover || '').trim(),
  totalChapters: Number(item.totalChapters) || 0,
  currentChapter: Number(item.currentChapter) || 0,
  latestChapter: Number(item.latestChapter ?? item.currentChapter ?? item.totalChapters) || 0,
  status: String(item.status || 'reading'),
  favorite: Boolean(item.favorite),
  collection: String(item.collection || '').trim(),
  tags: Array.isArray(item.tags)
    ? item.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(item.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
});

const downloadTextFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const parseCsvRows = (csvText: string): GenericRecord[] => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let idx = 0; idx < line.length; idx += 1) {
      const char = line[idx];
      if (char === '"') {
        if (inQuotes && line[idx + 1] === '"') {
          current += '"';
          idx += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  };

  const headers = parseLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers.reduce<GenericRecord>((acc, header, idx) => {
      acc[header] = values[idx] ?? '';
      return acc;
    }, {});
  });
};

const mergeData = (manhwaList: ManhwaItem[], progressList: GenericRecord[], updatesList: UpdateItem[]): ManhwaItem[] => {
  const progressMap = Object.fromEntries(progressList.map((p) => [String(p.manhwaId || ''), p]));
  const updateMap = Object.fromEntries(updatesList.map((u) => [String(u.manhwaId || u.id || ''), u]));

  return manhwaList.map((item) => {
    const id = String(item._id || '');
    const progress = (progressMap[id] || { currentChapter: 0 }) as GenericRecord;
    const update = updateMap[id];
    const unread = update ? Math.max(0, Number(update.latestChapter || 0) - Number(progress.currentChapter || 0)) : 0;
    return {
      ...item,
      currentChapter: Number(progress.currentChapter) || 0,
      unread,
    };
  });
};

const fetchLibrarySnapshot = async ({ token, user, useLocal }: { token: string | null; user: GenericRecord | null; useLocal: boolean }): Promise<LibrarySnapshot> => {
  const userId = String(user?.id || user?._id || '');
  if (!token || !userId) {
    return { manhwa: [], updates: [], error: null };
  }

  try {
    if (useLocal) {
      const snapshot = await localAdapter.getAllForUser(userId);
      const merged = mergeData(snapshot.manhwas, snapshot.progresses, snapshot.updates);
      const unread = await localAdapter.getUnreadUpdates(userId);
      const localSnapshot = { manhwa: merged, updates: unread, error: null };
      writeSnapshotCache(userId, localSnapshot);
      return localSnapshot;
    }

    const [manhwaRes, progressRes, updatesRes] = await Promise.all([
      api.get('/manhwa'),
      api.get('/progress'),
      api.get('/updates'),
    ]);
    const merged = mergeData(manhwaRes.data, progressRes.data, updatesRes.data);
    const liveSnapshot = { manhwa: merged, updates: updatesRes.data, error: null };
    writeSnapshotCache(userId, liveSnapshot);
    return liveSnapshot;
  } catch (_err) {
    const cached = readSnapshotCache(userId);
    if (cached) {
      return {
        ...cached,
        error: 'Offline mode active. Using cached library snapshot.',
      } as LibrarySnapshot;
    }

    return {
      manhwa: mergeData(demoManhwa, [], demoUpdates),
      updates: demoUpdates,
      error: 'Live data unreachable. Showing offline demo.',
    };
  }
};

const fetchAnalyticsSnapshot = async ({ token, user, useLocal, manhwa }: { token: string | null; user: GenericRecord | null; useLocal: boolean; manhwa: ManhwaItem[] }): Promise<AnalyticsSnapshot | null> => {
  const userId = String(user?.id || user?._id || '');
  if (!token || !userId) {
    return null;
  }

  if (useLocal) {
    return localAdapter.getStatsOverview(userId);
  }

  try {
    const { data } = await api.get('/stats/overview');
    return data;
  } catch (_error) {
    const completed = manhwa.filter((item) => item.status === 'completed').length;
    return {
      totalChaptersRead: manhwa.reduce((sum, item) => sum + (item.currentChapter || 0), 0),
      readingStreak: 0,
      favoriteGenres: [],
      completionRate: manhwa.length ? Math.round((completed / manhwa.length) * 100) : 0,
      readingSpeed: 0,
      chaptersPerWeek: 0,
      dailySeries: [],
      heatmap: [],
    };
  }
};

const inferMetadataFromUrl = (url: string): GenericRecord => {
  try {
    const pathname = new URL(url).pathname;
    const slug = pathname.split('/').filter(Boolean).pop() || '';
    const title = slug
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
    return {
      title: title || 'Untitled Manhwa',
      cover: '',
      totalChapters: 0,
      latestChapter: 0,
      description: 'Autofilled using URL structure.',
    };
  } catch (_error) {
    return {
      title: 'Untitled Manhwa',
      cover: '',
      totalChapters: 0,
      latestChapter: 0,
      description: 'Autofilled using URL structure.',
    };
  }
};

const buildLocalRecommendations = (manhwa: ManhwaItem[]): AiRecommendation[] => {
  const existing = new Set(manhwa.map((item) => item.title.toLowerCase()));
  const tagWeight = new Map<string, number>();
  manhwa.forEach((item) => {
    (item.tags || []).forEach((tag) => tagWeight.set(tag, (tagWeight.get(tag) || 0) + 1));
  });

  return localAiCatalog
    .filter((item) => !existing.has(item.title.toLowerCase()))
    .map((item) => ({
      ...item,
      score: item.tags.reduce((sum, tag) => sum + (tagWeight.get(tag) || 0), 0),
    }))
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 6);
};

const buildLocalPredictions = ({ manhwa, analytics }: { manhwa: ManhwaItem[]; analytics: AnalyticsSnapshot | null }): { readingSpeed: number; predictions: AiPrediction[] } => {
  const speed = Math.max(0, Number(analytics?.readingSpeed) || 0);
  const list: AiPrediction[] = manhwa
    .filter((item) => ['reading', 'planning', 'on-hold'].includes(String(item.status || '')))
    .map((item) => {
      const remainingChapters = Math.max(0, (item.totalChapters || 0) - (item.currentChapter || 0));
      if (remainingChapters === 0) {
        return {
          title: item.title,
          remainingChapters,
          estimatedDays: 0,
          insight: 'Already completed',
        };
      }
      if (speed <= 0) {
        return {
          title: item.title,
          remainingChapters,
          estimatedDays: null,
          insight: 'Need more reading data for prediction',
        };
      }
      const estimatedDays = Math.max(1, Math.ceil(remainingChapters / speed));
      return {
        title: item.title,
        remainingChapters,
        estimatedDays,
        insight: `Finish in about ${estimatedDays} day${estimatedDays > 1 ? 's' : ''}`,
      };
    })
    .sort((a, b) => {
      if (a.estimatedDays === null) return 1;
      if (b.estimatedDays === null) return -1;
      return a.estimatedDays - b.estimatedDays;
    })
    .slice(0, 8);

  return {
    readingSpeed: speed,
    predictions: list,
  };
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const useLocal = import.meta.env.VITE_USE_LOCAL === '1';
  const queryClient = useQueryClient();
  const userId = String(user?.id || user?._id || '');
  const queryKey = ['library-snapshot', userId, useLocal] as const;

  const libraryQuery = useQuery({
    queryKey,
    enabled: Boolean(token && userId),
    queryFn: () => fetchLibrarySnapshot({ token, user, useLocal }),
  });

  const manhwa = libraryQuery.data?.manhwa || [];
  const updates = libraryQuery.data?.updates || [];
  const error = libraryQuery.data?.error || null;
  const loading = libraryQuery.isLoading || libraryQuery.isFetching;

  const analyticsQuery = useQuery({
    queryKey: ['analytics-overview', userId, useLocal, manhwa.length],
    enabled: Boolean(token && userId),
    queryFn: () => fetchAnalyticsSnapshot({ token, user, useLocal, manhwa }),
  });

  const aiRecommendationsQuery = useQuery({
    queryKey: ['ai-recommendations', userId, useLocal, manhwa.length],
    enabled: Boolean(token && userId),
    queryFn: async () => {
      if (useLocal) {
        return { recommendations: buildLocalRecommendations(manhwa) };
      }
      const { data } = await api.get('/ai/recommendations');
      return data;
    },
  });

  const aiPredictionsQuery = useQuery({
    queryKey: ['ai-predictions', userId, useLocal, manhwa.length, analyticsQuery.data?.readingSpeed || 0],
    enabled: Boolean(token && userId),
    queryFn: async () => {
      if (useLocal) {
        return buildLocalPredictions({ manhwa, analytics: analyticsQuery.data || null });
      }
      const { data } = await api.get('/ai/predictions');
      return data;
    },
  });

  const applyOptimisticProgress = useCallback(
    (manhwaId: string, currentChapter: number) => {
      queryClient.setQueryData<LibrarySnapshot | undefined>(queryKey, (prev) => {
        if (!prev) return prev;
        const nextManhwa = prev.manhwa.map((item) =>
          item._id === manhwaId
            ? {
                ...item,
                currentChapter,
                unread: Math.max(0, (item.unread || 0) - Math.max(0, currentChapter - (item.currentChapter || 0))),
                updatedAt: new Date().toISOString(),
              }
            : item
        );
        const nextUpdates = prev.updates
          .map((u) =>
            u.manhwaId === manhwaId
              ? { ...u, currentChapter, unread: Math.max(0, (u.latestChapter || 0) - currentChapter) }
              : u
          )
          .filter((u) => (u.unread || 0) > 0);
        return { ...prev, manhwa: nextManhwa, updates: nextUpdates };
      });
    },
    [queryClient, queryKey]
  );

  const applyOptimisticMarkAsRead = useCallback(
    (manhwaId: string) => {
      queryClient.setQueryData<LibrarySnapshot | undefined>(queryKey, (prev) => {
        if (!prev) return prev;
        const targetUpdate = prev.updates.find((u) => u.manhwaId === manhwaId);
        if (!targetUpdate) return prev;
        const latestChapter = targetUpdate.latestChapter || 0;
        const nextManhwa = prev.manhwa.map((item) =>
          item._id === manhwaId
            ? { ...item, currentChapter: latestChapter, unread: 0, updatedAt: new Date().toISOString() }
            : item
        );
        const nextUpdates = prev.updates
          .map((u) => (u.manhwaId === manhwaId ? { ...u, currentChapter: latestChapter, unread: 0 } : u))
          .filter((u) => (u.unread || 0) > 0);
        return { ...prev, manhwa: nextManhwa, updates: nextUpdates };
      });
    },
    [queryClient, queryKey]
  );

  const applyOptimisticFavorite = useCallback(
    (manhwaId: string, favorite: boolean) => {
      queryClient.setQueryData<LibrarySnapshot | undefined>(queryKey, (prev) => {
        if (!prev) return prev;
        const nextManhwa = prev.manhwa.map((item) =>
          item._id === manhwaId ? { ...item, favorite, updatedAt: new Date().toISOString() } : item
        );
        return { ...prev, manhwa: nextManhwa };
      });
    },
    [queryClient, queryKey]
  );

  const invalidateLibrary = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const syncQueuedActions = useCallback(async () => {
    if (!userId || useLocal || !navigator.onLine) return;

    const executor = async (action: { type: string; payload: GenericRecord }) => {
      if (action.type === 'updateProgress') {
        await api.put(`/progress/${String(action.payload.manhwaId || '')}`, {
          currentChapter: Number(action.payload.currentChapter) || 0,
        });
        return;
      }
      if (action.type === 'markAsRead') {
        await api.put(`/updates/${String(action.payload.manhwaId || '')}/read`);
        return;
      }
      if (action.type === 'toggleFavorite') {
        await api.put(`/manhwa/${String(action.payload.manhwaId || '')}`, {
          favorite: Boolean(action.payload.favorite),
        });
      }
    };

    const { flushed } = await flushOfflineQueue(userId, executor);
    if (flushed > 0) {
      addToast(`Synced ${flushed} offline change${flushed > 1 ? 's' : ''}.`, 'success');
      await invalidateLibrary();
    }
  }, [addToast, invalidateLibrary, useLocal, userId]);

  useEffect(() => {
    const onOnline = () => {
      syncQueuedActions().catch(() => null);
    };
    window.addEventListener('online', onOnline);
    syncQueuedActions().catch(() => null);
    return () => window.removeEventListener('online', onOnline);
  }, [syncQueuedActions]);

  const addManhwaMutation = useMutation({
    mutationFn: async (payload: GenericRecord) => {
      if (useLocal) {
        await localAdapter.addManhwa(userId, payload);
        return;
      }
      await api.post('/manhwa', payload);
    },
    onSuccess: async () => {
      addToast('Manhwa added to your hangar.', 'success');
      await invalidateLibrary();
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, 'Could not add manhwa');
      addToast(message, 'error');
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ manhwaId, currentChapter }: { manhwaId: string; currentChapter: number }) => {
      if (useLocal) {
        await localAdapter.updateProgress(userId, manhwaId, currentChapter);
        return;
      }

      if (!navigator.onLine) {
        enqueueOfflineAction(userId, { type: 'updateProgress', payload: { manhwaId, currentChapter } });
        applyOptimisticProgress(manhwaId, currentChapter);
        return;
      }

      try {
        await api.put(`/progress/${manhwaId}`, { currentChapter });
      } catch (error: unknown) {
        if (!hasApiResponse(error)) {
          enqueueOfflineAction(userId, { type: 'updateProgress', payload: { manhwaId, currentChapter } });
          applyOptimisticProgress(manhwaId, currentChapter);
          return;
        }
        throw error;
      }
    },
    onSuccess: async () => {
      addToast('Progress updated.', 'success');
      await invalidateLibrary();
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, 'Could not update progress');
      addToast(message, 'error');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (manhwaId: string) => {
      if (useLocal) {
        await localAdapter.markAsRead(userId, manhwaId);
        return;
      }

      if (!navigator.onLine) {
        enqueueOfflineAction(userId, { type: 'markAsRead', payload: { manhwaId } });
        applyOptimisticMarkAsRead(manhwaId);
        return;
      }

      try {
        await api.put(`/updates/${manhwaId}/read`);
      } catch (error: unknown) {
        if (!hasApiResponse(error)) {
          enqueueOfflineAction(userId, { type: 'markAsRead', payload: { manhwaId } });
          applyOptimisticMarkAsRead(manhwaId);
          return;
        }
        throw error;
      }
    },
    onSuccess: async () => {
      addToast('Synced to latest chapter.', 'success');
      await invalidateLibrary();
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, 'Could not mark as read');
      addToast(message, 'error');
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ manhwaId, favorite }: { manhwaId: string; favorite: boolean }) => {
      if (useLocal) {
        await localAdapter.updateManhwa(userId, manhwaId, { favorite });
        return;
      }

      if (!navigator.onLine) {
        enqueueOfflineAction(userId, { type: 'toggleFavorite', payload: { manhwaId, favorite } });
        applyOptimisticFavorite(manhwaId, favorite);
        return;
      }

      try {
        await api.put(`/manhwa/${manhwaId}`, { favorite });
      } catch (error: unknown) {
        if (!hasApiResponse(error)) {
          enqueueOfflineAction(userId, { type: 'toggleFavorite', payload: { manhwaId, favorite } });
          applyOptimisticFavorite(manhwaId, favorite);
          return;
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await invalidateLibrary();
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, 'Could not update favorite status');
      addToast(message, 'error');
    },
  });

  const analytics = analyticsQuery.data || null;

  const addManhwa = async (payload: GenericRecord) => addManhwaMutation.mutateAsync(payload);
  const updateProgress = async (manhwaId: string, currentChapter: number) =>
    updateProgressMutation.mutateAsync({ manhwaId, currentChapter });
  const markAsRead = async (manhwaId: string) => markAsReadMutation.mutateAsync(manhwaId);
  const toggleFavorite = async (manhwaId: string, favorite: boolean) =>
    toggleFavoriteMutation.mutateAsync({ manhwaId, favorite });
  const refresh = async () => libraryQuery.refetch();

  const aiAutofillMetadata = useCallback(
    async (url: string) => {
      if (!url) return null;
      if (useLocal) {
        return inferMetadataFromUrl(url);
      }
      const { data } = await api.post('/ai/metadata-from-url', { url });
      return data;
    },
    [useLocal]
  );

  const exportLibraryJSON = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      count: manhwa.length,
      items: manhwa.map(toExportRecord),
    };
    downloadTextFile('nova-scrolls-library.json', JSON.stringify(payload, null, 2), 'application/json');
    addToast('JSON backup exported.', 'success');
  }, [addToast, manhwa]);

  const exportLibraryCSV = useCallback(() => {
    const header = [
      'title',
      'cover',
      'totalChapters',
      'currentChapter',
      'latestChapter',
      'status',
      'favorite',
      'collection',
      'tags',
    ];
    const rows = manhwa.map((item) => {
      const record = toExportRecord(item);
      return [
        record.title,
        record.cover,
        record.totalChapters,
        record.currentChapter,
        record.latestChapter,
        record.status,
        record.favorite,
        record.collection,
        record.tags.join('|'),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    downloadTextFile('nova-scrolls-library.csv', csv, 'text/csv;charset=utf-8;');
    addToast('CSV backup exported.', 'success');
  }, [addToast, manhwa]);

  const importRecords = useCallback(
    async (rawItems: GenericRecord[]) => {
      if (!Array.isArray(rawItems) || !rawItems.length) {
        addToast('No importable records found.', 'error');
        return;
      }

      const records = rawItems.map(normalizeImportRecord).filter((item) => item.title);
      if (!records.length) {
        addToast('No valid records after validation.', 'error');
        return;
      }

      for (const record of records) {
        if (useLocal) {
          await localAdapter.addManhwa(userId, record);
        } else {
          await api.post('/manhwa', record);
        }
      }

      await invalidateLibrary();
      addToast(`Imported ${records.length} title${records.length > 1 ? 's' : ''}.`, 'success');
    },
    [addToast, invalidateLibrary, useLocal, userId]
  );

  const importLibraryJSON = useCallback(
    async (fileText: string) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(fileText);
      } catch (_error) {
        addToast('Invalid JSON file.', 'error');
        return;
      }

      const parsedRecord = parsed as GenericRecord | GenericRecord[];
      const rawItems = Array.isArray(parsedRecord) ? parsedRecord : (parsedRecord?.items as GenericRecord[]);
      await importRecords(rawItems);
    },
    [addToast, importRecords]
  );

  const importLibraryCSV = useCallback(
    async (fileText: string) => {
      const rows = parseCsvRows(fileText).map((row) => ({
        ...row,
        tags: String(row.tags || '')
          .split('|')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }));
      await importRecords(rows);
    },
    [importRecords]
  );

  const importLibraryBackup = useCallback(
    async ({ fileText, fileName = '' }: { fileText: string; fileName?: string }) => {
      const lower = fileName.toLowerCase();
      if (lower.endsWith('.csv')) {
        await importLibraryCSV(fileText);
        return;
      }
      await importLibraryJSON(fileText);
    },
    [importLibraryCSV, importLibraryJSON]
  );

  const stats = useMemo<StatsSummary>(() => {
    const total = manhwa.length;
    const reading = manhwa.filter((m) => m.status === 'reading').length;
    const completed = manhwa.filter((m) => m.status === 'completed').length;
    const onHold = manhwa.filter((m) => m.status === 'on-hold').length;
    const dropped = manhwa.filter((m) => m.status === 'dropped').length;
    return { total, reading, completed, onHold, dropped };
  }, [manhwa]);

  const aiRecommendations = (aiRecommendationsQuery.data?.recommendations || []) as AiRecommendation[];
  const aiPredictions = (aiPredictionsQuery.data?.predictions || []) as AiPrediction[];
  const aiReadingSpeed = Number(aiPredictionsQuery.data?.readingSpeed || 0);

  const value = useMemo<DataContextValue>(
    () => ({
      manhwa,
      updates,
      stats,
      loading,
      error,
      analytics,
      aiRecommendations,
      aiPredictions,
      aiReadingSpeed,
      refresh,
      addManhwa,
      updateProgress,
      markAsRead,
      toggleFavorite,
      aiAutofillMetadata,
      exportLibraryJSON,
      exportLibraryCSV,
      importLibraryJSON,
      importLibraryCSV,
      importLibraryBackup,
    }),
    [
      addManhwa,
      analytics,
      aiAutofillMetadata,
      aiPredictions,
      aiReadingSpeed,
      aiRecommendations,
      error,
      exportLibraryCSV,
      exportLibraryJSON,
      importLibraryBackup,
      importLibraryCSV,
      importLibraryJSON,
      loading,
      manhwa,
      markAsRead,
      refresh,
      stats,
      toggleFavorite,
      updates,
      updateProgress,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = (): DataContextValue | null => useContext(DataContext);
