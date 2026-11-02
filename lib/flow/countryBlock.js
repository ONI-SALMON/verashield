// "Depending on your country": helplines, authorities, laws and who can order removal.
// Items that are not verified say so; a pending item never becomes a link or a phone number.
import { h, icon } from './dom.js';
import { fill } from '../content/index.js';

export function statusLine(item, c) {
  if (item.status === 'pending') return c.status.pending;
  if (item.carried) return c.status.carried;
  const key = item.status === 'verified' ? 'verified' : 'partial';
  return fill(c.status[key], { date: item.verifiedOn });
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function externalLink(url, text) {
  return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, text || hostOf(url));
}

function telHref(number) {
  return 'tel:' + String(number).replace(/[^\d+]/g, '');
}

function sourceLine(item, c) {
  if (!item.source || item.status === 'pending') return null;
  return h('p', { class: 'resource-source' }, c.sourceLabel + ': ', externalLink(item.source));
}

export function helplineEl(item, lang, c) {
  return h('li', { class: 'resource' },
    h('p', { class: 'resource-name' }, item.label[lang]),
    item.number && item.status !== 'pending'
      ? h('p', { class: 'resource-contact' }, h('a', { class: 'resource-call', href: telHref(item.number) }, icon('phone', 16), ' ', item.number))
      : null,
    h('p', { class: 'resource-text' }, item.note[lang]),
    item.url && item.status !== 'pending' ? h('p', { class: 'resource-link' }, externalLink(item.url)) : null,
    h('p', { class: 'resource-status' }, statusLine(item, c)),
    sourceLine(item, c),
  );
}

export function authorityEl(item, lang, c) {
  return h('li', { class: 'resource' },
    h('p', { class: 'resource-name' }, item.name[lang]),
    h('p', { class: 'resource-text' }, item.summary[lang]),
    item.url && item.status !== 'pending' ? h('p', { class: 'resource-link' }, externalLink(item.url)) : null,
    item.email && item.status === 'verified' ? h('p', { class: 'resource-contact' }, h('a', { href: 'mailto:' + item.email }, item.email)) : null,
    h('p', { class: 'resource-status' }, statusLine(item, c)),
    sourceLine(item, c),
  );
}

// Guides and manuals of an organization: title, year, who it is for, link and credit.
export function materialEl(item, lang, c, credit) {
  return h('li', { class: 'resource' },
    h('p', { class: 'resource-name' }, item.title + ' (' + item.year + ')'),
    h('p', { class: 'resource-text' }, item.audience[lang]),
    item.url && item.status !== 'pending' ? h('p', { class: 'resource-link' }, externalLink(item.url)) : null,
    h('p', { class: 'resource-status' }, statusLine(item, c)),
    credit ? h('p', { class: 'resource-source' }, credit) : null,
  );
}

export function lawEl(item, lang, c) {
  return h('li', { class: 'resource' },
    h('p', { class: 'resource-name' }, item.cite[lang]),
    h('p', { class: 'resource-text' }, item.summary[lang]),
    h('p', { class: 'resource-status' }, statusLine(item, c)),
    sourceLine(item, c),
  );
}

export function list(items, render) {
  return h('ul', { class: 'resource-list' }, items.map(render));
}

// sections: any of 'removal', 'report', 'laws', 'helplines'
export function countryBlock({ country, lang, t, sections }) {
  const c = t.chrome;
  const a = t.adult;
  const out = [];
  if (sections.includes('removal')) {
    out.push(h('div', { class: 'country-section' },
      h('h3', {}, a.removalTitle),
      h('p', { class: 'resource-text' }, country.removal.summary[lang]),
      h('p', { class: 'resource-status' }, statusLine(country.removal, c))));
  }
  if (sections.includes('report')) {
    out.push(h('div', { class: 'country-section' }, h('h3', {}, a.reportTitle),
      list(country.authorities, (item) => authorityEl(item, lang, c))));
  }
  if (sections.includes('materials') && country.materials && country.materials.length) {
    out.push(h('div', { class: 'country-section' }, h('h3', {}, a.materialsTitle),
      h('p', { class: 'resource-text' }, a.materialsNote),
      list(country.materials, (item) => materialEl(item, lang, c, a.materialsCredit))));
  }
  if (sections.includes('laws')) {
    out.push(h('div', { class: 'country-section' }, h('h3', {}, a.lawsTitle),
      list(country.laws, (item) => lawEl(item, lang, c)),
      h('p', { class: 'resource-status' }, a.lawsNote)));
  }
  if (sections.includes('helplines')) {
    out.push(h('div', { class: 'country-section' }, h('h3', {}, a.helplinesTitle),
      list(country.helplines, (item) => helplineEl(item, lang, c))));
  }
  return h('div', { class: 'country-block' }, out);
}
