import {
  AZURE_PRIVACY_URL, NCMEC_CYBERTIPLINE_URL, SIGHTENGINE_URL, TE_PROTEJO_URL,
} from '/lib/privacyServices.js';

const CONTACT_EMAIL = 'hello@verashield.help';

const SERVICES = [
  { name: 'sightengine', url: SIGHTENGINE_URL },
  { name: 'azure', url: AZURE_PRIVACY_URL },
];

// VERIFICAR: the Hindi text is a draft and needs review by a speaker.
const STRINGS = {
  es: {
    skip: 'Saltar al contenido',
    docTitle: 'Privacidad | VeraShield',
    title: 'Cómo protegemos tu privacidad',
    s1: 'Qué pasa cuando subes una imagen',
    flow: [
      'Tú subes la imagen.',
      'VeraShield la recibe de forma temporal en su servidor, solo para enviarla al análisis.',
      'Antes de enviarla, te preguntamos si muestra desnudez o contenido sexual de alguien menor de 18 años. Si respondes que sí, el análisis se detiene y la imagen no se envía a ningún servicio.',
      'Si respondes que no, se envía a Sightengine para el análisis. Si Sightengine falla, puede usarse Azure AI Content Safety como respaldo.',
      'El resultado regresa a tu pantalla.',
      'Para evitar abusos, el servidor cuenta brevemente cuántos análisis se piden desde una misma conexión, con una huella que no permite recuperar la dirección, y lo olvida en pocos minutos.',
      'VeraShield no conserva tu imagen: no tiene ninguna base de datos de imágenes.',
    ],
    s1note: 'VeraShield no tiene base de datos de imágenes. No guardamos tus imágenes de forma permanente.',
    s2: 'Servicios externos que usamos',
    th: ['Servicio', 'Para qué', 'Su política de privacidad'],
    services: {
      sightengine: ['Sightengine (Kozelo SAS, París, Francia)', 'Detectar si la imagen fue manipulada con IA'],
      azure: ['Microsoft Azure AI Content Safety', 'Detección de respaldo, solo si Sightengine no responde'],
    },
    s2note: 'Estos servicios reciben la imagen temporalmente para procesarla. Tienen sus propias políticas de datos, que puedes revisar en los links.',
    s3: 'Qué NO hacemos',
    nots: [
      'No guardamos tus imágenes de forma permanente.',
      'No tenemos cuentas de usuario ni perfiles.',
      'No compartimos datos con autoridades (tú decides si denunciar).',
      'VeraShield no usa tus imágenes para entrenar modelos de IA.',
    ],
    s4: 'Qué pasa si hay contenido ilegal',
    s4p: ['VeraShield no guarda las imágenes que subes ni las revisa, así que no puede reportarlas por ti.',
      'Si encuentras material que involucra abuso sexual de menores, no lo descargues ni lo reenvíes. Puedes reportarlo tú en'],
    s4links: [['NCMEC CyberTipline', NCMEC_CYBERTIPLINE_URL], ['Te Protejo México', TE_PROTEJO_URL]],
    s4and: ' o en ',
    s5: 'Contacto',
    s5p: '¿Tienes preguntas sobre privacidad? Escríbenos a:',
    s5missing: '[correo por confirmar]',
  },
  en: {
    skip: 'Skip to content',
    docTitle: 'Privacy | VeraShield',
    title: 'How we protect your privacy',
    s1: 'What happens when you upload an image',
    flow: [
      'You upload the image.',
      'VeraShield receives it temporarily on its server, only to send it for analysis.',
      'Before sending it, we ask whether it shows nudity or sexual content of someone under 18. If you answer yes, the analysis stops and the image is not sent to any service.',
      'If you answer no, it is sent to Sightengine for analysis. If Sightengine fails, Azure AI Content Safety may be used as a backup.',
      'The result comes back to your screen.',
      'To prevent abuse, the server briefly counts how many analyses are requested from the same connection, using a fingerprint that cannot be turned back into the address, and forgets it within minutes.',
      'VeraShield does not keep your image: it has no image database.',
    ],
    s1note: 'VeraShield has no image database. We do not store your images permanently.',
    s2: 'External services we use',
    th: ['Service', 'What for', 'Their privacy policy'],
    services: {
      sightengine: ['Sightengine (Kozelo SAS, Paris, France)', 'Detect whether the image was manipulated with AI'],
      azure: ['Microsoft Azure AI Content Safety', 'Backup detection, only if Sightengine does not respond'],
    },
    s2note: 'These services receive the image temporarily to process it. They have their own data policies, which you can review at the links.',
    s3: 'What we do NOT do',
    nots: [
      'We do not store your images permanently.',
      'We have no user accounts or profiles.',
      'We do not share data with authorities (you decide whether to report).',
      'VeraShield does not use your images to train AI models.',
    ],
    s4: 'What happens if there is illegal content',
    s4p: ['VeraShield does not store the images you upload or review them, so it cannot report them for you.',
      'If you find material involving child sexual abuse, do not download or forward it. You can report it yourself to the'],
    s4links: [['NCMEC CyberTipline', NCMEC_CYBERTIPLINE_URL], ['Te Protejo México', TE_PROTEJO_URL]],
    s4and: ' or to ',
    s5: 'Contact',
    s5p: 'Questions about privacy? Write to us at:',
    s5missing: '[email to be confirmed]',
  },
  hi: {
    skip: 'सामग्री पर जाएँ',
    docTitle: 'गोपनीयता | VeraShield',
    title: 'हम आपकी गोपनीयता की रक्षा कैसे करते हैं',
    s1: 'इमेज अपलोड करने पर क्या होता है',
    flow: [
      'आप इमेज अपलोड करते हैं।',
      'VeraShield इसे अस्थायी रूप से अपने सर्वर पर प्राप्त करता है, केवल विश्लेषण के लिए भेजने हेतु।',
      'भेजने से पहले हम पूछते हैं कि क्या इसमें 18 वर्ष से कम उम्र के किसी व्यक्ति की नग्नता या यौन सामग्री है। अगर आप "हाँ" कहते हैं, तो विश्लेषण रुक जाता है और इमेज किसी सेवा को नहीं भेजी जाती।',
      'अगर आप "नहीं" कहते हैं, तो इमेज विश्लेषण के लिए Sightengine को भेजी जाती है। Sightengine विफल हो तो बैकअप के रूप में Azure AI Content Safety इस्तेमाल हो सकता है।',
      'नतीजा आपकी स्क्रीन पर लौट आता है।',
      'दुरुपयोग रोकने के लिए सर्वर एक ही कनेक्शन से माँगी गई जाँचों को थोड़ी देर गिनता है, ऐसे फ़िंगरप्रिंट से जिससे पता वापस नहीं निकाला जा सकता, और कुछ मिनट में भूल जाता है।',
      'VeraShield आपकी इमेज नहीं रखता: उसके पास इमेज का कोई डेटाबेस नहीं है।',
    ],
    s1note: 'VeraShield के पास इमेज का कोई डेटाबेस नहीं है। हम आपकी इमेज स्थायी रूप से सेव नहीं करते।',
    s2: 'हम जो बाहरी सेवाएँ इस्तेमाल करते हैं',
    th: ['सेवा', 'किसलिए', 'उनकी गोपनीयता नीति'],
    services: {
      sightengine: ['Sightengine (Kozelo SAS, पेरिस, फ़्रांस)', 'यह पहचानना कि इमेज AI से बदली गई है या नहीं'],
      azure: ['Microsoft Azure AI Content Safety', 'बैकअप पहचान, केवल तब जब Sightengine जवाब न दे'],
    },
    s2note: 'ये सेवाएँ इमेज को प्रोसेस करने के लिए अस्थायी रूप से प्राप्त करती हैं। उनकी अपनी डेटा नीतियाँ हैं, जिन्हें आप लिंक पर देख सकते हैं।',
    s3: 'हम क्या नहीं करते',
    nots: [
      'हम आपकी इमेज स्थायी रूप से सेव नहीं करते।',
      'हमारे यहाँ कोई यूज़र अकाउंट या प्रोफ़ाइल नहीं है।',
      'हम अधिकारियों के साथ डेटा साझा नहीं करते (शिकायत करना है या नहीं, यह आप तय करते हैं)।',
      'VeraShield आपकी इमेज का उपयोग AI मॉडल ट्रेन करने के लिए नहीं करता।',
    ],
    s4: 'अवैध सामग्री मिलने पर क्या होता है',
    s4p: ['VeraShield आपकी अपलोड की इमेज न सेव करता है न उन्हें देखता है, इसलिए वह आपकी ओर से रिपोर्ट नहीं कर सकता।',
      'अगर आपको बच्चों के यौन शोषण से जुड़ी सामग्री मिले, तो उसे डाउनलोड या फ़ॉरवर्ड न करें। आप खुद यहाँ रिपोर्ट कर सकते हैं:'],
    s4links: [['NCMEC CyberTipline', NCMEC_CYBERTIPLINE_URL], ['Te Protejo México', TE_PROTEJO_URL]],
    s4and: ' या ',
    s5: 'संपर्क',
    s5p: 'गोपनीयता के बारे में सवाल? हमें लिखें:',
    s5missing: '[ईमेल की पुष्टि बाकी है]',
  },
};

