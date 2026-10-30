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

  // State-specific criminal code references (only cited when that state is selected).
  state: {
    // Reform approved by the Jalisco Congress in June 2026; Periódico Oficial publication date still unconfirmed.
    Jalisco: {
      es: 'En Jalisco resulta aplicable el artículo 176-Bis.3 del Código Penal del Estado de Jalisco (reforma aprobada por el Congreso de Jalisco en junio de 2026; fecha de publicación en el Periódico Oficial pendiente de confirmación oficial).',
      en: 'In Jalisco, article 176-Bis.3 of the Criminal Code of the State of Jalisco applies (reform approved by the Jalisco Congress in June 2026; date of publication in the Official Gazette pending official confirmation).',
      hi: 'जालिस्को में जालिस्को राज्य की दंड संहिता का अनुच्छेद 176-Bis.3 लागू होता है (जून 2026 में जालिस्को कांग्रेस द्वारा स्वीकृत सुधार; राजकीय राजपत्र में प्रकाशन की तिथि की आधिकारिक पुष्टि लंबित है)।',
    },
    Oaxaca: {
      es: 'En Oaxaca resulta aplicable el decreto número 876, publicado en el Periódico Oficial de Oaxaca número 50, décimo octava sección, de fecha 13 de diciembre de 2025.',
      en: 'In Oaxaca, decree No. 876 applies, published in the Official Gazette of Oaxaca No. 50, eighteenth section, dated December 13, 2025.',
      hi: 'ओआहाका में आदेश संख्या 876 लागू होता है, जो ओआहाका के राजकीय राजपत्र संख्या 50, अठारहवें खंड में 13 दिसंबर 2025 को प्रकाशित हुआ।',
    },
  },

  // Shown next to every CNDH mention. The Mexican resource list is Spanish-only by design.
  cndhNote: {
    es: 'Nota: Las recomendaciones de la CNDH no son vinculantes (obligatorias). Esta vía es útil cuando una escuela pública o fiscalía no actúa. La CNDH no interviene en casos contra particulares.',
  },
};

// Legal paragraph of the school letter for Mexico (the sentence templates that used to
// live inside SL.*.legal.mx). `state` is '' unless the state has Ley Olimpia adopted.
function buildMxLetterLegal(lang, state, level) {
  const R = LEGAL_REFS;
  const school = R.school[level] || R.school.local;
  const stateRef = state && R.state[state] ? R.state[state][lang] + ' ' : '';
  const olimpia = R.leyOlimpiaFederal[lang];

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
