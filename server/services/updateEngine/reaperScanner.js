import {
  fetchHtmlWithFallback,
  loadCheerio,
  parseLatestFromSelectorList,
  resolveCandidateUrls,
  slugifyTitle,
} from './parserUtils.js';

const source = 'reaper';
const sourceBaseUrl = process.env.REAPER_BASE_URL || 'https://reaperscans.com';

const SELECTORS = [
  'a[href*="chapter"]',
  '.postbody a',
  '.listupd a',
  '.chapters a',
];

export const scanReaper = async ({ title, slug, sourceUrl }) => {
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

  const reason = lastError?.message || 'Unable to parse Reaper chapter list';
  throw new Error(`Reaper scan failed: ${reason}`);
};

export default scanReaper;
