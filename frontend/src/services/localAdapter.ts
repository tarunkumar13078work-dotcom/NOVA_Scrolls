const STORAGE_KEY = 'nova_local_v1';

type ID = string;

type Status = 'reading' | 'completed' | 'on-hold' | 'dropped' | 'planning' | string;

interface LocalUser {
  _id: ID;
  username: string;
  password: string;
  createdAt: string;
}

interface PublicUser {
  id: ID;
  username: string;
  createdAt: string;
}

interface SessionState {
  token: string;
  userId: ID;
}

interface ManhwaRecord {
  _id: ID;
  userId: ID;
  title: string;
  cover: string;
  totalChapters: number;
  status: Status;
  favorite: boolean;
  tags: string[];
  collection: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgressRecord {
  _id: ID;
  userId: ID;
  manhwaId: ID;
  currentChapter: number;
  createdAt: string;
  updatedAt: string;
}

interface UpdateRecord {
  _id: ID;
  userId: ID;
  manhwaId: ID;
  latestChapter: number;
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityRecord {
  _id: ID;
  userId: ID;
  date: string;
  chaptersRead: number;
}

interface LocalState {
  users: LocalUser[];
  manhwas: ManhwaRecord[];
  progresses: ProgressRecord[];
  updates: UpdateRecord[];
  activities: ActivityRecord[];
  session: SessionState | null;
}

interface AuthPayload {
  username: string;
  password: string;
}

interface AddManhwaPayload {
  title: string;
  cover?: string;
  totalChapters?: number;
  currentChapter?: number;
  latestChapter?: number;
  status?: Status;
  favorite?: boolean;
  tags?: string[];
  collection?: string;
}

interface UpdateManhwaPayload {
  title?: string;
  cover?: string;
  totalChapters?: number;
  status?: Status;
  favorite?: boolean;
  tags?: string[];
  collection?: string;
}

interface UnreadUpdate {
  id: string;
  manhwaId: string;
  title: string;
  cover: string;
  currentChapter: number;
  latestChapter: number;
  unread: number;
  lastChecked: string;
}

interface GenreStat {
  name: string;
  count: number;
}

interface HeatmapPoint {
  date: string;
  count: number;
  intensity: number;
}

interface DailySeriesPoint {
  date: string;
  chapters: number;
}

interface StatsOverview {
  totalChaptersRead: number;
  readingStreak: number;
  favoriteGenres: GenreStat[];
  completionRate: number;
  readingSpeed: number;
  chaptersPerWeek: number;
  dailySeries: DailySeriesPoint[];
  heatmap: HeatmapPoint[];
}

const defaultState: LocalState = {
  users: [],
  manhwas: [],
  progresses: [],
  updates: [],
  activities: [],
  session: null,
};

const uuid = () =>
  crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const load = (): LocalState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    return { ...defaultState, ...parsed };
  } catch (err) {
    console.error('localAdapter load failed', err);
    return { ...defaultState };
  }
};

