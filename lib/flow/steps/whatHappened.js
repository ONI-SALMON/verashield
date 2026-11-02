import { h, replace } from '../dom.js';
import { flow, setDone, setFlow } from '../session.js';
import { renderCurrent } from '../router.js';
import { heading, stepNav, glossary } from './common.js';

export function render(root, ctx) {
  const c = ctx.t.what;
  const cards = c.options.map((opt) => {
    const selected = flow.caso === opt.id;
    return h('button', {
      type: 'button', class: 'choice-card' + (selected ? ' is-selected' : ''), 'aria-pressed': String(selected), id: 'case-' + opt.id,
      on: {
        click: () => {
          setFlow({ caso: opt.id });
          setDone('choose', true);
          renderCurrent();
          const again = document.getElementById('case-' + opt.id);
          if (again) again.focus({ preventScroll: true });
        },
      },
    }, h('span', { class: 'choice-label' }, opt.label), h('span', { class: 'choice-hint' }, opt.hint));
  });
  const threat = flow.caso === 'threat'
    ? h('div', { class: 'info-panel', role: 'note' },
      h('p', { class: 'info-card-title' }, c.threatTitle),
      h('ol', { class: 'plain-list' }, c.threatSteps.map((s) => h('li', {}, s))),
      h('p', { class: 'resource-status' }, c.threatNote))
    : null;
  replace(root, 
    heading(c.title),
    h('p', { class: 'step-lead' }, c.lead),
    h('div', { class: 'choice-grid', role: 'group', 'aria-label': c.title }, cards),
    threat,
    glossary(ctx.t),
    stepNav(ctx, { nextDisabled: !flow.caso }),
  );
}
