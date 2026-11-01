// Builds the messages the person can send to someone they trust. Technical wording and scores
// never go in these messages. The link points to the page for the adult who receives it.
import { SITE_DOMAIN } from '../siteConfig.js';
import { fill, getContent } from '../content/index.js';

export const WHATSAPP_URL_LIMIT = 2000; // practical limit of a wa.me link

export function defaultStyle(persona) {
  return persona === 'parent' ? 'short' : 'adult';
}

export function adultsUrl(lang, pais) {
  return `https://${SITE_DOMAIN}/adultos/?lang=${lang}&country=${pais}`;
}

function tidy(text) {
  // "Hola , necesito" (no name given) becomes "Hola, necesito".
  return text.replace(/\s+,/g, ',').replace(/ {2,}/g, ' ');
}

export function composeMessage({ lang, caso, style, name }) {
  const t = getContent(lang).tell;
  const byCase = t.messages[caso] || t.messages.fake;
  return tidy(fill(byCase[style] || byCase.short, { name: (name || '').trim() }));
}

export function withAdultsLine({ lang, pais, text }) {
  const t = getContent(lang).tell;
  return `${text}\n\n${fill(t.adultsLine, { link: adultsUrl(lang, pais) })}`;
}

export function whatsappUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Full text, then without the adults line, then no WhatsApp link at all (the person can still copy).
export function whatsappLink({ lang, pais, text }) {
  const full = whatsappUrl(withAdultsLine({ lang, pais, text }));
  if (full.length <= WHATSAPP_URL_LIMIT) return full;
  const bare = whatsappUrl(text);
  return bare.length <= WHATSAPP_URL_LIMIT ? bare : null;
}
