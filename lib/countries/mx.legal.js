// Single source of truth for the Mexican legal citations (school letter and evidence PDF). Named
// exports only. Moved here from lib/legalReferences.js.
//
// VERIFICAR: every statute, penalty, date and source below was supplied by the project
// maintainer and has NOT been checked against the DOF or the state gazettes. Re-check them
// before relying on them in a letter to a school or an authority.

export const FEDERAL_REFERENCES = {
  // Minors: articles 202 and 202 Bis. Text supplied by the project maintainer on 2026-11-02.
  // 202: producing, recording, photographing, describing (real or simulated) sexual acts of persons
  // under 18, and also reproducing, storing, distributing, selling, buying, exhibiting or
  // transmitting that material: 7 to 12 years and 800 to 2,000 days of fine. 202 Bis: storing or
  // buying it without commercial purpose: 1 to 5 years and 100 to 500 days of fine, plus psychiatric
  // treatment. The letter does not quote penalties; they are kept here for the legal report.
  cpf_202: {
    articulo: 'Artículo 202 del Código Penal Federal',
    descripcion: 'Pornografía de personas menores de dieciocho años: incluye grabar o fotografiar, y también reproducir, almacenar, distribuir o transmitir el material, reales o simulados',
    vigencia: 'Texto vigente aportado el 02/11/2026',
    pena: '7 a 12 años de prisión y 800 a 2,000 días multa',
  },
  cpf_202_bis: {
    articulo: 'Artículo 202 Bis del Código Penal Federal',
    descripcion: 'Almacenar o comprar ese material sin fines de comercialización o distribución',
    vigencia: 'Texto vigente aportado el 02/11/2026',
    pena: '1 a 5 años de prisión y 100 a 500 días multa, y tratamiento psiquiátrico especializado',
  },
  // Adults only: the text of 199 Octies says "persona que tenga la mayoría de edad" (text supplied
  // by the project maintainer on 2026-11-02). 199 Nonies covers content that does not match the
  // person shown (same sanctions); 199 Decies raises the penalty up to one half in listed cases.
  cpf_199_octies: {
    articulo: 'Artículo 199 Octies del Código Penal Federal',
    descripcion: 'Violación a la intimidad sexual de personas mayores de edad: 3 a 6 años de prisión y multa de 500 a 1,000 UMA',
    vigencia: 'DOF 01/06/2021',
  },
  cpf_199_nonies: {
    articulo: 'Artículo 199 Nonies del Código Penal Federal',
    descripcion: 'Mismas sanciones cuando las imágenes, videos o audios no corresponden con la persona señalada',
    vigencia: 'DOF 01/06/2021',
  },
  cpf_199_decies: {
    articulo: 'Artículo 199 Decies del Código Penal Federal',
    descripcion: 'Aumento de la pena hasta en una mitad (por ejemplo, relación de confianza o servidor público)',
    vigencia: 'DOF 01/06/2021',
  },
  lgamvlv_20_quater: {
    articulo: 'Artículo 20 Quáter de la LGAMVLV',
    descripcion: 'Violencia digital: imágenes, audios o videos reales o simulados de contenido íntimo sexual sin consentimiento',
    vigencia: 'DOF 01/06/2021',
  },
  // The Ministerio Público or the judge orders platforms to interrupt, block, destroy or delete the
  // content; the exact URL and the provider must be identified; the authority asks for lawful
  // preservation; the platform notifies the user; a hearing is held within five days.
  lgamvlv_20_sexies: {
    articulo: 'Artículo 20 Sexies de la LGAMVLV',
    descripcion: 'Medidas de protección: orden del Ministerio Público o juez a las plataformas, con el enlace exacto y resguardo lícito del contenido',
    vigencia: 'DOF 01/06/2021',
  },
};

export const SEP_ACUERDOS = {
  basica: {
    numero: '17/05/25',
    dof: '30 de mayo de 2025',
    alcance: 'Obligatorio para escuelas públicas y particulares de educación básica (preescolar, primaria, secundaria)',
    descripcion: 'Lineamientos para la prevención, atención y no repetición de la violencia sexual, incluyendo violencia digital',
  },
  media_superior_federal: {
    numero: '03/04/26',
    dof: '7 de mayo de 2026',
    alcance: 'Planteles federales de educación media superior',
    descripcion: 'Lineamientos para la atención de violencias en educación media superior, incluyendo violencia digital',
  },
};

