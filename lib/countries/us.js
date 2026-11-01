// Country data for the United States. See lib/countries/mx.js for the meaning of status.
// Reviewed on 2026-11-01 with web search only (official sites could not be fetched in this session).
const ON = '2026-11-01';

export default {
  id: 'us',
  name: { es: 'Estados Unidos', en: 'United States', hi: 'संयुक्त राज्य अमेरिका' },
  helplines: [
    {
      id: 'emergency', kind: 'emergency', number: '911',
      label: { es: 'Emergencias', en: 'Emergencies', hi: 'आपातकाल' },
      note: { es: 'Si estás en peligro ahora mismo.', en: 'If you are in danger right now.', hi: 'अगर आप अभी खतरे में हैं।' },
      status: 'partial', verifiedOn: ON,
    },
    {
      id: 'cybertipline', kind: 'report', number: '1-800-843-5678',
      label: { es: 'CyberTipline de NCMEC', en: 'NCMEC CyberTipline', hi: 'NCMEC साइबरटिपलाइन' },
      note: { es: 'Para reportar imágenes de menores de 18 años. También en report.cybertip.org.', en: 'To report images of people under 18. Also at report.cybertip.org.', hi: '18 वर्ष से कम उम्र के लोगों की तस्वीरों की रिपोर्ट के लिए। report.cybertip.org पर भी।' },
      url: 'https://report.cybertip.org',
      status: 'verified', verifiedOn: ON, source: 'https://ojjdp.ojp.gov/library/publications/resources-sextortion-victims',
    },
    {
      id: 'lifeline_988', kind: 'emotional', number: '988',
      label: { es: 'Línea 988 de Suicidio y Crisis', en: '988 Suicide and Crisis Lifeline', hi: '988 आत्महत्या और संकट लाइफ़लाइन' },
      note: { es: 'Llamada o mensaje, a toda hora. No pudimos confirmarlo en esta revisión: verifica en 988lifeline.org.', en: 'Call or text, any time. We could not confirm it in this review: check 988lifeline.org.', hi: 'कॉल या संदेश, हर समय। इस समीक्षा में पुष्टि नहीं हो सकी: 988lifeline.org पर जाँचें।' },
      status: 'partial', verifiedOn: ON,
    },
    {
      id: 'crisis_text_line', kind: 'emotional', number: '741741',
      label: { es: 'Crisis Text Line (mensaje de texto)', en: 'Crisis Text Line (text message)', hi: 'क्राइसिस टेक्स्ट लाइन (टेक्स्ट संदेश)' },
      note: { es: 'Envía el mensaje HOME al 741741. No pudimos confirmar la palabra clave: verifica en crisistextline.org.', en: 'Text HOME to 741741. We could not confirm the keyword: check crisistextline.org.', hi: '741741 पर HOME भेजें। कीवर्ड की पुष्टि नहीं हो सकी: crisistextline.org पर जाँचें।' },
      status: 'partial', verifiedOn: ON,
    },
  ],
  authorities: [
    {
      id: 'ftc_takeitdown', kind: 'removal',
      name: { es: 'Queja ante la FTC (TakeItDown.ftc.gov)', en: 'FTC complaint (TakeItDown.ftc.gov)', hi: 'FTC में शिकायत (TakeItDown.ftc.gov)' },
      summary: {
        es: 'Si una plataforma no actúa ante una solicitud válida de retiro, puedes presentar una queja ante la FTC.',
        en: 'If a platform does not act on a valid removal request, you can file a complaint with the FTC.',
        hi: 'अगर कोई प्लेटफ़ॉर्म वैध हटाने के अनुरोध पर कार्रवाई नहीं करता, तो आप FTC में शिकायत कर सकते हैं।',
      },
      url: 'https://takeitdown.ftc.gov',
      status: 'verified', verifiedOn: ON, source: 'https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act',
    },
    {
      id: 'fbi', kind: 'report',
      name: { es: 'FBI (tips.fbi.gov)', en: 'FBI (tips.fbi.gov)', hi: 'FBI (tips.fbi.gov)' },
      summary: {
        es: 'Para extorsión sexual y otros delitos. También puedes llamar al 1-800-CALL-FBI o acudir a la policía local.',
        en: 'For sextortion and other crimes. You can also call 1-800-CALL-FBI or go to local police.',
        hi: 'यौन ब्लैकमेल और अन्य अपराधों के लिए। आप 1-800-CALL-FBI पर कॉल कर सकते हैं या स्थानीय पुलिस के पास जा सकते हैं।',
      },
      url: 'https://tips.fbi.gov',
      status: 'verified', verifiedOn: ON, source: 'https://ojjdp.ojp.gov/library/publications/resources-sextortion-victims',
    },
  ],
  laws: [
    {
      id: 'tida',
      cite: { es: 'Ley TAKE IT DOWN (mayo de 2025)', en: 'TAKE IT DOWN Act (May 2025)', hi: 'टेक इट डाउन अधिनियम (मई 2025)' },
      summary: {
        es: 'Obliga a las plataformas a retirar imágenes íntimas sin consentimiento, también las hechas con IA, dentro de 48 horas de una solicitud válida. La FTC empezó a aplicarla el 19 de mayo de 2026.',
        en: 'It requires platforms to remove intimate images shared without consent, including AI-made ones, within 48 hours of a valid request. The FTC began enforcing it on May 19, 2026.',
        hi: 'यह प्लेटफ़ॉर्म को वैध अनुरोध के 48 घंटे के भीतर बिना सहमति की निजी तस्वीरें, AI से बनी तस्वीरें भी, हटाने के लिए बाध्य करता है। FTC ने इसे 19 मई 2026 से लागू करना शुरू किया।',
      },
      status: 'verified', verifiedOn: ON, source: 'https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act',
    },
    {
      id: 'state_laws',
      cite: { es: 'Leyes de cada estado', en: 'State laws', hi: 'राज्यों के कानून' },
      summary: {
        es: 'Cada estado tiene sus propias reglas sobre imágenes íntimas y contenido hecho con IA. Pregunta a la policía local o a una organización de apoyo.',
        en: 'Each state has its own rules on intimate images and AI-made content. Ask local police or a support organization.',
        hi: 'हर राज्य के निजी तस्वीरों और AI से बनी सामग्री पर अपने नियम हैं। स्थानीय पुलिस या सहायता संगठन से पूछें।',
      },
      status: 'partial', verifiedOn: ON,
    },
  ],
  removal: {
    summary: {
      es: 'En Estados Unidos, la ley TAKE IT DOWN obliga a las plataformas a responder a una solicitud válida de retiro. La vía principal es la solicitud a la plataforma y, si no actúa, la queja ante la FTC.',
      en: 'In the United States, the TAKE IT DOWN Act requires platforms to respond to a valid removal request. The main route is the request to the platform and, if it does not act, a complaint to the FTC.',
      hi: 'अमेरिका में टेक इट डाउन अधिनियम प्लेटफ़ॉर्म को वैध हटाने के अनुरोध का जवाब देने के लिए बाध्य करता है। मुख्य रास्ता प्लेटफ़ॉर्म को अनुरोध है और, कार्रवाई न होने पर, FTC में शिकायत।',
    },
    status: 'verified', verifiedOn: ON, source: 'https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act',
  },
  letter: { available: false },
};
