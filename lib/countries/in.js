// Country data for India. See lib/countries/mx.js for the meaning of status.
// Reviewed on 2026-11-01 with web search only (official sites could not be fetched in this session).
const ON = '2026-11-01';

export default {
  id: 'in',
  name: { es: 'India', en: 'India', hi: 'भारत' },
  helplines: [
    {
      id: 'emergency', kind: 'emergency', number: '112',
      label: { es: 'Emergencias', en: 'Emergencies', hi: 'आपातकाल' },
      note: { es: 'Si estás en peligro ahora mismo.', en: 'If you are in danger right now.', hi: 'अगर आप अभी खतरे में हैं।' },
      status: 'partial', verifiedOn: ON,
    },
    {
      id: 'tele_manas', kind: 'emotional', number: '14416',
      label: { es: 'Tele-MANAS', en: 'Tele-MANAS', hi: 'टेली-मानस' },
      note: {
        es: 'Apoyo de salud mental gratuito, las 24 horas. También 1-800-891-4416. No es un canal de denuncia.',
        en: 'Free mental health support, 24 hours. Also 1-800-891-4416. It is not a reporting channel.',
        hi: 'निःशुल्क मानसिक स्वास्थ्य सहायता, 24 घंटे। साथ में 1-800-891-4416। यह शिकायत का माध्यम नहीं है।',
      },
      status: 'verified', verifiedOn: ON, source: 'https://en.vikaspedia.in/viewcontent/health/mental-health/tele-manas',
    },
    {
      id: 'childline', kind: 'child', number: '1098',
      label: { es: 'Childline', en: 'Childline', hi: 'चाइल्डलाइन' },
      note: {
        es: 'Línea para niñas, niños y adolescentes en peligro. Confirmada solo por fuentes secundarias.',
        en: 'Helpline for children and teens in danger. Confirmed only by secondary sources.',
        hi: 'खतरे में बच्चों और किशोरों के लिए हेल्पलाइन। केवल द्वितीयक स्रोतों से पुष्टि।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://www.citizennest.com/guide/cyber-crime-complaint-online-india',
    },
    {
      id: 'cyber_helpline', kind: 'police', number: '1930',
      label: { es: 'Línea nacional de cibercrimen', en: 'National cyber crime helpline', hi: 'राष्ट्रीय साइबर अपराध हेल्पलाइन' },
      note: {
        es: 'Varias fuentes la ligan sobre todo a fraudes financieros. Confirma si aplica a tu caso.',
        en: 'Several sources tie it mainly to financial fraud. Check whether it applies to your case.',
        hi: 'कई स्रोत इसे मुख्यतः वित्तीय धोखाधड़ी से जोड़ते हैं। जाँच लें कि यह आपके मामले में लागू है या नहीं।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://ps.keralapolice.gov.in/ernakulamruralcyber-ps/notifications/National-Cyber-Crime-Reporting-Helpline-No-1930-3338',
    },
  ],
  authorities: [
    {
      id: 'cybercrime_portal', kind: 'report',
      name: { es: 'Portal Nacional de Denuncia de Cibercrimen', en: 'National Cyber Crime Reporting Portal', hi: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल' },
      summary: {
        es: 'Portal oficial para denunciar delitos cibernéticos, con atención especial a mujeres y menores. Permite denunciar de forma anónima.',
        en: 'Official portal to report cyber crimes, with special focus on women and children. It allows anonymous complaints.',
        hi: 'साइबर अपराध की रिपोर्ट के लिए आधिकारिक पोर्टल, महिलाओं और बच्चों पर विशेष ध्यान के साथ। गुमनाम शिकायत संभव है।',
      },
      url: 'https://cybercrime.gov.in',
      status: 'verified', verifiedOn: ON, source: 'https://publicnow.com/view/B028ED6F1E4EC474AFACBD9B15FBDEACEDA163B9',
    },
    {
      id: 'grievance_officer', kind: 'removal',
      name: { es: 'Oficial de quejas de la plataforma', en: "The platform's Grievance Officer", hi: 'प्लेटफ़ॉर्म का शिकायत अधिकारी' },
      summary: {
        es: 'Las reglas de TI de 2021 obligan a las plataformas a actuar rápido ante quejas por desnudez o imágenes alteradas: 24 horas en el texto de 2021. Fuentes secundarias indican que una reforma de febrero de 2026 lo bajó a 2 horas. Confirma el plazo vigente en la Gaceta oficial.',
        en: 'The 2021 IT Rules require platforms to act fast on complaints about nudity or altered images: 24 hours in the 2021 text. Secondary sources say a February 2026 amendment cut it to 2 hours. Confirm the current deadline in the official Gazette.',
        hi: 'आईटी नियम 2021 प्लेटफ़ॉर्म को नग्नता या बदली गई तस्वीरों की शिकायत पर जल्दी कार्रवाई करने के लिए बाध्य करते हैं: 2021 के पाठ में 24 घंटे। द्वितीयक स्रोतों के अनुसार फ़रवरी 2026 के संशोधन ने इसे 2 घंटे कर दिया। वर्तमान समय-सीमा राजपत्र में जाँच लें।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://chambers.com/articles/government-notifies-information-technology-amendment-rules-2026',
    },
  ],
  laws: [
    {
      id: 'it_act',
      cite: { es: 'Ley de Tecnología de la Información: secciones 66E, 67A y 67B', en: 'Information Technology Act: sections 66E, 67A and 67B', hi: 'सूचना प्रौद्योगिकी अधिनियम: धाराएँ 66E, 67A और 67B' },
      summary: {
        es: 'Cubren violación de la privacidad, material sexual explícito y material sexual con menores. Las imágenes alteradas suelen imputarse bajo la 67A.',
        en: 'They cover privacy violation, sexually explicit material and sexual material involving children. Morphed images are often charged under 67A.',
        hi: 'ये निजता उल्लंघन, यौन रूप से स्पष्ट सामग्री और बच्चों से जुड़ी यौन सामग्री को कवर करती हैं। बदली गई तस्वीरों पर अक्सर 67A लगती है।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://www.mondaq.com/india/media-telecoms-it-entertainment/959952',
    },
    {
      id: 'pocso',
      cite: { es: 'Ley POCSO de 2012 (secciones 13 y 14)', en: 'POCSO Act 2012 (sections 13 and 14)', hi: 'पॉक्सो अधिनियम 2012 (धाराएँ 13 और 14)' },
      summary: {
        es: 'Protege a menores de 18 años. Comentarios jurídicos la aplican también a material sexual de menores hecho con IA, pero la ley no define "deepfake".',
        en: 'It protects people under 18. Legal commentary also applies it to AI-made sexual material of minors, but the law does not define "deepfake".',
        hi: 'यह 18 वर्ष से कम उम्र के लोगों की रक्षा करता है। कानूनी टिप्पणियाँ इसे AI से बनी नाबालिगों की यौन सामग्री पर भी लागू करती हैं, पर कानून "डीपफेक" को परिभाषित नहीं करता।',
      },
      status: 'partial', verifiedOn: ON, source: 'https://lawfullegal.in/ai-generated-deepfakes-and-criminal-liability-is-indias-legal-framework-adequate/',
    },
  ],
  removal: {
    summary: {
      es: 'En India, la vía más directa es la queja al oficial de quejas de la plataforma, junto con la denuncia en el portal de cibercrimen o en la policía.',
      en: "In India, the most direct route is a complaint to the platform's Grievance Officer, together with a report on the cyber crime portal or to the police.",
      hi: 'भारत में सबसे सीधा रास्ता प्लेटफ़ॉर्म के शिकायत अधिकारी से शिकायत है, साथ में साइबर अपराध पोर्टल या पुलिस में रिपोर्ट।',
    },
    status: 'partial', verifiedOn: ON,
  },
  letter: { available: false },
};
