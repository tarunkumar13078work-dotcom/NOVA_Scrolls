import asyncHandler from '../utils/asyncHandler.js';
import { runManualUpdateCheck } from '../jobs/updateScheduler.js';

export const checkUpdatesNow = asyncHandler(async (_req, res) => {
  const summary = await runManualUpdateCheck();
  res.json({
    message: 'Manual update check completed',
    ...summary,
  });
});

export default {
  checkUpdatesNow,
};
