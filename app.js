import { LEGAL_FRAMEWORK_TITLE, buildMxLetterLegal, getLegalReference } from './lib/countries/mx.legal.js';
import { initFlow } from './lib/flow/index.js';
import { flow } from './lib/flow/session.js';
import { renderCurrent } from './lib/flow/router.js';
import { getContent } from './lib/content/index.js';
import { SITE_DOMAIN } from './lib/siteConfig.js';
import { AZURE_PRIVACY_URL, SIGHTENGINE_URL } from './lib/privacyServices.js';

const MAX_FILE_SIZE_BYTES       = 10 * 1024 * 1024; // final cap, matches api/detect.js
const COMPRESSION_MIN_BYTES     = 800 * 1024;        // below this, skip compression
const MAX_UPLOAD_DIMENSION_PX   = 1920;              // cap longest side
const JPEG_QUALITY              = 0.8;
const CANVAS_COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const REQUEST_TIMEOUT_MS        = 22000;             // 2s longer than server's maxDuration (vercel.json)

// DOM refs
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
const scoreGenerator  = document.getElementById('score-generator');
const langBtns        = document.querySelectorAll('.lang-btn');
const downloadPdfBtn     = document.getElementById('download-pdf-btn');

const analyzeHint    = document.getElementById('analyze-hint');
const uploadPreview  = document.getElementById('upload-preview');
const uploadPreviewImg = document.getElementById('upload-preview-img');
const uploadIcon     = document.getElementById('upload-icon');
const uploadHint     = document.getElementById('upload-hint');
const resultHeading  = document.getElementById('result-heading');
const scoreCaption   = document.getElementById('score-caption');
const scoreMeterFill = document.getElementById('score-meter-fill');

// Extra UI strings (labels, hints, orientation copy)
const UI = {
  es: {
    stepUpload:   'Elige la imagen',
    stepAnalyze:  'Revisa si fue creada por IA',
    uploadHint:   'JPG, PNG o WebP. Máximo 10 MB.',
    analyzeHint:  'Elige una imagen para activar este botón.',
    changeImage:  'Toca para cambiar la imagen',
    or:           'o',
    resultHeading:'Resultado',
    scoreCaption: 'Probabilidad de creada por IA',
    generatorLabel: 'Posible generador: ',
    faceSwapExplanation: 'Parece una manipulación del rostro (face swap), no una imagen creada por completo con IA.',
  },
  en: {
    stepUpload:   'Choose the image',
    stepAnalyze:  'Check if it was created by AI',
    uploadHint:   'JPG, PNG or WebP. Max 10 MB.',
    analyzeHint:  'Choose an image to enable this button.',
    changeImage:  'Tap to change the image',
    or:           'or',
    resultHeading:'Result',
    scoreCaption: 'Chance it was created by AI',
    generatorLabel: 'Possible generator: ',
    faceSwapExplanation: 'This looks like a face manipulation (face swap), not an image created entirely by AI.',
  },
  hi: {
    stepUpload:   'तस्वीर चुनें',
    stepAnalyze:  'जाँचें कि वह AI से बनी है या नहीं',
    uploadHint:   'JPG, PNG या WebP। अधिकतम 10 MB।',
    analyzeHint:  'इस बटन को चालू करने के लिए तस्वीर चुनें।',
    changeImage:  'तस्वीर बदलने के लिए टैप करें',
    or:           'या',
    resultHeading:'परिणाम',
    scoreCaption: 'AI से बनी होने की संभावना',
    generatorLabel: 'संभावित जनरेटर: ',
    faceSwapExplanation: 'यह चेहरे में हेरफेर (फेस स्वैप) लगता है, पूरी तरह AI से बनी तस्वीर नहीं।',
  },
};

// Translations
const T = {
  es: {
    uploadPrompt:    'Toca para subir o arrastra una imagen aquí',
    preparingImage:  'Preparando imagen...',
    analyzeBtn:      'Analizar',
    analyzingBtn:    'Analizando...',
    resetBtn:        'Analizar otra imagen',
    labels: {
      likely_real:   'Probablemente real',
      uncertain:     'No podemos determinarlo con certeza',
      likely_fake:   'Probablemente creada por IA',
    },
    explanations: {
      likely_real:   'Según la herramienta, esta imagen no muestra señales de haber sido generada por IA. Puede equivocarse.',
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
      DETECTION_NOT_CONFIGURED: 'El servicio de análisis no está configurado todavía. No se generó ningún resultado. Inténtalo más tarde.',
    },
  },

  en: {
    uploadPrompt:    'Tap to upload or drag an image here',
    preparingImage:  'Preparing image...',
    analyzeBtn:      'Analyze',
    analyzingBtn:    'Analyzing...',
    resetBtn:        'Analyze another image',
    labels: {
      likely_real:   'Probably real',
      uncertain:     "We can't determine this with certainty",
      likely_fake:   'Likely created by AI',
    },
    explanations: {
      likely_real:   'According to the tool, this image does not show signs of AI generation. It can be wrong.',
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
      DETECTION_NOT_CONFIGURED: 'The analysis service is not set up yet. No result was generated. Please try again later.',
    },
  },

  hi: {
    uploadPrompt:    'यहाँ टैप करें या तस्वीर खींचकर डालें',
    preparingImage:  'इमेज तैयार हो रही है...',
    analyzeBtn:      'जाँचें',
    analyzingBtn:    'जाँच हो रही है...',
    resetBtn:        'दूसरी तस्वीर जाँचें',
    labels: {
      likely_real:   'संभवतः असली',
      uncertain:     'हम निश्चित नहीं हैं',
      likely_fake:   'संभवतः AI से बनी',
    },
    explanations: {
      likely_real:   'टूल के अनुसार इस तस्वीर में AI जनरेशन के कोई संकेत नहीं हैं। वह गलत भी हो सकता है।',
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
      DETECTION_NOT_CONFIGURED: 'विश्लेषण सेवा अभी सेट अप नहीं है। कोई नतीजा नहीं बना। कृपया बाद में कोशिश करें।',
    },
  },
};

// PDF evidence report strings
const PDF_STRINGS = {
  es: {
    btn:          'Descargar reporte PDF',
    noAnalysis:   'No se analizó la imagen: este reporte no incluye ningún puntaje. Contiene los datos del caso y los pasos recomendados.',
    locale:       'es-MX',
    analyzedOn:   'Fecha y hora del análisis',
    generatedOn:  'Fecha y hora del reporte',
    resultTitle:  'Resultado del análisis',
    probability:  'Probabilidad de manipulación',
    meaningTitle: 'Qué significa este resultado',
    meaning: {
      low:    'Una probabilidad baja indica que no encontramos señales claras de manipulación por IA. Aun así, ningún detector es perfecto: si algo te preocupa, confía en tu criterio y busca apoyo.',
      medium: 'Una probabilidad media significa que hay algunas señales de posible manipulación, pero no podemos estar seguros. Trátalo con cuidado y no lo compartas mientras buscas ayuda.',
      high:   'Una probabilidad alta indica que la imagen probablemente fue creada o alterada con IA. Esto no es tu culpa, y hay pasos concretos que puedes tomar para frenar su difusión.',
    },
    stepsTitle: 'Pasos recomendados',
    steps: [
      'Documenta: guarda el enlace, el nombre de usuario, la fecha y la hora. No guardes ni reenvíes la imagen.',
      'Reporta a la plataforma: usa la opción de reporte de la red social o app donde aparece la imagen y pide que la eliminen.',
      'Busca apoyo: habla con un adulto de confianza y contacta a una organización o autoridad de tu país.',
    ],
    disclaimer: 'Este reporte es una herramienta de apoyo generada automáticamente. No constituye evidencia legal por sí solo. Consulta a un adulto de confianza o autoridad.',
    footer:     SITE_DOMAIN,
  },
  en: {
    btn:          'Download PDF report',
    noAnalysis:   'The image was not analyzed: this report does not include any score. It contains the case details and the recommended steps.',
    locale:       'en-US',
    analyzedOn:   'Analysis date and time',
    generatedOn:  'Report date and time',
    resultTitle:  'Analysis result',
    probability:  'Probability of manipulation',
    meaningTitle: 'What this result means',
    meaning: {
      low:    'A low probability means we found no clear signs of AI manipulation. Still, no detector is perfect: if something worries you, trust your instincts and seek support.',
      medium: 'A medium probability means there are some signs of possible manipulation, but we cannot be sure. Handle it with care and do not share it while you look for help.',
      high:   'A high probability means the image was likely created or altered with AI. This is not your fault, and there are concrete steps you can take to stop it from spreading.',
    },
    stepsTitle: 'Recommended steps',
    steps: [
      'Document: save the link, the username, the date and the time. Do not save or forward the image.',
      'Report to the platform: use the report option on the social network or app where the image appears and ask for its removal.',
      'Seek support: talk to a trusted adult and contact an organization or authority in your country.',
    ],
    disclaimer: 'This report is an automatically generated support tool. It does not constitute legal evidence on its own. Consult a trusted adult or authority.',
    footer:     SITE_DOMAIN,
  },
  hi: {
    btn:          'PDF रिपोर्ट डाउनलोड करें',
    noAnalysis:   'तस्वीर की जाँच नहीं की गई: इस रिपोर्ट में कोई स्कोर नहीं है। इसमें मामले का ब्योरा और सुझाए गए कदम हैं।',
    locale:       'hi-IN',
    analyzedOn:   'जाँच की तारीख और समय',
    generatedOn:  'रिपोर्ट की तारीख और समय',
    resultTitle:  'जाँच का परिणाम',
    probability:  'छेड़छाड़ की संभावना',
    meaningTitle: 'इस परिणाम का क्या मतलब है',
    meaning: {
      low:    'कम संभावना का मतलब है कि हमें AI द्वारा छेड़छाड़ के स्पष्ट संकेत नहीं मिले। फिर भी कोई भी डिटेक्टर पूरी तरह सही नहीं होता: अगर कुछ चिंता की बात है, तो अपनी समझ पर भरोसा करें और सहायता लें।',
      medium: 'मध्यम संभावना का मतलब है कि छेड़छाड़ के कुछ संकेत हैं, लेकिन हम निश्चित नहीं हैं। सावधानी रखें और मदद ढूँढते समय इसे साझा न करें।',
      high:   'अधिक संभावना का मतलब है कि तस्वीर संभवतः AI से बनाई या बदली गई है। यह आपकी गलती नहीं है, और इसे फैलने से रोकने के लिए आप ठोस कदम उठा सकते हैं।',
    },
    stepsTitle: 'सुझाए गए कदम',
    steps: [
      'दस्तावेज़ बनाएँ: लिंक, यूज़रनेम, तारीख और समय सेव करें। तस्वीर को सेव या फ़ॉरवर्ड न करें।',
      'प्लेटफ़ॉर्म को रिपोर्ट करें: जिस सोशल नेटवर्क या ऐप पर तस्वीर है, वहाँ रिपोर्ट विकल्प का उपयोग करें और उसे हटाने का अनुरोध करें।',
      'सहायता लें: किसी विश्वसनीय वयस्क से बात करें और अपने देश के किसी संगठन या अधिकारी से संपर्क करें।',
    ],
    disclaimer: 'यह रिपोर्ट स्वचालित रूप से बनाया गया एक सहायता उपकरण है। यह अपने आप में कानूनी सबूत नहीं है। किसी विश्वसनीय वयस्क या अधिकारी से सलाह लें।',
    footer:     SITE_DOMAIN,
  },
};

