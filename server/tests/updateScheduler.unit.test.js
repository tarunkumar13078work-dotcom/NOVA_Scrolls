import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(() => ({ stop: vi.fn() })),
  },
}));

vi.mock('../services/updateEngine/index.js', () => ({
  runAutoUpdateEngine: vi.fn(async () => ({ processed: 1, updated: 1, failures: 0, messages: [] })),
}));

describe('update scheduler', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('executes manual check through engine', async () => {
    const mod = await import('../jobs/updateScheduler.js');
    const result = await mod.runManualUpdateCheck();
    expect(result.updated).toBe(1);
  });

  it('uses 30-minute cron by default', async () => {
    const cronModule = await import('node-cron');
    const mod = await import('../jobs/updateScheduler.js');
    mod.startUpdateScheduler();
    expect(cronModule.default.schedule).toHaveBeenCalledWith('*/30 * * * *', expect.any(Function));
  });
});
