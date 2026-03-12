import Manhwa from '../models/Manhwa.js';
import Progress from '../models/Progress.js';
import Update from '../models/Update.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listManhwa = asyncHandler(async (req, res) => {
  const manhwa = await Manhwa.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  res.json(manhwa);
});

export const createManhwa = asyncHandler(async (req, res) => {
  const { title, cover, totalChapters, status, currentChapter, latestChapter } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const manhwa = await Manhwa.create({
    userId: req.user._id,
    title,
    cover,
    totalChapters: Number(totalChapters) || 0,
    status: status || 'reading',
  });

  await Progress.create({
    userId: req.user._id,
    manhwaId: manhwa._id,
    currentChapter: Number(currentChapter) || 0,
  });

  await Update.create({
    userId: req.user._id,
    manhwaId: manhwa._id,
    latestChapter: Number(latestChapter) || Number(totalChapters) || 0,
  });

  res.status(201).json(manhwa);
});

export const updateManhwa = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, cover, totalChapters, status } = req.body;
  const manhwa = await Manhwa.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { title, cover, totalChapters, status },
    { new: true }
  );
  if (!manhwa) return res.status(404).json({ message: 'Manhwa not found' });
  res.json(manhwa);
});

export const deleteManhwa = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const manhwa = await Manhwa.findOneAndDelete({ _id: id, userId: req.user._id });
  if (!manhwa) return res.status(404).json({ message: 'Manhwa not found' });
  await Progress.deleteMany({ manhwaId: id, userId: req.user._id });
  await Update.deleteMany({ manhwaId: id, userId: req.user._id });
  res.json({ message: 'Removed' });
});