// Language state
let currentLang = 'es';
let currentResult = null;
let selectedFile  = null;
let analyzedAt = null;
let flowApi = null; // set by initFlow at the bottom of the file

function applyLanguage(lang) {
  currentLang = lang;
  const t  = T[lang];

  document.querySelectorAll('.upload-text').forEach(el => {
    if (!selectedFile) el.textContent = t.uploadPrompt;
  });

  // buttons
  if (!analyzeBtn.classList.contains('loading')) {
    analyzeBtn.textContent = t.analyzeBtn;
  }
  resetBtn.textContent        = t.resetBtn;
  downloadPdfBtn.textContent  = PDF_STRINGS[lang].btn;

  // extra UI strings
  const ui = UI[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = ui[el.dataset.i18n] || ''; });
  resultHeading.textContent = ui.resultHeading;
  scoreCaption.textContent  = ui.scoreCaption;
  if (selectedFile) uploadHint.textContent = ui.changeImage;
  updateAnalyzeHint();
  renderPrivacyUi();
  renderContentGuard();
  if (!altRouteEl.hidden) renderBlockedNote();

  // toggle active state on ALL lang buttons
  langBtns.forEach(btn => {
    const on = btn.dataset.lang === lang;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });

  // The flow layer re-renders the current step and picks the default country from the language.
  if (flowApi) flowApi.setLang(lang);
  renderStateField();

  if (currentResult) {
    renderResultDetails();
    renderLowNote();
  }

  applyVideoLanguage();
  updateSchoolLetterVisibility();

  // update <html lang>
  document.documentElement.lang = lang;
}

// wire toggle buttons
langBtns.forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

// File handling
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

async function maybeCompressImage(file) {
  if (!CANVAS_COMPRESSIBLE_TYPES.has(file.type)) return file;       // HEIC/HEIF/GIF/etc: upload as-is
  if (file.size < COMPRESSION_MIN_BYTES) return file;               // already small: skip for speed
  if (typeof createImageBitmap !== 'function') return file;         // no browser support: fail open

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_UPLOAD_DIMENSION_PX / Math.max(bitmap.width, bitmap.height));
    const targetW = Math.round(bitmap.width * scale);
    const targetH = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;               // didn't help: keep original

    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('[compress] falling back to original file:', err);
    return file;                                                    // fail open: never block the flow
  }
}

let handleFileToken = 0;
let previewUrl = null;

function updateAnalyzeHint() {
  analyzeHint.textContent = inputMode === 'video' ? VIDEO_STRINGS[currentLang].analyzeHint : UI[currentLang].analyzeHint;
  analyzeHint.hidden = hasAnalyzeInput() || analyzeBtn.classList.contains('loading');
}

function setPreview(file) {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = file ? URL.createObjectURL(file) : null;
  uploadPreview.hidden = !file;
  uploadIcon.hidden = !!file;
  uploadZone.classList.toggle('has-file', !!file);
  if (file) uploadPreviewImg.src = previewUrl; else uploadPreviewImg.removeAttribute('src');
}

