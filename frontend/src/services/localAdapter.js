const STORAGE_KEY = 'nova_local_v1';

const defaultState = {
  users: [],
  manhwas: [],
  progresses: [],
  updates: [],
  session: null,
};

const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (err) {
    console.error('localAdapter load failed', err);
    return { ...defaultState };
  }
};

const save = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const findSessionUser = (state) => {
  const token = state.session?.token || localStorage.getItem('nova_token');
  if (!token) return null;
  const userId = state.session?.userId;
  if (!userId) return null;
  return state.users.find((u) => u._id === userId) || null;
};

const toPublicUser = (user) => ({ id: user._id, username: user.username, createdAt: user.createdAt });

const registerUser = async ({ username, password }) => {
  const state = load();
  if (!username || !password) {
    throw new Error('Username and password required');
  }
  const existing = state.users.find((u) => u.username === username);
  if (existing) {
    throw new Error('Username already taken');
  }
  const user = { _id: uuid(), username, password, createdAt: new Date().toISOString() };
  const token = `local-${user._id}`;
  state.users.push(user);
  state.session = { token, userId: user._id };
  save(state);
  localStorage.setItem('nova_token', token);
  return { user: toPublicUser(user), token };
};

const loginUser = async ({ username, password }) => {
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

const listManhwa = async (userId) => {
  const state = load();
  return state.manhwas.filter((m) => m.userId === userId);
};

const listProgress = async (userId) => {
  const state = load();
  return state.progresses.filter((p) => p.userId === userId);
};

const listUpdates = async (userId) => {
  const state = load();
  return state.updates.filter((u) => u.userId === userId);
};

const addManhwa = async (userId, payload) => {
  const state = load();
  const manhwa = {
    _id: uuid(),
    userId,
    title: payload.title,
    cover: payload.cover || '',
    totalChapters: Number(payload.totalChapters) || 0,
    status: payload.status || 'reading',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const progress = {
    _id: uuid(),
    userId,
    manhwaId: manhwa._id,
    currentChapter: Number(payload.currentChapter) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const update = {
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

const updateProgress = async (userId, manhwaId, currentChapter) => {
  const state = load();
  const progress = state.progresses.find((p) => p.userId === userId && p.manhwaId === manhwaId);
  if (!progress) throw new Error('Progress not found');
  progress.currentChapter = Number(currentChapter) || 0;
  progress.updatedAt = new Date().toISOString();
  const update = state.updates.find((u) => u.userId === userId && u.manhwaId === manhwaId);
  if (update) {
    update.latestChapter = Math.max(update.latestChapter || 0, progress.currentChapter || 0);
    update.lastChecked = new Date().toISOString();
    update.updatedAt = new Date().toISOString();
  }
  save(state);
  return progress;
};

const markAsRead = async (userId, manhwaId) => {
  const state = load();
  const update = state.updates.find((u) => u.userId === userId && u.manhwaId === manhwaId);
  if (!update) throw new Error('Update not found');
  const progress = state.progresses.find((p) => p.userId === userId && p.manhwaId === manhwaId);
  if (progress) {
    progress.currentChapter = update.latestChapter || 0;
    progress.updatedAt = new Date().toISOString();
  }
  update.lastChecked = new Date().toISOString();
  update.updatedAt = new Date().toISOString();
  save(state);
  return { progress, update };
};

const getAllForUser = async (userId) => {
  const [manhwas, progresses, updates] = await Promise.all([
    listManhwa(userId),
    listProgress(userId),
    listUpdates(userId),
  ]);
  return { manhwas, progresses, updates };
};

const getUnreadUpdates = async (userId) => {
  const state = load();
  const manhwaMap = Object.fromEntries(state.manhwas.map((m) => [m._id, m]));
  const progressMap = Object.fromEntries(state.progresses.map((p) => [p.manhwaId, p]));
  return state.updates
    .filter((u) => u.userId === userId)
    .map((u) => {
      const manhwa = manhwaMap[u.manhwaId] || {};
      const progress = progressMap[u.manhwaId] || { currentChapter: 0 };
      const unread = (u.latestChapter || 0) - (progress.currentChapter || 0);
      return {
        id: u._id,
        manhwaId: u.manhwaId,
        title: manhwa.title,
        cover: manhwa.cover,
        currentChapter: progress.currentChapter,
        latestChapter: u.latestChapter,
        unread,
        lastChecked: u.lastChecked,
      };
    })
    .filter((item) => item.unread > 0);
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  listManhwa,
  addManhwa,
  updateProgress,
  markAsRead,
  getAllForUser,
  getUnreadUpdates,
};
