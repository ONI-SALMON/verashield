const MAX_FILE_SIZE_BYTES       = 10 * 1024 * 1024; // final cap, matches api/detect.js
const COMPRESSION_MIN_BYTES     = 800 * 1024;        // below this, skip compression
const MAX_UPLOAD_DIMENSION_PX   = 1920;              // cap longest side
const JPEG_QUALITY              = 0.8;
const CANVAS_COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const REQUEST_TIMEOUT_MS        = 22000;             // 2s longer than server's maxDuration (vercel.json)

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
const countrySelector = document.getElementById('country-selector');
const victimToggle    = document.getElementById('victim-toggle');
const crisisIntro     = document.getElementById('crisis-intro');
const whatsappBtn     = document.getElementById('whatsapp-btn');
const crisisSteps     = document.getElementById('crisis-steps');
const ngoCard         = document.getElementById('ngo-card');
const legalNote       = document.getElementById('legal-note');
const takedownBtn     = document.getElementById('takedown-btn');
const langBtns        = document.querySelectorAll('.lang-btn');
const directCrisisBtn    = document.getElementById('direct-crisis-btn');
const directCrisisHeading= document.getElementById('direct-crisis-heading');
const noDetectionNote    = document.getElementById('no-detection-note');
const noDetectionText    = document.getElementById('no-detection-text');
const noDetectionLink    = document.getElementById('no-detection-link');
const backToUploadBtn    = document.getElementById('back-to-upload-btn');
const downloadPdfBtn     = document.getElementById('download-pdf-btn');

const analyzeHint    = document.getElementById('analyze-hint');
const uploadPreview  = document.getElementById('upload-preview');
const uploadPreviewImg = document.getElementById('upload-preview-img');
const uploadIcon     = document.getElementById('upload-icon');
const uploadHint     = document.getElementById('upload-hint');
const resultHeading  = document.getElementById('result-heading');
const scoreCaption   = document.getElementById('score-caption');
const scoreMeterFill = document.getElementById('score-meter-fill');
const countryLabel   = document.getElementById('country-label');
const whatsappSub    = document.getElementById('whatsapp-sub');
const heroTitle      = document.getElementById('hero-title');

// ─── Extra UI strings (labels, hints, orientation copy) ─────────────────────
const UI = {
  es: {
    skipLink:     'Saltar al contenido',
    eyebrow:      'Gratis y en tu idioma',
    trust1:       'Sin cuenta ni registro',
    trust2:       'Tu imagen no se guarda',
    trust3:       'Te mostramos qué hacer después del resultado',
    stepUpload:   'Elige la imagen',
    stepAnalyze:  'Revisa si fue creada por IA',
    uploadHint:   'JPG, PNG o WebP. Máximo 10 MB.',
    analyzeHint:  'Elige una imagen para activar este botón.',
    changeImage:  'Toca para cambiar la imagen',
    or:           'o',
    altLead:      '¿Tu foto es real y alguien la compartió sin tu permiso? No necesitas analizarla para recibir ayuda.',
    resultHeading:'Resultado',
    directHeading:'Tus derechos y recursos de apoyo',
    scoreCaption: 'Probabilidad de creada por IA',
    countryLabel: 'Mostrar ayuda en',
    whatsappSub:  'Se abre WhatsApp con un mensaje listo. Tú decides si lo envías.',
    schoolLetter: 'Generar carta para mi escuela',
  },
  en: {
    skipLink:     'Skip to content',
    eyebrow:      'Free and in your language',
    trust1:       'No account or sign-up',
    trust2:       'Your image is not saved',
    trust3:       'We show you what to do after the result',
    stepUpload:   'Choose the image',
    stepAnalyze:  'Check if it was created by AI',
    uploadHint:   'JPG, PNG or WebP. Max 10 MB.',
    analyzeHint:  'Choose an image to enable this button.',
    changeImage:  'Tap to change the image',
    or:           'or',
    altLead:      'Is your photo real and someone shared it without your permission? You do not need to analyze it to get help.',
    resultHeading:'Result',
    directHeading:'Your rights and support resources',
    scoreCaption: 'Chance it was created by AI',
    countryLabel: 'Show help in',
    whatsappSub:  'Opens WhatsApp with a message ready to go. You decide whether to send it.',
    schoolLetter: 'Generate a letter for my school',
  },
  hi: {
    skipLink:     'सामग्री पर जाएँ',
    eyebrow:      'निःशुल्क और आपकी भाषा में',
    trust1:       'कोई खाता या साइन-अप नहीं',
    trust2:       'आपकी तस्वीर सेव नहीं होती',
    trust3:       'परिणाम के बाद क्या करना है, हम बताते हैं',
    stepUpload:   'तस्वीर चुनें',
    stepAnalyze:  'जाँचें कि वह AI से बनी है या नहीं',
    uploadHint:   'JPG, PNG या WebP। अधिकतम 10 MB।',
    analyzeHint:  'इस बटन को चालू करने के लिए तस्वीर चुनें।',
    changeImage:  'तस्वीर बदलने के लिए टैप करें',
    or:           'या',
    altLead:      'क्या आपकी असली फ़ोटो बिना अनुमति के साझा की गई? मदद पाने के लिए उसे जाँचना ज़रूरी नहीं है।',
    resultHeading:'परिणाम',
    directHeading:'आपके अधिकार और सहायता संसाधन',
    scoreCaption: 'AI से बनी होने की संभावना',
    countryLabel: 'इस देश की मदद दिखाएँ',
    whatsappSub:  'WhatsApp में एक तैयार संदेश खुलेगा। भेजना है या नहीं, आप तय करें।',
    schoolLetter: 'स्कूल के लिए पत्र बनाएँ',
  },
};