export const ESTADO_REFERENCES = {
  Jalisco: {
    articulo: 'Artículo 176-Bis.3 del Código Penal del Estado de Jalisco',
    descripcion: 'Violación a la intimidad sexual: incluye contenido "creado por inteligencia artificial"',
    pena: '1 a 8 años de prisión y multa de 1,000 a 2,000 UMA',
    vigencia: 'Aprobado junio 2026; fecha de publicación en Periódico Oficial pendiente de confirmación',
    fuente: 'https://infolej.congresojal.gob.mx/documentos/estados/R_161006.pdf',
  },
  Oaxaca: {
    articulo: 'Artículo 249 (párrafo cuarto) y artículo 72 Bis del Código Penal de Oaxaca',
    descripcion: 'Violación a la intimidad sexual digital; el art. 72 Bis agrava la pena en 1/3 cuando se usa IA',
    pena: '4 a 8 años de prisión y multa de 1,000 a 2,000 UMA',
    vigencia: 'Decreto número 876, Periódico Oficial de Oaxaca n.º 50, 18ª sección, 13 de diciembre de 2025',
    fuente: 'Congreso del Estado de Oaxaca',
  },
  // Todos los demás estados usan FEDERAL_REFERENCES.cpf_202 (personas menores) por defecto
};

export const CNDH_NOTE = {
  advertencia: 'Las recomendaciones de la CNDH no son vinculantes (obligatorias).',
  uso: 'Útil cuando una escuela pública o fiscalía no actúa.',
  limite: 'La CNDH no interviene en casos contra particulares.',
  competencia: 'En escuelas estatales, el órgano competente es la comisión estatal de derechos humanos.',
};

// Display texts (built from the constants above; es / en / hi)

const FEDERAL_MINOR = {
  es: 'artículo 202 del Código Penal Federal, sobre material sexual de personas menores de dieciocho años',
  en: 'article 202 of the Federal Criminal Code, on sexual material of persons under eighteen',
  hi: 'संघीय दंड संहिता का अनुच्छेद 202, अठारह वर्ष से कम आयु के व्यक्तियों की यौन सामग्री पर',
};

// School-level obligation. 'local' is also the fallback when no level is chosen or the person does
// not know it: state and private bachilleratos must NOT be told the federal agreement is directly
// binding on them. The agreements are named by their title so the school knows what is meant.
const A = SEP_ACUERDOS;
const SCHOOL_TEXT = {
  basica: {
    es: `En el ámbito escolar, la SEP emitió el Acuerdo número ${A.basica.numero} (DOF, ${A.basica.dof}), que establece los Lineamientos para la prevención primaria, la atención y las medidas de no repetición para la erradicación de la violencia sexual en educación básica; solicito que se actúe conforme a ellos y al protocolo de su entidad federativa.`,
    en: `In the school setting, the SEP issued Agreement No. ${A.basica.numero} (DOF, May 30, 2025), which sets the guidelines for primary prevention, response and non-repetition measures to eradicate sexual violence in basic education; I ask that the school act in line with them and with the protocol of its state.`,
    hi: `विद्यालय के संदर्भ में SEP ने समझौता संख्या ${A.basica.numero} (DOF, 30 मई 2025) जारी किया, जो बुनियादी शिक्षा में यौन हिंसा के उन्मूलन के लिए रोकथाम, कार्रवाई और पुनरावृत्ति-रोधी उपायों के दिशानिर्देश तय करता है; मेरा अनुरोध है कि उनके और आपके राज्य के प्रोटोकॉल के अनुसार कार्रवाई की जाए।`,
  },
  mediaFederal: {
    es: `En el ámbito escolar, la SEP emitió el Acuerdo número ${A.media_superior_federal.numero} (DOF, ${A.media_superior_federal.dof}), que emite los Lineamientos Generales para la atención de las violencias en la educación media superior; solicito que se actúe conforme a ellos y al protocolo de su entidad federativa.`,
    en: `In the school setting, the SEP issued Agreement No. ${A.media_superior_federal.numero} (DOF, May 7, 2026), which issues the General Guidelines for addressing violence in upper secondary education; I ask that the school act in line with them and with the protocol of its state.`,
    hi: `विद्यालय के संदर्भ में SEP ने समझौता संख्या ${A.media_superior_federal.numero} (DOF, 7 मई 2026) जारी किया, जो उच्च माध्यमिक शिक्षा में हिंसा से निपटने के सामान्य दिशानिर्देश जारी करता है; मेरा अनुरोध है कि उनके और आपके राज्य के प्रोटोकॉल के अनुसार कार्रवाई की जाए।`,
  },
  local: {
    es: 'En el ámbito escolar, solicito que se actúe conforme al protocolo local de su entidad federativa.',
    en: 'In the school setting, I ask that the school act in accordance with the local protocol of its state.',
    hi: 'विद्यालय के संदर्भ में मेरा अनुरोध है कि आपके राज्य के स्थानीय प्रोटोकॉल के अनुसार कार्रवाई की जाए।',
  },
};