async function handleFile(file) {
  clearFormError();
  hideBlockedNote();
  const t = T[currentLang];
  const myToken = ++handleFileToken;

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

  analyzeBtn.disabled = true;
  uploadText.textContent = t.preparingImage;

  const processed = await maybeCompressImage(file);
  if (myToken !== handleFileToken) return; // a newer file was selected meanwhile; discard this result

  selectedFile = processed;
  uploadText.textContent = `${processed.name} (${formatFileSize(processed.size)})`;
  uploadHint.textContent = UI[currentLang].changeImage;
  setPreview(processed);
  analyzeBtn.disabled = false;
  updateAnalyzeHint();
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

// Loading state
function setLoading(isLoading) {
  const t = T[currentLang];
  analyzeBtn.disabled = isLoading || !hasAnalyzeInput();
  analyzeBtn.classList.toggle('loading', isLoading);
  const loadingText = inputMode === 'video' ? VIDEO_STRINGS[currentLang].analyzing : t.analyzingBtn;
  analyzeBtn.textContent = isLoading ? loadingText : t.analyzeBtn;
  updateAnalyzeHint();
}

// Score animation
function animateScore(target) {
  const duration = 800;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    scoreNumber.textContent = Math.round(eased * target);
    scoreMeterFill.style.transform = `scaleX(${(eased * target) / 100})`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Privacy disclaimer + "how it works" modal
const PRIVACY_STRINGS = {
  es: {
    link: '¿Cómo funciona?',
    close: 'Cerrar',
    title: 'Cómo funciona VeraShield',
    sections: [
      { h: 'VeraShield no almacena tu imagen', p: 'Cuando subes una imagen, la analizamos y la descartamos de inmediato. No creamos cuentas, no pedimos datos personales y no guardamos ningún archivo tuyo.' },
      { h: 'Detección de IA: Sightengine', p: 'Tu imagen se envía a Sightengine para determinar si fue generada o manipulada con IA. Sightengine la procesa bajo su propia política de privacidad y no la usa para entrenar modelos sin tu consentimiento explícito.', a: 'Ver política de Sightengine →', url: SIGHTENGINE_URL },
    ],
  },
  en: {
    link: 'How does it work?',
    close: 'Close',
    title: 'How VeraShield Works',
    sections: [
      { h: 'VeraShield does not store your image', p: "When you upload an image, we analyze it and discard it immediately. We don't create accounts, we don't ask for personal data, and we don't keep any of your files." },
      { h: 'AI Detection: Sightengine', p: 'Your image is sent to Sightengine to determine whether it was AI-generated or manipulated. Sightengine processes it under their own privacy policy and does not use it to train models without your explicit consent.', a: "View Sightengine's policy →", url: SIGHTENGINE_URL },
    ],
  },
  hi: {
    link: 'यह कैसे काम करता है?',
    close: 'बंद करें',
    title: 'VeraShield कैसे काम करता है',
    sections: [
      { h: 'VeraShield आपकी इमेज स्टोर नहीं करता', p: 'जब आप इमेज अपलोड करते हैं, हम उसका विश्लेषण करके तुरंत हटा देते हैं। हम कोई अकाउंट नहीं बनाते, कोई व्यक्तिगत डेटा नहीं मांगते और आपकी कोई फ़ाइल नहीं रखते।' },
      { h: 'AI डिटेक्शन: Sightengine', p: 'यह जांचने के लिए कि इमेज AI-generated या manipulated है या नहीं, आपकी इमेज Sightengine को भेजी जाती है। Sightengine इसे अपनी privacy policy के तहत process करता है और बिना आपकी सहमति के इसे model training के लिए उपयोग नहीं करता।', a: 'Sightengine की policy देखें →', url: SIGHTENGINE_URL },
    ],
  },
};

const privacyModal = document.getElementById('privacy-modal');
const privacyModalTitle = document.getElementById('privacy-modal-title');
const privacyModalBody = document.getElementById('privacy-modal-body');
const privacyModalClose = document.getElementById('privacy-modal-close');
let privacyLastFocus = null;

function renderPrivacyModal() {
  const s = PRIVACY_STRINGS[currentLang];
  privacyModalTitle.textContent = s.title;
  privacyModalClose.setAttribute('aria-label', s.close);
  privacyModalBody.replaceChildren();
  s.sections.forEach(sec => {
    const h = document.createElement('h3');
    h.textContent = sec.h;
    const p = document.createElement('p');
    p.textContent = sec.p;
    privacyModalBody.append(h, p);
    if (sec.a) {
      const link = document.createElement('a');
      link.href = sec.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = sec.a;
      const wrap = document.createElement('p');
      wrap.appendChild(link);
      privacyModalBody.appendChild(wrap);
    }
  });
}

function openPrivacyModal() {
  privacyLastFocus = document.activeElement;
  renderPrivacyModal();
  privacyModal.hidden = false;
  privacyModalClose.focus();
}

function closePrivacyModal() {
  privacyModal.hidden = true;
  if (privacyLastFocus && privacyLastFocus.focus) privacyLastFocus.focus();
}

// Zero-storage panel shown next to Analyze on the upload screen.
// Replaces the old one-line disclaimers. Texts requested by SocialTIC.
// VERIFICAR: the Hindi text has not been checked (URLs live in lib/privacyServices.js).
const PRIVACY_PANEL_STRINGS = {
  es: {
    summary: 'Tu imagen es privada',
    title: '¿Qué pasa con tu imagen?',
    memory: 'Se guarda un instante en un archivo temporal del servidor y se borra al terminar el análisis. VeraShield no la conserva.',
    sent: 'Se envía temporalmente a servicios de IA para el análisis:',
    services: [
      { name: 'Sightengine (Kozelo SAS, París)', url: SIGHTENGINE_URL },
      { name: 'Microsoft Azure AI Content Safety (solo si el servicio principal falla)', url: AZURE_PRIVACY_URL },
    ],
    after: 'Después del análisis, VeraShield no conserva ninguna copia.',
    more: '¿Cómo funciona esto?',
  },
  en: {
    summary: 'Your image is private',
    title: 'What happens to your image?',
    memory: 'It is kept for a moment in a temporary file on the server and deleted when the analysis ends. VeraShield does not keep it.',
    sent: 'Temporarily sent to AI services for analysis:',
    services: [
      { name: 'Sightengine (Kozelo SAS, Paris)', url: SIGHTENGINE_URL },
      { name: 'Microsoft Azure AI Content Safety (only if the main service fails)', url: AZURE_PRIVACY_URL },
    ],
    after: 'After analysis, VeraShield keeps no copy.',
    more: 'How does this work?',
  },
  hi: {
    summary: 'आपकी इमेज निजी है',
    title: 'आपकी इमेज का क्या होता है?',
    memory: 'इसे कुछ पल के लिए सर्वर की अस्थायी फ़ाइल में रखा जाता है और विश्लेषण खत्म होते ही मिटा दिया जाता है। VeraShield इसे नहीं रखता।',
    sent: 'विश्लेषण के लिए इसे अस्थायी रूप से AI सेवाओं को भेजा जाता है:',
    services: [
      { name: 'Sightengine (Kozelo SAS, पेरिस)', url: SIGHTENGINE_URL },
      { name: 'Microsoft Azure AI Content Safety (केवल तब जब मुख्य सेवा विफल हो)', url: AZURE_PRIVACY_URL },
    ],
    after: 'विश्लेषण के बाद VeraShield इसकी कोई प्रति नहीं रखता।',
    more: 'यह कैसे काम करता है?',
  },
};

function buildPrivacyPanel(open) {
  const s = PRIVACY_PANEL_STRINGS[currentLang];
  const el = (tag, text) => { const n = document.createElement(tag); if (text) n.textContent = text; return n; };
  const link = (href, text) => {
    const a = el('a', text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  };

  const details = el('details');
  details.className = 'privacy-panel';
  details.open = open;
  details.appendChild(el('summary', s.summary));

  const services = el('ul');
  s.services.forEach(({ name, url }) => {
    const li = el('li', name + ' → ');
    li.appendChild(link(url, url.replace(/^https:\/\//, '')));
    services.appendChild(li);
  });
  const sent = el('li', s.sent);
  sent.appendChild(services);

  const list = el('ul');
  list.append(el('li', s.memory), sent, el('li', s.after));

  const more = el('p');
  more.appendChild(link('/privacy?lang=' + currentLang, s.more + ' →'));
  const title = el('p', s.title);
  title.className = 'privacy-panel-title';
  details.append(title, list, more);
  return details;
}

function renderPrivacyUi() {
  const host = document.getElementById('privacy-panel-upload');
  const prev = host.querySelector('details');
  host.replaceChildren(buildPrivacyPanel(prev ? prev.open : true)); // open by default, keeps the user's choice
  if (!privacyModal.hidden) renderPrivacyModal();
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-privacy-open]')) openPrivacyModal();
  else if (e.target === privacyModal) closePrivacyModal();
});
privacyModalClose.addEventListener('click', closePrivacyModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !privacyModal.hidden) closePrivacyModal();
});

// Content guard
// Blocking question asked BEFORE any file leaves the browser (Sightengine, Azure).
// Art. 202 CPF (MX) punishes "transmitting" sexual material involving minors, so sending it to
// a third-party API is itself the offence. Nothing is logged externally; only console.warn.
const CONTENT_GUARD_STRINGS = {
  es: {
    question: 'Antes de continuar: ¿La imagen o video que vas a analizar muestra desnudez o contenido sexual de alguien menor de 18 años?',
    no: 'No, continuar',
    yes: 'Sí, detener el análisis',
  },
  en: {
    question: "Before continuing: Does the image or video you're uploading contain nudity or sexual content of someone under 18?",
    no: 'No, continue',
    yes: 'Yes, stop the analysis',
  },
  hi: {
    question: 'जारी रखने से पहले: क्या जिस फ़ोटो या वीडियो का आप विश्लेषण करने जा रहे हैं, उसमें 18 वर्ष से कम उम्र के किसी व्यक्ति की नग्नता या यौन सामग्री है?',
    no: 'नहीं, जारी रखें',
    yes: 'हाँ, विश्लेषण रोकें',
  },
};

const contentGuardModal    = document.getElementById('content-guard-modal');
const contentGuardQuestion = document.getElementById('content-guard-question');
const contentGuardNo       = document.getElementById('content-guard-no');
const contentGuardYes      = document.getElementById('content-guard-yes');
let contentGuardResolve   = null;  // pending answer while the modal is open
let contentGuardConfirmed = null;  // File (or 'url:...' key) the user already answered "No" for
let contentGuardLastFocus = null;

function renderContentGuard() {
  const s = CONTENT_GUARD_STRINGS[currentLang];
  contentGuardQuestion.textContent = s.question;
  contentGuardNo.textContent = s.no;
  contentGuardYes.textContent = s.yes;
}

function askContentGuard() {
  if (contentGuardResolve) return Promise.resolve(false);
  contentGuardLastFocus = document.activeElement;
  renderContentGuard();
  contentGuardModal.hidden = false;
  contentGuardYes.focus(); // safe default: stopping is the focused action
  return new Promise(resolve => { contentGuardResolve = resolve; });
}

function answerContentGuard(continueAnalysis) {
  const resolve = contentGuardResolve;
  if (!resolve) return;
  contentGuardResolve = null;
  contentGuardModal.hidden = true;
  if (contentGuardLastFocus && contentGuardLastFocus.focus) contentGuardLastFocus.focus();
  resolve(continueAnalysis);
}

contentGuardNo.addEventListener('click', () => answerContentGuard(true));
contentGuardYes.addEventListener('click', () => answerContentGuard(false));
// Blocking: Escape never dismisses it, and Tab stays inside the dialog.
document.addEventListener('keydown', (e) => {
  if (contentGuardModal.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return; }
  if (e.key !== 'Tab') return;
  const [first, last] = [contentGuardNo, contentGuardYes];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  else if (document.activeElement !== first && document.activeElement !== last) { e.preventDefault(); last.focus(); }
}, true);

function blockAnalysis() {
  console.warn('[VeraShield] Análisis bloqueado: el usuario indicó posible desnudez/contenido sexual de un menor de 18 años. No se envió ningún archivo a APIs externas.');
  resetAnalysis();
  showBlockedNote();
}

// Blocked note
// Shown when the content guard stops the analysis. The person does not need the analysis to get
// help, so the note only explains that nothing was sent and offers the next step.
const altRouteEl = document.getElementById('alternative-route');

function renderBlockedNote() {
  const c = getContent(currentLang).analysis;
  altRouteEl.replaceChildren();
  const text = document.createElement('p');
  text.id = 'alt-route-title';
  text.tabIndex = -1;
  text.textContent = c.blocked;
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'primary-btn';
  next.id = 'blocked-continue';
  next.textContent = c.blockedContinue;
  next.addEventListener('click', () => flow.step === 'analisis' && document.getElementById('analysis-skip').click());
  altRouteEl.append(text, next);
}

function showBlockedNote() {
  renderBlockedNote();
  altRouteEl.hidden = false;
  document.getElementById('alt-route-title').focus({ preventScroll: true });
}

function hideBlockedNote() {
  altRouteEl.hidden = true;
  altRouteEl.replaceChildren();
}

// key: the File (photo) or 'url:...' string (video URL) about to be sent. Resolves true only when it is safe to send.
async function ensureContentGuard(key) {
  if (key && key === contentGuardConfirmed) return true;
  if (await askContentGuard()) { contentGuardConfirmed = key; return true; }
  blockAnalysis();
  return false;
}

// Technical-analysis block shared by the evidence PDF and the school letter.
// Only written when an analysis result exists in state.
const TECH_STRINGS = {
  es: {
    title: 'Análisis técnico adjunto:',
    tool: `Herramienta utilizada: VeraShield (${SITE_DOMAIN})`,
    api: (a) => `API de detección: ${a}`,
    score: (n) => `Puntuación de detección: ${n}% de probabilidad de contenido generado con IA`,
    when: (d) => `Fecha y hora del análisis: ${d}`,
    note: 'Esta información es orientativa. Para uso legal, consulta a un especialista.',
  },
  en: {
    title: 'Technical analysis included:',
    tool: `Tool used: VeraShield (${SITE_DOMAIN})`,
    api: (a) => `Detection API: ${a}`,
    score: (n) => `Detection score: ${n}% probability of AI-generated content`,
    when: (d) => `Date and time of analysis: ${d}`,
    note: 'This information is indicative. For legal purposes, consult a specialist.',
  },
  hi: {
    title: 'तकनीकी विश्लेषण:',
    tool: `उपयोग किया गया टूल: VeraShield (${SITE_DOMAIN})`,
    api: (a) => `डिटेक्शन API: ${a}`,
    score: (n) => `स्कोर: ${n}% संभावना कि यह AI-generated है`,
    when: (d) => `विश्लेषण की तारीख और समय: ${d}`,
    note: 'यह जानकारी सांकेतिक है। कानूनी उपयोग के लिए किसी विशेषज्ञ से परामर्श लें।',
  },
};
const DETECTION_API_NAMES = { sightengine: 'Sightengine', azure: 'Azure AI Content Safety', mock: 'Mock (simulated test, not a real analysis)' };

function writeTechnicalBlock(w, lang, locale) {
  if (caseData.score_analisis === null) return;
  const tc = TECH_STRINGS[lang];
  const api = caseData.fuente_analisis;
  const when = (analyzedAt || new Date()).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' });
  w.rule(PDF_COLORS.muted, 0.2);
  w.text(tc.title, { size: 11, bold: true, gap: 2 });
  [tc.tool, tc.api(api), tc.score(caseData.score_analisis), tc.when(when)]
    .forEach((line) => w.text('- ' + line, { size: 10.5, gap: 1.5 }));
  w.text(tc.note, { size: 9.5, color: PDF_COLORS.muted, gap: 4 });
}

// PDF evidence report (100% client-side, nothing leaves the browser)
const PDF_PAGE_W_MM = 210;
const PDF_PAGE_H_MM = 297;
const PDF_MARGIN_MM = 20;
const PDF_PT_TO_MM  = 0.3528;
const PDF_LINE_H    = 1.45;
const PDF_BOTTOM_RESERVED_MM = 18; // room for footer
const PDF_CANVAS_PX_PER_MM   = 8;
const PDF_COLORS = {
  ink:    [17, 24, 39],
  muted:  [91, 100, 120],
  accent: [14, 150, 146],
  bucket: { low: [22, 163, 74], medium: [217, 119, 6], high: [220, 38, 38] },
};

// Helvetica (jsPDF's built-in font) has no Devanagari glyphs, so Hindi text is
// rasterized with the browser's own fonts and embedded as an image instead.
const PDF_CANVAS_FONT = '"Noto Sans Devanagari","Nirmala UI","Mangal","Inter",sans-serif';
let pdfMeasureCtx = null;

function pdfCanvasFont(size, bold) {
  return `${bold ? '700' : '400'} ${size * PDF_PT_TO_MM * PDF_CANVAS_PX_PER_MM}px ${PDF_CANVAS_FONT}`;
}

function pdfWrapCanvas(ctx, str, maxPx) {
  const lines = [];
  let line = '';
  str.split(/\s+/).forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxPx) { lines.push(line); line = word; }
    else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

// Returns a writer that flows text down the page(s) and adds pages as needed.
function createPdfWriter(doc, lang) {
  const useCanvas = lang === 'hi';
  const contentW  = PDF_PAGE_W_MM - 2 * PDF_MARGIN_MM;
  const pageLimit = PDF_PAGE_H_MM - PDF_BOTTOM_RESERVED_MM;
  let y = PDF_MARGIN_MM;
  doc.setLineHeightFactor(PDF_LINE_H);

  const fontStyle = (bold, italic) => (bold ? (italic ? 'bolditalic' : 'bold') : italic ? 'italic' : 'normal');

  function layout(str, size, bold, width, italic = false) {
    const lineH = size * PDF_PT_TO_MM * PDF_LINE_H;
    if (useCanvas) {
      pdfMeasureCtx = pdfMeasureCtx || document.createElement('canvas').getContext('2d');
      pdfMeasureCtx.font = (italic ? 'italic ' : '') + pdfCanvasFont(size, bold);
      const lines = pdfWrapCanvas(pdfMeasureCtx, str, width * PDF_CANVAS_PX_PER_MM);
      return { lines, h: lines.length * lineH, lineH };
    }
    doc.setFont('helvetica', fontStyle(bold, italic));
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(str, width);
    return { lines, h: lines.length * lineH, lineH };
  }

  function draw({ lines, h, lineH }, str, x, top, { size, bold, color, align, italic }, width) {
    if (useCanvas) {
      const canvas = document.createElement('canvas');
      canvas.width  = Math.ceil(width * PDF_CANVAS_PX_PER_MM);
      canvas.height = Math.ceil(h * PDF_CANVAS_PX_PER_MM);
      const ctx = canvas.getContext('2d');
      ctx.font = (italic ? 'italic ' : '') + pdfCanvasFont(size, bold);
      ctx.fillStyle = `rgb(${color.join(',')})`;
      ctx.textBaseline = 'top';
      ctx.textAlign = align;
      const px = align === 'right' ? canvas.width : align === 'center' ? canvas.width / 2 : 0;
      lines.forEach((l, i) => ctx.fillText(l, px, i * lineH * PDF_CANVAS_PX_PER_MM));
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, top, width, h);
    } else {
      doc.setFont('helvetica', fontStyle(bold, italic));
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const tx = align === 'right' ? x + width : align === 'center' ? x + width / 2 : x;
      doc.text(lines, tx, top, { baseline: 'top', align });
    }
  }

  return {
    contentW,
    pageLimit,
    get y() { return y; },
    space(mm) { y += mm; },
    ensure(mm) { if (y + mm > pageLimit) { doc.addPage(); y = PDF_MARGIN_MM; } },
    rule(color = PDF_COLORS.accent, weight = 0.6) {
      doc.setDrawColor(...color);
      doc.setLineWidth(weight);
      doc.line(PDF_MARGIN_MM, y, PDF_PAGE_W_MM - PDF_MARGIN_MM, y);
      y += 3;
    },
    text(str, { size = 11, bold = false, italic = false, color = PDF_COLORS.ink, align = 'left', gap = 3 } = {}) {
      const box = layout(str, size, bold, contentW, italic);
      if (y + box.h > pageLimit) { doc.addPage(); y = PDF_MARGIN_MM; }
      draw(box, str, PDF_MARGIN_MM, y, { size, bold, color, align, italic }, contentW);
      y += box.h + gap;
    },
    // Light-gray box with a colored left border; `blocks` are text() options plus `str`.
    callout(blocks, { bar = PDF_COLORS.accent } = {}) {
      const pad = 4;
      const innerW = contentW - 2 * pad;
      const boxes = blocks.map((b) => {
        const opts = { size: 10.5, bold: false, italic: false, color: PDF_COLORS.ink, align: 'left', gap: 1.5, ...b };
        return { opts, box: layout(opts.str, opts.size, opts.bold, innerW, opts.italic) };
      });
      const total = boxes.reduce((sum, { box, opts }) => sum + box.h + opts.gap, 0) + 2 * pad - boxes[boxes.length - 1].opts.gap;
      if (y + total > pageLimit) { doc.addPage(); y = PDF_MARGIN_MM; }
      doc.setFillColor(240, 241, 244);
      doc.rect(PDF_MARGIN_MM, y, contentW, total, 'F');
      doc.setFillColor(...bar);
      doc.rect(PDF_MARGIN_MM, y, 1.2, total, 'F');
      let top = y + pad;
      boxes.forEach(({ opts, box }) => {
        draw(box, opts.str, PDF_MARGIN_MM + pad, top, opts, innerW);
        top += box.h + opts.gap;
      });
      y += total + 5;
    },
    // fixed position, no flow (used for the footer on every page)
    textAt(str, top, opts) {
      const dx = opts.dx || 0;
      const width = contentW - dx;
      const box = layout(str, opts.size, opts.bold, width);
      draw(box, str, PDF_MARGIN_MM + dx, top, opts, width);
    },
  };
}

const CASE_STRINGS = {
  es: { title: 'Datos del caso', student: 'Alumno/a', school: 'Escuela', level: 'Nivel educativo', state: 'Estado', date: 'Fecha del incidente',
        ph: { student: '[nombre del alumno/a]', school: '[nombre de la escuela]', level: '[nivel educativo]', state: '[estado]', date: '[fecha del incidente]' } },
  en: { title: 'Case details', student: 'Student', school: 'School', level: 'School level', state: 'State', date: 'Date of the incident',
        ph: { student: '[student name]', school: '[school name]', level: '[school level]', state: '[state]', date: '[date of the incident]' } },
  hi: { title: 'मामले का विवरण', student: 'छात्र/छात्रा', school: 'विद्यालय', level: 'शिक्षा स्तर', state: 'राज्य', date: 'घटना की तारीख',
        ph: { student: '[छात्र/छात्रा का नाम]', school: '[विद्यालय का नाम]', level: '[शिक्षा स्तर]', state: '[राज्य]', date: '[घटना की तारीख]' } },
};
const LEVEL_KEYS = { basica: 'levelBasica', mediaFederal: 'levelMediaFederal', local: 'levelLocal', unknown: 'levelUnknown' };

// Reads the shared case data; a missing value prints its placeholder and never blocks generation.
function caseDataLines(lang) {
  const c = CASE_STRINGS[lang];
  const sl = SL[lang];
  const lines = [
    [c.student, caseData.nombre_victima || c.ph.student],
    [c.school, caseData.nombre_escuela || c.ph.school],
  ];
  if (flow.pais === 'mx') {
    lines.push([c.level, caseData.nivel_escolar ? sl[LEVEL_KEYS[caseData.nivel_escolar]] : c.ph.level]);
    lines.push([c.state, caseData.estado === 'unknown' ? sl.stateUnknown : (caseData.estado || c.ph.state)]);
  }
  lines.push([c.date, caseData.fecha_incidente ? isoToDate(caseData.fecha_incidente, sl.locale) : c.ph.date]);
  return lines;
}

function generateEvidencePdf() {
  if (!window.jspdf?.jsPDF) return;
  if (!requireState()) return;
  const lang = currentLang;
  const t    = T[lang];
  const p    = PDF_STRINGS[lang];
  const when = analyzedAt || new Date();
  const hasResult = !!currentResult;
  const bucket = hasResult && PDF_COLORS.bucket[currentResult.bucket] ? currentResult.bucket : 'medium';

  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const w = createPdfWriter(doc, lang);

  // 1. Header: textual logo + analysis date/time
  w.text('VeraShield', { size: 26, bold: true, color: PDF_COLORS.accent, gap: 1 });
  w.text(`${hasResult ? p.analyzedOn : p.generatedOn}: ${when.toLocaleString(p.locale, { dateStyle: 'long', timeStyle: 'short' })}`,
    { size: 10, color: PDF_COLORS.muted, gap: 2 });
  w.rule();
  w.space(4);

  // 1b. Case data (shared state)
  w.callout([
    { str: CASE_STRINGS[lang].title, bold: true, size: 11.5, gap: 2.5 },
    ...caseDataLines(lang).map(([label, value], i, all) => ({ str: `- ${label}: ${value}`, gap: i === all.length - 1 ? 0 : 1.5 })),
  ], { bar: PDF_COLORS.accent });

  // 2. Result (only when the optional analysis was done) or a clear note that it was not
  if (hasResult) {
    w.text(p.resultTitle, { size: 15, bold: true, gap: 3 });
    w.text(p.probability, { size: 10, color: PDF_COLORS.muted, gap: 1 });
    w.text(`${Math.round(currentResult.score_percent)}%`, { size: 38, bold: true, color: PDF_COLORS.bucket[bucket], gap: 2 });
    w.text(t.labels[currentResult.label] || '', { size: 13, bold: true, gap: 2 });
    w.text(t.explanations[currentResult.label] || '', { size: 11, gap: 6 });

    // 3. What this result means (by bucket)
    w.text(p.meaningTitle, { size: 15, bold: true, gap: 3 });
    w.text(p.meaning[bucket], { size: 11, gap: 6 });
  } else {
    w.text(p.resultTitle, { size: 15, bold: true, gap: 3 });
    w.text(p.noAnalysis, { size: 11, gap: 6 });
  }

  // 3b. Evidence preservation (own section, before the reporting steps).
  // Helvetica has no check/warning glyphs, so the PDF uses plain "- " bullets.
  const ev = getContent(lang).stop;
  w.callout([
    { str: ev.evidenceTitle, bold: true, size: 11.5, gap: 2.5 },
    ...ev.evidenceItems.map((item) => ({ str: '- ' + item })),
    { str: ev.evidenceWarn, bold: true, color: PDF_COLORS.bucket.high, gap: 0 },
  ], { bar: PDF_COLORS.bucket.medium });

  // 4. Recommended steps
  w.text(p.stepsTitle, { size: 15, bold: true, gap: 3 });
  p.steps.forEach((step, i) => w.text(`${i + 1}. ${step}`, { size: 11, gap: 3 }));
  w.space(4);

  // 4a. Legal framework for the selected state (Mexico only)
  if (flow.pais === 'mx') {
    const ref = getLegalReference(caseData.estado, lang);
    w.callout([
      { str: LEGAL_FRAMEWORK_TITLE[lang], bold: true, size: 11.5, gap: 2.5 },
      { str: (caseData.estado && caseData.estado !== 'unknown' ? caseData.estado + ': ' : '') + ref.estatuto, gap: ref.nota ? 1.5 : 0 },
      ...(ref.nota ? [{ str: ref.nota, italic: true, size: 10, color: PDF_COLORS.muted, gap: 0 }] : []),
    ], { bar: PDF_COLORS.accent });
  }

  // 4b. Technical analysis (tool, API, score, timestamp, found links)
  writeTechnicalBlock(w, lang, p.locale);

  // 5. Legal disclaimer
  w.rule(PDF_COLORS.muted, 0.2);
  w.text(p.disclaimer, { size: 9.5, color: PDF_COLORS.muted });

  // 6. Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...PDF_COLORS.muted);
    doc.setLineWidth(0.2);
    doc.line(PDF_MARGIN_MM, PDF_PAGE_H_MM - 14, PDF_PAGE_W_MM - PDF_MARGIN_MM, PDF_PAGE_H_MM - 14);
    w.textAt(p.footer, PDF_PAGE_H_MM - 11, { size: 9, bold: false, color: PDF_COLORS.muted, align: 'center' });
  }

  doc.save(`verashield-reporte-${Date.now()}.pdf`);
}