// ─── Translations ────────────────────────────────────────────────────────────
const T = {
  es: {
    heroTitle:       '¿Esta imagen es real?',
    heroSubtitle:    'Herramienta de respuesta a abuso de imagen para adolescentes.',
    uploadPrompt:    'Toca para subir o arrastra una imagen aquí',
    preparingImage:  'Preparando imagen…',
    analyzeBtn:      'Analizar',
    analyzingBtn:    'Analizando...',
    resetBtn:        'Analizar otra imagen',
    privacyNote:     'No guardamos tu imagen ni ningún dato personal.',
    disclaimer:      'Recuerda: ante cualquier situación, tu primer paso siempre es hablar con un adulto de confianza o una autoridad. Esta herramienta es un apoyo, no un sustituto.',
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
      'No compartas el contenido: reportarlo a quienes necesitan verlo es suficiente.',
      'Contacta a una organización de apoyo:',
    ],
    victimToggle: {
      me:    'Esto me pasó a mí',
      other: 'Le pasó a alguien que conozco',
    },
    crisisIntro: {
      me:    'Esto no es tu culpa. Lo que ves tiene solución y no estás solo/a.',
      other: 'Tu amigo/a necesita ayuda. Lo más importante ahora es que un adulto de confianza lo sepa.',
    },
    whatsappBtn: 'Pedir ayuda a un adulto de confianza',
    whatsappMessage: {
      me:    'Mamá/Papá, necesito tu ayuda. Encontré una imagen mía que puede haber sido creada por IA. Usé una app llamada VeraShield que lo detectó. ¿Podemos hablar?',
      other: 'Mamá/Papá, mi amigo/a necesita ayuda. Vi una imagen suya que puede haber sido creada por IA. ¿Podemos ayudarle?',
    },
    legalNote: 'Esta situación puede estar protegida por la <a href="https://www.gob.mx/conavim/articulos/ley-olimpia" target="_blank" rel="noopener">Ley Olimpia</a>.',
    takedownBtn: 'Solicitar eliminación de la imagen (NCMEC)',
    crisisIntro_mx: 'Esto no es tu culpa. En México existen leyes y organizaciones que pueden ayudarte a resolver esta situación. No estás solo/a.',
    crisisIntro_in: 'Esto no es tu culpa. En India existen leyes y organizaciones que pueden ayudarte a resolver esta situación. No estás solo/a.',
    crisisIntro_us: 'Esto no es tu culpa. En Estados Unidos existen leyes y organizaciones que pueden ayudarte a resolver esta situación. No estás solo/a.',
    legalNote_in: 'En India, la Sección 66E de la Ley de TI protege a las víctimas de la difusión no consensuada de imágenes.',
    ngoTitle_mx: 'Organizaciones que pueden ayudarte (México)',
    ngoTitle_in: 'Organizaciones que pueden ayudarte (India)',
    ngoTitle_us: 'Organizaciones que pueden ayudarte (Estados Unidos)',
    ngosIndia: [
      {
        name: 'iCall (TISS)',
        description: 'Apoyo psicológico gratuito para jóvenes: llamada o chat',
        phone: '9152987821',
        url: 'https://icallhelpline.org',
      },
      {
        name: 'Vandrevala Foundation',
        description: 'Línea de crisis de salud mental 24/7: llamada y WhatsApp',
        phone: '1860-2662-345',
        url: 'https://www.vandrevalafoundation.com',
      },
      {
        name: 'Childline India',
        description: 'Línea de emergencia gratuita para niños y adolescentes en riesgo',
        phone: '1098',
        url: 'https://www.childlineindia.org',
      },
      {
        name: 'Cyber Crime Portal',
        description: 'Portal oficial del gobierno para reportar delitos digitales en India',
        phone: null,
        url: 'https://cybercrime.gov.in',
      },
      {
        name: 'CyberPeace Foundation',
        description: 'ONG especializada en seguridad digital y abuso de imagen en menores',
        phone: null,
        url: 'https://cyberpeace.org',
      },
    ],
  },

  en: {
    heroTitle:       'Is this image real?',
    heroSubtitle:    'Image abuse response tool for teens aged 13–17.',
    uploadPrompt:    'Tap to upload or drag an image here',
    preparingImage:  'Preparing image…',
    analyzeBtn:      'Analyze',
    analyzingBtn:    'Analyzing...',
    resetBtn:        'Analyze another image',
    privacyNote:     "We don't save your image or any personal data.",
    disclaimer:      'Remember: in any situation, your first step is always to talk to a trusted adult or authority. This tool is a support, not a substitute.',
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
      'Do not share the content: reporting it to the right people is enough.',
      'Contact a support organization:',
    ],
    victimToggle: {
      me:    'This happened to me',
      other: 'This happened to someone I know',
    },
    crisisIntro: {
      me:    "This is not your fault. What you're seeing has a solution and you're not alone.",
      other: 'Your friend needs help. The most important thing now is that a trusted adult knows.',
    },
    whatsappBtn: 'Ask a trusted adult for help',
    whatsappMessage: {
      me:    'Mom/Dad, I need your help. I found an image of me that may have been created by AI. I used an app called VeraShield that detected it. Can we talk?',
      other: 'Mom/Dad, my friend needs help. I saw an image of them that may have been created by AI. Can we help them?',
    },
    legalNote: 'This situation may be covered under the <a href="https://takeitdown.ncmec.org" target="_blank" rel="noopener">TAKE IT DOWN Act</a>.',
    takedownBtn: 'Request image removal (NCMEC)',
    crisisIntro_mx: "This is not your fault. In Mexico, there are laws and organizations that can help you resolve this. You're not alone.",
    crisisIntro_in: "This is not your fault. In India, there are laws and organizations that can help you resolve this. You're not alone.",
    crisisIntro_us: "This is not your fault. In the United States, there are laws and organizations that can help you resolve this. You're not alone.",
    legalNote_in: 'In India, IT Act Section 66E protects victims of non-consensual image sharing.',
    ngoTitle_mx: 'Organizations that can help you (Mexico)',
    ngoTitle_in: 'Organizations that can help you (India)',
    ngoTitle_us: 'Organizations that can help you (United States)',
    ngosIndia: [
      {
        name: 'iCall (TISS)',
        description: 'Free psychological support for young people: call or chat',
        phone: '9152987821',
        url: 'https://icallhelpline.org',
      },
      {
        name: 'Vandrevala Foundation',
        description: '24/7 mental health crisis helpline: call and WhatsApp',
        phone: '1860-2662-345',
        url: 'https://www.vandrevalafoundation.com',
      },
      {
        name: 'Childline India',
        description: 'Free emergency helpline for children and teens at risk',
        phone: '1098',
        url: 'https://www.childlineindia.org',
      },
      {
        name: 'Cyber Crime Portal',
        description: 'Official government portal to report cybercrimes in India',
        phone: null,
        url: 'https://cybercrime.gov.in',
      },
      {
        name: 'CyberPeace Foundation',
        description: 'NGO specializing in digital safety and image abuse for minors',
        phone: null,
        url: 'https://cyberpeace.org',
      },
    ],
  },

  hi: {
    heroTitle:       'क्या यह तस्वीर असली है?',
    heroSubtitle:    '13–17 वर्ष के किशोरों के लिए छवि दुर्व्यवहार प्रतिक्रिया उपकरण।',
    uploadPrompt:    'यहाँ टैप करें या तस्वीर खींचकर डालें',
    preparingImage:  'इमेज तैयार हो रही है…',
    analyzeBtn:      'जाँचें',
    analyzingBtn:    'जाँच हो रही है...',
    resetBtn:        'दूसरी तस्वीर जाँचें',
    privacyNote:     'हम आपकी तस्वीर या कोई भी व्यक्तिगत डेटा सेव नहीं करते।',
    disclaimer:      'याद रखें: किसी भी स्थिति में, आपका पहला कदम हमेशा किसी विश्वसनीय वयस्क या अधिकारी से बात करना है। यह टूल एक सहायता है, विकल्प नहीं।',
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
      'सामग्री साझा न करें: सही लोगों को रिपोर्ट करना पर्याप्त है।',
      'एक सहायता संगठन से संपर्क करें:',
    ],
    victimToggle: {
      me:    'यह मेरे साथ हुआ',
      other: 'यह किसी और के साथ हुआ',
    },
    crisisIntro: {
      me:    'यह आपकी गलती नहीं है। इसका समाधान है और आप अकेले नहीं हैं।',
      other: 'आपके मित्र को मदद चाहिए। अभी सबसे जरूरी है कि कोई विश्वसनीय वयस्क इसे जाने।',
    },
    whatsappBtn: 'किसी विश्वसनीय वयस्क से मदद माँगें',
    whatsappMessage: {
      me:    'मम्मी/पापा, मुझे आपकी मदद चाहिए। मुझे एक तस्वीर मिली जो AI से बनी हो सकती है। मैंने VeraShield ऐप से इसे जाँचा। क्या हम बात कर सकते हैं?',
      other: 'मम्मी/पापा, मेरे दोस्त को मदद चाहिए। मैंने उनकी एक तस्वीर देखी जो AI से बनी हो सकती है। क्या हम उनकी मदद कर सकते हैं?',
    },
    legalNote: 'यह स्थिति <a href="https://wcd.nic.in/act/protection-children-sexual-offences-pocso-act-2012" target="_blank" rel="noopener">POCSO Act</a> के तहत संरक्षित हो सकती है।',
    takedownBtn: 'तस्वीर हटाने का अनुरोध करें (NCMEC)',
    crisisIntro_mx: 'यह आपकी गलती नहीं है। मेक्सिको में ऐसे कानून और संगठन हैं जो इस स्थिति में आपकी मदद कर सकते हैं। आप अकेले नहीं हैं।',
    crisisIntro_in: 'यह आपकी गलती नहीं है। भारत में ऐसे कानून और संगठन हैं जो इस स्थिति में आपकी मदद कर सकते हैं। आप अकेले नहीं हैं।',
    crisisIntro_us: 'यह आपकी गलती नहीं है। संयुक्त राज्य अमेरिका में ऐसे कानून और संगठन हैं जो इस स्थिति में आपकी मदद कर सकते हैं। आप अकेले नहीं हैं।',
    legalNote_in: 'भारत में, आईटी अधिनियम की धारा 66E सहमति के बिना तस्वीरें साझा किए जाने के पीड़ितों की रक्षा करती है।',
    ngoTitle_mx: 'संगठन जो आपकी मदद कर सकते हैं (मेक्सिको)',
    ngoTitle_in: 'संगठन जो आपकी मदद कर सकते हैं (भारत)',
    ngoTitle_us: 'संगठन जो आपकी मदद कर सकते हैं (संयुक्त राज्य अमेरिका)',
    ngosIndia: [
      {
        name: 'iCall (TISS)',
        description: 'युवाओं के लिए निःशुल्क मनोवैज्ञानिक सहायता: कॉल या चैट',
        phone: '9152987821',
        url: 'https://icallhelpline.org',
      },
      {
        name: 'Vandrevala Foundation',
        description: '24/7 मानसिक स्वास्थ्य संकट हेल्पलाइन: कॉल और व्हाट्सएप',
        phone: '1860-2662-345',
        url: 'https://www.vandrevalafoundation.com',
      },
      {
        name: 'Childline India',
        description: 'जोखिम में बच्चों और किशोरों के लिए निःशुल्क आपातकालीन हेल्पलाइन',
        phone: '1098',
        url: 'https://www.childlineindia.org',
      },
      {
        name: 'Cyber Crime Portal',
        description: 'भारत में साइबर अपराध रिपोर्ट करने का आधिकारिक सरकारी पोर्टल',
        phone: null,
        url: 'https://cybercrime.gov.in',
      },
      {
        name: 'CyberPeace Foundation',
        description: 'डिजिटल सुरक्षा और बाल छवि दुरुपयोग में विशेषज्ञ NGO',
        phone: null,
        url: 'https://cyberpeace.org',
      },
    ],
  },
};

