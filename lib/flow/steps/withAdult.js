// Step 5. The generated blocks (country information) are rendered here; the school letter form,
// the case fields and the PDF button keep living in their own containers of index.html because
// app.js owns their listeners.
import { h } from '../dom.js';
import { flow, setDone } from '../session.js';
import { countryBlock } from '../countryBlock.js';
import { adultsUrl } from '../messages.js';
import { heading, stepNav } from './common.js';

export function render(root, ctx) {
  const c = ctx.t.adult;
  const lang = flow.lang;
  const country = ctx.country;
  const letterAvailable = country.letter.available;

  root.querySelector('#adult-render').replaceChildren(
    heading(c.title),
    h('p', { class: 'step-lead' }, c.lead),
    h('p', {}, h('a', { href: adultsUrl(lang, flow.pais).replace(/^https:\/\/[^/]+/, ''), target: '_blank', rel: 'noopener noreferrer' }, c.adultsLinkText)),
    h('h3', {}, c.countryTitle),
    countryBlock({ country, lang, t: ctx.t, sections: ['removal', 'report', 'laws'] }),
    h('label', { class: 'check-row' },
      h('input', { type: 'checkbox', id: 'done-adult', checked: flow.done.has('adult') ? 'checked' : null, on: { change: (e) => setDone('adult', e.target.checked) } }),
      h('span', {}, ctx.t.plan.items.adult)),
    h('h3', {}, c.schoolTitle),
    h('p', { class: 'resource-text' }, letterAvailable ? c.schoolLead : c.schoolPending),
  );

  root.querySelector('#adult-letter-host').hidden = !letterAvailable;
  root.querySelector('#adult-pdf-lead').textContent = `${c.evidenceLead} ${c.evidenceNone}`;
  root.querySelector('#adult-pdf-title').textContent = c.evidenceTitle;
  root.querySelector('#adult-nav').replaceChildren(stepNav(ctx));
}
