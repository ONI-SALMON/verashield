// Content checks for the flow texts and the country and platform data. No dependencies:
//   node scripts/check-content.mjs   (or: npm run check:content)
import { ADULTS, CONTENT, LANGS } from '../lib/content/index.js';
import { COUNTRIES, COUNTRY_IDS } from '../lib/countries/index.js';
import { PLATFORMS } from '../lib/platforms.js';

const errors = [];
const fail = (msg) => errors.push(msg);

const FORBIDDEN = /[—–…‘’“”️]|\p{Extended_Pictographic}/u;

function* walk(value, path = '') {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* walk(value[i], `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const k of Object.keys(value)) yield* walk(value[k], path ? `${path}.${k}` : k);
}

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = shape(value[k]);
    return out;
  }
  return typeof value;
}

const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

// 1. Same keys, same array lengths and same placeholders in every language
const base = CONTENT[LANGS[0]];
const baseShape = JSON.stringify(shape(base));
for (const lang of LANGS.slice(1)) {
  if (JSON.stringify(shape(CONTENT[lang])) !== baseShape) fail(`content: ${lang} does not have the same keys or array sizes as ${LANGS[0]}`);
}
const baseStrings = new Map(walk(base));
for (const lang of LANGS.slice(1)) {
  for (const [path, text] of walk(CONTENT[lang])) {
    if (baseStrings.has(path) && placeholders(baseStrings.get(path)) !== placeholders(text)) fail(`content: placeholders differ at ${lang}.${path}`);
  }
}

// 1b. The adults page has the same keys in every language too
const adultsShape = JSON.stringify(shape(ADULTS[LANGS[0]]));
for (const lang of LANGS.slice(1)) {
  if (JSON.stringify(shape(ADULTS[lang])) !== adultsShape) fail(`adults: ${lang} does not have the same keys or array sizes as ${LANGS[0]}`);
}

// 2. No emojis, long dashes, curly quotes or ellipsis characters in any visible text
const sources = { content: CONTENT, adults: ADULTS, countries: COUNTRIES, platforms: PLATFORMS };
for (const [name, tree] of Object.entries(sources)) {
  for (const [path, text] of walk(tree)) {
    if (FORBIDDEN.test(text)) fail(`${name}: forbidden character at ${path}`);
  }
}

// 3. Data items: status rules
function checkItem(where, item, { needsLink = false } = {}) {
  const { status, verifiedOn, source, url, number } = item;
  if (!['verified', 'partial', 'pending'].includes(status)) fail(`${where}: bad status "${status}"`);
  if (status === 'verified' && (!verifiedOn || !source)) fail(`${where}: verified items need verifiedOn and source`);
  if (status === 'partial' && !verifiedOn && !item.carried) fail(`${where}: partial items need verifiedOn (or carried: true)`);
  if (status === 'pending' && (url || number)) fail(`${where}: pending items must not carry a link or a number`);
  if (item.email && status !== 'verified') fail(`${where}: only verified items can show an email`);
  if (needsLink && !url) fail(`${where}: missing url`);
}

const localized = (where, obj) => {
  for (const lang of LANGS) if (!obj || typeof obj[lang] !== 'string' || !obj[lang]) fail(`${where}: missing ${lang}`);
};

for (const id of COUNTRY_IDS) {
  const c = COUNTRIES[id];
  localized(`country ${id}.name`, c.name);
  for (const kind of ['helplines', 'authorities', 'laws']) {
    if (!Array.isArray(c[kind]) || !c[kind].length) fail(`country ${id}.${kind}: empty`);
    for (const item of c[kind] || []) {
      checkItem(`country ${id}.${kind}.${item.id}`, item);
      if (kind === 'laws') { localized(`country ${id}.laws.${item.id}.cite`, item.cite); localized(`country ${id}.laws.${item.id}.summary`, item.summary); }
      else if (kind === 'helplines') { localized(`country ${id}.helplines.${item.id}.label`, item.label); localized(`country ${id}.helplines.${item.id}.note`, item.note); }
      else { localized(`country ${id}.authorities.${item.id}.name`, item.name); localized(`country ${id}.authorities.${item.id}.summary`, item.summary); }
    }
  }
  for (const m of c.materials || []) {
    checkItem(`country ${id}.materials.${m.id}`, m, { needsLink: true });
    if (!m.title || !m.year) fail(`country ${id}.materials.${m.id}: needs title and year`);
    localized(`country ${id}.materials.${m.id}.audience`, m.audience);
  }
  localized(`country ${id}.removal.summary`, c.removal && c.removal.summary);
  checkItem(`country ${id}.removal`, c.removal || {});
  if (typeof (c.letter && c.letter.available) !== 'boolean') fail(`country ${id}.letter.available must be a boolean`);
}

// 4. Platforms: data and content must agree
const platformContent = base.stop.platforms;
for (const p of PLATFORMS) {
  checkItem(`platform ${p.id}`, p);
  for (const lang of LANGS) {
    const entry = CONTENT[lang].stop.platforms[p.id];
    if (!entry || !entry.name || !Array.isArray(entry.steps) || !entry.steps.length) fail(`platform ${p.id}: missing content in ${lang}`);
    if (p.url && p.status !== 'pending' && entry && !entry.button) fail(`platform ${p.id}: has a url but no button text in ${lang}`);
  }
}
for (const id of Object.keys(platformContent)) {
  if (!PLATFORMS.some((p) => p.id === id)) fail(`content: platform "${id}" has texts but no data in lib/platforms.js`);
}

if (errors.length) {
  console.error(`check-content: ${errors.length} problem(s)`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log(`check-content: OK (${LANGS.length} languages, ${COUNTRY_IDS.length} countries, ${PLATFORMS.length} platforms)`);
