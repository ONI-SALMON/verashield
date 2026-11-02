import { h, icon, replace } from '../dom.js';
import { setDone } from '../session.js';
import { heading, stepNav } from './common.js';

export function render(root, ctx) {
  const c = ctx.t.breathe;
  const emergency = ctx.country.helplines.find((x) => x.kind === 'emergency' && x.status !== 'pending');
  replace(root, 
    heading(c.title),
    h('p', { class: 'step-lead' }, c.lead),
    h('ul', { class: 'card-list' }, c.items.map((item) =>
      h('li', { class: 'info-card' }, h('p', { class: 'info-card-title' }, item.h), h('p', {}, item.p)))),
    emergency
      ? h('p', { class: 'danger-line' }, c.danger, ' ',
        h('a', { class: 'resource-call', href: 'tel:' + emergency.number.replace(/[^\d+]/g, '') }, icon('phone', 16), ' ', emergency.number))
      : null,
    stepNav(ctx, { nextLabel: c.next, onNext: () => { setDone('breathe', true); ctx.next(); } }),
  );
}
