export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

const VISION_TIMEOUT_MS = 15000;
const MAX_URLS = 10;

const PLATFORMS = [
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)(twitter|x)\.com$/, 'Twitter/X'],
  [/(^|\.)facebook\.com$/, 'Facebook'],
];

function platformOf(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [re, name] of PLATFORMS) if (re.test(host)) return name;
  } catch {
    // fall through
  }
  return 'Other';
}

function notFound(res) {
  return res.status(200).json({ found: false, matchingUrls: [] });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: true, code: 'METHOD_NOT_ALLOWED' });
  }

  const image = req.body && req.body.image;
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (typeof image !== 'string' || !image || !apiKey) return notFound(res);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: image },
            features: [{ type: 'WEB_DETECTION', maxResults: MAX_URLS }],
          }],
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      console.error('[find-links] vision status', response.status);
      return notFound(res);
    }
    const data = await response.json();
    const web = data?.responses?.[0]?.webDetection;
    const pages = (web?.pagesWithMatchingImages || []).map((p) => p.url);
    const direct = (web?.fullMatchingImages || []).map((p) => p.url);
    const urls = [...new Set([...pages, ...direct].filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u)))]
      .slice(0, MAX_URLS);

    const matchingUrls = urls.map((url) => ({ url, platform: platformOf(url) }));
    return res.status(200).json({ found: matchingUrls.length > 0, matchingUrls });
  } catch (err) {
    console.error('[find-links]', err && err.name);
    return notFound(res);
  } finally {
    clearTimeout(timer);
  }
}
