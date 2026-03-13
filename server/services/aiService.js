const CATALOG = [
  { title: 'Return of the Mount Hua Sect', tags: ['Murim', 'Action'], totalChapters: 140, cover: '', description: 'A legendary swordsman reborn into a fallen sect.' },
  { title: 'Omniscient Reader', tags: ['System', 'Action', 'Regression'], totalChapters: 220, cover: '', description: 'A reader survives inside the novel he knows by heart.' },
  { title: 'The Beginning After the End', tags: ['Fantasy', 'Action'], totalChapters: 190, cover: '', description: 'A king reincarnates into a world of magic and monsters.' },
  { title: 'SSS-Class Suicide Hunter', tags: ['System', 'Regression', 'Fantasy'], totalChapters: 170, cover: '', description: 'A hunter gains power by repeating and refining fate.' },
  { title: 'Legend of the Northern Blade', tags: ['Murim', 'Action'], totalChapters: 200, cover: '', description: 'A lone swordsman rises against hidden conspiracies.' },
  { title: 'My In-Laws Are Obsessed With Me', tags: ['Romance', 'Fantasy'], totalChapters: 120, cover: '', description: 'A political romance wrapped in supernatural mystery.' },
  { title: 'Solo Max-Level Newbie', tags: ['System', 'Action'], totalChapters: 180, cover: '', description: 'A gamer dominates a deadly tower with insider knowledge.' },
  { title: 'Villains Are Destined to Die', tags: ['Romance', 'Fantasy'], totalChapters: 135, cover: '', description: 'A trapped heroine navigates danger in a hostile story world.' },
];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const parsePossiblyWrappedJson = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  try {
    return JSON.parse(raw);
  } catch (_error) {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch (_innerError) {
        return null;
      }
    }
    return null;
  }
};

const getResponseText = (payload) => {
  if (payload?.output_text) return payload.output_text;
  const fragments = payload?.output
    ?.flatMap((item) => item?.content || [])
    ?.map((content) => content?.text)
    ?.filter(Boolean);
  return fragments?.join('\n') || '';
};

const requestOpenAiJson = async ({ prompt, fallback }) => {
  if (!OPENAI_API_KEY) return fallback;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'You are a structured output assistant. Return valid JSON only with no markdown.',
              },
            ],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const parsed = parsePossiblyWrappedJson(getResponseText(data));
    return parsed || fallback;
  } catch (_error) {
    return fallback;
  }
};

const sanitizeText = (value = '') =>
  String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseMetaContent = (html, key) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return html.match(regex)?.[1] || '';
};

const extractTitleFromUrl = (url) => {
  try {
    const pathname = new URL(url).pathname;
    const slug = pathname.split('/').filter(Boolean).pop() || '';
    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  } catch (_error) {
    return '';
  }
};

