// Single source of truth for every legal citation used by the app (school letter, evidence PDF,
// Mexican crisis resources). Named exports only.
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

// General reference to the federal "Ley Olimpia" (kept on purpose; the specific norms complement it).
export const LEY_OLIMPIA = {
  nombre: 'Ley Olimpia',
  url: 'https://www.gob.mx/conavim/articulos/ley-olimpia',
};

const OLIMPIA_FEDERAL = {
  es: `${FEDERAL_REFERENCES.cpf_199_octies.vigencia}; art. 199 Octies del Código Penal Federal`,
  en: 'Official Gazette of the Federation (DOF) of June 1, 2021; art. 199 Octies of the Federal Criminal Code',
  hi: `${FEDERAL_REFERENCES.cpf_199_octies.vigencia}; संघीय दंड संहिता का अनुच्छेद 199 Octies`,
};

// Shown next to every CNDH mention. The Mexican resource list is Spanish-only by design.
export const CNDH_NOTE_TEXT = {
  es: `Nota: ${CNDH_NOTE.advertencia} ${CNDH_NOTE.uso} ${CNDH_NOTE.limite} ${CNDH_NOTE.competencia}`,
};

// Legal note shown with the Mexican crisis resources (decoupled from the UI language on purpose).
export const MX_CRISIS_LEGAL_NOTE =
  `En México, la ${LEY_OLIMPIA.nombre} penaliza la difusión no consentida de ` +
  'imágenes íntimas entre adultos. Para menores de edad, aplica la Ley ' +
  'General de los Derechos de Niñas, Niños y Adolescentes (LGDNNA) y ' +
  'el Código Penal Federal. Tienes derecho a denunciar aunque la imagen ' +
  'sea real y no un deepfake.';

// School-level obligation. 'local' is also the fallback when no level is chosen: state and private
// bachilleratos must NOT be told the federal agreement is directly binding on them.
const A = SEP_ACUERDOS;
const SCHOOL_TEXT = {
  basica: {
    es: `En el ámbito escolar, resulta aplicable el Acuerdo número ${A.basica.numero} de la SEP, publicado en el DOF el ${A.basica.dof}, de observancia obligatoria en todas las escuelas públicas y particulares de educación básica.`,
    en: `In the school setting, Agreement No. ${A.basica.numero} of the SEP (Mexico's Ministry of Public Education), published in the DOF on May 30, 2025, applies; it is mandatory in all public and private basic-education schools.`,
    hi: `विद्यालय के संदर्भ में SEP (मेक्सिको का सार्वजनिक शिक्षा मंत्रालय) का समझौता संख्या ${A.basica.numero} लागू होता है, जो 30 मई 2025 को DOF में प्रकाशित हुआ और सभी सार्वजनिक एवं निजी बुनियादी शिक्षा विद्यालयों के लिए अनिवार्य है।`,
  },
  mediaFederal: {
    es: `En el ámbito escolar, resulta aplicable el Acuerdo número ${A.media_superior_federal.numero} de la SEP, publicado en el DOF el ${A.media_superior_federal.dof}, vigente para planteles de educación media superior federales.`,
    en: `In the school setting, Agreement No. ${A.media_superior_federal.numero} of the SEP, published in the DOF on May 7, 2026, applies; it is in force for federal upper-secondary (bachillerato) schools.`,
    hi: `विद्यालय के संदर्भ में SEP का समझौता संख्या ${A.media_superior_federal.numero} लागू होता है, जो 7 मई 2026 को DOF में प्रकाशित हुआ और संघीय उच्च माध्यमिक (बाचिलेराटो) संस्थानों के लिए प्रभावी है।`,
  },
  local: {
    es: 'En el ámbito escolar, solicito que se actúe conforme al protocolo local de su entidad federativa.',
    en: 'In the school setting, I ask that the school act in accordance with the local protocol of its state.',
    hi: 'विद्यालय के संदर्भ में मेरा अनुरोध है कि आपके राज्य के स्थानीय प्रोटोकॉल के अनुसार कार्रवाई की जाए।',
  },
};