downloadPdfBtn.addEventListener('click', generateEvidencePdf);

// Result details (label, explanation, generator line)
function renderResultDetails() {
  if (!currentResult) return;
  const t = T[currentLang];
  const ui = UI[currentLang];
  const r = currentResult;

  scoreLabel.textContent = t.labels[r.label] || '';

  // Face-swap nuance: deepfake signal dominates, image is not fully AI-generated
  const faceSwapOnly = r.bucket !== 'low' && r.deepfake > 0.6 && r.aiGenerated < 0.4;
  scoreExplanation.textContent = faceSwapOnly ? ui.faceSwapExplanation : (t.explanations[r.label] || '');

  if (r.topGenerator && r.score > 0.5) {
    scoreGenerator.textContent = ui.generatorLabel + r.topGenerator;
    scoreGenerator.hidden = false;
  } else {
    scoreGenerator.textContent = '';
    scoreGenerator.hidden = true;
  }
}

// Low-result note ("a low result does not mean nothing happened")
const lowNote = document.getElementById('analysis-low-note');
function renderLowNote() {
  if (!currentResult) return;
  lowNote.textContent = getContent(currentLang).analysis.lowNote;
  lowNote.hidden = currentResult.bucket !== 'low';
  document.getElementById('analysis-accuracy-note').textContent = getContent(currentLang).analysis.accuracyResultNote;
}

