// On-device NSFW / nudity pre-filter for photo uploads.
//
// Runs entirely in the browser via a self-hosted NSFWJS model (TensorFlow.js,
// vendored at lib/vendor/nsfwjs/ and lib/vendor/nsfw-model/). The image file
// never leaves the device for this check: it is classified locally, and the
// result (a yes/no + confidence) is the only thing app.js acts on.
//
// This replaces the old manual "does this show someone under 18 nude..." yes/no
// question. Automatically blocking "Analizar con IA" when the on-device check is
// positive (or fails to run) matters specifically because sending such an image to
// a third-party analysis API (Sightengine, Azure) would itself be a transmission of
// the material -- Art. 202 CPF (MX) punishes that transmission, not just possession.
// So this check runs on file selection, before any upload is possible, and on any
// failure we block by precaution rather than falling back to letting the user pass.

const NSFWJS_SCRIPT_URL = '/lib/vendor/nsfwjs/nsfwjs.min.js';
const MODEL_URL = '/lib/vendor/nsfw-model/mobilenet_v2/';

// NSFWJS (mobilenet_v2) returns probabilities for: Drawing, Hentai, Neutral, Porn, Sexy.
// Thresholds below are a reasonable starting point, not a validated clinical cutoff --
// they should be revisited once the team can test against real (consented) sample images.
// "Sexy" alone needs a higher bar than Porn/Hentai, since swimwear/fitness photos also
// score high on that class alone.
const UNSAFE_SUM_THRESHOLD = 0.5;    // Porn + Hentai + Sexy combined
const PORN_HENTAI_THRESHOLD = 0.4;   // Porn + Hentai alone (ignoring Sexy)
const SEXY_ALONE_THRESHOLD = 0.75;   // Sexy by itself

let scriptLoadPromise = null;
let modelLoadPromise = null;

function loadScript() {
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.nsfwjs) { resolve(window.nsfwjs); return; }
    const script = document.createElement('script');
    script.src = NSFWJS_SCRIPT_URL;
    script.onload = () => resolve(window.nsfwjs);
    script.onerror = () => reject(new Error('NSFWJS_SCRIPT_LOAD_FAILED'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

function loadModel() {
  if (!modelLoadPromise) {
    modelLoadPromise = loadScript()
      .then((nsfwjs) => nsfwjs.load(MODEL_URL))
      .catch((err) => { modelLoadPromise = null; throw err; }); // allow retry on a later file
  }
  return modelLoadPromise;
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('IMAGE_DECODE_FAILED')); };
    img.src = url;
  });
}

// Classifies one image file on-device.
// Returns { unsafe: boolean, confidence: 'low'|'medium'|'high' }.
// Throws on any failure (model/script load, decode) -- callers must treat a throw
// as "block by precaution", never as "safe to proceed".
export async function checkImage(file) {
  const model = await loadModel();
  const img = await fileToImage(file);
  let predictions;
  try {
    predictions = await model.classify(img);
  } finally {
    if (img.src) URL.revokeObjectURL(img.src);
  }

  const byClass = Object.fromEntries(predictions.map((p) => [p.className, p.probability]));
  const porn = byClass.Porn || 0;
  const hentai = byClass.Hentai || 0;
  const sexy = byClass.Sexy || 0;
  const unsafeSum = porn + hentai + sexy;

  const unsafe = unsafeSum >= UNSAFE_SUM_THRESHOLD
    || (porn + hentai) >= PORN_HENTAI_THRESHOLD
    || sexy >= SEXY_ALONE_THRESHOLD;

  let confidence = 'low';
  if (unsafeSum >= 0.85) confidence = 'high';
  else if (unsafeSum >= 0.65) confidence = 'medium';

  return { unsafe, confidence };
}

// Warms up the script + model without classifying anything, so the first real
// check (on file selection) is faster. Safe to call speculatively; swallows errors
// since checkImage() will surface and handle them for real when it matters.
export function warmUp() {
  loadModel().catch(() => {});
}