// State-specific legal reference. Jalisco and Oaxaca have their own norms; every other state falls
// back to the federal framework (`federal: true`).
export function getLegalReference(estado, lang = 'es') {
  const L = (es, en, hi) => ({ es, en, hi })[lang] || es;
  const F = FEDERAL_REFERENCES.cpf_199_octies;
  const J = ESTADO_REFERENCES.Jalisco;
  const O = ESTADO_REFERENCES.Oaxaca;
  if (estado === 'Jalisco') {
    return {
      estatuto: L(
        `${J.articulo} (reforma aprobada junio 2026)`,
        'Article 176-Bis.3 of the Criminal Code of the State of Jalisco (reform approved June 2026)',
        'जालिस्को राज्य की दंड संहिता का अनुच्छेद 176-Bis.3 (जून 2026 में स्वीकृत सुधार)'),
      nota: L(
        'Fecha de publicación en Periódico Oficial pendiente de confirmación oficial.',
        'Date of publication in the Official Gazette pending official confirmation.',
        'राजकीय राजपत्र में प्रकाशन की तिथि की आधिकारिक पुष्टि लंबित है।'),
      federal: false,
    };
  }
  if (estado === 'Oaxaca') {
    return {
      estatuto: L(
        `${O.vigencia} (arts. 72 Bis y 249 del Código Penal de Oaxaca)`,
        'Decree No. 876, Official Gazette of Oaxaca No. 50, 18th section, December 13, 2025 (arts. 72 Bis and 249 of the Oaxaca Criminal Code)',
        'आदेश संख्या 876, ओआहाका का राजकीय राजपत्र सं. 50, 18वाँ खंड, 13 दिसंबर 2025 (ओआहाका दंड संहिता के अनुच्छेद 72 Bis और 249)'),
      nota: null,
      federal: false,
    };
  }
  return {
    estatuto: L(
      `${F.articulo} y Ley General de Acceso de las Mujeres a una Vida Libre de Violencia (${F.vigencia})`,
      'Article 199 Octies of the Federal Criminal Code and the General Law on Women\'s Access to a Life Free of Violence (DOF June 1, 2021)',
      'संघीय दंड संहिता का अनुच्छेद 199 Octies और महिलाओं के हिंसा-मुक्त जीवन तक पहुँच का सामान्य कानून (DOF 01/06/2021)'),
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

// Legal paragraph of the school letter for Mexico. `state` is the selected entidad federativa;
// its note (if any) is printed separately, in italics, by the caller (see getLegalReference).
export function buildMxLetterLegal(lang, state, level) {
  const school = SCHOOL_TEXT[level] || SCHOOL_TEXT.local;
  const ref = getLegalReference(state, lang);
  // Federal fallback: the statute itself replaces the generic Ley Olimpia parenthetical.
  const olimpia = ref.federal ? ref.estatuto : OLIMPIA_FEDERAL[lang];
  const stateRef = state && !ref.federal
    ? ({ es: 'En ' + state + ' resulta aplicable: ', en: 'In ' + state + ', the following applies: ', hi: state + ' में लागू: ' }[lang]) + ref.estatuto + '. '
    : '';

  if (lang === 'en') {
    return 'Please be advised that sharing intimate or sexual content without consent is conduct punishable under the so-called "Ley Olimpia" (' + olimpia + '), '
      + (state ? 'both at the federal level (General Law on Women\'s Access to a Life Free of Violence and the Federal Criminal Code) and under the criminal law of ' + state : 'at the federal level (General Law on Women\'s Access to a Life Free of Violence and the Federal Criminal Code)')
      + '. ' + stateRef + school.en + ' Because the student is a minor, the best interests of the child must also prevail under the General Law on the Rights of Children and Adolescents.';
  }
  if (lang === 'hi') {
    return 'मैं आपको सूचित करता/करती हूँ कि सहमति के बिना निजी या यौन सामग्री साझा करना मेक्सिको की "ले ओलम्पिया" (' + olimpia + ') के तहत दंडनीय है'
      + (state ? ', संघीय स्तर पर भी और ' + state + ' के आपराधिक कानून के तहत भी' : ', संघीय स्तर पर')
      + '। ' + stateRef + school.hi + ' छात्र/छात्रा नाबालिग है, इसलिए बच्चों और किशोरों के अधिकारों के सामान्य कानून के अनुसार बच्चे का सर्वोत्तम हित सर्वोपरि होना चाहिए।';
  }
  return 'Hago de su conocimiento que la difusión de contenido íntimo o sexual sin consentimiento constituye una conducta sancionada por la denominada «Ley Olimpia» (' + olimpia + '), '
    + (state ? 'tanto en el ámbito federal (Ley General de Acceso de las Mujeres a una Vida Libre de Violencia y Código Penal Federal) como en la legislación penal de ' + state : 'en el ámbito federal (Ley General de Acceso de las Mujeres a una Vida Libre de Violencia y Código Penal Federal)')
    + '. ' + stateRef + school.es + ' Al tratarse de una persona menor de edad, debe prevalecer además el interés superior de la niñez, conforme a la Ley General de los Derechos de Niñas, Niños y Adolescentes.';
}
