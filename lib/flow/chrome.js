// The fixed parts around the steps: skip link, quick exit label, the flow bar (step text, country
// selector, My plan button). Re-rendered on language, country and step changes.
import { flow, setFlow } from './session.js';
import { PROGRESS_TOTAL, renderCurrent, stepNumber } from './router.js';
import { PLAN_IDS, planDoneCount } from './myPlan.js';
import { fill, getContent } from '../content/index.js';
import { COUNTRY_IDS } from '../countries/index.js';

export function initChrome() {
  const select = document.getElementById('country-select');
  select.addEventListener('change', () => {
    setFlow({ pais: select.value, paisManual: true });
    renderCurrent();
  });
}

export function updateChrome() {
  const c = getContent(flow.lang).chrome;
  document.getElementById('skip-link').textContent = c.skipLink;

  const exit = document.getElementById('quick-exit');
  exit.textContent = c.quickExit;
  exit.setAttribute('title', c.quickExitHint);
  exit.setAttribute('aria-label', `${c.quickExit}. ${c.quickExitHint}`);

  const n = stepNumber(flow.step);
  const stepText = document.getElementById('flow-bar-step');
  stepText.textContent = n > 0 ? `${fill(c.stepOf, { n, t: PROGRESS_TOTAL })}: ${c.stepNames[n - 1]}` : '';

  document.getElementById('country-label').textContent = c.countryLabel;
  const select = document.getElementById('country-select');
  const existing = [...select.options].map((o) => o.value).join(',');
  if (existing !== COUNTRY_IDS.join(',')) {
    select.replaceChildren(...COUNTRY_IDS.map((id) => new Option('', id)));
  }
  for (const option of select.options) option.textContent = c.countries[option.value];
  select.value = flow.pais;

  const plan = document.getElementById('plan-btn');
  plan.textContent = `${c.myPlan} (${planDoneCount()}/${PLAN_IDS.length})`;
}
