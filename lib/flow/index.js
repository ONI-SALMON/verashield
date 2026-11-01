// Entry point of the flow layer. app.js calls initFlow once and lends it a few hooks, so the steps
// never import app.js.
import { registerStep, onAfterRender, renderCurrent, setHooks, startRouter } from './router.js';
import { flow, resetFlow, setFlow, subscribe } from './session.js';
import { initChrome, updateChrome } from './chrome.js';
import { initMyPlan } from './myPlan.js';
import { initQuickExit } from './quickExit.js';
import { defaultCountry } from '../countries/index.js';
import * as home from './steps/home.js';
import * as respira from './steps/respira.js';
import * as whatHappened from './steps/whatHappened.js';
import * as analysis from './steps/analysis.js';
import * as tellSomeone from './steps/tellSomeone.js';
import * as stopSpread from './steps/stopSpread.js';
import * as withAdult from './steps/withAdult.js';
import * as care from './steps/care.js';

export function initFlow({ hooks, lang }) {
  setHooks(hooks);
  registerStep('home', home);
  registerStep('respira', respira);
  registerStep('que-paso', whatHappened);
  registerStep('analisis', analysis);
  registerStep('contarlo', tellSomeone);
  registerStep('frenar', stopSpread);
  registerStep('adulto', withAdult);
  registerStep('cuidarte', care);

  setFlow({ lang, pais: defaultCountry(lang, navigator.language) });
  const plan = initMyPlan();
  initChrome();
  initQuickExit({ onExit: () => hooks.resetAll && hooks.resetAll() });
  onAfterRender(() => { updateChrome(); plan.rerender(); });
  subscribe(() => updateChrome()); // e.g. the My plan counter follows every checkbox
  startRouter();

  return {
    // The language suggests a country until the person picks one by hand.
    setLang(next) {
      setFlow({ lang: next });
      if (!flow.paisManual) setFlow({ pais: defaultCountry(next, navigator.language) });
      renderCurrent();
    },
    rerender: renderCurrent,
    resetAll() { resetFlow(); },
  };
}
