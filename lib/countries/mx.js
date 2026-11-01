// Country data for Mexico. Every item carries a status:
//   verified: confirmed in an official or several consistent sources (needs verifiedOn and source)
//   partial: only secondary sources or not re-checked; shown with a "confirm at the official source" label
//   pending: not confirmed; never rendered as a link or phone number
// Reviewed on 2026-11-01. Re-check before relying on any item in a letter to an authority.
import { CNDH_NOTE } from './mx.legal.js';

const ON = '2026-11-01';

export default {
  id: 'mx',
  name: { es: 'México', en: 'Mexico', hi: 'मेक्सिको' },
  helplines: [
    {
      id: 'emergency', kind: 'emergency', number: '911',
      label: { es: 'Emergencias', en: 'Emergencies', hi: 'आपातकाल' },
      note: { es: 'Si estás en peligro ahora mismo.', en: 'If you are in danger right now.', hi: 'अगर आप अभी खतरे में हैं।' },
      status: 'partial', verifiedOn: ON,
    },
    {
      id: 'linea_de_la_vida', kind: 'emotional', number: '800 911 2000',
      label: { es: 'Línea de la Vida', en: 'Línea de la Vida (mental health line)', hi: 'लीनिया दे ला विदा (मानसिक स्वास्थ्य लाइन)' },
      note: { es: 'Apoyo psicológico gratuito y confidencial, a toda hora.', en: 'Free, confidential emotional support, any time (in Spanish).', hi: 'निःशुल्क और गोपनीय भावनात्मक सहायता (स्पेनिश में)।' },
      url: 'https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000',
      status: 'partial', verifiedOn: ON, source: 'https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000',
    },
    {
      id: 'policia_cibernetica', kind: 'police', number: '088',
      label: { es: 'Policía Cibernética', en: 'Cyber Police', hi: 'साइबर पुलिस' },
      note: {
        es: 'Orientación confidencial. Solo lo confirma una nota periodística: llama y verifica; también hay Policía Cibernética en tu estado.',
        en: 'Confidential guidance. Only a news article confirms it: call and check; there is also a state Cyber Police.',
        hi: 'गोपनीय मार्गदर्शन। इसकी पुष्टि केवल एक समाचार से होती है: कॉल करके जाँच लें; आपके राज्य की साइबर पुलिस भी है।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://www.excelsior.com.mx/estilo-de-vida/que-hacer-si-comparten-nudes-mexico',
    },
  ],
  authorities: [
    {
      id: 'mp', kind: 'report',
      name: { es: 'Ministerio Público o Fiscalía de tu estado', en: 'Public Prosecutor (Ministerio Público) of your state', hi: 'आपके राज्य का लोक अभियोजक (मिनिस्तेरियो पुब्लिको)' },
      summary: {
        es: 'Recibe la denuncia. Con la Ley Olimpia, el Ministerio Público o un juez pueden ordenar a las plataformas que bloqueen o eliminen el contenido. Si la víctima es menor de edad, la denuncia la hace un adulto contigo.',
        en: 'It receives the report. Under the Ley Olimpia, the prosecutor or a judge can order platforms to block or remove the content. If the victim is a minor, an adult files the report with you.',
        hi: 'यह शिकायत लेता है। ले ओलम्पिया के तहत अभियोजक या न्यायाधीश प्लेटफ़ॉर्म को सामग्री रोकने या हटाने का आदेश दे सकते हैं। पीड़ित नाबालिग हो तो कोई वयस्क आपके साथ शिकायत करता है।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://www.excelsior.com.mx/estilo-de-vida/que-hacer-si-comparten-nudes-mexico',
    },
    {
      id: 'te_protejo', kind: 'report',
      name: { es: 'Te Protejo México', en: 'Te Protejo México', hi: 'ते प्रोतेहो मेक्सिको' },
      summary: {
        es: 'Reporte anónimo y gratuito de contenido sexual de menores de 18 años. Forma parte de la red internacional INHOPE. No pudimos confirmar cuánto tarda ni cómo avisa a las plataformas.',
        en: 'Free, anonymous reporting of sexual content involving people under 18. Part of the international INHOPE network. We could not confirm how long it takes or how it notifies platforms.',
        hi: '18 वर्ष से कम उम्र के लोगों से जुड़ी यौन सामग्री की निःशुल्क और गुमनाम रिपोर्ट। यह अंतरराष्ट्रीय INHOPE नेटवर्क का हिस्सा है। हम यह पुष्टि नहीं कर पाए कि कितना समय लगता है या यह प्लेटफ़ॉर्म को कैसे सूचित करता है।',
      },
      url: 'https://teprotejomexico.org/',
      status: 'verified', verifiedOn: ON, source: 'https://www.globalgiving.org/pfil/69169/informeanualtpm2025comprimido.pdf',
    },
    {
      id: 'ppnna', kind: 'family',
      name: { es: 'Procuraduría de Protección de Niñas, Niños y Adolescentes (PPNNA) y DIF', en: 'Child Protection Prosecutor (PPNNA) and DIF', hi: 'बाल संरक्षण अभियोजन कार्यालय (PPNNA) और DIF' },
      summary: {
        es: 'En casos de violencia digital en escuelas han intervenido junto con la fiscalía. Tu familia o tu escuela pueden pedir su apoyo.',
        en: 'In cases of digital violence at schools they have worked with the prosecutor. Your family or school can ask for their help.',
        hi: 'स्कूलों में डिजिटल हिंसा के मामलों में वे अभियोजन के साथ मिलकर काम कर चुके हैं। आपका परिवार या स्कूल उनकी मदद माँग सकता है।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://www.sdpnoticias.com/opinion/violencia-digital-contra-adolescentes-en-la-escuela-el-caso-de-veracruz/',
    },
    {
      id: 'sep', kind: 'school',
      name: { es: 'Protocolo de tu escuela (SEP)', en: 'Your school protocol (SEP)', hi: 'आपके स्कूल का प्रोटोकॉल (SEP)' },
      summary: {
        es: 'Las escuelas de educación básica deben seguir los Lineamientos del Acuerdo 17/05/25 de la SEP (DOF, 30 de mayo de 2025). Para bachillerato existe el Acuerdo 03/04/26 (DOF, 7 de mayo de 2026). Cada estado puede tener su propio protocolo.',
        en: 'Basic-education schools must follow the guidelines of SEP Agreement 17/05/25 (DOF, May 30, 2025). For upper secondary there is Agreement 03/04/26 (DOF, May 7, 2026). Each state may have its own protocol.',
        hi: 'बुनियादी शिक्षा के स्कूलों को SEP के समझौते 17/05/25 (DOF, 30 मई 2025) के दिशानिर्देशों का पालन करना होता है। उच्च माध्यमिक के लिए समझौता 03/04/26 (DOF, 7 मई 2026) है। हर राज्य का अपना प्रोटोकॉल हो सकता है।',
      },
      status: 'verified', verifiedOn: ON, source: 'https://sidof.segob.gob.mx/notas/docFuente/5758814',
    },
    {
      id: 'cndh', kind: 'human-rights',
      name: { es: 'CNDH y comisión estatal de derechos humanos', en: 'CNDH and the state human rights commission', hi: 'CNDH और राज्य मानवाधिकार आयोग' },
      summary: {
        es: `Denuncia violaciones a derechos humanos, incluida la violencia digital. Tel. 800 715 2000. ${CNDH_NOTE.advertencia} ${CNDH_NOTE.uso} ${CNDH_NOTE.limite} ${CNDH_NOTE.competencia}`,
        en: 'Reports of human rights violations, including digital violence. Phone 800 715 2000. CNDH recommendations are not binding. Useful when a public school or a prosecutor does not act. The CNDH does not take cases against private individuals. For state schools, the competent body is the state human rights commission.',
        hi: 'मानवाधिकार उल्लंघनों की शिकायत, डिजिटल हिंसा सहित। फ़ोन 800 715 2000। CNDH की सिफ़ारिशें बाध्यकारी नहीं हैं। यह तब उपयोगी है जब कोई सार्वजनिक स्कूल या अभियोजन कार्रवाई नहीं करता। CNDH निजी व्यक्तियों के विरुद्ध मामलों में हस्तक्षेप नहीं करती। राज्य के स्कूलों के लिए सक्षम निकाय राज्य मानवाधिकार आयोग है।',
      },
      url: 'https://www.cndh.org.mx/programas/contacto-1',
      status: 'partial', carried: true,
    },
    {
      id: 'redim', kind: 'ngo',
      name: { es: 'REDIM: Red por los Derechos de la Infancia en México', en: 'REDIM: Network for Children\'s Rights in Mexico', hi: 'REDIM: मेक्सिको में बाल अधिकार नेटवर्क' },
      summary: {
        es: 'Organización de referencia en derechos de niñas, niños y adolescentes.',
        en: 'A reference organization on the rights of children and teens.',
        hi: 'बच्चों और किशोरों के अधिकारों पर एक संदर्भ संगठन।',
      },
      url: 'https://derechosinfancia.org.mx/v1/',
      status: 'partial', carried: true,
    },
  ],
  laws: [
    {
      id: 'ley_olimpia',
      cite: { es: 'Ley Olimpia (art. 199 Octies del Código Penal Federal y LGAMVLV, DOF 01/06/2021)', en: 'Ley Olimpia (art. 199 Octies of the Federal Criminal Code and LGAMVLV, DOF 06/01/2021)', hi: 'ले ओलम्पिया (संघीय दंड संहिता का अनुच्छेद 199 Octies और LGAMVLV, DOF 01/06/2021)' },
      summary: {
        es: 'Sanciona difundir contenido íntimo sin consentimiento. A nivel federal no nombra de forma explícita el contenido hecho con IA.',
        en: 'It punishes sharing intimate content without consent. At the federal level it does not explicitly name AI-made content.',
        hi: 'यह बिना सहमति के निजी सामग्री फैलाने को दंडित करता है। संघीय स्तर पर यह AI से बनी सामग्री का स्पष्ट उल्लेख नहीं करता।',
      },
      status: 'partial', verifiedOn: ON,
    },
    {
      id: 'oaxaca',
      cite: { es: 'Oaxaca: reforma al Código Penal sobre IA e intimidad sexual (arts. 249 y 72 Bis)', en: 'Oaxaca: Criminal Code reform on AI and sexual privacy (arts. 249 and 72 Bis)', hi: 'ओआहाका: AI और यौन गोपनीयता पर दंड संहिता सुधार (अनुच्छेद 249 और 72 Bis)' },
      summary: {
        es: 'El Congreso la aprobó el 5 de diciembre de 2025. El número del decreto y la fecha de publicación no se pudieron confirmar.',
        en: 'Congress approved it on December 5, 2025. The decree number and publication date could not be confirmed.',
        hi: 'कांग्रेस ने इसे 5 दिसंबर 2025 को मंज़ूर किया। आदेश संख्या और प्रकाशन तिथि की पुष्टि नहीं हो सकी।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://www.elimparcial.com/mexico/2025/12/05/oaxaca-reforma-codigo-penal-del-estado-para-tipificar-el-uso-de-inteligencia-artificial-para-violar-la-intimidad-sexual/',
    },
    {
      id: 'jalisco',
      cite: { es: 'Jalisco: reforma sobre contenido sexual hecho con IA (junio de 2026)', en: 'Jalisco: reform on AI-made sexual content (June 2026)', hi: 'जालिस्को: AI से बनी यौन सामग्री पर सुधार (जून 2026)' },
      summary: {
        es: 'El Congreso la aprobó en junio de 2026. El artículo exacto y la publicación en el Periódico Oficial están por confirmar.',
        en: 'Congress approved it in June 2026. The exact article and its publication in the Official Gazette are still to be confirmed.',
        hi: 'कांग्रेस ने इसे जून 2026 में मंज़ूर किया। सटीक अनुच्छेद और राजकीय राजपत्र में प्रकाशन की पुष्टि बाकी है।',
      },
      status: 'pending', verifiedOn: ON,
    },
  ],
  removal: {
    summary: {
      es: 'En México, quien puede ordenar que las plataformas retiren el contenido es el Ministerio Público o un juez, después de una denuncia.',
      en: 'In Mexico, the prosecutor or a judge can order platforms to remove the content, after a report is filed.',
      hi: 'मेक्सिको में शिकायत के बाद अभियोजक या न्यायाधीश प्लेटफ़ॉर्म को सामग्री हटाने का आदेश दे सकते हैं।',
    },
    status: 'partial', verifiedOn: ON,
  },
  letter: { available: true },
};
