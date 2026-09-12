import { IncomingForm } from 'formidable';
import { readFile } from 'fs/promises';

export const config = { api: { bodyParser: false } };

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MOCK_SCORE = 0.82;
const HIVE_FETCH_TIMEOUT_MS = 12000;
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

function buildResult(scoreFraction, source) {
  const score_percent = Math.round(scoreFraction * 100);
  const bucket = scoreToBucket(score_percent);
  const label = bucketToLabel(bucket);
  return {
    score: scoreFraction,
    score_percent,
    label,
    bucket,
    source,
    message_key: `result_${label}`,
  };
}

async function callHive(file) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = file.type || 'image/jpeg';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HIVE_FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(
      'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HIVE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_metadata: true,
          input: [{ media_base64: `data:${mimeType};base64,${base64}` }],
        }),
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errBody = await response.text();
    console.error('[detect] Hive V3 error body:', errBody);
    const error = new Error(`Hive API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  console.log('[detect] Hive V3 raw response:', JSON.stringify(data).slice(0, 500));

  // V3 returns per-frame results — take the first frame's score
  const output = data?.output?.[0];
  const classes = output?.classes || [];
  const match = classes.find((c) => c.class === 'ai_generated');
  if (!match) {
    throw new Error('Hive V3 response missing ai-generated class');
  }
  return buildResult(match.value, 'hive');
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
  return buildResult(data.score, 'azure');
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

    if (!process.env.HIVE_API_KEY) {
      const mock = buildResult(MOCK_SCORE, 'mock');
      logDetection(mock);
      return res.status(200).json(mock);
    }

    let result;
    try {
      result = await callHive(file);
    } catch (hiveError) {
      const shouldFallback = hiveError.status === 429 || hiveError.status >= 500;
      if (!shouldFallback || !process.env.AZURE_ENDPOINT || !process.env.AZURE_KEY) {
        throw hiveError;
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
