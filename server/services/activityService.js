import ReadingActivity from '../models/ReadingActivity.js';

const toDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

export const recordReadingActivity = async (userId, chaptersRead) => {
  const safeDelta = Number(chaptersRead) || 0;
  if (safeDelta <= 0) return;

  const date = toDateKey();
  await ReadingActivity.findOneAndUpdate(
    { userId, date },
    { $inc: { chaptersRead: safeDelta } },
    { upsert: true, new: true }
  );
};

export const getDateRangeKeys = (days) => {
  const keys = [];
  const today = new Date();
  for (let idx = days - 1; idx >= 0; idx -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - idx);
    keys.push(toDateKey(date));
  }
  return keys;
};

export default {
  recordReadingActivity,
  getDateRangeKeys,
};
