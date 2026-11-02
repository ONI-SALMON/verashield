// Country data for Mexico. Every item carries a status:
//   verified: confirmed in an official or several consistent sources (needs verifiedOn and source)
//   partial: only secondary sources or not re-checked; shown with a "confirm at the official source" label
//   pending: not confirmed; never rendered as a link or phone number
// Reviewed on 2026-11-01. Re-check before relying on any item in a letter to an authority.
import { CNDH_NOTE } from './mx.legal.js';

const ON = '2026-11-01';
const TODAY = '2026-11-02';

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
    {
      id: 'cultivando-genero', kind: 'ngo',
      name: { es: 'Cultivando Género A.C.', en: 'Cultivando Género A.C.', hi: 'Cultivando Género A.C.' },
      summary: {
        es: 'Organización civil feminista con sede en Aguascalientes. Publica guías sobre violencia digital para adolescentes, familias, docentes y profesionales del derecho, y da talleres. No es una línea de emergencia. Los datos legales de su manual para profesionales corresponden a Aguascalientes.',
        en: 'A feminist civil organization based in Aguascalientes. It publishes guides on digital violence for teens, families, teachers and legal professionals, and gives workshops. It is not an emergency line. The legal data in its manual for legal professionals is for Aguascalientes.',
        hi: 'अगुआस्कालिएंतेस में स्थित एक नारीवादी नागरिक संगठन। यह किशोरों, परिवारों, शिक्षकों और कानूनी पेशेवरों के लिए डिजिटल हिंसा पर गाइड प्रकाशित करता है और कार्यशालाएँ चलाता है। यह आपातकालीन लाइन नहीं है। कानूनी पेशेवरों के लिए इसके मैनुअल में दिया कानूनी ब्योरा अगुआस्कालिएंतेस का है।',
      },
      url: 'https://cultivandogeneroac.org/derechos-digitales/',
      email: 'cultivandogeneroac@gmail.com',
      status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
  ],
  materials: [
    {
      id: 'guia-adolescentes', title: 'Guía para la prevención y acompañamiento de violencia digital: para adolescentes', year: '2022',
      audience: { es: 'Para adolescentes: primeros auxilios digitales, a quién contarle y red de apoyo.', en: 'For teens: digital first aid, who to tell and a support network.', hi: 'किशोरों के लिए: डिजिटल प्राथमिक उपचार, किसे बताएँ और सहायता नेटवर्क।' },
      url: 'https://cultivandogeneroac.org/derechos-digitales/', status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
    {
      id: 'navego-segurx', title: 'Navego Segurx en Internet: manual para adolescencias', year: '2024',
      audience: { es: 'Para adolescentes: seguridad digital, sexting, relaciones y cuidado de la salud mental.', en: 'For teens: digital safety, sexting, relationships and mental health care.', hi: 'किशोरों के लिए: डिजिटल सुरक्षा, सेक्सटिंग, रिश्ते और मानसिक स्वास्थ्य की देखभाल।' },
      url: 'https://cultivandogeneroac.org/derechos-digitales/', status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
    {
      id: 'te-queremos', title: 'Te queremos, te acompañamos y te protegemos: guía para madres, padres y docentes', year: '2022',
      audience: { es: 'Para madres, padres y docentes: cómo acompañar sin castigar ni juzgar.', en: 'For parents and teachers: how to support without punishing or judging.', hi: 'माता-पिता और शिक्षकों के लिए: बिना सज़ा या आरोप के साथ कैसे दें।' },
      url: 'https://cultivandogeneroac.org/derechos-digitales/', status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
    {
      id: 'manual-interinstitucional', title: 'Manual interinstitucional para la canalización de violencia digital', year: '2023',
      audience: { es: 'Para instituciones: primer contacto, ruta de atención y cómo evitar la revictimización. Su legislación citada es la de Aguascalientes.', en: 'For institutions: first contact, response route and how to avoid revictimization. The legislation it cites is that of Aguascalientes.', hi: 'संस्थाओं के लिए: पहला संपर्क, कार्रवाई का रास्ता और दोबारा पीड़ित होने से बचाव। इसमें दिया कानून अगुआस्कालिएंतेस का है।' },
      url: 'https://cultivandogeneroac.org/manual-interinstitucional-para-la-canalizacion-de-violencia-digital/', status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
    {
      id: 'profesionales-derecho', title: 'Aspectos básicos de la violencia digital para profesionales del derecho', year: '2024',
      audience: { es: 'Para personas abogadas: denuncia y querella, delitos y reparación del daño. Sus delitos y penas son los del Código Penal de Aguascalientes.', en: 'For lawyers: complaint types, offenses and reparation of harm. Its offenses and penalties are those of the Aguascalientes Criminal Code.', hi: 'वकीलों के लिए: शिकायत के प्रकार, अपराध और क्षतिपूर्ति। इसके अपराध और सज़ाएँ अगुआस्कालिएंतेस की दंड संहिता की हैं।' },
      url: 'https://cultivandogeneroac.org/derechos-digitales/', status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
    {
      id: 'pistas-legales', title: 'Pistas legales para apropiarte de tu proceso de justicia en casos de violencia digital', year: '2024',
      audience: { es: 'Para personas afectadas, sin ser abogadas: vías de acción, qué esperar al denunciar, derechos de las víctimas y cómo respaldar evidencia. Su ejemplo de Fiscalía y de contraloría es de Aguascalientes.', en: 'For people affected, no legal training needed: routes of action, what to expect when reporting, victims rights and how to back up evidence. Its prosecutor and comptroller examples are from Aguascalientes.', hi: 'प्रभावित लोगों के लिए, वकील होना ज़रूरी नहीं: कार्रवाई के रास्ते, शिकायत करते समय क्या उम्मीद करें, पीड़ितों के अधिकार और सबूत सुरक्षित करना। इसके अभियोजक और नियंत्रक के उदाहरण अगुआस्कालिएंतेस के हैं।' },
      url: 'https://cultivandogeneroac.org/derechos-digitales/', status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
    {
      id: 'malestar-adolescencias', title: 'Manual para acompañar el malestar emocional, psicológico y social de las adolescencias', year: '2025',
      audience: { es: 'Para quien acompaña a adolescentes: escucha activa, emociones y cuidado de la salud mental ante la violencia digital.', en: 'For people who support teens: active listening, emotions and mental health care in the face of digital violence.', hi: 'किशोरों का साथ देने वालों के लिए: सक्रिय सुनना, भावनाएँ और डिजिटल हिंसा के सामने मानसिक स्वास्थ्य की देखभाल।' },
      url: 'https://cultivandogeneroac.org/derechos-digitales/', status: 'verified', verifiedOn: TODAY, source: 'https://cultivandogeneroac.org/derechos-digitales/',
    },
  ],
  laws: [
    {
      id: 'ley_olimpia',
      cite: { es: 'Ley Olimpia: arts. 199 Octies, Nonies y Decies del Código Penal Federal y arts. 20 Quáter y Sexies de la LGAMVLV (DOF 01/06/2021)', en: 'Ley Olimpia: arts. 199 Octies, Nonies and Decies of the Federal Criminal Code and arts. 20 Quáter and Sexies of the LGAMVLV (DOF 06/01/2021)', hi: 'ले ओलम्पिया: संघीय दंड संहिता के अनुच्छेद 199 Octies, Nonies और Decies तथा LGAMVLV के अनुच्छेद 20 Quáter और Sexies (DOF 01/06/2021)' },
      summary: {
        es: 'Castiga difundir contenido íntimo sexual sin consentimiento, también el que no corresponde con la persona que aparece (art. 199 Nonies). El texto del art. 199 Octies habla de personas mayores de edad; para menores aplica el art. 202 (material sexual de personas menores de 18 años) y el 202 Bis. La LGAMVLV protege a mujeres y niñas: el Ministerio Público o la jueza o juez puede ordenar a las plataformas bloquear o eliminar el contenido si se da el enlace exacto, y la autoridad debe pedir que se conserve de forma lícita.',
        en: 'It punishes sharing intimate sexual content without consent, including content that does not match the person shown (art. 199 Nonies). The text of art. 199 Octies refers to adults; for minors, art. 202 (sexual material of persons under 18) and art. 202 Bis apply. The LGAMVLV protects women and girls: the prosecutor or judge can order platforms to block or delete the content if the exact link is given, and the authority must ask for lawful preservation of it.',
        hi: 'यह बिना सहमति के निजी यौन सामग्री फैलाने को दंडित करता है, उस सामग्री को भी जो दिखाए गए व्यक्ति से मेल नहीं खाती (अनुच्छेद 199 Nonies)। अनुच्छेद 199 Octies का पाठ वयस्कों की बात करता है; नाबालिगों पर अनुच्छेद 202 (18 वर्ष से कम आयु के व्यक्तियों की यौन सामग्री) और 202 Bis लागू होते हैं। LGAMVLV महिलाओं और बालिकाओं की रक्षा करता है: सटीक लिंक देने पर अभियोजक या न्यायाधीश प्लेटफ़ॉर्म को सामग्री ब्लॉक या हटाने का आदेश दे सकता है, और प्राधिकरण को उसे वैध रूप से सुरक्षित रखने का अनुरोध करना होता है।',
      },
      status: 'partial', verifiedOn: TODAY, source: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/CPF.pdf',
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
