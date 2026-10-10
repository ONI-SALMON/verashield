import { IncomingForm } from 'formidable';
import { readFile, unlink } from 'fs/promises';
import http from 'http';
import https from 'https';
import dns from 'dns';
import net from 'net';

// bodyParser is off on purpose: multipart is parsed by formidable and the small
// JSON body (mode B) is read by hand. Vercel Functions also hard-cap any request
// body at 4.5MB, so the frontend downsizes larger files before uploading.
export const config = { api: { bodyParser: false } };

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_JSON_BYTES = 16 * 1024;
const MOCK_SCORE = 0.82;
const DOWNLOAD_TIMEOUT_MS = 15000;
const SIGHTENGINE_TIMEOUT_MS = 40000;
const MAX_REDIRECTS = 3;
const AI_THRESHOLD = 0.5;

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|avi|m4v|mkv)$/i;
const SOCIAL_HOSTS = [
  'tiktok.com', 'instagram.com', 'youtube.com', 'youtu.be', 'facebook.com', 'fb.watch',
  'twitter.com', 'x.com', 't.co', 'snapchat.com', 'reddit.com', 'vimeo.com', 'twitch.tv',
];

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const unsupportedUrl = (message) => new ApiError(422, 'UNSUPPORTED_URL', message);

function scoreToBucket(scorePercent) {
  if (scorePercent < 30) return 'low';
  if (scorePercent < 70) return 'medium';
  return 'high';
}

function bucketToLabel(bucket) {
  if (bucket === 'low') return 'likely_real';
  if (bucket === 'medium') return 'uncertain';
  return 'likely_fake';
}

// Same shape the image flow returns, so the frontend result screen and crisis
// pathway are reused as-is. The first four fields are the video contract.
function buildResult(score, inputType, source) {
  const confidence = Math.round(score * 100);
  const bucket = scoreToBucket(confidence);
  const label = bucketToLabel(bucket);
  return {
    score,
    isAiGenerated: score > AI_THRESHOLD,
    confidence,
    inputType,
    aiGenerated: score,
    deepfake: 0,
    topGenerator: null,
    score_percent: confidence,
    label,
    bucket,
    source,
    message_key: `result_${label}`,
  };
}

// ─── URL safety ──────────────────────────────────────────────────────────────
function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (net.isIPv6(address)) {
    const a = address.toLowerCase();
    if (a === '::' || a === '::1') return true;
    if (a.startsWith('::ffff:')) return isPrivateAddress(a.slice(7));
    return a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe8') || a.startsWith('fe9') ||
      a.startsWith('fea') || a.startsWith('feb') || a.startsWith('ff');
  }
  return true;
}

// Validates the address actually used for the connection (no DNS-rebinding gap).
function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err);
    const list = Array.isArray(address) ? address : [{ address, family }];
    if (list.some((entry) => isPrivateAddress(entry.address))) {
      return callback(new ApiError(422, 'UNSUPPORTED_URL', 'Private address'));
    }
    return options?.all ? callback(null, list) : callback(null, list[0].address, list[0].family);
  });
}

function parseVideoUrl(raw) {
  if (typeof raw !== 'string' || raw.length > 2048) throw unsupportedUrl('Invalid URL.');
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    throw unsupportedUrl('Invalid URL.');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw unsupportedUrl('Only http(s) URLs are supported.');
  if (url.username || url.password) throw unsupportedUrl('URLs with credentials are not supported.');
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  // IP literals never go through dns.lookup, so check them here.
  if (net.isIP(host) && isPrivateAddress(host)) throw unsupportedUrl('Private addresses are not supported.');
  if (SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    throw unsupportedUrl('Social media page URLs are not supported.');
  }
  return url;
}

function fetchVideo(url, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const req = client.get(
      url,
      { lookup: safeLookup, timeout: DOWNLOAD_TIMEOUT_MS, headers: { Accept: 'video/*,*/*;q=0.5' } },
      (res) => {
        const status = res.statusCode || 0;

        if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
          res.resume();
          if (redirectsLeft <= 0) return reject(unsupportedUrl('Too many redirects.'));
          try {
            return resolve(fetchVideo(parseVideoUrl(new URL(res.headers.location, url).href), redirectsLeft - 1));
          } catch (e) {
            return reject(e);
          }
        }
        if (status < 200 || status >= 300) {
          res.resume();
          return reject(unsupportedUrl(`The URL responded with status ${status}.`));
        }

        const type = String(res.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
        const looksLikeVideo =
          type.startsWith('video/') ||
          ((type === 'application/octet-stream' || type === 'binary/octet-stream') && VIDEO_EXTENSIONS.test(url.pathname));
        if (!looksLikeVideo) {
          res.resume();
          return reject(unsupportedUrl('The URL does not point directly to a video file.'));
        }

        const declared = Number(res.headers['content-length']);
        if (declared > MAX_VIDEO_BYTES) {
          res.resume();
          return reject(new ApiError(413, 'FILE_TOO_LARGE', 'Video exceeds 50MB.'));
        }

        const chunks = [];
        let total = 0;
        res.on('data', (chunk) => {
          total += chunk.length;
          if (total > MAX_VIDEO_BYTES) {
            req.destroy(new ApiError(413, 'FILE_TOO_LARGE', 'Video exceeds 50MB.'));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => resolve({ buffer: Buffer.concat(chunks), type: type.startsWith('video/') ? type : 'video/mp4' }));
        res.on('error', reject);
      }
    );
    req.on('timeout', () => req.destroy(unsupportedUrl('The URL took too long to respond.')));
    req.on('error', (err) => reject(err instanceof ApiError ? err : unsupportedUrl('Could not download a video from that URL.')));
  });
}

