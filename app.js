const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15000;

const uploadScreen = document.getElementById('upload-screen');
const resultScreen = document.getElementById('result-screen');
const uploadZone = document.getElementById('upload-zone');
const uploadText = uploadZone.querySelector('.upload-text');
const fileInput = document.getElementById('file-input');
const analyzeBtn = document.getElementById('analyze-btn');
const formError = document.getElementById('form-error');
const resetBtn = document.getElementById('reset-btn');

const scoreDisplay = document.getElementById('score-display');
const scoreNumber = document.getElementById('score-number');
const scoreLabel = document.getElementById('score-label');
const scoreExplanation = document.getElementById('score-explanation');
const crisisPathway = document.getElementById('crisis-pathway');
const crisisSteps = document.getElementById('crisis-steps');
const ngoCard = document.getElementById('ngo-card');

let selectedFile = null;

const RESULT_LABEL_TEXT = {
  likely_real: 'Probably real',
  uncertain: "We can't determine this with certainty",
  likely_fake: 'Likely created by AI',
};

const RESULT_EXPLANATION_TEXT = {
  likely_real: 'This image does not show signs of AI generation.',
  uncertain: 'Our detection could not confidently classify this image.',
  likely_fake: 'This image was likely created or altered by AI.',
};

const ERROR_MESSAGES = {
  INVALID_FILE: 'Please select an image file.',
  INVALID_FILE_TYPE: 'Please upload an image file (JPG, PNG, or WebP).',
  FILE_TOO_LARGE: 'File too large. Max size is 10MB.',
  TIMEOUT: 'Taking longer than expected. Please try again.',
  NETWORK: 'Could not connect. Check your internet and try again.',
  DETECTION_FAILED: 'Detection temporarily unavailable. Try again in a few minutes.',
  DETECTION_UNAVAILABLE: 'Detection temporarily unavailable. Try again in a few minutes.',
};

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearFormError() {
  formError.textContent = '';
  formError.hidden = true;
}

function handleFile(file) {
  clearFormError();

  if (!file.type || !file.type.startsWith('image/')) {
    showFormError(ERROR_MESSAGES.INVALID_FILE_TYPE);
    analyzeBtn.disabled = true;
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    showFormError(ERROR_MESSAGES.FILE_TOO_LARGE);
    analyzeBtn.disabled = true;
    return;
  }

  selectedFile = file;
  uploadText.textContent = `${file.name} (${formatFileSize(file.size)})`;
  analyzeBtn.disabled = false;
}

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});

uploadZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = event.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFile(file);
});

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.classList.toggle('loading', isLoading);
  analyzeBtn.textContent = isLoading ? 'Analyzing...' : 'Analyze';
}

function animateScore(target) {
  const duration = 800;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    scoreNumber.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function renderCrisisPathwayMX() {
  crisisSteps.innerHTML = '';
  const steps = [
    'Guarda evidencia: toma una captura de pantalla con la URL visible.',
    'No compartas el contenido — reportarlo a quienes necesitan verlo es suficiente.',
    'Contacta a una organización de apoyo:',
  ];
  steps.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    crisisSteps.appendChild(li);
  });

  ngoCard.innerHTML = '';
  const name = document.createElement('p');
  name.className = 'ngo-name';
  name.textContent = 'Red Infancia MX';

  const phone = document.createElement('p');
  const phoneLink = document.createElement('a');
  phoneLink.href = 'tel:+525500000000';
  phoneLink.textContent = '+52-55-XXXX-XXXX';
  phone.appendChild(phoneLink);

  const website = document.createElement('p');
  const websiteLink = document.createElement('a');
  websiteLink.href = 'https://redinfanciamx.org';
  websiteLink.target = '_blank';
  websiteLink.rel = 'noopener';
  websiteLink.textContent = 'redinfanciamx.org';
  website.appendChild(websiteLink);

  ngoCard.append(name, phone, website);
}

function showResult(data) {
  uploadScreen.hidden = true;
  resultScreen.hidden = false;

  scoreDisplay.dataset.bucket = data.bucket;
  scoreNumber.textContent = '0';
  animateScore(data.score_percent);

  scoreLabel.textContent = RESULT_LABEL_TEXT[data.label] || '';
  scoreExplanation.textContent = RESULT_EXPLANATION_TEXT[data.label] || '';

  if (data.bucket !== 'low') {
    renderCrisisPathwayMX();
    crisisPathway.hidden = false;
  } else {
    crisisPathway.hidden = true;
  }
}

function showError(code) {
  setLoading(false);
  showFormError(ERROR_MESSAGES[code] || 'Something went wrong. Please try again.');
  analyzeBtn.disabled = !selectedFile;
}

analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  clearFormError();
  setLoading(true);

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('country', 'MX');
  formData.append('language', 'es');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/detect', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    const data = await response.json();

    if (data.error) {
      showError(data.code);
      return;
    }

    setLoading(false);
    showResult(data);
  } catch (error) {
    showError(error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK');
  } finally {
    clearTimeout(timeoutId);
  }
});

resetBtn.addEventListener('click', () => {
  window.location.reload();
});
