const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15000;

// ─── DOM refs ───────────────────────────────────────────────────────────────
const uploadScreen    = document.getElementById('upload-screen');
const resultScreen    = document.getElementById('result-screen');
const uploadZone      = document.getElementById('upload-zone');
const uploadText      = uploadZone.querySelector('.upload-text');
const fileInput       = document.getElementById('file-input');
const analyzeBtn      = document.getElementById('analyze-btn');
const formError       = document.getElementById('form-error');
const resetBtn        = document.getElementById('reset-btn');
const scoreDisplay    = document.getElementById('score-display');
const scoreNumber     = document.getElementById('score-number');
const scoreLabel      = document.getElementById('score-label');
const scoreExplanation= document.getElementById('score-explanation');
const crisisPathway   = document.getElementById('crisis-pathway');
const crisisSteps     = document.getElementById('crisis-steps');
const ngoCard         = document.getElementById('ngo-card');
const langBtns        = document.querySelectorAll('.lang-btn');

// ─── Translations ────────────────────────────────────────────────────────────
const T = {
  es: {
    heroTitle:       '¿Esta imagen es real?',
    heroSubtitle:    'Sube una foto para saber si fue creada por IA.',
    uploadPrompt:    'Toca para subir o arrastra una imagen aquí',
    analyzeBtn:      'Analizar',
    analyzingBtn:    'Analizando...',
    resetBtn:        'Analizar otra imagen',
    privacyNote:     'No guardamos tu imagen ni ningún dato personal.',
    crisisTitle:     '¿Qué puedes hacer?',
    labels: {
      likely_real:   'Probablemente real',
      uncertain:     'No podemos determinarlo con certeza',
      likely_fake:   'Probablemente creada por IA',
    },
    explanations: {
      likely_real:   'Esta imagen no muestra señales de haber sido generada por IA.',
      uncertain:     'Nuestra detección no pudo clasificar esta imagen con certeza.',
      likely_fake:   'Esta imagen probablemente fue creada o alterada por IA.',
    },
    errors: {
      INVALID_FILE:          'Por favor selecciona un archivo de imagen.',
      INVALID_FILE_TYPE:     'Sube una imagen en formato JPG, PNG o WebP.',
      FILE_TOO_LARGE:        'Archivo muy grande. El máximo es 10 MB.',
      TIMEOUT:               'Está tardando más de lo esperado. Intenta de nuevo.',
      NETWORK:               'No se pudo conectar. Revisa tu internet e intenta de nuevo.',
      DETECTION_FAILED:      'Detección temporalmente no disponible. Intenta en unos minutos.',
      DETECTION_UNAVAILABLE: 'Detección temporalmente no disponible. Intenta en unos minutos.',
    },
    crisisSteps: [
      'Guarda evidencia: toma una captura de pantalla con la URL visible.',
      'No compartas el contenido — reportarlo a quienes necesitan verlo es suficiente.',
      'Contacta a una organización de apoyo:',
    ],
    ngo: { name: 'Red Infancia MX', phone: '+52-55-XXXX-XXXX', url: 'https://redinfanciamx.org', label: 'redinfanciamx.org' },
  },

  en: {
    heroTitle:       'Is this image real?',
    heroSubtitle:    'Upload a photo to find out if it was created by AI.',
    uploadPrompt:    'Tap to upload or drag an image here',
    analyzeBtn:      'Analyze',
    analyzingBtn:    'Analyzing...',
    resetBtn:        'Analyze another image',
    privacyNote:     "We don't save your image or any personal data.",
    crisisTitle:     'What can you do?',
    labels: {
      likely_real:   'Probably real',
      uncertain:     "We can't determine this with certainty",
      likely_fake:   'Likely created by AI',
    },
    explanations: {
      likely_real:   'This image does not show signs of AI generation.',
      uncertain:     'Our detection could not confidently classify this image.',
      likely_fake:   'This image was likely created or altered by AI.',
    },
    errors: {
      INVALID_FILE:          'Please select an image file.',
      INVALID_FILE_TYPE:     'Please upload an image file (JPG, PNG, or WebP).',
      FILE_TOO_LARGE:        'File too large. Max size is 10MB.',
      TIMEOUT:               'Taking longer than expected. Please try again.',
      NETWORK:               'Could not connect. Check your internet and try again.',
      DETECTION_FAILED:      'Detection temporarily unavailable. Try again in a few minutes.',
      DETECTION_UNAVAILABLE: 'Detection temporarily unavailable. Try again in a few minutes.',
    },
    crisisSteps: [
      'Save evidence: take a screenshot showing the URL.',
      'Do not share the content — reporting it to the right people is enough.',
      'Contact a support organization:',
    ],
    ngo: { name: 'Cyber Peace Foundation', phone: '', url: 'https://cyberpeacefoundation.org', label: 'cyberpeacefoundation.org' },
  },

  hi: {
    heroTitle:       'क्या यह तस्वीर असली है?',
    heroSubtitle:    'जानने के लिए फ़ोटो अपलोड करें कि यह AI से बनी है या नहीं।',
    uploadPrompt:    'यहाँ टैप करें या तस्वीर खींचकर डालें',
    analyzeBtn:      'जाँचें',
    analyzingBtn:    'जाँच हो रही है...',
    resetBtn:        'दूसरी तस्वीर जाँचें',
    privacyNote:     'हम आपकी तस्वीर या कोई भी व्यक्तिगत डेटा सेव नहीं करते।',
    crisisTitle:     'आप क्या कर सकते हैं?',
    labels: {
      likely_real:   'संभवतः असली',
      uncertain:     'हम निश्चित नहीं हैं',
      likely_fake:   'संभवतः AI से बनी',
    },
    explanations: {
      likely_real:   'इस तस्वीर में AI जनरेशन के कोई संकेत नहीं हैं।',
      uncertain:     'हमारी प्रणाली इस तस्वीर को निश्चित रूप से वर्गीकृत नहीं कर पाई।',
      likely_fake:   'यह तस्वीर संभवतः AI द्वारा बनाई या बदली गई है।',
    },
    errors: {
      INVALID_FILE:          'कृपया एक इमेज फ़ाइल चुनें।',
      INVALID_FILE_TYPE:     'JPG, PNG या WebP फ़ॉर्मेट में तस्वीर अपलोड करें।',
      FILE_TOO_LARGE:        'फ़ाइल बहुत बड़ी है। अधिकतम 10 MB।',
      TIMEOUT:               'अपेक्षा से अधिक समय लग रहा है। दोबारा कोशिश करें।',
      NETWORK:               'कनेक्ट नहीं हो पाया। इंटरनेट जाँचें और दोबारा कोशिश करें।',
      DETECTION_FAILED:      'जाँच अस्थायी रूप से उपलब्ध नहीं है। कुछ मिनट बाद कोशिश करें।',
      DETECTION_UNAVAILABLE: 'जाँच अस्थायी रूप से उपलब्ध नहीं है। कुछ मिनट बाद कोशिश करें।',
    },
    crisisSteps: [
      'सबूत सेव करें: URL दिखाते हुए स्क्रीनशॉट लें।',
      'सामग्री साझा न करें — सही लोगों को रिपोर्ट करना पर्याप्त है।',
      'एक सहायता संगठन से संपर्क करें:',
    ],
    ngo: { name: 'Cyber Peace Foundation', phone: '+91-XXXX-XXXXXX', url: 'https://cyberpeacefoundation.org', label: 'cyberpeacefoundation.org' },
  },
};

