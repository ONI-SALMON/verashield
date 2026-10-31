// Single source of truth for the legal citations used in the school letter and
// in the Mexican crisis resources. Loaded as a classic script before app.js.
//
// VERIFICAR: the SEP agreements, the Oaxaca decree and the Jalisco article below were
// supplied by the project maintainer and have not been checked against the DOF or the
// state gazettes. Re-check them before relying on them in a letter to a school.

const LEGAL_REFS = {
  // Federal "Ley Olimpia": still valid as the general reference (do not remove).
  leyOlimpiaFederal: {
    es: 'DOF 01/06/2021; art. 199 Octies del Código Penal Federal',
    en: 'Official Gazette of the Federation (DOF) of June 1, 2021; art. 199 Octies of the Federal Criminal Code',
    hi: 'DOF 01/06/2021; संघीय दंड संहिता का अनुच्छेद 199 Octies',
  },

  // School-level obligation. 'local' is also the fallback when no level is chosen.
  school: {
    basica: {
      es: 'En el ámbito escolar, resulta aplicable el Acuerdo número 17/05/25 de la SEP, publicado en el DOF el 30 de mayo de 2025, de observancia obligatoria en todas las escuelas públicas y particulares de educación básica.',
      en: 'In the school setting, Agreement No. 17/05/25 of the SEP (Mexico\'s Ministry of Public Education), published in the DOF on May 30, 2025, applies; it is mandatory in all public and private basic-education schools.',
      hi: 'विद्यालय के संदर्भ में SEP (मेक्सिको का सार्वजनिक शिक्षा मंत्रालय) का समझौता संख्या 17/05/25 लागू होता है, जो 30 मई 2025 को DOF में प्रकाशित हुआ और सभी सार्वजनिक एवं निजी बुनियादी शिक्षा विद्यालयों के लिए अनिवार्य है।',
    },
    mediaFederal: {
      es: 'En el ámbito escolar, resulta aplicable el Acuerdo número 03/04/26 de la SEP, publicado en el DOF el 7 de mayo de 2026, vigente para planteles de educación media superior federales.',
      en: 'In the school setting, Agreement No. 03/04/26 of the SEP, published in the DOF on May 7, 2026, applies; it is in force for federal upper-secondary (bachillerato) schools.',
      hi: 'विद्यालय के संदर्भ में SEP का समझौता संख्या 03/04/26 लागू होता है, जो 7 मई 2026 को DOF में प्रकाशित हुआ और संघीय उच्च माध्यमिक (बाचिलेराटो) संस्थानों के लिए प्रभावी है।',
    },
    // State and private bachilleratos: do NOT cite the federal agreement as directly binding.
    local: {
      es: 'En el ámbito escolar, solicito que se actúe conforme al protocolo local de su entidad federativa.',
      en: 'In the school setting, I ask that the school act in accordance with the local protocol of its state.',
      hi: 'विद्यालय के संदर्भ में मेरा अनुरोध है कि आपके राज्य के स्थानीय प्रोटोकॉल के अनुसार कार्रवाई की जाए।',
    },
  },

  // Shown next to every CNDH mention. The Mexican resource list is Spanish-only by design.
  cndhNote: {
    es: 'Nota: Las recomendaciones de la CNDH no son vinculantes (obligatorias). Esta vía es útil cuando una escuela pública o fiscalía no actúa. La CNDH no interviene en casos contra particulares.',
  },
};

// State-specific legal reference. Jalisco and Oaxaca have their own norms; every other state falls
// back to the federal framework. `federal: true` marks the fallback.
// VERIFICAR: Jalisco reform approved June 2026 (Periódico Oficial publication date unconfirmed);
// Oaxaca decree 876 and the "arts. 72 Bis y 249 del Código Penal de Oaxaca" were supplied by the
// maintainer and are not checked against the state gazette.
function getLegalReference(estado, lang = 'es') {
  const L = (es, en, hi) => ({ es, en, hi })[lang] || es;
  if (estado === 'Jalisco') {
    return {
      estatuto: L(
        'Artículo 176-Bis.3 del Código Penal del Estado de Jalisco (reforma aprobada junio 2026)',
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
        'Decreto número 876, Periódico Oficial de Oaxaca n.º 50, 18ª sección, 13 de diciembre de 2025 (arts. 72 Bis y 249 del Código Penal de Oaxaca)',
        'Decree No. 876, Official Gazette of Oaxaca No. 50, 18th section, December 13, 2025 (arts. 72 Bis and 249 of the Oaxaca Criminal Code)',
        'आदेश संख्या 876, ओआहाका का राजकीय राजपत्र सं. 50, 18वाँ खंड, 13 दिसंबर 2025 (ओआहाका दंड संहिता के अनुच्छेद 72 Bis और 249)'),
      nota: null,
      federal: false,
    };
  }
  return {
    estatuto: L(
      'Artículo 199 Octies del Código Penal Federal y Ley General de Acceso de las Mujeres a una Vida Libre de Violencia (DOF 01/06/2021)',
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
const LEGAL_FRAMEWORK_TITLE = {
  es: 'Marco legal aplicable',
  en: 'Applicable legal framework',
  hi: 'लागू कानूनी ढाँचा',
};

// Legal paragraph of the school letter for Mexico. `state` is the selected entidad federativa;
// its note (if any) is printed separately, in italics, by the caller (see getLegalReference).
function buildMxLetterLegal(lang, state, level) {
  const R = LEGAL_REFS;
  const school = R.school[level] || R.school.local;
  const ref = getLegalReference(state, lang);
  // Federal fallback: the statute itself replaces the generic Ley Olimpia parenthetical.
  const olimpia = ref.federal ? ref.estatuto : R.leyOlimpiaFederal[lang];
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