// Show result: inside the optional analysis step. It never replaces the flow: the step keeps its
// Back and Continue buttons, and the next steps are the same whatever the result is.
function showResult(data) {
  currentResult = data;
  setAnalysis(data);
  analyzedAt = new Date();

  uploadScreen.hidden = true;
  resultScreen.hidden = false;

  resultHeading.textContent = UI[currentLang].resultHeading;
  scoreDisplay.dataset.bucket = data.bucket;
  scoreNumber.textContent = '0';
  animateScore(data.score_percent);

  renderResultDetails();
  renderLowNote();
  if (flowApi) flowApi.rerender(); // the step now offers "Continue" instead of "Skip"
  resultHeading.focus({ preventScroll: true });
}

// Back to the upload panel with nothing selected (does not touch the rest of the flow).
function resetAnalysis() {
  hideBlockedNote();
  handleFileToken++;
  selectedFile = null;
  contentGuardConfirmed = null;
  currentResult = null;
  setAnalysis(null);
  fileInput.value = '';
  clearVideoInputs();
  setPreview(null);
  uploadText.textContent = T[currentLang].uploadPrompt;
  uploadHint.textContent = UI[currentLang].uploadHint;
  analyzeBtn.disabled = true;
  setLoading(false);
  clearFormError();
  lowNote.hidden = true;
  scoreGenerator.hidden = true;
  resultScreen.hidden = true;
  uploadScreen.hidden = false;
  if (flowApi) flowApi.rerender();
}

// Everything: the analysis, the case data and the in-memory flow (used by Quick exit and Start over).
function resetAll() {
  resetAnalysis();
  clearCaseData();
  schoolLetterForm.reset();
  schoolLetterDetails.open = false;
  if (flowApi) flowApi.resetAll();
}

// School letter (MX / ES only)
// 100% client-side: form values never leave the browser. Reuses the jsPDF
// build already loaded in index.html.

const schoolLetterSection = document.getElementById('school-letter');
const schoolLetterDetails = document.getElementById('school-letter-details');
const schoolLetterForm    = document.getElementById('school-letter-form');
const slDescription       = document.getElementById('sl-description');
const slCounter           = document.getElementById('sl-counter');
const slError             = document.getElementById('sl-error');

const SL = {
  es: {
    locale: 'es-MX',
    title: 'Generar carta para mi escuela',
    intro: 'Esta carta la firma tu mamá, papá o tutor/a. Puedes llenarla tú y entregársela. Llena los datos que quieras (todos son opcionales). Se genera en tu dispositivo: nada se envía ni se guarda.',
    student: 'Nombre del alumno/a', studentPh: 'Ej. María Pérez López',
    grade: 'Grado y grupo', gradePh: 'Ej. 2.º B de secundaria',
    school: 'Nombre de la escuela', schoolPh: 'Ej. Secundaria Técnica No. 25',
    date: 'Fecha del incidente',
    desc: 'Descripción breve del incidente', descPh: 'Describe brevemente qué pasó, sin datos que no quieras compartir con la escuela.',
    guardian: 'Nombre del tutor o tutora legal', guardianPh: 'Ej. Ana López Ramírez',
    state: 'Estado', statePh: 'Selecciona tu estado', stateUnknown: 'No sé',
    descWarn: 'No describas contenido sexual ni adjuntes la imagen. La escuela leerá esta carta.',
    level: 'Nivel educativo', levelPh: 'Selecciona el nivel',
    levelBasica: 'Educación básica (preescolar, primaria o secundaria)',
    levelMediaFederal: 'Bachillerato federal (por ejemplo CBTIS o CETIS)',
    levelLocal: 'Bachillerato estatal o privado (por ejemplo COBACH)',
    levelUnknown: 'No sé',
    generate: 'Generar carta', clear: 'Limpiar formulario',
    pdfError: 'No se pudo cargar el generador de PDF. Revisa tu conexión e inténtalo de nuevo.',
    file: 'carta-escuela-verashield',
    addressee: (school) => 'C. Director(a) de ' + school,
    greeting: 'Presente',
    subject: 'Asunto: Solicitud de intervención por incidente de contenido digital no consensuado',
    body: (g, st, gr, inc) => 'Por medio de la presente, yo, ' + g + ', en mi carácter de tutor(a) legal del/de la alumno/a ' + st + ', quien cursa ' + gr + ' en esa institución, me dirijo a usted para hacer de su conocimiento un incidente de difusión o manipulación de contenido digital (imágenes o video) sin consentimiento, ocurrido ' + (inc ? 'el ' + inc : 'en fecha ____________________') + ', que afecta al/a la alumno/a.',
    descLabel: 'Descripción de los hechos: ',
    legal: {
      mx: (state, level) => buildMxLetterLegal('es', state, level), // text lives in lib/legalReferences.js
    },
    requestsIntro: 'Por lo anterior, solicito respetuosamente a esa dirección:',
    requests: [
      "1. Que se active el protocolo escolar correspondiente para esclarecer los hechos.",
      "2. Que se adopten medidas inmediatas de protección para el/la alumno/a, que garanticen su seguridad y su confidencialidad y eviten la revictimización.",
      "3. Que, conforme al protocolo, se notifique a las autoridades competentes cuando corresponda.",
      "4. Que se levante el acta correspondiente y se me entregue copia, con un folio de seguimiento.",
    ],
    closing: 'Sin otro particular, agradezco su atención y quedo en espera de su respuesta por escrito, con los plazos de atención.',
    farewell: 'Atentamente',
    signature: 'Tutor(a) legal (firma)',
    stampTitle: 'Para uso de la escuela',
    stampLine: 'Recibido por: ____________________   Fecha: ______________   Folio: ______________',
    footer: {
      mx: 'Esta carta es para reporte escolar. Para denuncia penal, el tutor debe acompañar al menor al Ministerio Público.',
    },
    generated: `Generado con VeraShield | ${SITE_DOMAIN}`,
  },
  en: {
    locale: 'en-US',
    title: 'Generate a letter for my school',
    intro: 'This letter is signed by your mom, dad or guardian. You can fill it in and hand it to them. Fill in whatever you like (everything is optional). It is created on your device: nothing is sent or saved.',
    student: 'Student name', studentPh: 'e.g. Maria Perez Lopez',
    grade: 'Grade and class', gradePh: 'e.g. Grade 8, Section B',
    school: 'School name', schoolPh: 'e.g. Riverside Secondary School',
    date: 'Date of the incident',
    desc: 'Short description of the incident', descPh: 'Briefly describe what happened. Leave out anything you do not want the school to know.',
    guardian: 'Name of parent or legal guardian', guardianPh: 'e.g. Ana Lopez Ramirez',
    state: 'State', statePh: 'Select your state', stateUnknown: "I don't know",
    descWarn: 'Do not describe sexual content or attach the image. The school will read this letter.',
    level: 'School level', levelPh: 'Select the level',
    levelBasica: 'Basic education (preschool, primary or lower secondary)',
    levelMediaFederal: 'Federal upper secondary (for example CBTIS or CETIS)',
    levelLocal: 'State or private upper secondary (for example COBACH)',
    levelUnknown: "I don't know",
    generate: 'Generate letter', clear: 'Clear form',
    pdfError: 'The PDF generator could not be loaded. Check your connection and try again.',
    file: 'school-letter-verashield',
    addressee: (school) => 'To the Principal of ' + school,
    greeting: 'Dear Principal,',
    subject: 'Subject: Request for action on a non-consensual digital content incident',
    body: (g, st, gr, inc) => 'I, ' + g + ', as the legal guardian of the student ' + st + ', who attends ' + gr + ' at your institution, am writing to inform you of an incident involving the sharing or manipulation of digital content (images or video) without consent, which occurred ' + (inc ? 'on ' + inc : 'on a date ____________________') + ' and affects the student.',
    descLabel: 'Description of events: ',
    legal: {
      mx: (state, level) => buildMxLetterLegal('en', state, level),
    },
    requestsIntro: 'For these reasons, I respectfully ask the school to:',
    requests: [
      "1. Activate the school protocol to establish the facts.",
      "2. Put immediate protection measures in place for the student that ensure their safety and confidentiality and prevent re-victimization.",
      "3. Notify the competent authorities when the protocol requires it.",
      "4. Make a formal record of the incident and give me a copy of it, together with a follow-up reference number.",
    ],
    closing: 'Thank you for your attention. I look forward to a written reply that states the response times.',
    farewell: 'Sincerely,',
    signature: 'Parent or legal guardian (signature)',
    stampTitle: 'For school use',
    stampLine: 'Received by: ____________________   Date: ______________   Ref. no.: ______________',
    footer: {
      mx: 'This letter is for school reporting. For a criminal complaint, the guardian should accompany the minor to the Public Prosecutor\'s Office (Ministerio Publico).',
    },
    generated: `Generated with VeraShield | ${SITE_DOMAIN}`,
  },
  hi: {
    locale: 'hi-IN',
    title: 'स्कूल के लिए पत्र बनाएँ',
    intro: 'इस पत्र पर आपकी माँ, पापा या अभिभावक हस्ताक्षर करते हैं। आप इसे भरकर उन्हें दे सकते हैं। जो जानकारी देना चाहें भरें (सब वैकल्पिक है)। यह आपके डिवाइस पर बनता है: कुछ भेजा या सेव नहीं किया जाता।',
    student: 'छात्र/छात्रा का नाम', studentPh: 'जैसे: प्रिया शर्मा',
    grade: 'कक्षा और सेक्शन', gradePh: 'जैसे: कक्षा 8, सेक्शन बी',
    school: 'स्कूल का नाम', schoolPh: 'जैसे: राजकीय उच्च माध्यमिक विद्यालय',
    date: 'घटना की तारीख',
    desc: 'घटना का संक्षिप्त विवरण', descPh: 'संक्षेप में बताएँ क्या हुआ। ऐसी बातें न लिखें जो आप स्कूल को नहीं बताना चाहते।',
    guardian: 'अभिभावक का नाम', guardianPh: 'जैसे: सुनीता शर्मा',
    state: 'राज्य', statePh: 'अपना राज्य चुनें', stateUnknown: 'मुझे नहीं पता',
    descWarn: 'यौन सामग्री का वर्णन न करें और तस्वीर न जोड़ें। स्कूल यह पत्र पढ़ेगा।',
    level: 'शिक्षा स्तर', levelPh: 'स्तर चुनें',
    levelBasica: 'बुनियादी शिक्षा (प्रीस्कूल, प्राथमिक या माध्यमिक)',
    levelMediaFederal: 'संघीय बाचिलेराटो (उच्च माध्यमिक), जैसे CBTIS या CETIS',
    levelLocal: 'राज्य या निजी बाचिलेराटो (उच्च माध्यमिक), जैसे COBACH',
    levelUnknown: 'मुझे नहीं पता',
    generate: 'पत्र बनाएँ', clear: 'फ़ॉर्म साफ़ करें',
    pdfError: 'PDF जनरेटर लोड नहीं हो सका। अपना कनेक्शन जाँचें और दोबारा कोशिश करें।',
    file: 'school-letter-verashield',
    addressee: (school) => 'सेवा में, प्रधानाचार्य, ' + school,
    greeting: 'आदरणीय प्रधानाचार्य जी,',
    subject: 'विषय: बिना सहमति के डिजिटल सामग्री से जुड़ी घटना पर कार्रवाई का अनुरोध',
    body: (g, st, gr, inc) => 'मैं, ' + g + ', छात्र/छात्रा ' + st + ' का कानूनी अभिभावक, जो आपके विद्यालय में ' + gr + ' में पढ़ता/पढ़ती है, आपको एक घटना की जानकारी देने के लिए लिख रहा/रही हूँ, जिसमें डिजिटल सामग्री (तस्वीरें या वीडियो) बिना सहमति के साझा या बदली गई। यह घटना ' + (inc ? inc + ' को' : 'दिनांक ____________________ को') + ' हुई और इससे छात्र/छात्रा प्रभावित है।',
    descLabel: 'घटना का विवरण: ',
    legal: {
      mx: (state, level) => buildMxLetterLegal('hi', state, level),
    },
    requestsIntro: 'इसलिए मैं विद्यालय से विनम्र अनुरोध करता/करती हूँ कि:',
    requests: [
      "1. तथ्यों का पता लगाने के लिए स्कूल का प्रोटोकॉल शुरू किया जाए।",
      "2. छात्र/छात्रा की सुरक्षा और गोपनीयता सुनिश्चित करने और दोबारा पीड़ित होने से बचाने के लिए तुरंत सुरक्षात्मक कदम उठाए जाएँ।",
      "3. प्रोटोकॉल के अनुसार जहाँ ज़रूरी हो वहाँ सक्षम अधिकारियों को सूचित किया जाए।",
      "4. घटना का औपचारिक रिकॉर्ड बनाया जाए और उसकी प्रति तथा अनुवर्ती संदर्भ संख्या मुझे दी जाए।",
    ],
    closing: 'आपके ध्यान के लिए धन्यवाद। मैं समय-सीमा बताने वाले लिखित उत्तर की प्रतीक्षा करूँगा/करूँगी।',
    farewell: 'सादर,',
    signature: 'अभिभावक (हस्ताक्षर)',
    stampTitle: 'विद्यालय के उपयोग के लिए',
    stampLine: 'प्राप्तकर्ता: ____________________   तारीख: ______________   संदर्भ संख्या: ______________',
    footer: {
      mx: 'यह पत्र विद्यालय को सूचित करने के लिए है। आपराधिक शिकायत के लिए अभिभावक नाबालिग के साथ लोक अभियोजक कार्यालय (Ministerio Publico) जाएँ।',
    },
    generated: `VeraShield से बनाया गया | ${SITE_DOMAIN}`,
  },
};

