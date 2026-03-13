export const evaluateUnreadChapters = ({ latestChapter, currentChapter }) => {
  const safeLatest = Number.isFinite(latestChapter) ? latestChapter : 0;
  const safeCurrent = Number.isFinite(currentChapter) ? currentChapter : 0;
  return Math.max(0, safeLatest - safeCurrent);
};
