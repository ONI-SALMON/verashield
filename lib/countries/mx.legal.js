// Single source of truth for the Mexican legal citations (school letter and evidence PDF). Named
// exports only. Moved here from lib/legalReferences.js.
//
// VERIFICAR: every statute, penalty, date and source below was supplied by the project
// maintainer and has NOT been checked against the DOF or the state gazettes. Re-check them
// before relying on them in a letter to a school or an authority.

export const FEDERAL_REFERENCES = {
  cpf_202: {
    articulo: 'Artículo 202 del Código Penal Federal',
    descripcion: 'Pornografía de personas menores de dieciocho años',
    pena: '7 a 12 años de prisión y 800 a 2,000 días multa',
    nota: 'No menciona explícitamente contenido generado por IA. Aplica cuando hay un menor real involucrado.',
  },
  cpf_199_octies: {
    articulo: 'Artículo 199 Octies del Código Penal Federal',
    descripcion: 'Violencia digital: difusión no consentida de imágenes íntimas',
    vigencia: 'DOF 01/06/2021',
  },
  // VERIFICAR: the evidence note (EVIDENCE_STRINGS in app.js) cites this article as "the authority
  // safeguards the reported content"; here it is described as content removal. Reconcile.
  lgamvlv_20_sexies: {
    articulo: 'Artículo 20 Sexies de la LGAMVLV',
    descripcion: 'Retiro de contenido: orden del Ministerio Público o juez',
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
  // Todos los demás estados usan FEDERAL_REFERENCES.cpf_199_octies por defecto
};

export const CNDH_NOTE = {
  advertencia: 'Las recomendaciones de la CNDH no son vinculantes (obligatorias).',
  uso: 'Útil cuando una escuela pública o fiscalía no actúa.',
  limite: 'La CNDH no interviene en casos contra particulares.',
  competencia: 'En escuelas estatales, el órgano competente es la comisión estatal de derechos humanos.',
};

// Display texts (built from the constants above; es / en / hi)

const OLIMPIA_FEDERAL = {
  es: `${FEDERAL_REFERENCES.cpf_199_octies.vigencia}; art. 199 Octies del Código Penal Federal`,
  en: 'Official Gazette of the Federation (DOF) of June 1, 2021; art. 199 Octies of the Federal Criminal Code',
  hi: `${FEDERAL_REFERENCES.cpf_199_octies.vigencia}; संघीय दंड संहिता का अनुच्छेद 199 Octies`,
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
  const F = FEDERAL_REFERENCES.cpf_199_octies;
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
      `${F.articulo} (${F.vigencia})`,
      'Article 199 Octies of the Federal Criminal Code (DOF June 1, 2021)',
      'संघीय दंड संहिता का अनुच्छेद 199 Octies (DOF 01/06/2021)'),
    nota: L(
      'Consulta el código penal de tu estado para leyes adicionales.',
      'Check your state\'s criminal code for additional laws.',
      'अतिरिक्त कानूनों के लिए अपने राज्य की दंड संहिता देखें।'),
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
  const olimpia = OLIMPIA_FEDERAL[lang];

  if (lang === 'en') {
    return 'Please be advised that sharing intimate or sexual content without consent may constitute a crime under the reforms known as the "Ley Olimpia" (' + olimpia + '). ' + own
      + 'Because the student is a minor, the best interests of the child must also prevail under the General Law on the Rights of Children and Adolescents.\n\n' + school.en;
  }
  if (lang === 'hi') {
    return 'मैं आपको सूचित करता/करती हूँ कि सहमति के बिना निजी या यौन सामग्री साझा करना "ले ओलम्पिया" नाम से जाने जाने वाले सुधारों (' + olimpia + ') के तहत अपराध हो सकता है। ' + own
      + 'छात्र/छात्रा नाबालिग है, इसलिए बच्चों और किशोरों के अधिकारों के सामान्य कानून के अनुसार बच्चे का सर्वोत्तम हित सर्वोपरि होना चाहिए।\n\n' + school.hi;
  }
  return 'Hago de su conocimiento que la difusión de contenido íntimo o sexual sin consentimiento puede constituir un delito conforme a las reformas conocidas como «Ley Olimpia» (' + olimpia + '). ' + own
    + 'Al tratarse de una persona menor de edad, debe prevalecer además el interés superior de la niñez, conforme a la Ley General de los Derechos de Niñas, Niños y Adolescentes.\n\n' + school.es;
}
