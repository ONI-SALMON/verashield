import { h } from '../dom.js';
import { flow, setDone } from '../session.js';
import { helplineEl, list } from '../countryBlock.js';
import { heading, stepNav } from './common.js';

export function render(root, ctx) {
  const c = ctx.t.care;
  const lang = flow.lang;
  const emotional = ctx.country.helplines.filter((x) => x.kind === 'emotional' || x.kind === 'child' || x.kind === 'emergency');
  root.replaceChildren(
    heading(c.title),
    h('p', { class: 'step-lead' }, c.lead),
    h('ul', { class: 'card-list' }, c.tips.map((tip) => h('li', { class: 'info-card' }, h('p', {}, tip)))),
    h('h3', {}, c.helplinesTitle),
    list(emotional, (item) => helplineEl(item, lang, ctx.t.chrome)),
    h('p', { class: 'danger-line' }, c.danger),
    h('h3', {}, c.followTitle),
    h('ul', { class: 'plain-list' }, c.follow.map((s) => h('li', {}, s))),
    h('label', { class: 'check-row' },
      h('input', { type: 'checkbox', id: 'done-care', checked: flow.done.has('care') ? 'checked' : null, on: { change: (e) => setDone('care', e.target.checked) } }),
      h('span', {}, ctx.t.plan.items.care)),
    h('div', { class: 'step-actions' },
      h('button', { type: 'button', class: 'secondary-btn', on: { click: () => ctx.back() } }, ctx.t.chrome.back),
      h('button', { type: 'button', class: 'primary-btn', id: 'finish-btn', on: { click: () => ctx.go('home') } }, c.finish)),
  );
}
