import axios from 'axios';
import { load } from 'cheerio';

export const SOURCE_PRIORITY = ['asura', 'reaper', 'flame'];

export const normalizeTitle = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const slugifyTitle = (value = '') =>
  normalizeTitle(value)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const extractChapterNumber = (value = '') => {
  const text = String(value || '').toLowerCase();
  const chapterMatch = text.match(/chapter\s*(\d+(?:\.\d+)?)/i);
  if (chapterMatch) return Number(chapterMatch[1]);

  const numberMatches = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
  if (!numberMatches.length) return null;
  return Math.max(...numberMatches);
};

export const parseLatestFromSelectorList = ($, selectors = []) => {
  let latest = null;

  selectors.forEach((selector) => {
    $(selector).each((_idx, element) => {
      const candidateText = [$(element).text(), $(element).attr('href'), $(element).attr('title')]
        .filter(Boolean)
        .join(' ');
      const chapter = extractChapterNumber(candidateText);
      if (chapter !== null) {
        latest = latest === null ? chapter : Math.max(latest, chapter);
      }
    });
  });

  return latest;
};

export const withTimeoutGet = async (url, options = {}) => {
  const response = await axios.get(url, {
    timeout: Number(process.env.UPDATE_ENGINE_TIMEOUT_MS) || 10000,
    headers: {
      'User-Agent':
        process.env.UPDATE_ENGINE_UA ||
        'Mozilla/5.0 (compatible; NOVA-Scrolls-UpdateEngine/1.0; +https://nova-scrolls.local)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    ...options,
  });

  return response.data;
};

export const fetchHtmlWithFallback = async (url) => {
  try {
    return await withTimeoutGet(url);
  } catch (networkError) {
    if ((process.env.UPDATE_ENGINE_ENABLE_PLAYWRIGHT || '0') !== '1') {
      throw networkError;
    }

    try {
      const playwrightModule = await import('playwright');
      const browser = await playwrightModule.chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const html = await page.content();
      await browser.close();
      return html;
    } catch (_playwrightError) {
      throw networkError;
    }
  }
};

export const resolveCandidateUrls = ({ sourceBaseUrl, sourceUrl, title, slug }) => {
  const safeSlug = slug || slugifyTitle(title);
  const candidates = [];

  if (sourceUrl && sourceUrl.startsWith('http')) {
    candidates.push(sourceUrl);
  }

  const base = String(sourceBaseUrl || '').replace(/\/$/, '');
  if (base && safeSlug) {
    candidates.push(`${base}/manga/${safeSlug}`);
    candidates.push(`${base}/series/${safeSlug}`);
    candidates.push(`${base}/${safeSlug}`);
  }

  return [...new Set(candidates)];
};

export const loadCheerio = (html) => load(html);

export default {
  SOURCE_PRIORITY,
  normalizeTitle,
  slugifyTitle,
  extractChapterNumber,
  parseLatestFromSelectorList,
  withTimeoutGet,
  fetchHtmlWithFallback,
  resolveCandidateUrls,
  loadCheerio,
};
