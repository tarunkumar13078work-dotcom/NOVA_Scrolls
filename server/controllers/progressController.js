import Progress from '../models/Progress.js';
import Update from '../models/Update.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.find({ userId: req.user._id });
  res.json(progress);
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { id } = req.params; // manhwaId
  const { currentChapter } = req.body;
  const progress = await Progress.findOneAndUpdate(
    { manhwaId: id, userId: req.user._id },
    { currentChapter: Number(currentChapter) || 0 },
    { new: true }
  );
  if (!progress) return res.status(404).json({ message: 'Progress not found' });

  // When user reads to currentChapter, also sync Update latestChapter down if surpassed
  await Update.findOneAndUpdate(
    { manhwaId: id, userId: req.user._id },
    { $max: { latestChapter: progress.currentChapter }, lastChecked: new Date() }
  );

  res.json(progress);
});
