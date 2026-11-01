import { h, icon } from '../dom.js';
import { heading } from './common.js';

export function render(root, ctx) {
  const c = ctx.t.home;
  root.replaceChildren(
    h('div', { class: 'intro' },
      h('p', { class: 'eyebrow' }, c.eyebrow),
      heading(c.title, 'h1'),
      h('p', { class: 'hero-subtitle' }, c.subtitle)),
    h('ul', { class: 'trust-list' }, c.reassure.map((line) => h('li', {}, icon('check', 20), h('span', {}, line)))),
    h('div', { class: 'step-actions' },
      h('button', { type: 'button', class: 'primary-btn', id: 'start-btn', on: { click: () => ctx.go('respira') } }, c.start, ' ', icon('arrow', 16))),
    h('p', { class: 'step-aside' }, c.other),
  );
}
