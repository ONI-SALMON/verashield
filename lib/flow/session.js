// In-memory state of the flow. Nothing here is written to localStorage, sessionStorage or cookies:
// closing the tab erases it. Shared by app.js and the steps so they never import each other.
function initial() {
  return {
    step: 'home',
    stack: ['home'],
    caso: '',          // '' | fake | real | threat | other
    persona: 'parent', // parent | family | school | other
    canal: 'message',  // message | person | paper
    style: 'short',    // short | context | adult
    name: '',          // optional name used in the "adult" message
    platform: '',      // platform id chosen in the "stop" step
    link: '',          // optional link typed for the form text
    pais: 'mx',
    paisManual: false,
    lang: 'es',
    done: new Set(),
  };
}

export const flow = initial();
const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(flow);
}

export function setFlow(patch) {
  Object.assign(flow, patch);
  notify();
}

export function setDone(id, on = true) {
  if (on) flow.done.add(id); else flow.done.delete(id);
  notify();
}

// New case: clears the personal choices but keeps language and country.
export function resetFlow() {
  const keep = { lang: flow.lang, pais: flow.pais, paisManual: flow.paisManual };
  Object.assign(flow, initial(), keep);
  notify();
}
