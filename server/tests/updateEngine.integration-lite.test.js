import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/updateEngine/asuraScanner.js', () => ({
  default: vi.fn(async () => {
    throw new Error('Asura unavailable');
  }),
}));

vi.mock('../services/updateEngine/reaperScanner.js', () => ({
  default: vi.fn(async ({ title }) => ({
    source: 'reaper',
    title,
    latestChapter: 195,
    url: 'https://reaperscans.com/manga/solo-leveling',
  })),
}));

vi.mock('../services/updateEngine/flameScanner.js', () => ({
  default: vi.fn(async ({ title }) => ({
    source: 'flame',
    title,
    latestChapter: 194,
    url: 'https://flamescans.org/manga/solo-leveling',
  })),
}));

describe('update engine source fallback', () => {
  it('falls back to next source when preferred scanner fails', async () => {
    const { detectUpdateCandidate } = await import('../services/updateEngine/index.js');
    const candidate = await detectUpdateCandidate({
      manhwa: { title: 'Solo Leveling' },
      update: { source: 'asura', sourceUrl: '' },
    });

    expect(candidate?.source).toBe('reaper');
    expect(candidate?.latestChapter).toBe(195);
  });
});