// State (entidad federativa) selector
// One control, one value, shared by the school letter and the evidence PDF. It starts on the
// upload screen and is moved (same DOM node) to the result screen, where both documents are
// generated. Purely local: nothing is sent anywhere.
const STATE_FIELD_STRINGS = {
  es: { label: '¿En qué estado está la escuela o donde ocurrió esto?', error: 'Selecciona un estado para generar este documento.' },
  en: { label: 'In which state is the school, or where did this happen?', error: 'Select a state to generate this document.' },
  hi: { label: 'स्कूल किस राज्य में है, या यह कहाँ हुआ?', error: 'यह दस्तावेज़ बनाने के लिए एक राज्य चुनें।' },
};
const stateField  = document.getElementById('state-field');
const stateSelect = document.getElementById('state-select');
const stateError  = document.getElementById('state-error');
// Shared case data: captured once, read by the letter, the evidence PDF and the WhatsApp message.
const caseData = {
  nombre_victima: '',
  nombre_escuela: '',
  nivel_escolar: '',      // '' | basica | mediaFederal | local
  estado: '',
  fecha_incidente: '',    // yyyy-mm-dd
  score_analisis: null,   // rounded %, null while there is no analysis
  fuente_analisis: 'ninguno',
};
const caseInputs = {
  nombre_victima: document.getElementById('sl-student'),
  nombre_escuela: document.getElementById('sl-school'),
  nivel_escolar: document.getElementById('sl-level'),
  fecha_incidente: document.getElementById('sl-date'),
};
Object.entries(caseInputs).forEach(([key, input]) => {
  input.addEventListener(input.tagName === 'SELECT' || input.type === 'date' ? 'change' : 'input', () => {
    caseData[key] = input.value.trim();
  });
});

function clearCaseData() {
  Object.assign(caseData, { nombre_victima: '', nombre_escuela: '', nivel_escolar: '', estado: '', fecha_incidente: '' });
  Object.values(caseInputs).forEach((input) => { input.value = ''; });
  stateSelect.value = '';
}

function setAnalysis(result) {
  caseData.score_analisis = result ? Math.round(result.score_percent) : null;
  caseData.fuente_analisis = result ? (DETECTION_API_NAMES[result.source] || result.source || 'N/A') : 'ninguno';
}

function renderStateField() {
  document.getElementById('state-label').textContent = STATE_FIELD_STRINGS[currentLang].label;
  if (!stateError.hidden) stateError.textContent = STATE_FIELD_STRINGS[currentLang].error;
  stateField.hidden = flow.pais !== 'mx';
}

stateSelect.addEventListener('change', () => {
  caseData.estado = stateSelect.value;
  if (caseData.estado) stateError.hidden = true;
});

// True when a Mexican document can be generated; otherwise shows the error and focuses the field.
function requireState() {
  if (flow.pais !== 'mx' || caseData.estado) return true;
  stateError.textContent = STATE_FIELD_STRINGS[currentLang].error;
  stateError.hidden = false;
  stateField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  stateSelect.focus({ preventScroll: true });
  return false;
}

const levelFields = document.querySelectorAll('[data-level-field]');

function applySchoolLetterStrings() {
  const sl = SL[currentLang];
  document.querySelectorAll('[data-sl]').forEach((el) => { el.textContent = sl[el.dataset.sl] || ''; });
  document.querySelectorAll('[data-sl-ph]').forEach((el) => { el.placeholder = sl[el.dataset.slPh] || ''; });
}

function updateSchoolLetterVisibility() {
  renderStateField();
  levelFields.forEach((f) => { f.hidden = flow.pais !== 'mx'; });
  applySchoolLetterStrings();
}

function isoToDate(iso, locale) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return '';
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString(locale, { dateStyle: 'long' });
}

function todayStamp(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function generateSchoolLetter() {
  slError.hidden = true;
  if (!requireState()) return;
  const sl = SL[currentLang];
  const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDFCtor) {
    slError.textContent = sl.pdfError;
    slError.hidden = false;
    return;
  }

  const val = (id) => document.getElementById(id).value.trim();
  const blank = (v, n = 18) => v || '_'.repeat(n);
  const country  = flow.pais;
  const student  = caseData.nombre_victima;
  const grade    = val('sl-grade');
  const school   = caseData.nombre_escuela;
  const guardian = val('sl-guardian');
  const known    = (v) => (v && v !== 'unknown' ? v : '');  // 'No sé' behaves like an empty choice
  const state    = country === 'mx' ? known(caseData.estado) : '';
  const level    = country === 'mx' ? known(caseData.nivel_escolar) : ''; // '' falls back to the local-protocol wording
  const incident = isoToDate(caseData.fecha_incidente, sl.locale);
  const desc     = val('sl-description').slice(0, 300);
  const now      = new Date();
  const today    = now.toLocaleDateString(sl.locale, { dateStyle: 'long' });

  const doc = new jsPDFCtor({ unit: 'mm', format: 'a4' });
  const w = createPdfWriter(doc, currentLang);
  const ink = PDF_COLORS.ink;

  const place = !state ? today : (currentLang === 'es' ? state + ', a ' + today : state + ', ' + today);
  w.text(place, { align: 'right', gap: 8, color: ink });
  w.text(sl.addressee(school || '______________________________'), { bold: true, gap: 0, color: ink });
  w.text(sl.greeting, { bold: true, gap: 8, color: ink });
  w.text(sl.subject, { bold: true, gap: 8, color: ink });

  w.text(sl.body(blank(guardian, 28), blank(student, 28), blank(grade, 14), incident), { gap: 4, color: ink });
  w.text(sl.descLabel + (desc || '_'.repeat(40)), { gap: desc ? 4 : 1, color: ink });
  if (!desc) w.text('_'.repeat(75), { gap: 4, color: ink });

  String(sl.legal[country](state, level)).split('\n\n').forEach((par) => w.text(par, { gap: 4, color: ink }));

  w.text(sl.requestsIntro, { gap: 2, color: ink });
  sl.requests.forEach((item) => w.text(item, { gap: 2, color: ink }));
  w.space(2);
  w.text(sl.closing, { gap: 8, color: ink });

  w.ensure(50);
  w.text(sl.farewell, { gap: 14, color: ink });
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(PDF_MARGIN_MM, w.y, PDF_MARGIN_MM + 80, w.y);
  w.space(3);
  w.text(blank(guardian, 28), { bold: true, gap: 0, color: ink });
  w.text(sl.signature, { size: 9, gap: 8, color: PDF_COLORS.muted });

  w.ensure(30);
  const boxTop = w.y;
  doc.setDrawColor(120);
  doc.setLineWidth(0.2);
  doc.rect(PDF_MARGIN_MM, boxTop, w.contentW, 24);
  w.textAt(sl.stampTitle, boxTop + 4, { size: 9, bold: true, color: ink, align: 'left', dx: 3 });
  w.textAt(sl.stampLine, boxTop + 13, { size: 9, bold: false, color: ink, align: 'left', dx: 3 });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...PDF_COLORS.muted);
    doc.setLineWidth(0.2);
    doc.line(PDF_MARGIN_MM, PDF_PAGE_H_MM - 20, PDF_PAGE_W_MM - PDF_MARGIN_MM, PDF_PAGE_H_MM - 20);
    w.textAt(sl.footer.mx + ' ' + sl.generated, PDF_PAGE_H_MM - 18, { size: 8, bold: false, color: PDF_COLORS.muted, align: 'left' });
  }

  doc.save(sl.file + '-' + todayStamp(now) + '.pdf');
}

schoolLetterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  generateSchoolLetter();
});

document.getElementById('sl-clear').addEventListener('click', () => {
  schoolLetterForm.reset();
  clearCaseData(); // the shared fields live outside the letter form
  slCounter.textContent = '0 / 300';
  slError.hidden = true;
});

slDescription.addEventListener('input', () => {
  slCounter.textContent = `${slDescription.value.length} / 300`;
});

// Video mode
// Photo/Video toggle, video upload (file or direct URL) and analysis. The result
// goes through the same showResult() as images, so the crisis pathway is shared.
const VIDEO_STRINGS = {
  es: {
    modeLabel: 'Tipo de archivo', modePhoto: 'Foto', modeVideo: 'Video',
    stepVideo: 'Elige el video',
    videoPrompt: 'Toca para subir o arrastra un video aquí',
    videoLimit: 'Máximo 50MB · Clips de hasta ~60 segundos',
    or: 'O',
    urlLabel: 'URL del video',
    urlPlaceholder: 'URL directa del archivo de video (no de redes sociales)',
    urlNote: 'Las URLs de TikTok, Instagram y YouTube no son compatibles. Descarga el video y súbelo como archivo.',
    preparing: 'Preparando video...',
    changeVideo: 'Toca para cambiar el video',
    analyzing: 'Analizando video...',
    analyzeHint: 'Sube un video o pega una URL para activar este botón.',
    errors: {
      UNSUPPORTED_URL: 'Esa URL no es compatible. Las URLs de TikTok, Instagram y YouTube (o cualquier página web) no funcionan: necesitamos el enlace directo al archivo de video. Descarga el video y súbelo como archivo.',
      VIDEO_TOO_LONG: 'El video es demasiado largo. Sube un clip de menos de 60 segundos.',
      VIDEO_PREPARE_FAILED: 'No pudimos preparar este video para enviarlo. Prueba con un clip más corto o en formato MP4.',
      INVALID_FILE: 'Por favor selecciona un archivo de video.',
      INVALID_FILE_TYPE: 'Sube un video en formato MP4, MOV, WebM o AVI.',
      FILE_TOO_LARGE: 'Video muy grande. El máximo es 50 MB.',
    },
  },
  en: {
    modeLabel: 'Media type', modePhoto: 'Photo', modeVideo: 'Video',
    stepVideo: 'Choose the video',
    videoPrompt: 'Tap to upload or drag a video here',
    videoLimit: 'Max 50MB · Clips up to ~60 seconds',
    or: 'OR',
    urlLabel: 'Video URL',
    urlPlaceholder: 'Direct video file URL (not social media pages)',
    urlNote: 'TikTok, Instagram, and YouTube URLs are not supported. Download the video and upload it as a file.',
    preparing: 'Preparing video...',
    changeVideo: 'Tap to change the video',
    analyzing: 'Analyzing video...',
    analyzeHint: 'Upload a video or paste a URL to enable this button.',
    errors: {
      UNSUPPORTED_URL: 'That URL is not supported. TikTok, Instagram, and YouTube URLs (or any web page) do not work: we need a direct link to the video file. Download the video and upload it as a file.',
      VIDEO_TOO_LONG: 'Video is too long. Please upload a clip under 60 seconds.',
      VIDEO_PREPARE_FAILED: 'We could not prepare this video for upload. Try a shorter clip or an MP4 file.',
      INVALID_FILE: 'Please select a video file.',
      INVALID_FILE_TYPE: 'Please upload a video in MP4, MOV, WebM or AVI format.',
      FILE_TOO_LARGE: 'Video too large. Max size is 50MB.',
    },
  },
  hi: {
    modeLabel: 'मीडिया प्रकार', modePhoto: 'फ़ोटो', modeVideo: 'वीडियो',
    stepVideo: 'वीडियो चुनें',
    videoPrompt: 'अपलोड करने के लिए टैप करें या वीडियो यहाँ खींचें',
    videoLimit: 'अधिकतम 50MB · ~60 सेकंड तक के क्लिप',
    or: 'या',
    urlLabel: 'वीडियो URL',
    urlPlaceholder: 'वीडियो फ़ाइल का सीधा URL (सोशल मीडिया नहीं)',
    urlNote: 'TikTok, Instagram और YouTube URLs काम नहीं करते। वीडियो डाउनलोड करके फ़ाइल के रूप में अपलोड करें।',
    preparing: 'वीडियो तैयार हो रहा है...',
    changeVideo: 'वीडियो बदलने के लिए टैप करें',
    analyzing: 'वीडियो का विश्लेषण हो रहा है...',
    analyzeHint: 'इस बटन को चालू करने के लिए वीडियो अपलोड करें या URL पेस्ट करें।',
    errors: {
      UNSUPPORTED_URL: 'यह URL काम नहीं करता। TikTok, Instagram और YouTube URLs (या कोई भी वेब पेज) काम नहीं करते: हमें वीडियो फ़ाइल का सीधा लिंक चाहिए। वीडियो डाउनलोड करके फ़ाइल के रूप में अपलोड करें।',
      VIDEO_TOO_LONG: 'वीडियो बहुत लंबा है। 60 सेकंड से कम का क्लिप अपलोड करें।',
      VIDEO_PREPARE_FAILED: 'हम इस वीडियो को अपलोड के लिए तैयार नहीं कर सके। छोटा क्लिप या MP4 फ़ाइल आज़माएँ।',
      INVALID_FILE: 'कृपया वीडियो फ़ाइल चुनें।',
      INVALID_FILE_TYPE: 'कृपया MP4, MOV, WebM या AVI वीडियो अपलोड करें।',
      FILE_TOO_LARGE: 'वीडियो बहुत बड़ा है। अधिकतम आकार 50MB है।',
    },
  },
};

