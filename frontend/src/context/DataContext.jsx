import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import localAdapter from '../services/localAdapter.js';
import useToast from '../hooks/useToast.js';
import useAuth from '../hooks/useAuth.js';

const demoManhwa = [
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

const demoUpdates = [
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

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const useLocal = import.meta.env.VITE_USE_LOCAL === '1';

  const [manhwa, setManhwa] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mergeData = useCallback((manhwaList, progressList, updatesList) => {
    const progressMap = Object.fromEntries(
      progressList.map((p) => [p.manhwaId?.toString?.() || p.manhwaId, p])
    );
    const updateMap = Object.fromEntries(
      updatesList.map((u) => [u.manhwaId?.toString?.() || u.id, u])
    );

    return manhwaList.map((item) => {
      const id = item._id?.toString?.() || item._id;
      const progress = progressMap[id] || { currentChapter: 0 };
      const update = updateMap[id];
      const unread = update ? Math.max(0, (update.latestChapter || 0) - (progress.currentChapter || 0)) : 0;
      return {
        ...item,
        currentChapter: progress.currentChapter || 0,
        unread,
      };
    });
  }, []);

  const fetchAll = useCallback(async () => {
    const userId = user?.id || user?._id;
    if (!token || !userId) {
      setManhwa([]);
      setUpdates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (useLocal) {
        const snapshot = await localAdapter.getAllForUser(userId);
        const merged = mergeData(snapshot.manhwas, snapshot.progresses, snapshot.updates);
        const unread = await localAdapter.getUnreadUpdates(userId);
        setManhwa(merged);
        setUpdates(unread);
      } else {
        const [manhwaRes, progressRes, updatesRes] = await Promise.all([
          api.get('/manhwa'),
          api.get('/progress'),
          api.get('/updates'),
        ]);

        const merged = mergeData(manhwaRes.data, progressRes.data, updatesRes.data);
        setManhwa(merged);
        setUpdates(updatesRes.data);
      }
    } catch (err) {
      setError('Live data unreachable. Showing offline demo.');
      setManhwa(mergeData(demoManhwa, [], demoUpdates));
      setUpdates(demoUpdates);
    } finally {
      setLoading(false);
    }
  }, [mergeData, token, useLocal, user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, token]);

  const addManhwa = useCallback(
    async (payload) => {
      try {
        if (useLocal) {
          const userId = user?.id || user?._id;
          await localAdapter.addManhwa(userId, payload);
        } else {
          await api.post('/manhwa', payload);
        }
        addToast('Manhwa added to your hangar.', 'success');
        await fetchAll();
      } catch (err) {
        const message = err?.response?.data?.message || 'Could not add manhwa';
        addToast(message, 'error');
        throw err;
      }
    },
    [addToast, fetchAll, useLocal, user]
  );

  const updateProgress = useCallback(
    async (manhwaId, currentChapter) => {
      try {
        if (useLocal) {
          const userId = user?.id || user?._id;
          await localAdapter.updateProgress(userId, manhwaId, currentChapter);
        } else {
          await api.put(`/progress/${manhwaId}`, { currentChapter });
        }
        addToast('Progress updated.', 'success');
        await fetchAll();
      } catch (err) {
        const message = err?.response?.data?.message || 'Could not update progress';
        addToast(message, 'error');
      }
    },
    [addToast, fetchAll, useLocal, user]
  );

  const markAsRead = useCallback(
    async (manhwaId) => {
      try {
        if (useLocal) {
          const userId = user?.id || user?._id;
          await localAdapter.markAsRead(userId, manhwaId);
        } else {
          await api.put(`/updates/${manhwaId}/read`);
        }
        addToast('Synced to latest chapter.', 'success');
        await fetchAll();
      } catch (err) {
        const message = err?.response?.data?.message || 'Could not mark as read';
        addToast(message, 'error');
      }
    },
    [addToast, fetchAll, useLocal, user]
  );

  const stats = useMemo(() => {
    const total = manhwa.length;
    const reading = manhwa.filter((m) => m.status === 'reading').length;
    const completed = manhwa.filter((m) => m.status === 'completed').length;
    const onHold = manhwa.filter((m) => m.status === 'on-hold').length;
    const dropped = manhwa.filter((m) => m.status === 'dropped').length;
    return { total, reading, completed, onHold, dropped };
  }, [manhwa]);

  const value = useMemo(
    () => ({
      manhwa,
      updates,
      stats,
      loading,
      error,
      refresh: fetchAll,
      addManhwa,
      updateProgress,
      markAsRead,
    }),
    [addManhwa, error, fetchAll, loading, manhwa, markAsRead, stats, updates, updateProgress]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => useContext(DataContext);
