// "For whoever receives this message": a standalone page (no flow state, nothing stored). The
// language comes from ?lang=, the country from ?country= (or the language's default); both can be
// changed on the page. Rendered with the same safe DOM helper as the flow.
import { h } from '/lib/flow/dom.js';
import { countryBlock } from '/lib/flow/countryBlock.js';
import { ADULTS, getContent } from '/lib/content/index.js';
import { COUNTRY_IDS, defaultCountry, getCountry } from '/lib/countries/index.js';

const LANGS = ['es', 'en', 'hi'];
const params = new URLSearchParams(location.search);
const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();

let lang = [params.get('lang'), nav].find((l) => LANGS.includes(l)) || 'es';
let pais = COUNTRY_IDS.includes(params.get('country')) ? params.get('country') : defaultCountry(lang, navigator.language);
let paisManual = COUNTRY_IDS.includes(params.get('country'));

const page = document.getElementById('adults-page');
const langBtns = document.querySelectorAll('.lang-btn');
const select = document.getElementById('country-select');

function section(title, items) {
  return h('section', { class: 'adults-section' },
    h('h2', { class: 'section-heading' }, title),
    h('ul', { class: 'plain-list' }, items.map((item) => h('li', {}, item))));
}

function render() {
  const a = ADULTS[lang];
  const t = getContent(lang);
  document.documentElement.lang = lang;
  document.title = a.docTitle;
  document.getElementById('skip-link').textContent = t.chrome.skipLink;
  langBtns.forEach((b) => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });

  document.getElementById('country-label').textContent = t.chrome.countryLabel;
  select.replaceChildren(...COUNTRY_IDS.map((id) => new Option(t.chrome.countries[id], id)));
  select.value = pais;

  page.replaceChildren(
    h('h1', { class: 'hero-title', tabindex: '-1' }, a.title),
    h('p', { class: 'step-lead' }, a.lead),
    section(a.before.title, a.before.items),
    section(a.dont.title, a.dont.items),
    section(a.next.title, a.next.items),
    h('section', { class: 'adults-section' },
      h('h2', { class: 'section-heading' }, a.countryTitle),
      countryBlock({ country: getCountry(pais), lang, t, sections: ['removal', 'report', 'helplines', 'materials'] })),
    h('p', { class: 'resource-status' }, a.note),
    h('p', {}, h('a', { class: 'secondary-btn', href: '/' }, a.back)),
  );
}

langBtns.forEach((b) => b.addEventListener('click', () => {
  lang = b.dataset.lang;
  if (!paisManual) pais = defaultCountry(lang, navigator.language);
  render();
}));
select.addEventListener('change', () => { pais = select.value; paisManual = true; render(); });
render();
