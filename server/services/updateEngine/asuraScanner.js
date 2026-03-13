import {
  fetchHtmlWithFallback,
  loadCheerio,
  parseLatestFromSelectorList,
  resolveCandidateUrls,
  slugifyTitle,
} from './parserUtils.js';

const source = 'asura';
const sourceBaseUrl = process.env.ASURA_BASE_URL || 'https://asuracomic.net';

const SELECTORS = [
  'a[href*="chapter"]',
  '.chapters-list a',
  '.chapter-list a',
  '.eplister li a',
];

export const scanAsura = async ({ title, slug, sourceUrl }) => {
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

  const reason = lastError?.message || 'Unable to parse Asura chapter list';
  throw new Error(`Asura scan failed: ${reason}`);
};

export default scanAsura;
