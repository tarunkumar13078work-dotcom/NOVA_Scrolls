import cron from 'node-cron';
import { runAutoUpdateEngine } from '../services/updateEngine/index.js';

export const UPDATE_CRON_EXPRESSION = process.env.UPDATE_CRON || '*/30 * * * *';

export const executeScheduledUpdate = async () => {
  return runAutoUpdateEngine();
};

export const startUpdateScheduler = () => {
  const enabled = (process.env.ENABLE_UPDATE_JOBS || '1') === '1';
  if (!enabled) {
    return null;
  }

  const task = cron.schedule(UPDATE_CRON_EXPRESSION, () => {
    executeScheduledUpdate().catch((error) => {
      console.error('[update-scheduler] Scheduled run failed', error.message);
    });
  });

  executeScheduledUpdate().catch((error) => {
    console.error('[update-scheduler] Initial run failed', error.message);
  });

  return task;
};

export const runManualUpdateCheck = async () => {
  return executeScheduledUpdate();
};

export default startUpdateScheduler;