// ─── Direct crisis path (real photo, no AI analysis needed) ─────────────────
const DIRECT_CRISIS_STRINGS = {
  en: {
    directCrisisBtn: "My image was shared without my consent (real photo)",
    directCrisisHeading: "Your rights and support resources",
    directCrisisIntro:
      "You don't need AI analysis to get support. " +
      "Even if your image is real, not a deepfake, " +
      "you have rights and there are people who can help you right now.",
    noDetectionNote:
      "If a real photo of you was shared without your consent, " +
      "you still have the right to report it.",
    noDetectionLink: "See your resources",
    backToUpload: "Analyze an image instead",
  },
  es: {
    directCrisisBtn: "Mi imagen real fue compartida sin mi consentimiento",
    directCrisisHeading: "Tus derechos y recursos de apoyo",
    directCrisisIntro:
      "No necesitas análisis de IA para obtener apoyo. " +
      "Aunque tu imagen sea real, no un deepfake, " +
      "tienes derechos y hay personas que pueden ayudarte ahora mismo.",
    noDetectionNote:
      "Si una foto real tuya fue compartida sin tu consentimiento, " +
      "sigues teniendo el derecho de denunciarlo.",
    noDetectionLink: "Ver tus recursos",
    backToUpload: "Analizar una imagen en su lugar",
  },
  hi: {
    directCrisisBtn: "मेरी असली फ़ोटो बिना अनुमति के साझा की गई",
    directCrisisHeading: "आपके अधिकार और सहायता संसाधन",
    directCrisisIntro:
      "सहायता पाने के लिए AI विश्लेषण की ज़रूरत नहीं है। " +
      "चाहे आपकी फ़ोटो असली हो, deepfake नहीं, " +
      "आपके अधिकार हैं और ऐसे लोग हैं जो अभी आपकी मदद कर सकते हैं।",
    noDetectionNote:
      "अगर आपकी असली फ़ोटो बिना सहमति के साझा की गई है, " +
      "तो आपको रिपोर्ट करने का पूरा अधिकार है।",
    noDetectionLink: "अपने संसाधन देखें",
    backToUpload: "इसके बजाय एक छवि का विश्लेषण करें",
  },
};

// ─── PDF evidence report strings ─────────────────────────────────────────────
const PDF_STRINGS = {
  es: {
    btn:          'Descargar reporte PDF',
    locale:       'es-MX',
    analyzedOn:   'Fecha y hora del análisis',
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
      'Documenta: guarda capturas de pantalla con la URL, el nombre de usuario y la fecha visibles. No reenvíes ni compartas la imagen.',
      'Reporta a la plataforma: usa la opción de reporte de la red social o app donde aparece la imagen y pide que la eliminen.',
      'Busca apoyo: habla con un adulto de confianza y contacta a una organización o autoridad de tu país.',
    ],
    disclaimer: 'Este reporte es una herramienta de apoyo generada automáticamente. No constituye evidencia legal por sí solo. Consulta a un adulto de confianza o autoridad.',
    footer:     'verashield.app | Conrad Challenge 2026–2027',
  },
  en: {
    btn:          'Download PDF report',
    locale:       'en-US',
    analyzedOn:   'Analysis date and time',
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
      'Document: save screenshots with the URL, username and date visible. Do not forward or share the image.',
      'Report to the platform: use the report option on the social network or app where the image appears and ask for its removal.',
      'Seek support: talk to a trusted adult and contact an organization or authority in your country.',
    ],
    disclaimer: 'This report is an automatically generated support tool. It does not constitute legal evidence on its own. Consult a trusted adult or authority.',
    footer:     'verashield.app | Conrad Challenge 2026–2027',
  },
  hi: {
    btn:          'PDF रिपोर्ट डाउनलोड करें',
    locale:       'hi-IN',
    analyzedOn:   'जाँच की तारीख और समय',
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
      'दस्तावेज़ बनाएँ: URL, यूज़रनेम और तारीख दिखाते हुए स्क्रीनशॉट सेव करें। तस्वीर को फॉरवर्ड या साझा न करें।',
      'प्लेटफ़ॉर्म को रिपोर्ट करें: जिस सोशल नेटवर्क या ऐप पर तस्वीर है, वहाँ रिपोर्ट विकल्प का उपयोग करें और उसे हटाने का अनुरोध करें।',
      'सहायता लें: किसी विश्वसनीय वयस्क से बात करें और अपने देश के किसी संगठन या अधिकारी से संपर्क करें।',
    ],
    disclaimer: 'यह रिपोर्ट स्वचालित रूप से बनाया गया एक सहायता उपकरण है। यह अपने आप में कानूनी सबूत नहीं है। किसी विश्वसनीय वयस्क या अधिकारी से सलाह लें।',
    footer:     'verashield.app | Conrad Challenge 2026–2027',
  },
};

// ─── Action resources: copy-only email templates ────────────────────────────
// Text is only ever copied to the user's clipboard: nothing is sent or stored.
const ACTION_STRINGS = {
  es: {
    title:      'Cómo reportar',
    disclaimer: 'Estos textos son sugerencias. Puedes modificarlos antes de enviarlos. Siempre consulta con un adulto antes de contactar a cualquier institución.',
    copy:       'Copiar al portapapeles',
    copied:     '¡Copiado!',
    fallback:   'Selecciona y copia este texto',
  },
  en: {
    title:      'How to report',
    disclaimer: 'These are suggested templates. Edit them before sending. Always consult a trusted adult before contacting any institution.',
    copy:       'Copy to clipboard',
    copied:     'Copied!',
    fallback:   'Select and copy this text',
  },
  hi: {
    title:      'रिपोर्ट कैसे करें',
    disclaimer: 'ये केवल सुझाए गए टेम्पलेट हैं। भेजने से पहले इन्हें बदल लें। किसी भी संस्था से संपर्क करने से पहले हमेशा किसी विश्वसनीय वयस्क से सलाह लें।',
    copy:       'क्लिपबोर्ड पर कॉपी करें',
    copied:     'कॉपी हो गया!',
    fallback:   'इस टेक्स्ट को चुनें और कॉपी करें',
  },
};