const page = document.getElementById('privacy-page');
const langBtns = document.querySelectorAll('.lang-btn');
let lang = initialLang();

function initialLang() {
  const asked = new URLSearchParams(location.search).get('lang');
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return [asked, nav].find((l) => STRINGS[l]) || 'es';
}

function el(tag, text, className) {
  const n = document.createElement(tag);
  if (text) n.textContent = text;
  if (className) n.className = className;
  return n;
}

function extLink(href, text) {
  const a = el('a', text);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function section(heading, ...children) {
  const s = el('section', '', 'privacy-section');
  s.appendChild(el('h2', heading, 'section-heading'));
  s.append(...children);
  return s;
}

function render() {
  const t = STRINGS[lang];
  document.documentElement.lang = lang;
  document.title = t.docTitle;
  document.getElementById('skip-link').textContent = t.skip;
  langBtns.forEach((b) => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });

  const h1 = el('h1', t.title, 'hero-title');

  // 1. Flow diagram: numbered steps with arrows (plain DOM + CSS, no library)
  const flow = el('ol', '', 'flow-steps');
  t.flow.forEach((step) => flow.appendChild(el('li', step)));
  const s1 = section(t.s1, flow, el('p', t.s1note, 'privacy-note-box'));

  // 2. External services table
  const table = el('table', '', 'privacy-table');
  const head = el('tr');
  t.th.forEach((h) => { const c = el('th', h); c.scope = 'col'; head.appendChild(c); });
  table.appendChild(el('thead')).appendChild(head);
  const body = el('tbody');
  SERVICES.forEach(({ name, url }) => {
    const [service, why] = t.services[name];
    const row = el('tr');
    const policy = el('td');
    policy.appendChild(extLink(url, url.replace(/^https:\/\//, '')));
    row.append(el('td', service), el('td', why), policy);
    body.appendChild(row);
  });
  table.appendChild(body);
  const wrap = el('div', '', 'privacy-table-wrap');
  wrap.appendChild(table);
  const s2 = section(t.s2, wrap, el('p', t.s2note, 'privacy-note-box'));

  // 3. What we do NOT do
  const nots = el('ul', '', 'privacy-nots');
  t.nots.forEach((n) => nots.appendChild(el('li', n)));
  const s3 = section(t.s3, nots);

  // 4. Illegal content
  const p2 = el('p', t.s4p[1] + ' ');
  p2.append(extLink(t.s4links[0][1], t.s4links[0][0]), t.s4and, extLink(t.s4links[1][1], t.s4links[1][0]), '.');
  const s4 = section(t.s4, el('p', t.s4p[0]), p2);

  // 5. Contact
  const contact = el('p', t.s5p + ' ');
  if (CONTACT_EMAIL) {
    const a = el('a', CONTACT_EMAIL);
    a.href = 'mailto:' + CONTACT_EMAIL;
    contact.appendChild(a);
  } else {
    contact.appendChild(el('strong', t.s5missing));
  }
  const s5 = section(t.s5, contact);

  page.replaceChildren(h1, s1, s2, s3, s4, s5);
}

langBtns.forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; render(); }));
render();
