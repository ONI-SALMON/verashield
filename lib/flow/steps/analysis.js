// The image analysis is optional. The existing upload and result panels stay in the markup (with
// their listeners in app.js); this module only renders the heading and the buttons around them.
import { h, icon } from '../dom.js';
import { glossary } from './common.js';

export function render(root, ctx) {
  const c = ctx.t.analysis;
  const hooks = ctx.hooks || {};
  const hasResult = hooks.hasResult ? hooks.hasResult() : false;

  root.querySelector('#analysis-head').replaceChildren(
    h('h2', { class: 'section-heading', tabindex: '-1', 'data-step-heading': '' }, c.title, ' ', h('span', { class: 'tag' }, c.optional)),
    h('p', { class: 'step-lead' }, c.lead),
    h('p', { class: 'step-lead muted' }, c.how),
    h('p', { class: 'info-panel accuracy-note', role: 'note' }, c.accuracyNote),
    glossary(ctx.t),
  );

  root.querySelector('#analysis-actions').replaceChildren(
    h('button', { type: 'button', class: 'secondary-btn', on: { click: () => ctx.back() } }, icon('back', 16), ' ', ctx.t.chrome.back),
    h('button', { type: 'button', class: hasResult ? 'primary-btn' : 'secondary-btn', id: 'analysis-skip', on: { click: () => ctx.next() } },
      hasResult ? c.continueAfter : c.skip, ' ', icon('arrow', 16)),
  );
}
