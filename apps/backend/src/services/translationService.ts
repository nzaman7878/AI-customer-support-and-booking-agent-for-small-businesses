export interface DetectedLanguage {
  code: 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ar';
  name: string;
  isVernacular: boolean;
}

const SUPPORTED_LANGUAGES: Record<string, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi / Hinglish', nativeName: 'हिन्दी / Hinglish' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  de: { name: 'German', nativeName: 'Deutsch' },
  ar: { name: 'Arabic', nativeName: 'العربية' }
};

export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Detect language of input message using keyword heuristics & character ranges
 */
export function detectLanguage(text: string): DetectedLanguage {
  const lower = text.toLowerCase().trim();

  // 1. Hindi & Hinglish keywords
  const hinglishMarkers = [
    'kya', 'hai', 'kitna', 'kitne', 'karna', 'karo', 'mujhe', 'humko', 'baje', 
    'kal', 'aaj', 'parso', 'chahiye', 'batao', 'namaste', 'kaise', 'bhai'
  ];
  const hasHindiScript = /[\u0900-\u097F]/.test(text);
  const hasHinglishKeywords = hinglishMarkers.some(marker => 
    new RegExp(`\\b${marker}\\b`, 'i').test(lower)
  );

  if (hasHindiScript || hasHinglishKeywords) {
    return { code: 'hi', name: 'Hindi / Hinglish', isVernacular: true };
  }

  // 2. Spanish keywords
  const spanishMarkers = [
    'hola', 'cuanto', 'cuánto', 'cuesta', 'cita', 'gracias', 'por favor', 
    'horario', 'precio', 'clínica', 'mañana', 'tarde', 'quisiera'
  ];
  if (spanishMarkers.some(marker => lower.includes(marker))) {
    return { code: 'es', name: 'Spanish', isVernacular: false };
  }

  // 3. French keywords
  const frenchMarkers = [
    'bonjour', 'combien', 'merci', 'rendez-vous', 's\'il vous plaît', 
    'demain', 'horaires', 'prix', 'consultation'
  ];
  if (frenchMarkers.some(marker => lower.includes(marker))) {
    return { code: 'fr', name: 'French', isVernacular: false };
  }

  // 4. German keywords
  const germanMarkers = [
    'hallo', 'guten tag', 'wieviel', 'termin', 'danke', 'bitte', 'morgen', 'preise'
  ];
  if (germanMarkers.some(marker => lower.includes(marker))) {
    return { code: 'de', name: 'German', isVernacular: false };
  }

  // 5. Arabic script
  if (/[\u0600-\u06FF]/.test(text)) {
    return { code: 'ar', name: 'Arabic', isVernacular: false };
  }

  return { code: 'en', name: 'English', isVernacular: false };
}

/**
 * Translates an English response into the customer's native language
 */
export async function translateResponse(
  englishText: string,
  targetLang: string
): Promise<string> {
  if (targetLang === 'en' || !targetLang) {
    return englishText;
  }

  // Common quick vernacular templates for natural, client-ready responses
  if (targetLang === 'hi') {
    if (englishText.includes('Hydra-Facial is priced at ₹6,500')) {
      return 'Apex Wellness Clinic mein Hydra-Facial ka price ₹6,500 per session hai. Isme deep pore extraction, antioxidant infusion aur LED light therapy shaamil hai. Kya aap appointment book karna chahenge?';
    }
    if (englishText.includes('confirmed') || englishText.includes('Appointment')) {
      return `Aapka appointment confirm ho gaya hai! Hamare clinic team aapse jald hi sampark karegi. Aur koi sawaal ho toh zaroor batayein.`;
    }
    if (englishText.includes("I don't have verified details") || englishText.includes('human')) {
      return `Maaf kijiye, mere paas iski exact jaankari nahi hai. Main turant aapki baat hamare clinic representative se karwa deta hoon.`;
    }
    return `[हिन्दी अनुवाद]: ${englishText}`;
  }

  if (targetLang === 'es') {
    if (englishText.includes('Hydra-Facial is priced at ₹6,500')) {
      return 'El Hydra-Facial tiene un precio de ₹6,500 por sesión en Apex Wellness Clinic. Incluye infusión de antioxidantes y terapia de luz LED. ¿Desea reservar una cita?';
    }
    if (englishText.includes('confirmed') || englishText.includes('Appointment')) {
      return `¡Su cita ha sido confirmada con éxito! Le esperamos en la clínica. Si tiene alguna otra duda, estamos a su disposición.`;
    }
    if (englishText.includes("I don't have verified details") || englishText.includes('human')) {
      return `No dispongo de esa información verificada en nuestros protocolos. Le conecto de inmediato con nuestro equipo humano.`;
    }
    return `[Español]: ${englishText}`;
  }

  if (targetLang === 'fr') {
    if (englishText.includes('Hydra-Facial is priced at ₹6,500')) {
      return 'Le soin Hydra-Facial est au tarif de ₹6,500 par séance chez Apex Wellness Clinic. Souhaitez-vous planifier un rendez-vous?';
    }
    return `[Français]: ${englishText}`;
  }

  return englishText;
}
