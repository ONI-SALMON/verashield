// Best-effort request limit for the analysis endpoints. State lives in the memory of one serverless
// instance, so it is not shared between instances or restarts: it slows down a script that hammers
// the endpoint (cost abuse, trying many edits of an image to see when the result changes), it is not
// a guarantee. Keys are hashed with a random per-instance salt so the raw address is never kept.
import { createHash, randomBytes } from 'crypto';

const SALT = randomBytes(16);
const WINDOW_MS = Number(process.env.DETECT_RATE_WINDOW_MS) || 10 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.DETECT_RATE_MAX) || 8;
const MAX_KEYS = 5000;
const hits = new Map();

function clientKey(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = String(req.headers['x-real-ip'] || forwarded || req.socket?.remoteAddress || 'unknown');
  return createHash('sha256').update(SALT).update(ip).digest('hex').slice(0, 24);
}

// Returns { limited: false } or { limited: true, retryAfterSeconds }.
export function checkRateLimit(req, now = Date.now()) {
  const key = clientKey(req);
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) {
    for (const [k, list] of hits) if (!list.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    if (hits.size > MAX_KEYS) hits.clear();
  }
  return { limited: false };
}

export function sendRateLimited(res, retryAfterSeconds) {
  res.setHeader('Retry-After', String(retryAfterSeconds));
  return res.status(429).json({
    error: true,
    code: 'RATE_LIMITED',
    message: 'Too many analyses in a short time. Try again later.',
  });
}
