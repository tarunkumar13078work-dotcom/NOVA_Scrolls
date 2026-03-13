import { describe, expect, it } from 'vitest';
import { predictFinishing } from '../services/aiService.js';

describe('predictFinishing', () => {
  it('returns null estimatedDays when reading speed is zero', () => {
    const prediction = predictFinishing({
      title: 'Demo Series',
      totalChapters: 120,
      currentChapter: 30,
      readingSpeed: 0,
    });

    expect(prediction.remainingChapters).toBe(90);
    expect(prediction.estimatedDays).toBeNull();
  });

  it('returns day estimate when reading speed is positive', () => {
    const prediction = predictFinishing({
      title: 'Demo Series',
      totalChapters: 120,
      currentChapter: 60,
      readingSpeed: 12,
    });

    expect(prediction.remainingChapters).toBe(60);
    expect(prediction.estimatedDays).toBe(5);
  });
});