// ─── Sightengine ─────────────────────────────────────────────────────────────
async function callSightengine(buffer, mimeType) {
  const form = new FormData();
  form.append('api_user', process.env.SIGHTENGINE_API_USER);
  form.append('api_secret', process.env.SIGHTENGINE_API_SECRET);
  form.append('models', 'genai');
  form.append('media', new Blob([buffer], { type: mimeType }), 'upload');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SIGHTENGINE_TIMEOUT_MS);

  let response;
  try {
    response = await fetch('https://api.sightengine.com/1.0/video/check-sync.json', {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // handled below
  }

  const errorText = `${data?.error?.type ?? ''} ${data?.error?.message ?? ''}`;
  if (/duration|too[_\s-]?long|length/i.test(errorText)) {
    throw new ApiError(422, 'VIDEO_TOO_LONG', 'Video is longer than the supported duration.');
  }
  if (!response.ok || data?.status !== 'success' || data.error) {
    throw new Error(`Sightengine ${response.status} ${data?.status ?? 'no-json'} ${data?.error?.type ?? ''}`.trim());
  }

  const frames = data?.data?.frames;
  const scores = Array.isArray(frames)
    ? frames.map((f) => f?.type?.ai_generated).filter((v) => typeof v === 'number')
    : [];
  if (scores.length === 0) throw new Error('Sightengine response has no frame scores');

  const duration = Number(data?.media?.duration ?? data?.data?.duration);
  if (Number.isFinite(duration) && duration > 65) {
    throw new ApiError(422, 'VIDEO_TOO_LONG', 'Video is longer than the supported duration.');
  }

  // A manipulated clip only needs to show up in some frames: use the peak frame.
  return Math.max(...scores);
}

// ─── Input parsing ───────────────────────────────────────────────────────────
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_JSON_BYTES) {
        reject(new ApiError(400, 'INVALID_FILE', 'Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new ApiError(400, 'INVALID_FILE', 'Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

function parseForm(req) {
  const form = new IncomingForm({ maxFileSize: MAX_VIDEO_BYTES });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve(files)));
  });
}

function sendError(res, status, code, message) {
  return res.status(status).json({ error: code, code, message });
}

export default async function handler(req, res) {
  let tempPath = null;
  try {
    if (req.method !== 'POST') return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only POST is supported.');

    const contentType = String(req.headers['content-type'] || '');
    let inputType;
    let buffer;
    let mimeType;

    if (contentType.includes('application/json')) {
      inputType = 'url';
      const body = await readJsonBody(req);
      const url = parseVideoUrl(body.videoUrl);
      if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
        return res.status(200).json(buildResult(MOCK_SCORE, inputType, 'mock'));
      }
      ({ buffer, type: mimeType } = await fetchVideo(url));
    } else {
      inputType = 'file';
      let files;
      try {
        files = await parseForm(req);
      } catch (parseError) {
        const tooLarge = parseError?.httpCode === 413 || parseError?.code === 1009;
        return tooLarge
          ? sendError(res, 413, 'FILE_TOO_LARGE', 'Video too large. Max size is 50MB.')
          : sendError(res, 400, 'INVALID_FILE', 'Could not read the uploaded video.');
      }
      const uploaded = Array.isArray(files.video) ? files.video[0] : files.video;
      if (!uploaded) return sendError(res, 400, 'INVALID_FILE', 'No video file was provided.');
      tempPath = uploaded.filepath;

      mimeType = uploaded.mimetype || uploaded.type;
      if (!mimeType || !mimeType.startsWith('video/')) {
        return sendError(res, 400, 'INVALID_FILE_TYPE', 'Please upload a video file (MP4, MOV, WebM or AVI).');
      }
      if (uploaded.size > MAX_VIDEO_BYTES) {
        return sendError(res, 413, 'FILE_TOO_LARGE', 'Video too large. Max size is 50MB.');
      }
      if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
        return res.status(200).json(buildResult(MOCK_SCORE, inputType, 'mock'));
      }
      buffer = await readFile(uploaded.filepath);
    }

    const score = await callSightengine(buffer, mimeType);
    const result = buildResult(score, inputType, 'sightengine');
    console.log('[detect-video]', { bucket: result.bucket, label: result.label, inputType });
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.status, error.code, error.message);
    }
    console.error('[detect-video] outer catch:', error.message);
    return sendError(res, 502, 'DETECTION_FAILED', 'Our detection service is temporarily unavailable. Try again in a few minutes.');
  } finally {
    if (tempPath) unlink(tempPath).catch(() => {});
  }
}
