import Manhwa from '../../models/Manhwa.js';
import Progress from '../../models/Progress.js';
import Update from '../../models/Update.js';
import { sendPushToUser } from '../pushService.js';
import { evaluateUnreadChapters } from '../updateService.js';
import scanAsura from './asuraScanner.js';
import scanReaper from './reaperScanner.js';
import scanFlame from './flameScanner.js';
import { SOURCE_PRIORITY } from './parserUtils.js';

const scanners = {
  asura: scanAsura,
  reaper: scanReaper,
  flame: scanFlame,
};

const sourceTaskChains = new Map();
const sourceLastHit = new Map();
const sourceCache = new Map();

const REQUEST_GAP_MS = Number(process.env.UPDATE_ENGINE_RATE_LIMIT_MS) || 1000;
const CACHE_TTL_MS = Number(process.env.UPDATE_ENGINE_CACHE_MS) || 10 * 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const queueSourceTask = (source, task) => {
  const previous = sourceTaskChains.get(source) || Promise.resolve();
  const next = previous.then(task, task);
  sourceTaskChains.set(source, next.catch(() => null));
  return next;
};

const waitForRateLimit = async (source) => {
  const last = sourceLastHit.get(source) || 0;
  const wait = REQUEST_GAP_MS - (Date.now() - last);
  if (wait > 0) await sleep(wait);
  sourceLastHit.set(source, Date.now());
};

const getCacheKey = ({ source, title, sourceUrl }) => `${source}:${String(sourceUrl || title || '').toLowerCase()}`;

const getCachedScan = (key) => {
  const cached = sourceCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    sourceCache.delete(key);
    return null;
  }
  return cached.payload;
};

const setCachedScan = (key, payload) => {
  sourceCache.set(key, { cachedAt: Date.now(), payload });
};

export const buildSourcePriority = (preferredSource) => {
  const preferred = String(preferredSource || '').toLowerCase();
  if (!preferred || !SOURCE_PRIORITY.includes(preferred)) return [...SOURCE_PRIORITY];
  return [preferred, ...SOURCE_PRIORITY.filter((source) => source !== preferred)];
};

const scanBySource = async ({ source, title, slug, sourceUrl }) => {
  const scanner = scanners[source];
  if (!scanner) throw new Error(`Unsupported source: ${source}`);

  const cacheKey = getCacheKey({ source, title, sourceUrl });
  const cached = getCachedScan(cacheKey);
  if (cached) return cached;

  const payload = await queueSourceTask(source, async () => {
    await waitForRateLimit(source);
    return scanner({ title, slug, sourceUrl });
  });

  setCachedScan(cacheKey, payload);
  return payload;
};

export const detectUpdateCandidate = async ({ manhwa, update }) => {
  const order = buildSourcePriority(update?.source);

  for (const source of order) {
    try {
      const result = await scanBySource({
        source,
        title: manhwa.title,
        slug: update?.sourceSlug,
        sourceUrl: update?.sourceUrl,
      });
      if (result && Number.isFinite(result.latestChapter)) {
        return result;
      }
    } catch (error) {
      console.error(`[update-engine] ${source} scan failed for ${manhwa.title}`, error.message);
    }
  }

  return null;
};

export const runAutoUpdateEngine = async () => {
  const updates = await Update.find({});
  if (!updates.length) {
    return { processed: 0, updated: 0, failures: 0, messages: [] };
  }

  const manhwaIds = [...new Set(updates.map((item) => item.manhwaId.toString()))];
  const userIds = [...new Set(updates.map((item) => item.userId.toString()))];

  const [manhwas, progresses] = await Promise.all([
    Manhwa.find({ _id: { $in: manhwaIds } }),
    Progress.find({ userId: { $in: userIds }, manhwaId: { $in: manhwaIds } }),
  ]);

  const manhwaMap = new Map(manhwas.map((item) => [item._id.toString(), item]));
  const progressMap = new Map(progresses.map((item) => [`${item.userId.toString()}:${item.manhwaId.toString()}`, item]));

  let updatedCount = 0;
  let failures = 0;
  const messages = [];

  for (const update of updates) {
    const manhwa = manhwaMap.get(update.manhwaId.toString());
    if (!manhwa) continue;

    try {
      const detected = await detectUpdateCandidate({ manhwa, update });
      const now = new Date();

      if (!detected) {
        await Update.findByIdAndUpdate(update._id, { lastChecked: now });
        continue;
      }

      const detectedLatest = Number(detected.latestChapter) || 0;
      const storedLatest = Number(update.latestChapter) || 0;

      if (detectedLatest <= storedLatest) {
        await Update.findByIdAndUpdate(update._id, {
          lastChecked: now,
          source: detected.source,
          sourceUrl: detected.url,
        });
        continue;
      }

      await Update.findByIdAndUpdate(update._id, {
        latestChapter: detectedLatest,
        lastChecked: now,
        source: detected.source,
        sourceUrl: detected.url,
      });

      updatedCount += 1;

      const progress = progressMap.get(`${update.userId.toString()}:${update.manhwaId.toString()}`);
      const unread = evaluateUnreadChapters({
        latestChapter: detectedLatest,
        currentChapter: progress?.currentChapter || 0,
      });

      if (unread > 0) {
        await sendPushToUser(update.userId, {
          title: 'NOVA Scrolls',
          body: `${manhwa.title}: ${unread} new chapter${unread > 1 ? 's' : ''} available`,
          url: '/updates',
        });
      }

      messages.push(`${manhwa.title}: ${detectedLatest} (source: ${detected.source})`);
    } catch (error) {
      failures += 1;
      console.error('[update-engine] Failed to process title', {
        manhwaId: update.manhwaId?.toString(),
        message: error.message,
      });
    }
  }

  return {
    processed: updates.length,
    updated: updatedCount,
    failures,
    messages,
  };
};

export default {
  runAutoUpdateEngine,
  detectUpdateCandidate,
  buildSourcePriority,
};
