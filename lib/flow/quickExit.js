// "Quick exit": clears the in-memory state, empties the page and replaces the current history entry
// with a neutral site. It cannot erase the browser history; the interface says so.
import { QUICK_EXIT_URL } from '../siteConfig.js';

export function initQuickExit({ onExit }) {
  const button = document.getElementById('quick-exit');

  function exit() {
    try { onExit(); } catch { /* leaving matters more than cleaning up */ }
    const root = document.getElementById('flow-root');
    if (root) root.replaceChildren();
    history.replaceState(null, '', location.pathname);
    location.replace(QUICK_EXIT_URL);
  }

  button.addEventListener('click', exit);

  // Esc twice within a second. Registered in the capture phase on purpose: the content guard modal
  // swallows Escape, and this must still work while it is open.
  let last = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const now = Date.now();
    if (now - last < 1000) exit();
    last = now;
  }, true);

  // A page restored from the back/forward cache must not show the old content again.
  window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
}