// ─── Language state ──────────────────────────────────────────────────────────
let currentLang = 'es';
let currentResult = null;
let selectedFile  = null;

function applyLanguage(lang) {
  currentLang = lang;
  const t = T[lang];

  // static text
  document.querySelectorAll('.hero-title').forEach(el => el.textContent = t.heroTitle);
  document.querySelectorAll('.hero-subtitle').forEach(el => el.textContent = t.heroSubtitle);
  document.querySelectorAll('.upload-text').forEach(el => {
    if (!selectedFile) el.textContent = t.uploadPrompt;
  });
  document.querySelectorAll('.privacy-note').forEach(el => el.textContent = t.privacyNote);

  // buttons
  if (!analyzeBtn.classList.contains('loading')) {
    analyzeBtn.textContent = t.analyzeBtn;
  }
  resetBtn.textContent = t.resetBtn;

  // toggle active state on ALL lang buttons (both screens)
  langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));

  // re-render result if visible
  if (currentResult) {
    scoreLabel.textContent      = t.labels[currentResult.label]       || '';
    scoreExplanation.textContent= t.explanations[currentResult.label] || '';
    if (currentResult.bucket !== 'low') renderCrisisPathway();
  }

  // update <html lang>
  document.documentElement.lang = lang;
}

// wire toggle buttons
langBtns.forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

