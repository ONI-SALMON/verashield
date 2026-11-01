// Step navigation. Only this module toggles `hidden` on the step sections. The browser Back button
// works through pushState; the state itself stays in memory (see session.js).
import { flow, setFlow } from './session.js';
import { getContent } from '../content/index.js';
import { getCountry } from '../countries/index.js';

export const STEP_IDS = ['home', 'respira', 'que-paso', 'analisis', 'contarlo', 'frenar', 'adulto', 'cuidarte'];
export const PROGRESS_TOTAL = STEP_IDS.length - 1; // home has no number

const registry = new Map();
let afterRender = () => {};
let hooks = {};

// Functions app.js lends to the steps (e.g. whether an analysis result exists).
export function setHooks(value) {
  hooks = value || {};
}

export function registerStep(id, def) {
  registry.set(id, def);
}

export function onAfterRender(fn) {
  afterRender = fn;
}

export function stepNumber(id) {
  return Math.max(STEP_IDS.indexOf(id), 0);
}

export function context() {
  return {
    t: getContent(flow.lang),
    country: getCountry(flow.pais),
    flow,
    hooks,
    go: goToStep,
    back: goBack,
    next: goNext,
  };
}

export function renderCurrent() {
  const def = registry.get(flow.step);
  const root = document.getElementById('step-' + flow.step);
  if (def && root) def.render(root, context());
  afterRender();
}

export function goToStep(id, { push = true } = {}) {
  if (!STEP_IDS.includes(id)) id = 'home';
  for (const stepId of STEP_IDS) {
    const el = document.getElementById('step-' + stepId);
    if (el) el.hidden = stepId !== id;
  }
  let stack = flow.stack;
  if (push) {
    stack = [...stack, id];
    history.pushState({ step: id }, '', '#' + id);
  } else {
    const at = stack.lastIndexOf(id);
    stack = at >= 0 ? stack.slice(0, at + 1) : [...stack, id];
  }
  setFlow({ step: id, stack });
  renderCurrent();
  window.scrollTo({ top: 0, behavior: 'auto' });
  const root = document.getElementById('step-' + id);
  const heading = root && root.querySelector('[data-step-heading]');
  if (heading) heading.focus({ preventScroll: true });
}

export function goNext() {
  const i = STEP_IDS.indexOf(flow.step);
  goToStep(STEP_IDS[Math.min(i + 1, STEP_IDS.length - 1)]);
}

export function goBack() {
  if (flow.stack.length > 1) history.back(); // popstate re-renders the previous step
  else goToStep('home', { push: false });
}

export function startRouter() {
  history.replaceState({ step: 'home' }, '', location.pathname + location.search);
  window.addEventListener('popstate', (e) => {
    goToStep((e.state && e.state.step) || 'home', { push: false });
  });
  goToStep('home', { push: false });
}
