export const config = {
  api: { bodyParser: false },
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MOCK_SCORE = 0.82;

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

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
  const form = new FormData();
  form.append('media', file, file.name || 'upload');

  const response = await fetch('https://api.thehive.ai/api/v2/task/sync/deepfake_detection', {
    method: 'POST',
    headers: { Authorization: `Token ${process.env.HIVE_API_KEY}` },
    body: form,
  });

  if (!response.ok) {
    const error = new Error(`Hive API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const classes = data.status?.[0]?.response?.output?.[0]?.classes || [];
  const match = classes.find((c) => c.class === 'ai-generated');
  if (!match) {
    throw new Error('Hive response missing ai-generated class');
  }
  return buildResult(match.score, 'hive');
}

async function callAzure(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await fetch(
    `${process.env.AZURE_ENDPOINT}/contentsafety/image:analyze?api-version=2023-10-01`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: { content: buffer.toString('base64') } }),
    }
  );

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

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return jsonResponse({ error: true, code: 'METHOD_NOT_ALLOWED', message: 'Only POST is supported.' }, 405);
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return jsonResponse({ error: true, code: 'INVALID_FILE', message: 'No image file was provided.' }, 400);
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return jsonResponse(
        { error: true, code: 'INVALID_FILE_TYPE', message: 'Please upload an image file (JPG, PNG, or WebP).' },
        400
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return jsonResponse({ error: true, code: 'FILE_TOO_LARGE', message: 'File too large. Max size is 10MB.' }, 400);
    }

    if (!process.env.HIVE_API_KEY) {
      const mock = buildResult(MOCK_SCORE, 'mock');
      logDetection(mock);
      return jsonResponse(mock, 200);
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
    return jsonResponse(result, 200);
  } catch (error) {
    return jsonResponse(
      {
        error: true,
        code: 'DETECTION_FAILED',
        fallback_attempted: true,
        message: 'Our detection service is temporarily unavailable. Try again in a few minutes.',
      },
      502
    );
  }
}