const EMAIL_TEMPLATES = {
  es: [
    {
      title: 'Plataforma (Instagram, TikTok, etc.)',
      text:
        'Asunto: Solicitud urgente de eliminación de contenido\n\n' +
        'Hola equipo de seguridad:\n\n' +
        'Me llamo [NOMBRE] y soy menor de edad. El [FECHA] descubrí que se publicó contenido que me muestra sin mi consentimiento, y que puede haber sido creado o alterado con inteligencia artificial.\n\n' +
        'Descripción: [DESCRIPCIÓN]\n\n' +
        'Solicito que lo eliminen de inmediato, ya que viola sus normas contra el abuso de imágenes y el acoso. También les pido que me confirmen cuando se haya retirado.\n\n' +
        'Gracias,\n[NOMBRE]',
    },
    {
      title: 'Adulto de confianza',
      text:
        'Asunto: Necesito tu ayuda\n\n' +
        'Hola [NOMBRE]:\n\n' +
        'Necesito hablar contigo de algo importante. El [FECHA] me enteré de que hay una imagen mía que se compartió sin mi permiso y que podría estar hecha con IA.\n\n' +
        '[DESCRIPCIÓN]\n\n' +
        'No es mi culpa, pero me siento preocupado/a y no sé qué hacer. ¿Podemos hablar hoy y decidir juntos cómo reportarlo?\n\n' +
        'Gracias por escucharme.',
    },
    {
      title: 'Escuela (dirección)',
      text:
        'Asunto: Aviso de un incidente que afecta a un estudiante\n\n' +
        'Estimada dirección:\n\n' +
        'Les escribo para informarles de manera informal sobre una situación ocurrida el [FECHA]. [NOMBRE] fue afectado/a por la difusión de una imagen sin su consentimiento, posiblemente creada o alterada con inteligencia artificial.\n\n' +
        'Resumen: [DESCRIPCIÓN]\n\n' +
        'Les pido que tomen las medidas necesarias para proteger al estudiante y que me indiquen cómo podemos colaborar. Agradezco su discreción.\n\n' +
        'Atentamente,\n[NOMBRE]',
    },
  ],
  en: [
    {
      title: 'Platform (Instagram, TikTok, etc.)',
      text:
        'Subject: Urgent content removal request\n\n' +
        'Hello Safety Team,\n\n' +
        'My name is [NAME] and I am a minor. On [DATE] I discovered content that shows me without my consent and may have been created or altered using artificial intelligence.\n\n' +
        'Description: [DESCRIPTION]\n\n' +
        'I am requesting its immediate removal, as it violates your policies against image abuse and harassment. Please confirm once it has been taken down.\n\n' +
        'Thank you,\n[NAME]',
    },
    {
      title: 'Trusted adult',
      text:
        'Subject: I need your help\n\n' +
        'Hi [NAME],\n\n' +
        'I need to talk to you about something important. On [DATE] I found out that an image of me was shared without my permission and it might be made with AI.\n\n' +
        '[DESCRIPTION]\n\n' +
        "It's not my fault, but I'm worried and I don't know what to do. Can we talk today and decide together how to report it?\n\n" +
        'Thank you for listening.',
    },
    {
      title: 'School (principal’s office)',
      text:
        'Subject: Notice of an incident affecting a student\n\n' +
        'Dear Principal,\n\n' +
        'I am writing to informally let you know about a situation that happened on [DATE]. [NAME] was affected by an image being shared without consent, possibly created or altered using artificial intelligence.\n\n' +
        'Summary: [DESCRIPTION]\n\n' +
        'I ask that you take the necessary steps to protect the student and let me know how we can work together. I appreciate your discretion.\n\n' +
        'Sincerely,\n[NAME]',
    },
  ],
  hi: [
    {
      title: 'प्लेटफ़ॉर्म (Instagram, TikTok आदि)',
      text:
        'विषय: सामग्री हटाने का अत्यावश्यक अनुरोध\n\n' +
        'नमस्ते सुरक्षा टीम,\n\n' +
        'मेरा नाम [नाम] है और मैं नाबालिग हूँ। [तारीख] को मुझे पता चला कि मेरी अनुमति के बिना मेरी एक तस्वीर पोस्ट की गई है, जो कृत्रिम बुद्धिमत्ता (AI) से बनाई या बदली गई हो सकती है।\n\n' +
        'विवरण: [विवरण]\n\n' +
        'मैं इसे तुरंत हटाने का अनुरोध करता/करती हूँ, क्योंकि यह छवि दुरुपयोग और उत्पीड़न के विरुद्ध आपकी नीतियों का उल्लंघन है। कृपया हटाए जाने पर मुझे सूचित करें।\n\n' +
        'धन्यवाद,\n[नाम]',
    },
    {
      title: 'विश्वसनीय वयस्क',
      text:
        'विषय: मुझे आपकी मदद चाहिए\n\n' +
        'नमस्ते [नाम],\n\n' +
        'मुझे आपसे एक ज़रूरी बात करनी है। [तारीख] को मुझे पता चला कि मेरी एक तस्वीर बिना मेरी अनुमति के साझा की गई है और वह AI से बनी हो सकती है।\n\n' +
        '[विवरण]\n\n' +
        'इसमें मेरी कोई गलती नहीं है, लेकिन मैं चिंतित हूँ और समझ नहीं आ रहा कि क्या करूँ। क्या हम आज बात कर सकते हैं और मिलकर तय कर सकते हैं कि इसकी रिपोर्ट कैसे करें?\n\n' +
        'मेरी बात सुनने के लिए धन्यवाद।',
    },
    {
      title: 'स्कूल (प्रधानाचार्य कार्यालय)',
      text:
        'विषय: एक छात्र को प्रभावित करने वाली घटना की सूचना\n\n' +
        'आदरणीय प्रधानाचार्य जी,\n\n' +
        'मैं आपको [तारीख] को हुई एक घटना के बारे में अनौपचारिक रूप से सूचित करने के लिए लिख रहा/रही हूँ। [नाम] की एक तस्वीर बिना सहमति के साझा की गई, जो संभवतः AI से बनाई या बदली गई है।\n\n' +
        'सारांश: [विवरण]\n\n' +
        'कृपया छात्र की सुरक्षा के लिए आवश्यक कदम उठाएँ और बताएँ कि हम मिलकर कैसे काम कर सकते हैं। आपकी गोपनीयता के लिए धन्यवाद।\n\n' +
        'सादर,\n[नाम]',
    },
  ],
};

const COPIED_FEEDBACK_MS = 2000;

// Resolves false when the Clipboard API is missing or the write is rejected
// (e.g. insecure context), so the caller can show a selectable textarea.
async function copyText(text) {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

function showCopyFallback(card, text, label) {
  let area = card.querySelector('.template-fallback');
  if (!area) {
    area = document.createElement('textarea');
    area.className = 'template-fallback';
    area.readOnly = true;
    area.setAttribute('aria-label', label);
    card.appendChild(area);
  }
  area.value = text;
  area.focus();
  area.select();
}

function renderActionResources() {
  const as = ACTION_STRINGS[currentLang];
  document.getElementById('action-resources-title').textContent = as.title;
  document.getElementById('action-disclaimer').textContent = as.disclaimer;

  const list = document.getElementById('template-list');
  list.innerHTML = '';

  EMAIL_TEMPLATES[currentLang].forEach((tpl) => {
    const card = document.createElement('article');
    card.className = 'template-card';

    const title = document.createElement('h4');
    title.className = 'template-title';
    title.textContent = tpl.title;
    card.appendChild(title);

    const body = document.createElement('pre');
    body.className = 'template-body';
    body.textContent = tpl.text;
    card.appendChild(body);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = as.copy;
    let resetTimer = null;
    btn.addEventListener('click', async () => {
      const ok = await copyText(tpl.text);
      if (!ok) { showCopyFallback(card, tpl.text, as.fallback); return; }
      btn.textContent = as.copied;
      btn.classList.add('copied');
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        btn.textContent = as.copy;
        btn.classList.remove('copied');
      }, COPIED_FEEDBACK_MS);
    });
    card.appendChild(btn);

    list.appendChild(card);
  });
}

// Country-keyed resources: decoupled from UI language (a Spanish speaker
// can be in the US, an English speaker can be in India, etc).
const CRISIS_RESOURCES = {
  us: {
    country: "United States",
    resources: [
      {
        name: "Crisis Text Line",
        description: "Free 24/7 crisis support via text",
        contact: "Text HOME to 741741",
        url: "https://www.crisistextline.org",
        type: "hotline",
      },
      {
        name: "RAINN: National Sexual Assault Hotline",
        description:
          "Confidential support for survivors of image-based sexual abuse",
        contact: "1-800-656-HOPE (4673)",
        url: "https://www.rainn.org",
        type: "hotline",
      },
      {
        name: "Cyber Civil Rights Initiative",
        description:
          "Specialized support for victims of non-consensual intimate images",
        contact: "cybercivilrights.org/get-help",
        url: "https://cybercivilrights.org/get-help/",
        type: "ngo",
      },
      {
        name: "StopNCII.org",
        description:
          "Free tool to prevent non-consensual intimate images from spreading online",
        contact: "stopncii.org",
        url: "https://stopncii.org",
        type: "tool",
      },
      {
        name: "FBI: Internet Crime Complaint Center (IC3)",
        description: "Official channel to report cybercrimes involving minors",
        contact: "ic3.gov",
        url: "https://www.ic3.gov",
        type: "legal",
      },
      {
        name: "NCMEC CyberTipline",
        description:
          "Report child sexual exploitation material, including deepfakes",
        contact: "1-800-843-5678",
        url: "https://www.missingkids.org/gethelpnow/cybertipline",
        type: "legal",
      },
    ],
    legalNote:
      "In the United States, sharing intimate images without consent is illegal " +
      "in 48 states. AI-generated sexual images of real people (deepfakes) are " +
      "increasingly covered under state law and the DEFIANCE Act (2024) at the " +
      "federal level.",
  },
  mx: {
    country: "México",
    resources: [
      {
        name: "Línea de la Vida",
        description: "Apoyo psicológico gratuito 24/7: crisis, estrés, violencia",
        contact: "800 911 2000",
        url: "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000",
        type: "hotline",
      },
      {
        name: "CNDH: Comisión Nacional de los Derechos Humanos",
        description: "Denuncia violaciones a derechos humanos, incluyendo violencia digital",
        contact: "800 715 2000",
        url: "https://www.cndh.org.mx/programas/contacto-1",
        type: "legal",
      },
      {
        name: "Te Protejo México",
        description:
          "Plataforma anónima y gratuita para reportar contenido sexual de menores, " +
          "grooming, sextorsión y ciberacoso. Parte de la red INHOPE.",
        contact: "contactanos@teprotejomexico.org",
        url: "https://teprotejomexico.org/",
        type: "report",
      },
      {
        name: "REDIM: Red por los Derechos de la Infancia en México",
        description: "Organización de referencia en derechos de niñas, niños y adolescentes",
        contact: null,
        url: "https://derechosinfancia.org.mx/v1/",
        type: "ngo",
      },
    ],
    legalNote:
      "En México, la Ley Olimpia penaliza la difusión no consentida de " +
      "imágenes íntimas entre adultos. Para menores de edad, aplica la Ley " +
      "General de los Derechos de Niñas, Niños y Adolescentes (LGDNNA) y " +
      "el Código Penal Federal. Tienes derecho a denunciar aunque la imagen " +
      "sea real y no un deepfake.",
  },
};

