import es from './es.js';
import en from './en.js';
import hi from './hi.js';

export const CONTENT = { es, en, hi };
export const LANGS = ['es', 'en', 'hi'];

export function getContent(lang) {
  return CONTENT[lang] || CONTENT.es;
}

// Replaces {name} style placeholders. Unknown placeholders are left as they are.
export function fill(text, values = {}) {
  return String(text).replace(/\{(\w+)\}/g, (m, key) => (key in values ? values[key] : m));
}
