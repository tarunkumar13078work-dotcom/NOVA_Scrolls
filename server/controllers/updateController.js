import Update from '../models/Update.js';
import Progress from '../models/Progress.js';
import Manhwa from '../models/Manhwa.js';
import asyncHandler from '../utils/asyncHandler.js';
import { recordReadingActivity } from '../services/activityService.js';

export const getUpdates = asyncHandler(async (req, res) => {
  const updates = await Update.find({ userId: req.user._id });
  const progressList = await Progress.find({ userId: req.user._id });
  const manhwaList = await Manhwa.find({ userId: req.user._id });

  const progressMap = Object.fromEntries(progressList.map((p) => [p.manhwaId.toString(), p]));
  const manhwaMap = Object.fromEntries(manhwaList.map((m) => [m._id.toString(), m]));

  const enriched = updates
    .map((u) => {
      const prog = progressMap[u.manhwaId.toString()] || { currentChapter: 0 };
      const manhwa = manhwaMap[u.manhwaId.toString()] || {};
      const unread = (u.latestChapter || 0) - (prog.currentChapter || 0);
      return {
        id: u._id,
        manhwaId: u.manhwaId,
        title: manhwa.title,
        cover: manhwa.cover,
        source: u.source,
        sourceUrl: u.sourceUrl,
        currentChapter: prog.currentChapter,
        latestChapter: u.latestChapter,
        unread,
        lastChecked: u.lastChecked,
      };
    })
    .filter((item) => item.unread > 0);

  res.json(enriched);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params; // manhwaId
  const update = await Update.findOne({ manhwaId: id, userId: req.user._id });
  if (!update) return res.status(404).json({ message: 'Update not found' });

  const latest = update.latestChapter || 0;
  const previous = await Progress.findOne({ manhwaId: id, userId: req.user._id });
  const previousChapter = previous?.currentChapter || 0;
  const progress = await Progress.findOneAndUpdate(
    { manhwaId: id, userId: req.user._id },
    { currentChapter: latest },
    { new: true }
  );

  await recordReadingActivity(req.user._id, Math.max(0, latest - previousChapter));

  await Update.findOneAndUpdate(
    { manhwaId: id, userId: req.user._id },
    { lastChecked: new Date() }
  );

  res.json({ message: 'Progress synced', progress });
});

export const upsertUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params; // manhwaId
  const { latestChapter, source, sourceUrl, sourceSlug } = req.body;
  const update = await Update.findOneAndUpdate(
    { manhwaId: id, userId: req.user._id },
    {
      latestChapter: Number(latestChapter) || 0,
      lastChecked: new Date(),
      ...(source !== undefined ? { source } : {}),
      ...(sourceUrl !== undefined ? { sourceUrl } : {}),
      ...(sourceSlug !== undefined ? { sourceSlug } : {}),
    },
    { new: true, upsert: true }
  );
  res.json(update);
});
