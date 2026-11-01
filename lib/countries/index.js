import mx from './mx.js';
import india from './in.js';
import us from './us.js';

export const COUNTRIES = { mx, in: india, us };
export const COUNTRY_IDS = ['mx', 'in', 'us'];

// Same defaults as the app had: the language suggests a country, the person can change it.
export function defaultCountry(lang, browserLocale = '') {
  if (lang === 'hi') return 'in';
  if (lang === 'es') return 'mx';
  if (browserLocale.startsWith('en-IN')) return 'in';
  return 'us';
}

export function getCountry(id) {
  return COUNTRIES[id] || COUNTRIES.mx;
}
