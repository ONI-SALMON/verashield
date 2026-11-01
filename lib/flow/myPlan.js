// "My plan": a checklist kept only in memory while the tab is open.
import { h } from './dom.js';
import { flow, setDone, subscribe } from './session.js';
import { fill, getContent } from '../content/index.js';

export const PLAN_IDS = ['breathe', 'choose', 'tell', 'takedown', 'report', 'evidence', 'adult', 'school', 'care'];

let lastFocus = null;

export function planDoneCount() {
  return PLAN_IDS.filter((id) => flow.done.has(id)).length;
}

export function planProgressText() {
  const c = getContent(flow.lang).chrome;
  return fill(c.planProgress, { n: planDoneCount(), t: PLAN_IDS.length });
}

export function initMyPlan() {
  const modal = document.getElementById('plan-modal');
  const openBtn = document.getElementById('plan-btn');

  function render() {
    const c = getContent(flow.lang);
    const list = h('ul', { class: 'plan-list' }, PLAN_IDS.map((id) => {
      const input = h('input', {
        type: 'checkbox', id: 'plan-' + id,
        on: { change: (e) => setDone(id, e.target.checked) },
      });
      input.checked = flow.done.has(id);
      return h('li', {}, h('label', { for: 'plan-' + id }, input, h('span', {}, c.plan.items[id])));
    }));
    const close = h('button', { type: 'button', class: 'privacy-modal-close', id: 'plan-close', 'aria-label': c.chrome.close, on: { click: closeModal } }, '×');
    const card = h('div', { class: 'privacy-modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'plan-title' },
      close,
      h('h2', { id: 'plan-title' }, c.chrome.planTitle),
      h('p', { class: 'plan-intro' }, c.chrome.planIntro),
      list,
      h('p', { class: 'plan-count', role: 'status', 'aria-live': 'polite' }, planProgressText()),
    );
    modal.replaceChildren(card);
  }

  function openModal() {
    lastFocus = document.activeElement;
    render();
    modal.hidden = false;
    document.getElementById('plan-close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  openBtn.addEventListener('click', openModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    // Keep focus inside the dialog.
    const focusables = [...modal.querySelectorAll('button, input')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Keep the open dialog and the count in sync when something is checked elsewhere.
  subscribe(() => { if (!modal.hidden) { const c = modal.querySelector('.plan-count'); if (c) c.textContent = planProgressText(); } });
  return { rerender: () => { if (!modal.hidden) render(); } };
}