export const metadataFromUrl = async (url) => {
  let html = '';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NOVA-Scrolls/1.0',
      },
    });
    if (response.ok) {
      html = await response.text();
    }
  } catch (_error) {
    // Fall back to URL parsing when remote fetch fails.
  }

  const ogTitle = parseMetaContent(html, 'og:title');
  const ogImage = parseMetaContent(html, 'og:image');
  const ogDescription = parseMetaContent(html, 'og:description');
  const titleTag = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';

  const title = sanitizeText(ogTitle || titleTag) || extractTitleFromUrl(url) || 'Untitled Manhwa';
  const description = sanitizeText(ogDescription) || `Imported from ${new URL(url).hostname}`;

  const chapterHint = html.match(/chapter\s*[:#]?\s*(\d{1,5})/i)?.[1];
  const totalChapters = chapterHint ? Number(chapterHint) : 0;

  const baseline = {
    title,
    cover: ogImage || '',
    totalChapters,
    latestChapter: totalChapters,
    description,
    sourceUrl: url,
  };

  const aiEnhanced = await requestOpenAiJson({
    prompt: `Refine this metadata JSON for a manhwa page and keep structure identical. URL: ${url}. JSON: ${JSON.stringify(
      baseline
    )}`,
    fallback: baseline,
  });

  return {
    ...baseline,
    ...aiEnhanced,
    title: sanitizeText(aiEnhanced?.title || baseline.title),
    description: sanitizeText(aiEnhanced?.description || baseline.description),
    totalChapters: Number(aiEnhanced?.totalChapters ?? baseline.totalChapters) || 0,
    latestChapter: Number(aiEnhanced?.latestChapter ?? baseline.latestChapter) || 0,
  };
};

export const recommendByHistory = ({ existingTitles, favoriteTags, limit = 6 }) => {
  const normalizedExisting = new Set(existingTitles.map((item) => item.toLowerCase()));
  const weightMap = new Map();
  favoriteTags.forEach((tag, index) => {
    weightMap.set(tag, Math.max(1, favoriteTags.length - index));
  });

  const scored = CATALOG.map((item) => {
    if (normalizedExisting.has(item.title.toLowerCase())) {
      return null;
    }
    const score = item.tags.reduce((sum, tag) => sum + (weightMap.get(tag) || 0), 0);
    return {
      ...item,
      score,
      reason:
        score > 0
          ? `Matches your preferences in ${item.tags.filter((tag) => weightMap.has(tag)).join(', ')}`
          : 'Popular pick to diversify your library',
    };
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};

export const recommendByHistoryWithAi = async (payload) => {
  const baseline = recommendByHistory(payload);
  const enhanced = await requestOpenAiJson({
    prompt: `Given favorite tags ${JSON.stringify(payload.favoriteTags)} and existing titles ${JSON.stringify(
      payload.existingTitles
    )}, return JSON: {"recommendations":[{"title":"string","tags":["string"],"reason":"string"}]}. Prefer manhwa style recommendations. Baseline suggestions: ${JSON.stringify(
      baseline
    )}`,
    fallback: { recommendations: baseline },
  });

  const list = Array.isArray(enhanced?.recommendations) ? enhanced.recommendations : baseline;
  return list.slice(0, payload.limit || 6).map((item) => ({
    title: item.title,
    tags: Array.isArray(item.tags) ? item.tags : [],
    reason: item.reason || 'Recommended for your library profile',
  }));
};

export const predictFinishing = ({ title, totalChapters, currentChapter, readingSpeed }) => {
  const remaining = Math.max(0, (Number(totalChapters) || 0) - (Number(currentChapter) || 0));
  const speed = Math.max(0, Number(readingSpeed) || 0);
  if (remaining === 0) {
    return { title, remainingChapters: 0, estimatedDays: 0, insight: 'Already completed' };
  }
  if (speed <= 0) {
    return { title, remainingChapters: remaining, estimatedDays: null, insight: 'Need more reading activity to predict' };
  }

  const estimatedDays = Math.max(1, Math.ceil(remaining / speed));
  return {
    title,
    remainingChapters: remaining,
    estimatedDays,
    insight: `At ${speed.toFixed(1)} chapters/day, finish in about ${estimatedDays} day${estimatedDays > 1 ? 's' : ''}`,
  };
};

export const enhancePredictionsWithAi = async ({ readingSpeed, predictions }) => {
  const enhanced = await requestOpenAiJson({
    prompt: `Given reading speed ${readingSpeed} and predictions ${JSON.stringify(
      predictions
    )}, return JSON: {"predictions":[{"title":"string","remainingChapters":number,"estimatedDays":number|null,"insight":"string"}]}`,
    fallback: { predictions },
  });

  if (!Array.isArray(enhanced?.predictions)) return predictions;

  return enhanced.predictions.map((item, index) => ({
    ...predictions[index],
    insight: item?.insight || predictions[index]?.insight,
  }));
};

export default {
  metadataFromUrl,
  recommendByHistory,
  recommendByHistoryWithAi,
  predictFinishing,
  enhancePredictionsWithAi,
};