const save = (state: LocalState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const findSessionUser = (state: LocalState): LocalUser | null => {
  const token = state.session?.token || localStorage.getItem('nova_token');
  if (!token) return null;
  const userId = state.session?.userId;
  if (!userId) return null;
  return state.users.find((u) => u._id === userId) || null;
};

const toPublicUser = (user: LocalUser): PublicUser => ({
  id: user._id,
  username: user.username,
  createdAt: user.createdAt,
});

const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const recordActivity = (state: LocalState, userId: string, chaptersRead: number) => {
  const safeDelta = Number(chaptersRead) || 0;
  if (safeDelta <= 0) return;

  const today = dateKey();
  const existing = state.activities.find((item) => item.userId === userId && item.date === today);
  if (existing) {
    existing.chaptersRead += safeDelta;
    return;
  }
  state.activities.push({
    _id: uuid(),
    userId,
    date: today,
    chaptersRead: safeDelta,
  });
};

const registerUser = async ({ username, password }: AuthPayload) => {
  const state = load();
  if (!username || !password) {
    throw new Error('Username and password required');
  }
  const existing = state.users.find((u) => u.username === username);
  if (existing) {
    throw new Error('Username already taken');
  }
  const user: LocalUser = { _id: uuid(), username, password, createdAt: new Date().toISOString() };
  const token = `local-${user._id}`;
  state.users.push(user);
  state.session = { token, userId: user._id };
  save(state);
  localStorage.setItem('nova_token', token);
  return { user: toPublicUser(user), token };
};

const loginUser = async ({ username, password }: AuthPayload) => {
  const state = load();
  const user = state.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const token = `local-${user._id}`;
  state.session = { token, userId: user._id };
  save(state);
  localStorage.setItem('nova_token', token);
  return { user: toPublicUser(user), token };
};

const logoutUser = async () => {
  const state = load();
  state.session = null;
  save(state);
  localStorage.removeItem('nova_token');
};

const getMe = async () => {
  const state = load();
  const user = findSessionUser(state);
  if (!user) throw new Error('Not authenticated');
  return { user: toPublicUser(user) };
};

const listManhwa = async (userId: string) => {
  const state = load();
  return state.manhwas.filter((m) => m.userId === userId);
};

const listProgress = async (userId: string) => {
  const state = load();
  return state.progresses.filter((p) => p.userId === userId);
};

const listUpdates = async (userId: string) => {
  const state = load();
  return state.updates.filter((u) => u.userId === userId);
};

const addManhwa = async (userId: string, payload: AddManhwaPayload) => {
  const state = load();
  const manhwa: ManhwaRecord = {
    _id: uuid(),
    userId,
    title: payload.title,
    cover: payload.cover || '',
    totalChapters: Number(payload.totalChapters) || 0,
    status: payload.status || 'reading',
    favorite: Boolean(payload.favorite),
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    collection: payload.collection || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const progress: ProgressRecord = {
    _id: uuid(),
    userId,
    manhwaId: manhwa._id,
    currentChapter: Number(payload.currentChapter) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const update: UpdateRecord = {
    _id: uuid(),
    userId,
    manhwaId: manhwa._id,
    latestChapter: Number(payload.latestChapter) || Number(payload.totalChapters) || 0,
    lastChecked: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.manhwas.push(manhwa);
  state.progresses.push(progress);
  state.updates.push(update);
  save(state);
  return manhwa;
};

const updateProgress = async (userId: string, manhwaId: string, currentChapter: number) => {
  const state = load();
  const progress = state.progresses.find((p) => p.userId === userId && p.manhwaId === manhwaId);
  if (!progress) throw new Error('Progress not found');
  const previousChapter = progress.currentChapter || 0;
  progress.currentChapter = Number(currentChapter) || 0;
  progress.updatedAt = new Date().toISOString();
  recordActivity(state, userId, Math.max(0, progress.currentChapter - previousChapter));
  const update = state.updates.find((u) => u.userId === userId && u.manhwaId === manhwaId);
  if (update) {
    update.latestChapter = Math.max(update.latestChapter || 0, progress.currentChapter || 0);
    update.lastChecked = new Date().toISOString();
    update.updatedAt = new Date().toISOString();
  }
  save(state);
  return progress;
};

const markAsRead = async (userId: string, manhwaId: string) => {
  const state = load();
  const update = state.updates.find((u) => u.userId === userId && u.manhwaId === manhwaId);
  if (!update) throw new Error('Update not found');
  const progress = state.progresses.find((p) => p.userId === userId && p.manhwaId === manhwaId) || null;
  if (progress) {
    const previousChapter = progress.currentChapter || 0;
    progress.currentChapter = update.latestChapter || 0;
    progress.updatedAt = new Date().toISOString();
    recordActivity(state, userId, Math.max(0, progress.currentChapter - previousChapter));
  }
  update.lastChecked = new Date().toISOString();
  update.updatedAt = new Date().toISOString();
  save(state);
  return { progress, update };
};

const updateManhwa = async (userId: string, manhwaId: string, payload: UpdateManhwaPayload) => {
  const state = load();
  const manhwa = state.manhwas.find((m) => m.userId === userId && m._id === manhwaId);
  if (!manhwa) throw new Error('Manhwa not found');

  Object.assign(manhwa, {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.cover !== undefined ? { cover: payload.cover } : {}),
    ...(payload.totalChapters !== undefined ? { totalChapters: Number(payload.totalChapters) || 0 } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.favorite !== undefined ? { favorite: Boolean(payload.favorite) } : {}),
    ...(payload.tags !== undefined ? { tags: Array.isArray(payload.tags) ? payload.tags : [] } : {}),
    ...(payload.collection !== undefined ? { collection: payload.collection || '' } : {}),
    updatedAt: new Date().toISOString(),
  });

  save(state);
  return manhwa;
};

const getAllForUser = async (userId: string) => {
  const [manhwas, progresses, updates] = await Promise.all([listManhwa(userId), listProgress(userId), listUpdates(userId)]);
  return { manhwas, progresses, updates };
};

const getUnreadUpdates = async (userId: string): Promise<UnreadUpdate[]> => {
  const state = load();
  const manhwaMap = Object.fromEntries(state.manhwas.map((m) => [m._id, m]));
  const progressMap = Object.fromEntries(state.progresses.map((p) => [p.manhwaId, p]));
  return state.updates
    .filter((u) => u.userId === userId)
    .map((u) => {
      const manhwa = manhwaMap[u.manhwaId] || ({} as ManhwaRecord);
      const progress = progressMap[u.manhwaId] || ({ currentChapter: 0 } as ProgressRecord);
      const unread = (u.latestChapter || 0) - (progress.currentChapter || 0);
      return {
        id: u._id,
        manhwaId: u.manhwaId,
        title: manhwa.title || '',
        cover: manhwa.cover || '',
        currentChapter: progress.currentChapter,
        latestChapter: u.latestChapter,
        unread,
        lastChecked: u.lastChecked,
      };
    })
    .filter((item) => item.unread > 0);
};

const getStatsOverview = async (userId: string): Promise<StatsOverview> => {
  const state = load();
  const userManhwa = state.manhwas.filter((m) => m.userId === userId);
  const userProgress = state.progresses.filter((p) => p.userId === userId);
  const activity = state.activities.filter((a) => a.userId === userId);

  const totalTracked = userManhwa.length;
  const completed = userManhwa.filter((m) => m.status === 'completed').length;
  const completionRate = totalTracked ? Math.round((completed / totalTracked) * 100) : 0;

  const totalChaptersRead = userProgress.reduce((sum, item) => sum + (item.currentChapter || 0), 0);
  const activityMap = new Map(activity.map((item) => [item.date, item.chaptersRead || 0]));

  const today = new Date();
  const rangeKeys = (days: number) => {
    const keys: string[] = [];
    for (let idx = days - 1; idx >= 0; idx -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - idx);
      keys.push(day.toISOString().slice(0, 10));
    }
    return keys;
  };

  let readingStreak = 0;
  const cursor = new Date(today);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if ((activityMap.get(key) || 0) <= 0) break;
    readingStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const twoWeek = rangeKeys(14).map((date) => ({ date, chapters: activityMap.get(date) || 0 }));
  const chaptersPerWeek = rangeKeys(7).reduce((sum, date) => sum + (activityMap.get(date) || 0), 0);
  const readingSpeed = Number((twoWeek.reduce((sum, row) => sum + row.chapters, 0) / 14).toFixed(2));

  const genreCount = new Map<string, number>();
  userManhwa.forEach((item) => {
    (item.tags || []).forEach((tag) => {
      genreCount.set(tag, (genreCount.get(tag) || 0) + 1);
    });
  });
  const favoriteGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const heatmapKeys = rangeKeys(84);
  const maxHeat = Math.max(1, ...heatmapKeys.map((date) => activityMap.get(date) || 0));
  const heatmap = heatmapKeys.map((date) => {
    const count = activityMap.get(date) || 0;
    return { date, count, intensity: Math.min(1, count / maxHeat) };
  });

  return {
    totalChaptersRead,
    readingStreak,
    favoriteGenres,
    completionRate,
    readingSpeed,
    chaptersPerWeek,
    dailySeries: twoWeek,
    heatmap,
  };
};

const localAdapter = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  listManhwa,
  addManhwa,
  updateManhwa,
  updateProgress,
  markAsRead,
  getAllForUser,
  getUnreadUpdates,
  getStatsOverview,
};

export default localAdapter;
