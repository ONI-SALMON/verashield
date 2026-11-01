import { h, icon } from '../dom.js';

export function heading(text, tag = 'h2') {
  return h(tag, { class: tag === 'h1' ? 'hero-title' : 'section-heading', tabindex: '-1', 'data-step-heading': '' }, text);
}

// Back and next buttons at the bottom of a step.
export function stepNav(ctx, { nextLabel, onNext, nextDisabled = false, showBack = true, nextClass = 'primary-btn' } = {}) {
  const c = ctx.t.chrome;
  return h('div', { class: 'step-actions' },
    showBack ? h('button', { type: 'button', class: 'secondary-btn', on: { click: () => ctx.back() } }, icon('back', 16), ' ', c.back) : null,
    h('button', {
      type: 'button', class: nextClass + ' next-btn', disabled: nextDisabled,
      on: { click: () => (onNext ? onNext() : ctx.next()) },
    }, nextLabel || c.next, ' ', icon('arrow', 16)),
  );
}