// Preferred country for the crisis pathway, based on UI language and browser
// locale. Only used until the user manually picks a country themselves.
function getDefaultCountry(lang, browserLocale) {
  if (lang === "hi") return "in";
  if (lang === "es") return "mx";
  if (lang === "en") {
    if (browserLocale && browserLocale.startsWith("en-US")) return "us";
    if (browserLocale && browserLocale.startsWith("en-IN")) return "in";
    return "us";
  }
  return "us";
}

// ─── Language state ──────────────────────────────────────────────────────────
let currentLang = 'es';
let currentResult = null;
let selectedFile  = null;
let victimMode    = 'me';
let currentCountry = 'mx';
let countryManuallySet = false;
let directCrisisActive = false;
let analyzedAt = null;

function syncCountryButtons() {
  document.querySelectorAll('.country-btn').forEach(b => b.classList.toggle('active', b.dataset.country === currentCountry));
}

function renderNoDetectionNote() {
  const dc = DIRECT_CRISIS_STRINGS[currentLang];
  noDetectionText.textContent = dc.noDetectionNote;
  noDetectionLink.textContent = dc.noDetectionLink;
}

function applyLanguage(lang) {
  currentLang = lang;
  const t  = T[lang];
  const dc = DIRECT_CRISIS_STRINGS[lang];

  // static text
  document.querySelectorAll('.hero-title').forEach(el => el.textContent = t.heroTitle);
  document.querySelectorAll('.hero-subtitle').forEach(el => el.textContent = t.heroSubtitle);
  document.querySelectorAll('.upload-text').forEach(el => {
    if (!selectedFile) el.textContent = t.uploadPrompt;
  });
  document.querySelectorAll('.privacy-note').forEach(el => el.textContent = t.privacyNote);
  document.querySelectorAll('.disclaimer-text').forEach(el => el.textContent = t.disclaimer);

  // buttons
  if (!analyzeBtn.classList.contains('loading')) {
    analyzeBtn.textContent = t.analyzeBtn;
  }
  resetBtn.textContent        = t.resetBtn;
  directCrisisBtn.textContent = dc.directCrisisBtn;
  backToUploadBtn.textContent = dc.backToUpload;
  directCrisisHeading.textContent = dc.directCrisisHeading;
  downloadPdfBtn.textContent  = PDF_STRINGS[lang].btn;

  // extra UI strings
  const ui = UI[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = ui[el.dataset.i18n] || ''; });
  resultHeading.textContent = directCrisisActive ? ui.directHeading : ui.resultHeading;
  scoreCaption.textContent  = ui.scoreCaption;
  countryLabel.textContent  = ui.countryLabel;
  whatsappSub.textContent   = ui.whatsappSub;
  schoolLetterLink.textContent = ui.schoolLetter;
  if (selectedFile) uploadHint.textContent = ui.changeImage;
  updateAnalyzeHint();

  // toggle active state on ALL lang buttons
  langBtns.forEach(btn => {
    const on = btn.dataset.lang === lang;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });

  // auto-detect country from language + browser locale, unless the user
  // already picked one manually via the country selector
  if (!countryManuallySet) {
    currentCountry = getDefaultCountry(lang, navigator.language);
    syncCountryButtons();
  }

  // re-render result if visible
  if (currentResult) {
    scoreLabel.textContent       = t.labels[currentResult.label]       || '';
    scoreExplanation.textContent = t.explanations[currentResult.label] || '';
  }
  if (!noDetectionNote.hidden) renderNoDetectionNote();
  if (!crisisPathway.hidden)   renderCrisisPathway();

  updateSchoolLetterVisibility();

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
  analyzeHint.hidden = !!selectedFile || analyzeBtn.classList.contains('loading');
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

// ─── Loading state ───────────────────────────────────────────────────────────
function setLoading(isLoading) {
  const t = T[currentLang];
  analyzeBtn.disabled = isLoading;
  analyzeBtn.classList.toggle('loading', isLoading);
  analyzeBtn.textContent = isLoading ? t.analyzingBtn : t.analyzeBtn;
  updateAnalyzeHint();
}

// ─── Score animation ─────────────────────────────────────────────────────────
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

// ─── Crisis pathway ──────────────────────────────────────────────────────────
function appendNgoEntry(container, { name, description, phone, url }) {
  const entry = document.createElement('div');
  entry.className = 'ngo-entry';

  const nameEl = document.createElement('p');
  nameEl.className = 'ngo-name';
  nameEl.textContent = name;
  entry.appendChild(nameEl);

  if (description) {
    const descEl = document.createElement('p');
    descEl.className = 'ngo-description';
    descEl.textContent = description;
    entry.appendChild(descEl);
  }

  if (phone) {
    const phoneEl = document.createElement('p');
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:${phone.replace(/\D/g, '')}`;
    phoneLink.textContent = phone;
    phoneEl.appendChild(phoneLink);
    entry.appendChild(phoneEl);
  }

  if (url) {
    const webEl = document.createElement('p');
    const webLink = document.createElement('a');
    webLink.href = url;
    webLink.target = '_blank';
    webLink.rel = 'noopener';
    webLink.textContent = new URL(url).hostname.replace(/^www\./, '');
    webEl.appendChild(webLink);
    entry.appendChild(webEl);
  }

  container.appendChild(entry);
}

// CRISIS_RESOURCES entries carry a description + free-text contact instead
// of a dialable phone number, so they get their own renderer.
function appendResourceEntry(container, { name, description, contact, url }) {
  const entry = document.createElement('div');
  entry.className = 'ngo-entry';

  const nameEl = document.createElement('p');
  nameEl.className = 'ngo-name';
  nameEl.textContent = name;
  entry.appendChild(nameEl);

  if (description) {
    const descEl = document.createElement('p');
    descEl.className = 'ngo-description';
    descEl.textContent = description;
    entry.appendChild(descEl);
  }

  if (contact) {
    const contactEl = document.createElement('p');
    contactEl.className = 'ngo-contact';
    if (/^[\d\s()+-]{7,}$/.test(contact)) {
      const call = document.createElement('a');
      call.href = `tel:${contact.replace(/[^\d+]/g, '')}`;
      call.textContent = contact;
      contactEl.appendChild(call);
    } else {
      contactEl.textContent = contact;
    }
    entry.appendChild(contactEl);
  }

  if (url) {
    const webEl = document.createElement('p');
    const webLink = document.createElement('a');
    webLink.href = url;
    webLink.target = '_blank';
    webLink.rel = 'noopener';
    webLink.textContent = new URL(url).hostname.replace(/^www\./, '');
    webEl.appendChild(webLink);
    entry.appendChild(webEl);
  }

  container.appendChild(entry);
}

function renderCrisisPathway() {
   const t  = T[currentLang];
   const dc = DIRECT_CRISIS_STRINGS[currentLang];

  // victim toggle
  victimToggle.querySelectorAll('.victim-toggle-btn').forEach((btn) => {
    btn.textContent = t.victimToggle[btn.dataset.mode];
    btn.classList.toggle('active', btn.dataset.mode === victimMode);
  });

  // heading: only shown for the direct crisis path (no AI analysis run)
  directCrisisHeading.hidden = true;

  // empathy-first intro: country-specific, or direct-crisis copy
  if (directCrisisActive) {
    crisisIntro.textContent = dc.directCrisisIntro;
  } else if (currentCountry === 'us') {
    crisisIntro.textContent = t.crisisIntro_us;
  } else if (currentCountry === 'in') {
    crisisIntro.textContent = t.crisisIntro_in;
  } else {
    crisisIntro.textContent = t.crisisIntro_mx;
  }

  // WhatsApp share: its canned message references AI detection, so it
  // doesn't fit the "this is a real photo" direct-crisis path
  whatsappBtn.hidden = directCrisisActive;
  if (!directCrisisActive) {
    whatsappBtn.textContent = t.whatsappBtn;
    whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(t.whatsappMessage[victimMode])}`;
  }

  const crisisTitleEl = document.querySelector('.crisis-title');
  if (crisisTitleEl) crisisTitleEl.textContent = t.crisisTitle;

  crisisSteps.innerHTML = '';
  t.crisisSteps.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    crisisSteps.appendChild(li);
  });

  ngoCard.innerHTML = '';

  const ngoTitleEl = document.createElement('p');
  ngoTitleEl.className = 'ngo-title';
  ngoTitleEl.textContent = currentCountry === 'us' ? t.ngoTitle_us
    : currentCountry === 'in' ? t.ngoTitle_in
    : t.ngoTitle_mx;
  ngoCard.appendChild(ngoTitleEl);

  if (currentCountry === 'us') {
    CRISIS_RESOURCES.us.resources.forEach((resource) => appendResourceEntry(ngoCard, resource));
  } else if (currentCountry === 'in') {
    t.ngosIndia.forEach((ngo) => appendNgoEntry(ngoCard, ngo));
  } else {
    CRISIS_RESOURCES.mx.resources.forEach((resource) => appendResourceEntry(ngoCard, resource));
  }

  // legal rights note: content is a hardcoded string, never user input.
  // MX note is decoupled from UI language (like CRISIS_RESOURCES.mx.resources)
  // since it's country-specific legal fact, not a UI string.
  const legalNoteText = currentCountry === 'us' ? CRISIS_RESOURCES.us.legalNote
    : currentCountry === 'in' ? t.legalNote_in
    : CRISIS_RESOURCES.mx.legalNote;
  legalNote.hidden = !legalNoteText;
  legalNote.innerHTML = legalNoteText || '';

  // TakeItDown removal request
  takedownBtn.textContent = t.takedownBtn;

  renderActionResources();
  updateSchoolLetterVisibility();
}

