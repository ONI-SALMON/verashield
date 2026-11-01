import { h, icon } from '../dom.js';
import { flow, setDone, setFlow } from '../session.js';
import { renderCurrent } from '../router.js';
import { copyToClipboard } from '../clipboard.js';
import { composeMessage, defaultStyle, whatsappLink, withAdultsLine } from '../messages.js';
import { heading, stepNav } from './common.js';

let focusKey = '';

function rerenderKeepingFocus(key) {
  focusKey = key;
  renderCurrent();
  const again = focusKey && document.querySelector(`[data-key="${focusKey}"]`);
  if (again) again.focus({ preventScroll: true });
}

function choiceGroup(title, items, current, onPick, keyPrefix) {
  return h('div', { class: 'choice-block' },
    h('p', { class: 'choice-title', id: keyPrefix + '-title' }, title),
    h('div', { class: 'chip-row', role: 'group', 'aria-labelledby': keyPrefix + '-title' }, items.map((item) =>
      h('button', {
        type: 'button', class: 'chip' + (current === item.id ? ' is-selected' : ''), 'aria-pressed': String(current === item.id),
        'data-key': keyPrefix + '-' + item.id,
        on: { click: () => onPick(item.id, keyPrefix + '-' + item.id) },
      }, item.label, item.hint ? h('span', { class: 'chip-hint' }, item.hint) : null))));
}

export function printSheet(ctx, text) {
  const c = ctx.t.tell;
  const sheet = document.getElementById('print-sheet');
  sheet.replaceChildren(
    h('h1', {}, c.paper.title),
    h('p', { class: 'print-message' }, text),
    h('p', { class: 'print-link' }, withAdultsLine({ lang: flow.lang, pais: flow.pais, text: '' }).trim()),
    h('p', { class: 'print-footer' }, c.paper.footer),
  );
  window.print();
}

export function render(root, ctx) {
  const c = ctx.t.tell;
  const chrome = ctx.t.chrome;
  const caso = flow.caso || 'fake';
  const message = () => composeMessage({ lang: flow.lang, caso, style: flow.canal === 'paper' ? 'context' : flow.style, name: flow.name });

  const whoGroup = choiceGroup(c.whoTitle, c.who, flow.persona, (id, key) => {
    setFlow({ persona: id, style: defaultStyle(id) });
    rerenderKeepingFocus(key);
  }, 'who');
  const howGroup = choiceGroup(c.howTitle, c.how, flow.canal, (id, key) => {
    setFlow({ canal: id });
    rerenderKeepingFocus(key);
  }, 'how');

  const body = [];
  if (flow.canal === 'message') {
    body.push(choiceGroup(c.stylesTitle, c.styles, flow.style, (id, key) => {
      setFlow({ style: id });
      rerenderKeepingFocus(key);
    }, 'style'));

    const box = h('p', { class: 'message-box', id: 'message-text' }, message());
    const wa = h('a', { class: 'primary-btn wa-btn', id: 'wa-btn', target: '_blank', rel: 'noopener noreferrer' }, c.waButton);
    const copy = h('button', { type: 'button', class: 'secondary-btn', id: 'copy-btn' }, c.copyButton);
    const refresh = () => {
      const text = message();
      box.textContent = text;
      const link = whatsappLink({ lang: flow.lang, pais: flow.pais, text });
      if (link) wa.setAttribute('href', link); else wa.removeAttribute('href');
      wa.hidden = !link;
    };
    copy.addEventListener('click', async () => {
      const ok = await copyToClipboard(withAdultsLine({ lang: flow.lang, pais: flow.pais, text: message() }));
      copy.textContent = ok ? chrome.copied : c.copyButton;
      setTimeout(() => { copy.textContent = c.copyButton; }, 2000);
    });
    if (flow.style === 'adult') {
      body.push(h('label', { class: 'field' }, h('span', {}, c.nameLabel),
        h('input', {
          type: 'text', id: 'name-input', maxlength: '60', value: flow.name, placeholder: c.namePlaceholder, autocomplete: 'off',
          on: { input: (e) => { setFlow({ name: e.target.value }); refresh(); } },
        })));
    }
    body.push(box, h('div', { class: 'step-actions wrap' }, wa, copy), h('p', { class: 'resource-status' }, c.note));
    refresh();
  } else if (flow.canal === 'person') {
    body.push(h('div', { class: 'info-panel' },
      h('p', { class: 'info-card-title' }, c.inPerson.title),
      h('p', { class: 'quote' }, c.inPerson.opener),
      h('ul', { class: 'plain-list' }, c.inPerson.tips.map((tip) => h('li', {}, tip)))));
  } else {
    const text = message();
    body.push(h('p', { class: 'step-lead' }, c.paper.intro), h('p', { class: 'message-box' }, text),
      h('div', { class: 'step-actions wrap' },
        h('button', { type: 'button', class: 'primary-btn', id: 'print-btn', on: { click: () => printSheet(ctx, text) } }, chrome.print)));
  }

  const done = flow.done.has('tell');
  root.replaceChildren(
    heading(c.title),
    h('p', { class: 'step-lead' }, c.lead),
    whoGroup,
    h('p', { class: 'resource-status' }, c.whoHint),
    howGroup,
    ...body,
    h('label', { class: 'check-row' },
      h('input', { type: 'checkbox', id: 'tell-done', checked: done ? 'checked' : null, on: { change: (e) => setDone('tell', e.target.checked) } }),
      h('span', {}, ctx.t.plan.items.tell)),
    stepNav(ctx),
  );
}
