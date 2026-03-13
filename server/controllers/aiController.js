import Manhwa from '../models/Manhwa.js';
import Progress from '../models/Progress.js';
import ReadingActivity from '../models/ReadingActivity.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  enhancePredictionsWithAi,
  metadataFromUrl,
  predictFinishing,
  recommendByHistoryWithAi,
} from '../services/aiService.js';

export const autofillMetadata = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const metadata = await metadataFromUrl(url);
  res.json(metadata);
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const manhwaList = await Manhwa.find({ userId: req.user._id });

  const titleList = manhwaList.map((item) => item.title || '');
  const tagCount = new Map();
  manhwaList.forEach((item) => {
    (item.tags || []).forEach((tag) => tagCount.set(tag, (tagCount.get(tag) || 0) + 1));
  });

  const favoriteTags = Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);

  const recommendations = await recommendByHistoryWithAi({
    existingTitles: titleList,
    favoriteTags,
    limit,
  });

  res.json({ recommendations });
});

export const getPredictions = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const [manhwaList, progressList, activities] = await Promise.all([
    Manhwa.find({ userId: req.user._id, status: { $in: ['reading', 'planning', 'on-hold'] } }),
    Progress.find({ userId: req.user._id }),
    ReadingActivity.find({ userId: req.user._id }).sort({ date: -1 }).limit(14),
  ]);

  const progressMap = new Map(progressList.map((item) => [item.manhwaId.toString(), item.currentChapter || 0]));
  const avgDaily =
    activities.length > 0
      ? activities.reduce((sum, item) => sum + (item.chaptersRead || 0), 0) / 14
      : 0;

  const baselinePredictions = manhwaList
    .map((item) =>
      predictFinishing({
        title: item.title,
        totalChapters: item.totalChapters || 0,
        currentChapter: progressMap.get(item._id.toString()) || 0,
        readingSpeed: avgDaily,
      })
    )
    .sort((a, b) => {
      if (a.estimatedDays === null) return 1;
      if (b.estimatedDays === null) return -1;
      return a.estimatedDays - b.estimatedDays;
    })
    .slice(0, limit);

  const predictions = await enhancePredictionsWithAi({
    readingSpeed: Number(avgDaily.toFixed(2)),
    predictions: baselinePredictions,
  });

  res.json({
    readingSpeed: Number(avgDaily.toFixed(2)),
    predictions,
  });
});
