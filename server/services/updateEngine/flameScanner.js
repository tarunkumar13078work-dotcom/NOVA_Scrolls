import {
  fetchHtmlWithFallback,
  loadCheerio,
  parseLatestFromSelectorList,
  resolveCandidateUrls,
  slugifyTitle,
} from './parserUtils.js';

const source = 'flame';
const sourceBaseUrl = process.env.FLAME_BASE_URL || 'https://flamescans.org';

const SELECTORS = [
  'a[href*="chapter"]',
  '.chapter-title',
  '.wp-manga-chapter a',
  '.listing-chapters_wrap a',
];

export const scanFlame = async ({ title, slug, sourceUrl }) => {
  const candidates = resolveCandidateUrls({
    sourceBaseUrl,
    sourceUrl,
    title,
    slug: slug || slugifyTitle(title),
  });

  let lastError = null;

  for (const url of candidates) {
    try {
      const html = await fetchHtmlWithFallback(url);
      const $ = loadCheerio(html);
      const latestChapter = parseLatestFromSelectorList($, SELECTORS);
      if (latestChapter !== null) {
        return {
          source,
          title,
          latestChapter,
          url,
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  const reason = lastError?.message || 'Unable to parse Flame chapter list';
  throw new Error(`Flame scan failed: ${reason}`);
};

export default scanFlame;
