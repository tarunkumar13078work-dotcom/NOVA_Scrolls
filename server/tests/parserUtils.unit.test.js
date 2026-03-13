import { describe, expect, it } from 'vitest';
import {
  buildSourcePriority,
} from '../services/updateEngine/index.js';
import {
  extractChapterNumber,
  parseLatestFromSelectorList,
  slugifyTitle,
} from '../services/updateEngine/parserUtils.js';
import { load } from 'cheerio';

describe('updateEngine parser utils', () => {
  it('extracts chapter from chapter text and URLs', () => {
    expect(extractChapterNumber('Chapter 195')).toBe(195);
    expect(extractChapterNumber('/solo-leveling-chapter-201/')).toBe(201);
  });

  it('slugifies title safely', () => {
    expect(slugifyTitle('Solo Leveling: Ragnarok')).toBe('solo-leveling-ragnarok');
  });

  it('parses highest chapter from selector list', () => {
    const $ = load(`
      <div>
        <a href="/chapter-191">Chapter 191</a>
        <a href="/chapter-195">Chapter 195</a>
        <a href="/chapter-193">Chapter 193</a>
      </div>
    `);

    expect(parseLatestFromSelectorList($, ['a[href*=\"chapter\"]'])).toBe(195);
  });

  it('applies preferred source ordering', () => {
    expect(buildSourcePriority('reaper')).toEqual(['reaper', 'asura', 'flame']);
  });
});
