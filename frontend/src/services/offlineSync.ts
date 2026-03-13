type QueueAction = {
  type: string;
  payload: Record<string, unknown>;
  queuedAt?: string;
};

const buildQueueKey = (userId: string) => `nova_offline_queue_${userId}`;

const readQueue = (userId: string): QueueAction[] => {
  try {
    const raw = localStorage.getItem(buildQueueKey(userId));
    return raw ? (JSON.parse(raw) as QueueAction[]) : [];
  } catch (_error) {
    return [];
  }
};

const writeQueue = (userId: string, queue: QueueAction[]) => {
  localStorage.setItem(buildQueueKey(userId), JSON.stringify(queue));
};

export const enqueueOfflineAction = (userId: string, action: QueueAction) => {
  const queue = readQueue(userId);
  queue.push({ ...action, queuedAt: new Date().toISOString() });
  writeQueue(userId, queue);
};

export const flushOfflineQueue = async (
  userId: string,
  executor: (action: QueueAction) => Promise<void>
): Promise<{ flushed: number }> => {
  const queue = readQueue(userId);
  if (!queue.length) return { flushed: 0 };

  let flushed = 0;
  const remaining: QueueAction[] = [];

  for (const action of queue) {
    try {
      await executor(action);
      flushed += 1;
    } catch (_error) {
      remaining.push(action);
      break;
    }
  }

  if (remaining.length) {
    const rest = queue.slice(flushed + remaining.length);
    writeQueue(userId, [...remaining, ...rest]);
  } else {
    writeQueue(userId, []);
  }

  return { flushed };
};

const buildCacheKey = (userId: string) => `nova_snapshot_cache_${userId}`;

export const writeSnapshotCache = <TSnapshot>(userId: string, snapshot: TSnapshot) => {
  localStorage.setItem(buildCacheKey(userId), JSON.stringify(snapshot));
};

export const readSnapshotCache = <TSnapshot>(userId: string): TSnapshot | null => {
  try {
    const raw = localStorage.getItem(buildCacheKey(userId));
    return raw ? (JSON.parse(raw) as TSnapshot) : null;
  } catch (_error) {
    return null;
  }
};