// ─── File handling ───────────────────────────────────────────────────────────
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
  const t = T[currentLang];

  if (!file.type || !file.type.startsWith('image/')) {
    showFormError(t.errors.INVALID_FILE_TYPE);
    analyzeBtn.disabled = true;
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    showFormError(t.errors.FILE_TOO_LARGE);
    analyzeBtn.disabled = true;
    return;
  }

  selectedFile = file;
  uploadText.textContent = `${file.name} (${formatFileSize(file.size)})`;
  analyzeBtn.disabled = false;
}

uploadZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});
uploadZone.addEventListener('dragover',  (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// ─── Loading state ───────────────────────────────────────────────────────────
function setLoading(isLoading) {
  const t = T[currentLang];
  analyzeBtn.disabled = isLoading;
  analyzeBtn.classList.toggle('loading', isLoading);
  analyzeBtn.textContent = isLoading ? t.analyzingBtn : t.analyzeBtn;
}

// ─── Score animation ─────────────────────────────────────────────────────────
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

// ─── Crisis pathway ──────────────────────────────────────────────────────────
function renderCrisisPathway() {
  const t = T[currentLang];
  document.querySelector('.crisis-title').textContent = t.crisisTitle;

  crisisSteps.innerHTML = '';
  t.crisisSteps.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    crisisSteps.appendChild(li);
  });

  ngoCard.innerHTML = '';
  const { name, phone, url, label } = t.ngo;

  const nameEl = document.createElement('p');
  nameEl.className = 'ngo-name';
  nameEl.textContent = name;
  ngoCard.appendChild(nameEl);

  if (phone) {
    const phoneEl = document.createElement('p');
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:${phone.replace(/\D/g, '')}`;
    phoneLink.textContent = phone;
    phoneEl.appendChild(phoneLink);
    ngoCard.appendChild(phoneEl);
  }

  const webEl = document.createElement('p');
  const webLink = document.createElement('a');
  webLink.href = url;
  webLink.target = '_blank';
  webLink.rel = 'noopener';
  webLink.textContent = label;
  webEl.appendChild(webLink);
  ngoCard.appendChild(webEl);
}

// ─── Show result ─────────────────────────────────────────────────────────────
function showResult(data) {
  currentResult = data;
  const t = T[currentLang];

  uploadScreen.hidden = true;
  resultScreen.hidden = false;

  scoreDisplay.dataset.bucket = data.bucket;
  scoreNumber.textContent = '0';
  animateScore(data.score_percent);

  scoreLabel.textContent       = t.labels[data.label]       || '';
  scoreExplanation.textContent = t.explanations[data.label] || '';

  if (data.bucket !== 'low') {
    renderCrisisPathway();
    crisisPathway.hidden = false;
  } else {
    crisisPathway.hidden = true;
  }
}

// ─── Error handler ───────────────────────────────────────────────────────────
function showError(code) {
  const t = T[currentLang];
  setLoading(false);
  showFormError(t.errors[code] || 'Something went wrong. Please try again.');
  analyzeBtn.disabled = !selectedFile;
}

// ─── Analyze ─────────────────────────────────────────────────────────────────
analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  clearFormError();
  setLoading(true);

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('country', currentLang === 'hi' ? 'IN' : 'MX');
  formData.append('language', currentLang);

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/detect', { method: 'POST', body: formData, signal: controller.signal });
    const data     = await response.json();
    if (data.error) { showError(data.code); return; }
    setLoading(false);
    showResult(data);
  } catch (error) {
    showError(error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK');
  } finally {
    clearTimeout(timeoutId);
  }
});

// ─── Reset ───────────────────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => window.location.reload());

// ─── Init ────────────────────────────────────────────────────────────────────
applyLanguage('es');