// Only Jalisco and Oaxaca have their own norms on AI-made sexual content. What could not be
// confirmed (Jalisco article and publication, Oaxaca decree number) is said as pending, never as fact.
const STATE_LETTER = {
  Jalisco: {
    es: 'En Jalisco, el Congreso aprobó en junio de 2026 una reforma sobre contenido sexual creado con inteligencia artificial; el artículo y su publicación en el Periódico Oficial están pendientes de confirmación oficial.',
    en: 'In Jalisco, Congress approved in June 2026 a reform on sexual content created with artificial intelligence; the article and its publication in the Official Gazette are pending official confirmation.',
    hi: 'जालिस्को में कांग्रेस ने जून 2026 में कृत्रिम बुद्धिमत्ता से बनी यौन सामग्री पर एक सुधार मंज़ूर किया; अनुच्छेद और राजकीय राजपत्र में प्रकाशन की आधिकारिक पुष्टि लंबित है।',
  },
  Oaxaca: {
    es: 'En Oaxaca, el Congreso aprobó el 5 de diciembre de 2025 una reforma al Código Penal que sanciona el uso de inteligencia artificial para violar la intimidad sexual (artículos 249 y 72 Bis).',
    en: 'In Oaxaca, Congress approved on December 5, 2025 a Criminal Code reform that punishes the use of artificial intelligence to violate sexual privacy (articles 249 and 72 Bis).',
    hi: 'ओआहाका में कांग्रेस ने 5 दिसंबर 2025 को दंड संहिता में एक सुधार मंज़ूर किया जो यौन गोपनीयता के उल्लंघन के लिए कृत्रिम बुद्धिमत्ता के उपयोग को दंडित करता है (अनुच्छेद 249 और 72 Bis)।',
  },
};

