import { IncomingForm } from 'formidable';
import { readFile } from 'fs/promises';

export const config = { api: { bodyParser: false } };

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MOCK_SCORE = 0.82;
const SIGHTENGINE_FETCH_TIMEOUT_MS = 12000;
const AZURE_FETCH_TIMEOUT_MS = 12000;

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

const GENERATOR_NAMES = {
  dalle: 'DALL-E',
  midjourney: 'Midjourney',
  stable_diffusion: 'Stable Diffusion',
  flux: 'FLUX',
};
const GENERATOR_MIN_SCORE = 0.1;

function formatGenerator(key) {
  if (GENERATOR_NAMES[key]) return GENERATOR_NAMES[key];
  return key
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function topGeneratorFrom(generators) {
  if (!generators || typeof generators !== 'object') return null;
  let bestKey = null;
  let bestValue = 0;
  for (const [key, value] of Object.entries(generators)) {
    if (typeof value === 'number' && value > bestValue) {
      bestKey = key;
      bestValue = value;
    }
  }
  if (!bestKey || bestValue < GENERATOR_MIN_SCORE) return null;
  return formatGenerator(bestKey);
}

function buildResult({ aiGenerated, deepfake = 0, topGenerator = null }, source) {
  const scoreFraction = Math.max(aiGenerated, deepfake);
  const score_percent = Math.round(scoreFraction * 100);
  const bucket = scoreToBucket(score_percent);
  const label = bucketToLabel(bucket);
  return {
    score: scoreFraction,
    aiGenerated,
    deepfake,
    topGenerator,
    confidence: score_percent,
    score_percent,
    label,
    bucket,
    source,
    message_key: `result_${label}`,
  };
}

async function callSightengine(file) {
  const form = new FormData();
  form.append('api_user', process.env.SIGHTENGINE_API_USER);
  form.append('api_secret', process.env.SIGHTENGINE_API_SECRET);
  form.append('models', 'genai,deepfake');
  form.append('media', file, 'upload');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SIGHTENGINE_FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = new Error(`Sightengine API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Sightengine returned invalid JSON');
  }

  if (data?.status !== 'success' || data.error) {
    throw new Error(`Sightengine status: ${data?.status ?? 'unknown'}${data?.error?.type ? ` (${data.error.type})` : ''}`);
  }

  const type = data.type;
  if (!type || typeof type.ai_generated !== 'number') {
    throw new Error('Sightengine response missing ai_generated score');
  }

  return buildResult(
    {
      aiGenerated: type.ai_generated,
      deepfake: typeof type.deepfake === 'number' ? type.deepfake : 0,
      topGenerator: topGeneratorFrom(type.ai_generators),
    },
    'sightengine'
  );
}

async function callAzure(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AZURE_FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(
      `${process.env.AZURE_ENDPOINT}/contentsafety/image:analyze?api-version=2023-10-01`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: { content: buffer.toString('base64') } }),
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = new Error(`Azure API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return buildResult({ aiGenerated: data.score }, 'azure');
}

function logDetection(result) {
  console.log('[detect]', { bucket: result.bucket, label: result.label, source: result.source });
}

function parseForm(req) {
  const form = new IncomingForm({ maxFileSize: MAX_FILE_SIZE_BYTES });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: true, code: 'METHOD_NOT_ALLOWED', message: 'Only POST is supported.' });
    }

    let files;
    try {
      files = await parseForm(req);
    } catch (parseError) {
      return res
        .status(400)
        .json({ error: true, code: 'FILE_TOO_LARGE', message: 'File too large. Max size is 10MB.' });
    }

    const uploaded = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploaded) {
      return res.status(400).json({ error: true, code: 'INVALID_FILE', message: 'No image file was provided.' });
    }

    const mimetype = uploaded.mimetype || uploaded.type;
    if (!mimetype || !mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: true,
        code: 'INVALID_FILE_TYPE',
        message: 'Please upload an image file (JPG, PNG, or WebP).',
      });
    }

    if (uploaded.size > MAX_FILE_SIZE_BYTES) {
      return res
        .status(400)
        .json({ error: true, code: 'FILE_TOO_LARGE', message: 'File too large. Max size is 10MB.' });
    }

    const buffer = await readFile(uploaded.filepath);
    const file = new Blob([buffer], { type: mimetype });

    if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
      const mock = buildResult({ aiGenerated: MOCK_SCORE }, 'mock');
      logDetection(mock);
      return res.status(200).json(mock);
    }

    let result;
    try {
      result = await callSightengine(file);
    } catch (detectError) {
      const shouldFallback = detectError.status === 429 || detectError.status >= 500;
      if (!shouldFallback || !process.env.AZURE_ENDPOINT || !process.env.AZURE_KEY) {
        throw detectError;
      }
      result = await callAzure(file);
    }

    logDetection(result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[detect] outer catch:', error.message, error.status ?? '');
    return res.status(502).json({
      error: true,
      code: 'DETECTION_FAILED',
      fallback_attempted: true,
      message: 'Our detection service is temporarily unavailable. Try again in a few minutes.',
    });
  }
}
