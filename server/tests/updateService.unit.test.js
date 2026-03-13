import { describe, expect, it } from 'vitest';
import { evaluateUnreadChapters } from '../services/updateService.js';

describe('evaluateUnreadChapters', () => {
  it('returns delta between latest and current chapter', () => {
    expect(evaluateUnreadChapters({ latestChapter: 22, currentChapter: 17 })).toBe(5);
  });

  it('never returns a negative unread number', () => {
    expect(evaluateUnreadChapters({ latestChapter: 3, currentChapter: 8 })).toBe(0);
  });
});
