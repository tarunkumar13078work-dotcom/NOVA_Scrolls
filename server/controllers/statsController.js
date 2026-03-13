import Manhwa from '../models/Manhwa.js';
import Progress from '../models/Progress.js';
import ReadingActivity from '../models/ReadingActivity.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getDateRangeKeys } from '../services/activityService.js';

const calcStreak = (activityMap) => {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const count = activityMap.get(key) || 0;
    if (count <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const getStatsOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [manhwaList, progressList, activityList] = await Promise.all([
    Manhwa.find({ userId }),
    Progress.find({ userId }),
    ReadingActivity.find({ userId }).sort({ date: 1 }),
  ]);

  const totalTracked = manhwaList.length;
  const completed = manhwaList.filter((item) => item.status === 'completed').length;
  const completionRate = totalTracked ? Math.round((completed / totalTracked) * 100) : 0;

  const totalChaptersRead = progressList.reduce((sum, item) => sum + (item.currentChapter || 0), 0);

  const genreCount = new Map();
  manhwaList.forEach((item) => {
    (item.tags || []).forEach((tag) => {
      genreCount.set(tag, (genreCount.get(tag) || 0) + 1);
    });
  });

  const favoriteGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const activityMap = new Map(activityList.map((item) => [item.date, item.chaptersRead || 0]));
  const streakDays = calcStreak(activityMap);

  const twoWeekKeys = getDateRangeKeys(14);
  const dailySeries = twoWeekKeys.map((date) => ({
    date,
    chapters: activityMap.get(date) || 0,
  }));

  const chaptersLastTwoWeeks = dailySeries.reduce((sum, item) => sum + item.chapters, 0);
  const readingSpeed = Number((chaptersLastTwoWeeks / 14).toFixed(2));

  const oneWeekKeys = getDateRangeKeys(7);
  const chaptersPerWeek = oneWeekKeys.reduce((sum, date) => sum + (activityMap.get(date) || 0), 0);

  const heatmapKeys = getDateRangeKeys(84);
  const maxHeat = Math.max(1, ...heatmapKeys.map((date) => activityMap.get(date) || 0));
  const heatmap = heatmapKeys.map((date) => {
    const count = activityMap.get(date) || 0;
    return {
      date,
      count,
      intensity: Math.min(1, count / maxHeat),
    };
  });

  res.json({
    totalChaptersRead,
    readingStreak: streakDays,
    favoriteGenres,
    completionRate,
    readingSpeed,
    chaptersPerWeek,
    dailySeries,
    heatmap,
  });
});