// State-specific reference for the evidence PDF. Every other state (or an unknown one) falls back to
// the federal framework (`federal: true`).
export function getLegalReference(estado, lang = 'es') {
  const L = (es, en, hi) => ({ es, en, hi })[lang] || es;
  const F = FEDERAL_REFERENCES.cpf_202;
  if (estado === 'Jalisco') {
    return {
      estatuto: L(
        'Reforma al Código Penal del Estado de Jalisco sobre contenido sexual creado con inteligencia artificial (aprobada en junio de 2026)',
        'Reform of the Criminal Code of the State of Jalisco on sexual content created with artificial intelligence (approved June 2026)',
        'कृत्रिम बुद्धिमत्ता से बनी यौन सामग्री पर जालिस्को राज्य की दंड संहिता में सुधार (जून 2026 में स्वीकृत)'),
      nota: L(
        'Artículo y fecha de publicación en el Periódico Oficial pendientes de confirmación oficial.',
        'Article and date of publication in the Official Gazette pending official confirmation.',
        'अनुच्छेद और राजकीय राजपत्र में प्रकाशन की तिथि की आधिकारिक पुष्टि लंबित है।'),
      federal: false,
    };
  }
  if (estado === 'Oaxaca') {
    return {
      estatuto: L(
        'Reforma al Código Penal de Oaxaca sobre inteligencia artificial e intimidad sexual (arts. 249 y 72 Bis), aprobada el 5 de diciembre de 2025',
        'Reform of the Oaxaca Criminal Code on artificial intelligence and sexual privacy (arts. 249 and 72 Bis), approved December 5, 2025',
        'कृत्रिम बुद्धिमत्ता और यौन गोपनीयता पर ओआहाका दंड संहिता में सुधार (अनुच्छेद 249 और 72 Bis), 5 दिसंबर 2025 को स्वीकृत'),
      nota: L(
        'Número de decreto y fecha de publicación en el Periódico Oficial pendientes de confirmación.',
        'Decree number and date of publication in the Official Gazette pending confirmation.',
        'आदेश संख्या और राजकीय राजपत्र में प्रकाशन की तिथि की पुष्टि लंबित है।'),
      federal: false,
    };
  }
  return {
    estatuto: L(
      `${F.articulo}, sobre material sexual de personas menores de dieciocho años`,
      'Article 202 of the Federal Criminal Code, on sexual material of persons under eighteen',
      'संघीय दंड संहिता का अनुच्छेद 202, अठारह वर्ष से कम आयु के व्यक्तियों की यौन सामग्री पर'),
    nota: L(
      'Consulta el código penal de tu estado para leyes adicionales. Para personas adultas, ver los artículos 199 Octies a 199 Decies.',
      'Check your state\'s criminal code for additional laws. For adults, see articles 199 Octies to 199 Decies.',
      'अतिरिक्त कानूनों के लिए अपने राज्य की दंड संहिता देखें। वयस्कों के लिए अनुच्छेद 199 Octies से 199 Decies देखें।'),
    federal: true,
  };
}

// Title of the legal-framework block in the evidence PDF.
export const LEGAL_FRAMEWORK_TITLE = {
  es: 'Marco legal aplicable',
  en: 'Applicable legal framework',
  hi: 'लागू कानूनी ढाँचा',
};

// Legal text of the school letter for Mexico: two paragraphs separated by a blank line. The
// letter says "may constitute" (federal law does not explicitly name AI-made content) and does not
// cite the LGAMVLV, which protects women and girls, so it cannot be assumed for every student.
// `state` is '' when unknown; `level` is '' when unknown (both fall back to the cautious wording).
export function buildMxLetterLegal(lang, state, level) {
  const school = SCHOOL_TEXT[level] || SCHOOL_TEXT.local;
  const own = STATE_LETTER[state] ? STATE_LETTER[state][lang] + ' ' : '';
  const federal = FEDERAL_MINOR[lang];

  if (lang === 'en') {
    return 'Please be advised that sharing intimate or sexual content without consent may constitute a crime under the Federal Criminal Code (in particular ' + federal + ') and, where applicable, the law of its state. ' + own
      + 'Because the student is a minor, the best interests of the child must also prevail under the General Law on the Rights of Children and Adolescents.\n\n' + school.en;
  }
  if (lang === 'hi') {
    return 'मैं आपको सूचित करता/करती हूँ कि सहमति के बिना निजी या यौन सामग्री साझा करना संघीय दंड संहिता (विशेषकर ' + federal + ') और, जहाँ लागू हो, राज्य के कानून के तहत अपराध हो सकता है। ' + own
      + 'छात्र/छात्रा नाबालिग है, इसलिए बच्चों और किशोरों के अधिकारों के सामान्य कानून के अनुसार बच्चे का सर्वोत्तम हित सर्वोपरि होना चाहिए।\n\n' + school.hi;
  }
  return 'Hago de su conocimiento que la difusión de contenido íntimo o sexual sin consentimiento puede constituir un delito conforme al Código Penal Federal (en particular el ' + federal + ') y, en su caso, a la legislación de su estado. ' + own
    + 'Al tratarse de una persona menor de edad, debe prevalecer además el interés superior de la niñez, conforme a la Ley General de los Derechos de Niñas, Niños y Adolescentes.\n\n' + school.es;
}