victimToggle.addEventListener('click', (e) => {
  const btn = e.target.closest('.victim-toggle-btn');
  if (!btn) return;
  victimMode = btn.dataset.mode;
  renderCrisisPathway();
});

document.querySelectorAll('.country-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCountry = btn.dataset.country;
    countryManuallySet = true;
    syncCountryButtons();
    renderCrisisPathway();
  });
});

// ─── PDF evidence report (100% client-side, nothing leaves the browser) ─────
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

  function layout(str, size, bold, width) {
    const lineH = size * PDF_PT_TO_MM * PDF_LINE_H;
    if (useCanvas) {
      pdfMeasureCtx = pdfMeasureCtx || document.createElement('canvas').getContext('2d');
      pdfMeasureCtx.font = pdfCanvasFont(size, bold);
      const lines = pdfWrapCanvas(pdfMeasureCtx, str, width * PDF_CANVAS_PX_PER_MM);
      return { lines, h: lines.length * lineH, lineH };
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(str, width);
    return { lines, h: lines.length * lineH, lineH };
  }

  function draw({ lines, h, lineH }, str, x, top, { size, bold, color, align }, width) {
    if (useCanvas) {
      const canvas = document.createElement('canvas');
      canvas.width  = Math.ceil(width * PDF_CANVAS_PX_PER_MM);
      canvas.height = Math.ceil(h * PDF_CANVAS_PX_PER_MM);
      const ctx = canvas.getContext('2d');
      ctx.font = pdfCanvasFont(size, bold);
      ctx.fillStyle = `rgb(${color.join(',')})`;
      ctx.textBaseline = 'top';
      ctx.textAlign = align;
      const px = align === 'right' ? canvas.width : align === 'center' ? canvas.width / 2 : 0;
      lines.forEach((l, i) => ctx.fillText(l, px, i * lineH * PDF_CANVAS_PX_PER_MM));
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, top, width, h);
    } else {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
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
    text(str, { size = 11, bold = false, color = PDF_COLORS.ink, align = 'left', gap = 3 } = {}) {
      const box = layout(str, size, bold, contentW);
      if (y + box.h > pageLimit) { doc.addPage(); y = PDF_MARGIN_MM; }
      draw(box, str, PDF_MARGIN_MM, y, { size, bold, color, align }, contentW);
      y += box.h + gap;
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

function generateEvidencePdf() {
  if (!currentResult || !window.jspdf?.jsPDF) return;
  const lang = currentLang;
  const t    = T[lang];
  const p    = PDF_STRINGS[lang];
  const when = analyzedAt || new Date();
  const bucket = PDF_COLORS.bucket[currentResult.bucket] ? currentResult.bucket : 'medium';

  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const w = createPdfWriter(doc, lang);

  // 1. Header: textual logo + analysis date/time
  w.text('VeraShield', { size: 26, bold: true, color: PDF_COLORS.accent, gap: 1 });
  w.text(`${p.analyzedOn}: ${when.toLocaleString(p.locale, { dateStyle: 'long', timeStyle: 'short' })}`,
    { size: 10, color: PDF_COLORS.muted, gap: 2 });
  w.rule();
  w.space(4);

  // 2. Result: manipulation probability + plain-language interpretation
  w.text(p.resultTitle, { size: 15, bold: true, gap: 3 });
  w.text(p.probability, { size: 10, color: PDF_COLORS.muted, gap: 1 });
  w.text(`${Math.round(currentResult.score_percent)}%`, { size: 38, bold: true, color: PDF_COLORS.bucket[bucket], gap: 2 });
  w.text(t.labels[currentResult.label] || '', { size: 13, bold: true, gap: 2 });
  w.text(t.explanations[currentResult.label] || '', { size: 11, gap: 6 });

  // 3. What this result means (by bucket)
  w.text(p.meaningTitle, { size: 15, bold: true, gap: 3 });
  w.text(p.meaning[bucket], { size: 11, gap: 6 });

  // 4. Recommended steps
  w.text(p.stepsTitle, { size: 15, bold: true, gap: 3 });
  p.steps.forEach((step, i) => w.text(`${i + 1}. ${step}`, { size: 11, gap: 3 }));
  w.space(4);

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

function enterScreen(headingEl) {
  window.scrollTo({ top: 0, behavior: 'auto' });
  headingEl.focus({ preventScroll: true });
}

// ─── Show result ─────────────────────────────────────────────────────────────
function showResult(data) {
  currentResult = data;
  analyzedAt = new Date();
  directCrisisActive = false;
  const t = T[currentLang];

  downloadPdfBtn.hidden = !window.jspdf?.jsPDF; // hide if the CDN script failed to load

  uploadScreen.hidden = true;
  resultScreen.hidden = false;
  scoreDisplay.hidden = false;
  scoreExplanation.hidden = false;
  resetBtn.hidden = false;
  backToUploadBtn.hidden = true;

  resultHeading.textContent = UI[currentLang].resultHeading;
  scoreDisplay.dataset.bucket = data.bucket;
  scoreNumber.textContent = '0';
  animateScore(data.score_percent);

  scoreLabel.textContent       = t.labels[data.label]       || '';
  scoreExplanation.textContent = t.explanations[data.label] || '';

  if (data.bucket !== 'low') {
    renderCrisisPathway();
    crisisPathway.hidden = false;
    countrySelector.hidden = false;
    noDetectionNote.hidden = true;
  } else {
    crisisPathway.hidden = true;
    countrySelector.hidden = true;
    renderNoDetectionNote();
    noDetectionNote.hidden = false;
  }
  enterScreen(resultHeading);
}

// ─── Direct crisis path ──────────────────────────────────────────────────────
// Entered either from the upload screen (no analysis run at all) or from the
// "no manipulation detected" note (a result already exists). Both cases just
// need the crisis pathway visible with direct-crisis framing instead of the
// AI-triage framing.
function revealCrisisResources() {
  directCrisisActive = true;
  countrySelector.hidden = false;
  crisisPathway.hidden = false;
  noDetectionNote.hidden = true;
  renderCrisisPathway();
}

function showDirectCrisisPath() {
  currentResult = null;
  downloadPdfBtn.hidden = true;
  uploadScreen.hidden = true;
  resultScreen.hidden = false;
  scoreDisplay.hidden = true;
  scoreExplanation.hidden = true;
  resetBtn.hidden = true;
  backToUploadBtn.hidden = false;
  resultHeading.textContent = UI[currentLang].directHeading;
  revealCrisisResources();
  enterScreen(resultHeading);
}

directCrisisBtn.addEventListener('click', showDirectCrisisPath);
noDetectionLink.addEventListener('click', revealCrisisResources);
function resetToUpload() {
  handleFileToken++;
  selectedFile = null;
  currentResult = null;
  directCrisisActive = false;
  fileInput.value = '';
  setPreview(null);
  uploadText.textContent = T[currentLang].uploadPrompt;
  uploadHint.textContent = UI[currentLang].uploadHint;
  analyzeBtn.disabled = true;
  setLoading(false);
  clearFormError();
  crisisPathway.hidden = true;
  countrySelector.hidden = true;
  noDetectionNote.hidden = true;
  schoolLetterDetails.open = false;
  resultScreen.hidden = true;
  uploadScreen.hidden = false;
  enterScreen(heroTitle);
}
backToUploadBtn.addEventListener('click', resetToUpload);

// ─── School letter (MX / ES only) ────────────────────────────────────────────
// 100% client-side: form values never leave the browser. Reuses the jsPDF
// build already loaded in index.html.

// Entidades con Ley Olimpia adoptada (reformas al código penal estatal).
// NOTE: lista pendiente de verificación contra fuente oficial; se asumen los
// 32 estados. Para quitar uno, borrarlo de este Set: la carta citará
// entonces solo el marco federal.
const LEY_OLIMPIA_STATES = new Set([
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
  'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
]);

const schoolLetterLink    = document.getElementById('school-letter-link');
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
    intro: 'Llena los datos que quieras (todos son opcionales) y descarga una carta formal para la dirección de tu escuela. Se genera en tu dispositivo: nada se envía ni se guarda.',
    student: 'Nombre del alumno/a', studentPh: 'Ej. María Pérez López',
    grade: 'Grado y grupo', gradePh: 'Ej. 2.º B de secundaria',
    school: 'Nombre de la escuela', schoolPh: 'Ej. Secundaria Técnica No. 25',
    date: 'Fecha del incidente',
    desc: 'Descripción breve del incidente', descPh: 'Describe brevemente qué pasó, sin datos que no quieras compartir con la escuela.',
    guardian: 'Nombre del tutor o tutora legal', guardianPh: 'Ej. Ana López Ramírez',
    state: 'Estado', statePh: 'Selecciona tu estado',
    generate: 'Generar carta', clear: 'Limpiar formulario',
    pdfError: 'No se pudo cargar el generador de PDF. Revisa tu conexión e inténtalo de nuevo.',
    file: 'carta-escuela-verashield',
    addressee: (school) => 'C. Director(a) de ' + school,
    greeting: 'Presente',
    subject: 'Asunto: Solicitud de intervención por incidente de contenido digital no consensuado',
    body: (g, st, gr, inc) => 'Por medio de la presente, yo, ' + g + ', en mi carácter de tutor(a) legal del/de la alumno/a ' + st + ', quien cursa ' + gr + ' en esa institución, me dirijo a usted para hacer de su conocimiento un incidente de difusión o manipulación de contenido digital (imágenes o video) sin consentimiento, ocurrido ' + (inc ? 'el ' + inc : 'en fecha ____________________') + ', que afecta al/a la alumno/a.',
    descLabel: 'Descripción de los hechos: ',
    legal: {
      mx: (state) => 'Hago de su conocimiento que la difusión de contenido íntimo o sexual sin consentimiento constituye una conducta sancionada por la denominada «Ley Olimpia», ' + (state ? 'tanto en el ámbito federal (Ley General de Acceso de las Mujeres a una Vida Libre de Violencia y Código Penal Federal) como en la legislación penal de ' + state : 'en el ámbito federal (Ley General de Acceso de las Mujeres a una Vida Libre de Violencia y Código Penal Federal)') + '. Al tratarse de una persona menor de edad, debe prevalecer además el interés superior de la niñez, conforme a la Ley General de los Derechos de Niñas, Niños y Adolescentes.',
      in: () => 'Hago de su conocimiento que difundir o manipular imágenes de una persona sin su consentimiento puede constituir un delito conforme a la Sección 66E de la Ley de Tecnología de la Información de 2000 y, al tratarse de una persona menor de edad, también puede estar comprendido en la Ley POCSO de 2012. Debe prevalecer el interés superior de la niñez.',
      us: () => 'Hago de su conocimiento que difundir o manipular imágenes de una persona menor de edad sin su consentimiento puede violar la ley federal (incluida la ley TAKE IT DOWN) y las leyes estatales aplicables. La seguridad y el interés superior del alumno/a deben ser la prioridad.',
    },
    requestsIntro: 'Por lo anterior, solicito respetuosamente a esa dirección:',
    requests: [
      '1. Que se realice una investigación interna para esclarecer los hechos y deslindar responsabilidades.',
      '2. Que se implementen medidas de protección inmediatas para el/la alumno/a, que garanticen su seguridad e integridad y eviten la revictimización.',
      '3. Que se levante el acta correspondiente y se me entregue copia de la misma, así como del folio de seguimiento.',
    ],
    closing: 'Sin otro particular, agradezco su atención y quedo en espera de su pronta respuesta.',
    farewell: 'Atentamente',
    signature: 'Tutor(a) legal (firma)',
    stampTitle: 'Para uso de la escuela',
    stampLine: 'Recibido por: ____________________   Fecha: ______________   Folio: ______________',
    footer: {
      mx: 'Esta carta es para reporte escolar. Para denuncia penal, el tutor debe acompañar al menor al Ministerio Público.',
      in: 'Esta carta es para reporte escolar. Para una denuncia penal, el tutor puede acompañar al menor a la comisaría más cercana o presentar la queja en cybercrime.gov.in.',
      us: 'Esta carta es para reporte escolar. Para una denuncia penal, contacta a la policía local o reporta en la CyberTipline del NCMEC.',
    },
    generated: 'Generado con VeraShield | verashield.app',
  },
  en: {
    locale: 'en-US',
    title: 'Generate a letter for my school',
    intro: 'Fill in whatever you like (everything is optional) and download a formal letter for your school principal. It is created on your device: nothing is sent or saved.',
    student: 'Student name', studentPh: 'e.g. Maria Perez Lopez',
    grade: 'Grade and class', gradePh: 'e.g. Grade 8, Section B',
    school: 'School name', schoolPh: 'e.g. Riverside Secondary School',
    date: 'Date of the incident',
    desc: 'Short description of the incident', descPh: 'Briefly describe what happened. Leave out anything you do not want the school to know.',
    guardian: 'Name of parent or legal guardian', guardianPh: 'e.g. Ana Lopez Ramirez',
    state: 'State', statePh: 'Select your state',
    generate: 'Generate letter', clear: 'Clear form',
    pdfError: 'The PDF generator could not be loaded. Check your connection and try again.',
    file: 'school-letter-verashield',
    addressee: (school) => 'To the Principal of ' + school,
    greeting: 'Dear Principal,',
    subject: 'Subject: Request for action on a non-consensual digital content incident',
    body: (g, st, gr, inc) => 'I, ' + g + ', as the legal guardian of the student ' + st + ', who attends ' + gr + ' at your institution, am writing to inform you of an incident involving the sharing or manipulation of digital content (images or video) without consent, which occurred ' + (inc ? 'on ' + inc : 'on a date ____________________') + ' and affects the student.',
    descLabel: 'Description of events: ',
    legal: {
      mx: (state) => 'Please be advised that sharing intimate or sexual content without consent is conduct punishable under the so-called "Ley Olimpia", ' + (state ? 'both at the federal level (General Law on Women\'s Access to a Life Free of Violence and the Federal Criminal Code) and under the criminal law of ' + state : 'at the federal level (General Law on Women\'s Access to a Life Free of Violence and the Federal Criminal Code)') + '. Because the student is a minor, the best interests of the child must also prevail under the General Law on the Rights of Children and Adolescents.',
      in: () => 'Please be advised that sharing or manipulating a person\'s images without consent may be an offence under Section 66E of the Information Technology Act, 2000 and, because the student is a minor, may also fall under the POCSO Act, 2012. The best interests of the child must prevail.',
      us: () => 'Please be advised that sharing or manipulating images of a minor without consent may violate federal law (including the TAKE IT DOWN Act) and applicable state law. The student\'s safety and best interests must come first.',
    },
    requestsIntro: 'For these reasons, I respectfully ask the school to:',
    requests: [
      '1. Carry out an internal investigation to establish the facts and determine responsibilities.',
      '2. Put immediate protective measures in place for the student, ensuring their safety and preventing re-victimization.',
      '3. Make a formal record of the incident and give me a copy of it, together with a follow-up reference number.',
    ],
    closing: 'Thank you for your attention. I look forward to your prompt reply.',
    farewell: 'Sincerely,',
    signature: 'Parent or legal guardian (signature)',
    stampTitle: 'For school use',
    stampLine: 'Received by: ____________________   Date: ______________   Ref. no.: ______________',
    footer: {
      mx: 'This letter is for school reporting. For a criminal complaint, the guardian should accompany the minor to the Public Prosecutor\'s Office (Ministerio Publico).',
      in: 'This letter is for school reporting. For a criminal complaint, the guardian can accompany the minor to the nearest police station or file at cybercrime.gov.in.',
      us: 'This letter is for school reporting. For a criminal complaint, contact local law enforcement or report to the NCMEC CyberTipline.',
    },
    generated: 'Generated with VeraShield | verashield.app',
  },
  hi: {
    locale: 'hi-IN',
    title: 'स्कूल के लिए पत्र बनाएँ',
    intro: 'जो जानकारी देना चाहें भरें (सब वैकल्पिक है) और अपने स्कूल के प्रधानाचार्य के लिए औपचारिक पत्र डाउनलोड करें। यह आपके डिवाइस पर बनता है: कुछ भेजा या सेव नहीं किया जाता।',
    student: 'छात्र/छात्रा का नाम', studentPh: 'जैसे: प्रिया शर्मा',
    grade: 'कक्षा और सेक्शन', gradePh: 'जैसे: कक्षा 8, सेक्शन बी',
    school: 'स्कूल का नाम', schoolPh: 'जैसे: राजकीय उच्च माध्यमिक विद्यालय',
    date: 'घटना की तारीख',
    desc: 'घटना का संक्षिप्त विवरण', descPh: 'संक्षेप में बताएँ क्या हुआ। ऐसी बातें न लिखें जो आप स्कूल को नहीं बताना चाहते।',
    guardian: 'अभिभावक का नाम', guardianPh: 'जैसे: सुनीता शर्मा',
    state: 'राज्य', statePh: 'अपना राज्य चुनें',
    generate: 'पत्र बनाएँ', clear: 'फ़ॉर्म साफ़ करें',
    pdfError: 'PDF जनरेटर लोड नहीं हो सका। अपना कनेक्शन जाँचें और दोबारा कोशिश करें।',
    file: 'school-letter-verashield',
    addressee: (school) => 'सेवा में, प्रधानाचार्य, ' + school,
    greeting: 'आदरणीय प्रधानाचार्य जी,',
    subject: 'विषय: बिना सहमति के डिजिटल सामग्री से जुड़ी घटना पर कार्रवाई का अनुरोध',
    body: (g, st, gr, inc) => 'मैं, ' + g + ', छात्र/छात्रा ' + st + ' का कानूनी अभिभावक, जो आपके विद्यालय में ' + gr + ' में पढ़ता/पढ़ती है, आपको एक घटना की जानकारी देने के लिए लिख रहा/रही हूँ, जिसमें डिजिटल सामग्री (तस्वीरें या वीडियो) बिना सहमति के साझा या बदली गई। यह घटना ' + (inc ? inc + ' को' : 'दिनांक ____________________ को') + ' हुई और इससे छात्र/छात्रा प्रभावित है।',
    descLabel: 'घटना का विवरण: ',
    legal: {
      mx: (state) => 'मैं आपको सूचित करता/करती हूँ कि सहमति के बिना निजी या यौन सामग्री साझा करना मेक्सिको की "ले ओलम्पिया" के तहत दंडनीय है' + (state ? ', संघीय स्तर पर भी और ' + state + ' के आपराधिक कानून के तहत भी' : ', संघीय स्तर पर') + '। छात्र/छात्रा नाबालिग है, इसलिए बच्चों और किशोरों के अधिकारों के सामान्य कानून के अनुसार बच्चे का सर्वोत्तम हित सर्वोपरि होना चाहिए।',
      in: () => 'मैं आपको सूचित करता/करती हूँ कि किसी व्यक्ति की तस्वीरें बिना सहमति के साझा करना या बदलना सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 66E के तहत अपराध हो सकता है और, छात्र/छात्रा नाबालिग होने के कारण, POCSO अधिनियम, 2012 के अंतर्गत भी आ सकता है। बच्चे का सर्वोत्तम हित सर्वोपरि होना चाहिए।',
      us: () => 'मैं आपको सूचित करता/करती हूँ कि किसी नाबालिग की तस्वीरें बिना सहमति के साझा करना या बदलना संघीय कानून (TAKE IT DOWN Act सहित) और लागू राज्य कानूनों का उल्लंघन हो सकता है। छात्र/छात्रा की सुरक्षा और सर्वोत्तम हित को प्राथमिकता मिलनी चाहिए।',
    },
    requestsIntro: 'इसलिए मैं विद्यालय से विनम्र अनुरोध करता/करती हूँ कि:',
    requests: [
      '1. तथ्यों का पता लगाने और ज़िम्मेदारी तय करने के लिए आंतरिक जाँच की जाए।',
      '2. छात्र/छात्रा की सुरक्षा सुनिश्चित करने और दोबारा पीड़ित होने से बचाने के लिए तुरंत सुरक्षात्मक कदम उठाए जाएँ।',
      '3. घटना का औपचारिक रिकॉर्ड बनाया जाए और उसकी प्रति तथा अनुवर्ती संदर्भ संख्या मुझे दी जाए।',
    ],
    closing: 'आपके ध्यान के लिए धन्यवाद। मैं आपके शीघ्र उत्तर की प्रतीक्षा करूँगा/करूँगी।',
    farewell: 'सादर,',
    signature: 'अभिभावक (हस्ताक्षर)',
    stampTitle: 'विद्यालय के उपयोग के लिए',
    stampLine: 'प्राप्तकर्ता: ____________________   तारीख: ______________   संदर्भ संख्या: ______________',
    footer: {
      mx: 'यह पत्र विद्यालय को सूचित करने के लिए है। आपराधिक शिकायत के लिए अभिभावक नाबालिग के साथ लोक अभियोजक कार्यालय (Ministerio Publico) जाएँ।',
      in: 'यह पत्र विद्यालय को सूचित करने के लिए है। आपराधिक शिकायत के लिए अभिभावक नाबालिग के साथ नज़दीकी पुलिस थाने जा सकते हैं या cybercrime.gov.in पर शिकायत दर्ज कर सकते हैं।',
      us: 'यह पत्र विद्यालय को सूचित करने के लिए है। आपराधिक शिकायत के लिए स्थानीय पुलिस से संपर्क करें या NCMEC CyberTipline पर रिपोर्ट करें।',
    },
    generated: 'VeraShield से बनाया गया | verashield.app',
  },
};

const stateField = document.getElementById('sl-state-field');

function applySchoolLetterStrings() {
  const sl = SL[currentLang];
  document.querySelectorAll('[data-sl]').forEach((el) => { el.textContent = sl[el.dataset.sl] || ''; });
  document.querySelectorAll('[data-sl-ph]').forEach((el) => { el.placeholder = sl[el.dataset.slPh] || ''; });
}

function updateSchoolLetterVisibility() {
  schoolLetterSection.hidden = false;
  schoolLetterLink.hidden = false;
  stateField.hidden = currentCountry !== 'mx';
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
  const sl = SL[currentLang];
  const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDFCtor) {
    slError.textContent = sl.pdfError;
    slError.hidden = false;
    return;
  }

  const val = (id) => document.getElementById(id).value.trim();
  const blank = (v, n = 18) => v || '_'.repeat(n);
  const country  = currentCountry;
  const student  = val('sl-student');
  const grade    = val('sl-grade');
  const school   = val('sl-school');
  const guardian = val('sl-guardian');
  const state    = country === 'mx' ? val('sl-state') : '';
  const incident = isoToDate(val('sl-date'), sl.locale);
  const desc     = val('sl-description').slice(0, 300);
  const now      = new Date();
  const today    = now.toLocaleDateString(sl.locale, { dateStyle: 'long' });

  const doc = new jsPDFCtor({ unit: 'mm', format: 'a4' });
  const w = createPdfWriter(doc, currentLang);
  const ink = PDF_COLORS.ink;

  w.text(state ? state + ', ' + today : today, { align: 'right', gap: 8, color: ink });
  w.text(sl.addressee(school || '______________________________'), { bold: true, gap: 0, color: ink });
  w.text(sl.greeting, { bold: true, gap: 8, color: ink });
  w.text(sl.subject, { bold: true, gap: 8, color: ink });

  w.text(sl.body(blank(guardian, 28), blank(student, 28), blank(grade, 14), incident), { gap: 4, color: ink });
  w.text(sl.descLabel + (desc || '_'.repeat(40)), { gap: desc ? 4 : 1, color: ink });
  if (!desc) w.text('_'.repeat(75), { gap: 4, color: ink });

  w.text(sl.legal[country](state && LEY_OLIMPIA_STATES.has(state) ? state : ''), { gap: 4, color: ink });

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
    w.textAt(sl.footer[country] + ' ' + sl.generated, PDF_PAGE_H_MM - 18, { size: 8, bold: false, color: PDF_COLORS.muted, align: 'left' });
  }

  doc.save(sl.file + '-' + todayStamp(now) + '.pdf');
}

schoolLetterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  generateSchoolLetter();
});

document.getElementById('sl-clear').addEventListener('click', () => {
  schoolLetterForm.reset();
  slCounter.textContent = '0 / 300';
  slError.hidden = true;
});

slDescription.addEventListener('input', () => {
  slCounter.textContent = `${slDescription.value.length} / 300`;
});

// Entry point from the upload screen (independent of any analysis result)
schoolLetterLink.addEventListener('click', () => {
  showDirectCrisisPath();
  schoolLetterDetails.open = true;
  schoolLetterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

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
resetBtn.addEventListener('click', resetToUpload);

// ─── Init ────────────────────────────────────────────────────────────────────
(function initLanguage() {
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  applyLanguage(['es', 'en', 'hi'].includes(nav) ? nav : 'es');
})();