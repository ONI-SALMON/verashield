import { h, icon, replace } from '../dom.js';
import { flow, setDone, setFlow } from '../session.js';
import { renderCurrent } from '../router.js';
import { copyToClipboard } from '../clipboard.js';
import { fill } from '../../content/index.js';
import { PLATFORMS, getPlatform } from '../../platforms.js';
import { heading, stepNav } from './common.js';

const CHOOSABLE = PLATFORMS.filter((p) => p.id !== 'takeitdown').map((p) => p.id);
const NO_FORM_TEXT = new Set(['takeitdown', 'whatsapp']);

function externalButton(platform, label, lang) {
  if (!platform.url || platform.status === 'pending' || !label) return null;
  return h('a', { class: 'secondary-btn', href: platform.url, target: '_blank', rel: 'noopener noreferrer' }, label, ' ', icon('external', 16));
}

function platformCard(ctx, platform, text, { headingTag = 'h3' } = {}) {
  const c = ctx.t.stop;
  const chrome = ctx.t.chrome;
  const status = platform.status === 'pending'
    ? chrome.status.pending
    : fill(chrome.status[platform.status === 'verified' ? 'verified' : 'partial'], { date: platform.verifiedOn });
  return h('div', { class: 'platform-card' },
    h(headingTag, {}, text.name),
    platform.status === 'pending'
      ? h('p', { class: 'resource-text' }, c.noRoute)
      : h('ol', { class: 'plain-list' }, text.steps.map((s) => h('li', {}, s))),
    externalButton(platform, text.button, flow.lang),
    h('p', { class: 'resource-status' }, status),
  );
}

function formTextBlock(ctx) {
  const c = ctx.t.stop;
  const chrome = ctx.t.chrome;
  const caso = flow.caso || 'fake';
  const box = h('p', { class: 'message-box', id: 'form-text' });
  const refresh = () => { box.textContent = fill(c.formText[caso], { link: flow.link.trim() || c.linkPlaceholder }); };
  refresh();
  const copy = h('button', { type: 'button', class: 'secondary-btn', id: 'form-copy' }, chrome.copy);
  copy.addEventListener('click', async () => {
    const ok = await copyToClipboard(box.textContent);
    copy.textContent = ok ? chrome.copied : chrome.copy;
    setTimeout(() => { copy.textContent = chrome.copy; }, 2000);
  });
  return h('div', { class: 'form-text-block' },
    h('h3', {}, c.formTitle),
    h('p', { class: 'resource-status' }, c.formHint),
    h('label', { class: 'field' }, h('span', {}, c.linkPlaceholder),
      h('input', { type: 'url', id: 'link-input', inputmode: 'url', autocomplete: 'off', value: flow.link, maxlength: '500', on: { input: (e) => { setFlow({ link: e.target.value }); refresh(); } } })),
    box,
    copy,
  );
}

function checkRow(ctx, id) {
  return h('label', { class: 'check-row' },
    h('input', { type: 'checkbox', id: 'done-' + id, checked: flow.done.has(id) ? 'checked' : null, on: { change: (e) => setDone(id, e.target.checked) } }),
    h('span', {}, ctx.t.plan.items[id]));
}

export function render(root, ctx) {
  const c = ctx.t.stop;
  const tid = getPlatform('takeitdown');
  const chosen = CHOOSABLE.includes(flow.platform) ? getPlatform(flow.platform) : null;

  const chips = h('div', { class: 'chip-row', role: 'group', 'aria-labelledby': 'where-title' }, CHOOSABLE.map((id) =>
    h('button', {
      type: 'button', class: 'chip' + (flow.platform === id ? ' is-selected' : ''), 'aria-pressed': String(flow.platform === id), 'data-key': 'plat-' + id,
      on: { click: () => { setFlow({ platform: id }); renderCurrent(); const again = document.querySelector(`[data-key="plat-${id}"]`); if (again) again.focus({ preventScroll: true }); } },
    }, c.platforms[id].name)));

  replace(root, 
    heading(c.title),
    h('p', { class: 'step-lead' }, c.lead),
    h('div', { class: 'info-panel' }, h('h3', {}, c.takeItDownTitle), h('p', { class: 'resource-text' }, c.takeItDownLead),
      platformCard(ctx, tid, c.platforms.takeitdown, { headingTag: 'h4' }), checkRow(ctx, 'takedown')),
    h('p', { class: 'choice-title', id: 'where-title' }, c.wherePrompt),
    chips,
    chosen ? platformCard(ctx, chosen, c.platforms[chosen.id]) : null,
    chosen && !NO_FORM_TEXT.has(chosen.id) ? formTextBlock(ctx) : null,
    chosen ? checkRow(ctx, 'report') : null,
    h('p', { class: 'resource-text' }, c.reportAnyway),
    h('div', { class: 'info-panel' },
      h('h3', {}, c.evidenceTitle),
      h('ul', { class: 'plain-list' }, c.evidenceItems.map((item) => h('li', {}, item))),
      h('p', { class: 'evidence-warn' }, c.evidenceWarn),
      checkRow(ctx, 'evidence')),
    stepNav(ctx),
  );
}