const MAX_VIDEO_BYTES        = 50 * 1024 * 1024;  // matches api/detect-video.js
const VIDEO_DIRECT_MAX_BYTES = 4 * 1024 * 1024;   // Vercel rejects request bodies over 4.5MB
const VIDEO_MAX_SECONDS      = 60;
const VIDEO_DURATION_SLACK_S = 2;                 // "~60 seconds"
const VIDEO_MAX_SHORT_SIDE   = 480;
const VIDEO_TARGET_BYTES     = 3.4 * 1024 * 1024;
const VIDEO_REQUEST_TIMEOUT_MS = 62000;           // 2s longer than detect-video's maxDuration (vercel.json)
const VIDEO_EXT_TYPES = { mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', avi: 'video/x-msvideo' };
const SOCIAL_HOST_RE  = /(^|\.)(tiktok\.com|instagram\.com|youtube\.com|youtu\.be|facebook\.com|fb\.watch|twitter\.com|x\.com|t\.co|snapchat\.com|reddit\.com|vimeo\.com|twitch\.tv)$/i;

const modeToggle      = document.getElementById('mode-toggle');
const modeBtns        = modeToggle.querySelectorAll('.mode-btn');
const photoInputBlock = document.getElementById('photo-input-block');
const videoInputBlock = document.getElementById('video-input-block');
const videoZone       = document.getElementById('video-upload-zone');
const videoInput      = document.getElementById('video-input');
const videoText       = document.getElementById('video-upload-text');
const videoHint       = document.getElementById('video-upload-hint');
const videoUrlInput   = document.getElementById('video-url');

let inputMode = 'photo';
let selectedVideo = null;
let videoPreparing = false;
let videoToken = 0;

function hasVideoInput() {
  return !!selectedVideo || videoUrlInput.value.trim() !== '';
}

function hasAnalyzeInput() {
  return inputMode === 'video' ? hasVideoInput() : !!selectedFile;
}

function renderVideoZone() {
  const vs = VIDEO_STRINGS[currentLang];
  if (videoPreparing) return; // progress text owns the zone while compressing
  if (selectedVideo) {
    videoText.textContent = `${selectedVideo.name} (${formatFileSize(selectedVideo.size)})`;
    videoHint.textContent = vs.changeVideo;
  } else {
    videoText.textContent = vs.videoPrompt;
    videoHint.textContent = vs.videoLimit;
  }
  videoZone.classList.toggle('has-file', !!selectedVideo);
}

function applyVideoLanguage() {
  const vs = VIDEO_STRINGS[currentLang];
  document.querySelectorAll('[data-vi18n]').forEach(el => {
    if (el === videoText || el === videoHint) return;
    el.textContent = vs[el.dataset.vi18n] || '';
  });
  document.querySelectorAll('[data-vi18n-ph]').forEach(el => { el.placeholder = vs[el.dataset.vi18nPh] || ''; });
  modeToggle.setAttribute('aria-label', vs.modeLabel);
  renderVideoZone();
  updateAnalyzeHint();
  renderVideoSoon();
}

const VIDEO_SOON_STRINGS = {
  es: { title: "Detección de video: próximamente", body: "Estamos trabajando para traerte análisis de deepfakes en video. Por ahora, puedes analizar imágenes en la pestaña de imagen." },
  en: { title: "Video Detection: coming soon", body: "We're working on bringing deepfake detection to videos. For now, you can analyze images in the image tab." },
  hi: { title: "वीडियो डिटेक्शन: जल्द आ रहा है", body: "हम वीडियो के लिए डीपफेक डिटेक्शन पर काम कर रहे हैं। अभी के लिए, आप इमेज टैब में छवियों का विश्लेषण कर सकती/सकते हैं।" },
};
const videoSoon         = document.getElementById("video-soon");
const stepAnalyzeLabel  = document.getElementById("step-analyze-label");

// The video upload flow is paused: video mode shows a placeholder card and
// hides the analyze step. The upload code above stays in place, unreachable.
function renderVideoSoon() {
  const s = VIDEO_SOON_STRINGS[currentLang];
  document.getElementById("video-soon-title").textContent = s.title;
  document.getElementById("video-soon-body").textContent = s.body;
  const soon = inputMode === "video";
  videoSoon.hidden = !soon;
  stepAnalyzeLabel.hidden = soon;
  analyzeBtn.hidden = soon;
  analyzeHint.hidden = soon;
  if (soon) formError.hidden = true;
}

function setInputMode(mode) {
  if (mode === inputMode) return;
  inputMode = mode;
  clearFormError();
  const video = mode === 'video';
  photoInputBlock.hidden = video;
  videoInputBlock.hidden = true;
  modeBtns.forEach(btn => {
    const on = btn.dataset.mode === mode;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  analyzeBtn.disabled = !hasAnalyzeInput();
  updateAnalyzeHint();
  renderVideoSoon();
}
modeBtns.forEach(btn => btn.addEventListener('click', () => setInputMode(btn.dataset.mode)));

function clearVideoInputs() {
  videoToken++;
  selectedVideo = null;
  videoPreparing = false;
  videoInput.value = '';
  videoUrlInput.value = '';
  renderVideoZone();
}

// Video preparation (metadata check + browser-side downsizing)
function readVideoMeta(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    const done = (meta) => { clearTimeout(timer); v.removeAttribute('src'); v.load(); URL.revokeObjectURL(url); resolve(meta); };
    const timer = setTimeout(() => done(null), 8000);
    v.preload = 'metadata';
    v.muted = true;
    v.onloadedmetadata = () => done({ duration: v.duration, width: v.videoWidth, height: v.videoHeight });
    v.onerror = () => done(null);
    v.src = url;
  });
}

// Re-encodes in real time at low resolution/bitrate so the upload fits Vercel's
// 4.5MB request limit. Resolves null if the browser cannot do it.
function compressVideo(file, meta, isCancelled, onProgress) {
  return new Promise((resolve) => {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return resolve(null);
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']
      .find((m) => MediaRecorder.isTypeSupported(m));
    if (!mime || !meta.width || !meta.height || !isFinite(meta.duration)) return resolve(null);

    const scale = Math.min(1, VIDEO_MAX_SHORT_SIDE / Math.min(meta.width, meta.height));
    const w = Math.max(2, Math.round((meta.width * scale) / 2) * 2);
    const h = Math.max(2, Math.round((meta.height * scale) / 2) * 2);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = url;

    const stream = canvas.captureStream(24);
    const bps = Math.min(2000000, Math.max(120000, Math.floor((VIDEO_TARGET_BYTES * 8) / Math.max(meta.duration, 1))));
    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bps });
    } catch {
      URL.revokeObjectURL(url);
      return resolve(null);
    }

    const chunks = [];
    let finished = false;
    let guard = null;
    const finish = (ok) => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      stream.getTracks().forEach((tr) => tr.stop());
      v.pause();
      v.removeAttribute('src');
      v.load();
      URL.revokeObjectURL(url);
      if (!ok || chunks.length === 0) return resolve(null);
      const type = mime.split(';')[0];
      const ext = type === 'video/mp4' ? 'mp4' : 'webm';
      resolve(new File(chunks, `${file.name.replace(/\.\w+$/, '')}.${ext}`, { type, lastModified: Date.now() }));
    };

    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = () => finish(true);
    recorder.onerror = () => finish(false);
    guard = setTimeout(() => finish(false), (meta.duration + 20) * 1000);

    const schedule = () => {
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(drawFrame);
      else requestAnimationFrame(drawFrame);
    };
    const drawFrame = () => {
      if (finished) return;
      ctx.drawImage(v, 0, 0, w, h);
      schedule();
    };

    v.ontimeupdate = () => {
      if (isCancelled()) { finish(false); return; }
      onProgress(Math.min(1, v.currentTime / meta.duration));
    };
    v.onended = () => { if (recorder.state !== 'inactive') recorder.stop(); };
    v.onerror = () => finish(false);

    v.play().then(() => {
      recorder.start(1000);
      schedule();
    }).catch(() => finish(false));
  });
}

class VideoPrepareError extends Error {
  constructor(code) { super(code); this.code = code; }
}

async function prepareVideo(file, isCancelled, onProgress) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const type = file.type && file.type.startsWith('video/') ? file.type : (VIDEO_EXT_TYPES[ext] || '');
  const typed = file.type === type ? file : new File([file], file.name, { type, lastModified: file.lastModified });

  const meta = await readVideoMeta(file);
  if (meta && isFinite(meta.duration) && meta.duration > VIDEO_MAX_SECONDS + VIDEO_DURATION_SLACK_S) {
    throw new VideoPrepareError('VIDEO_TOO_LONG');
  }
  if (typed.size <= VIDEO_DIRECT_MAX_BYTES) return typed;

  if (!meta) throw new VideoPrepareError('VIDEO_PREPARE_FAILED');
  const compressed = await compressVideo(file, meta, isCancelled, onProgress);
  if (!compressed || compressed.size > VIDEO_DIRECT_MAX_BYTES) throw new VideoPrepareError('VIDEO_PREPARE_FAILED');
  return compressed;
}

function showVideoError(code) {
  const vs = VIDEO_STRINGS[currentLang];
  setLoading(false);
  showFormError(vs.errors[code] || T[currentLang].errors[code] || 'Something went wrong. Please try again.');
  analyzeBtn.disabled = !hasVideoInput();
}

async function handleVideoFile(file) {
  clearFormError();
  const vs = VIDEO_STRINGS[currentLang];
  const myToken = ++videoToken;
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  if (!(file.type && file.type.startsWith('video/')) && !VIDEO_EXT_TYPES[ext]) {
    showFormError(vs.errors.INVALID_FILE_TYPE);
    return;
  }
  if (file.size > MAX_VIDEO_BYTES) {
    showFormError(vs.errors.FILE_TOO_LARGE);
    return;
  }

  selectedVideo = null;
  videoUrlInput.value = '';
  analyzeBtn.disabled = true;
  videoPreparing = true;
  videoText.textContent = vs.preparing;
  videoHint.textContent = vs.videoLimit;
  const isCancelled = () => myToken !== videoToken;

  try {
    const prepared = await prepareVideo(file, isCancelled, (p) => {
      if (!isCancelled()) videoText.textContent = `${VIDEO_STRINGS[currentLang].preparing} ${Math.round(p * 100)}%`;
    });
    if (isCancelled()) return;
    selectedVideo = prepared;
    videoPreparing = false;
    renderVideoZone();
    analyzeBtn.disabled = false;
    updateAnalyzeHint();
  } catch (err) {
    if (isCancelled()) return;
    videoPreparing = false;
    videoInput.value = '';
    renderVideoZone();
    showFormError(VIDEO_STRINGS[currentLang].errors[err.code] || VIDEO_STRINGS[currentLang].errors.VIDEO_PREPARE_FAILED);
    analyzeBtn.disabled = !hasVideoInput();
    updateAnalyzeHint();
  }
}

videoZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); videoInput.click(); }
});
videoZone.addEventListener('dragover',  (e) => { e.preventDefault(); videoZone.classList.add('dragover'); });
videoZone.addEventListener('dragleave', ()  => videoZone.classList.remove('dragover'));
videoZone.addEventListener('drop', (e) => {
  e.preventDefault();
  videoZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleVideoFile(file);
});
videoInput.addEventListener('change', () => {
  if (videoInput.files[0]) handleVideoFile(videoInput.files[0]);
});
videoUrlInput.addEventListener('input', () => {
  clearFormError();
  if (videoUrlInput.value.trim() !== '' && (selectedVideo || videoPreparing)) {
    videoToken++;
    selectedVideo = null;
    videoPreparing = false;
    videoInput.value = '';
    renderVideoZone();
  }
  analyzeBtn.disabled = !hasVideoInput();
  updateAnalyzeHint();
});

function validateVideoUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { return 'UNSUPPORTED_URL'; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'UNSUPPORTED_URL';
  if (SOCIAL_HOST_RE.test(url.hostname)) return 'UNSUPPORTED_URL';
  return null;
}

async function analyzeVideo() {
  if (!hasVideoInput() || videoPreparing) return;
  clearFormError();

  let init;
  if (selectedVideo) {
    const formData = new FormData();
    formData.append('video', selectedVideo);
    init = { method: 'POST', body: formData };
  } else {
    const videoUrl = videoUrlInput.value.trim();
    const urlError = validateVideoUrl(videoUrl);
    if (urlError) { showVideoError(urlError); return; }
    init = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoUrl }) };
  }

  if (!(await ensureContentGuard(selectedVideo || 'url:' + videoUrlInput.value.trim()))) return;
  setLoading(true);
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), VIDEO_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/detect-video', { ...init, signal: controller.signal });
    let data = null;
    try { data = await response.json(); } catch { /* non-JSON platform error */ }

    if (!response.ok || !data || data.error) {
      const code = typeof data?.error === 'string' ? data.error : data?.code;
      showVideoError(response.status === 413 ? 'FILE_TOO_LARGE' : response.status === 504 ? 'TIMEOUT' : (code || 'DETECTION_FAILED'));
      return;
    }
    setLoading(false);
    showResult(data);
  } catch (error) {
    showVideoError(error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK');
  } finally {
    clearTimeout(timeoutId);
  }
}

// Error handler
function showError(code) {
  const t = T[currentLang];
  setLoading(false);
  showFormError(t.errors[code] || 'Something went wrong. Please try again.');
  analyzeBtn.disabled = !selectedFile;
}

// Analyze
analyzeBtn.addEventListener('click', async () => {
  if (inputMode === 'video') { analyzeVideo(); return; }
  if (!selectedFile) return;
  clearFormError();
  if (!(await ensureContentGuard(selectedFile))) return;
  setLoading(true);

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('country', flow.pais.toUpperCase());
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

// Reset
resetBtn.addEventListener('click', resetAnalysis);

// Init
(function init() {
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  const lang = ['es', 'en', 'hi'].includes(nav) ? nav : 'es';
  downloadPdfBtn.hidden = !window.jspdf?.jsPDF; // hide if the CDN script failed to load
  flowApi = initFlow({
    lang,
    hooks: { hasResult: () => !!currentResult, resetAll },
  });
  applyLanguage(lang);
})();