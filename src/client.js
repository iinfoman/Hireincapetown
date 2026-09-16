import './styles.css';
import { openState } from './lib/hours.js';

// Everything the public pages need at runtime. Deliberately tiny: "open now"
// is the only thing that genuinely cannot be decided at build time.
function paintOpenState() {
  document.querySelectorAll('.js-open').forEach((el) => {
    let hours = null;
    try { hours = JSON.parse(el.dataset.hours || 'null'); } catch { /* leave null */ }
    const { open, label } = openState(hours);
    const dot = el.querySelector('.js-open-dot');
    const text = el.querySelector('.js-open-label');
    if (dot) dot.className = `js-open-dot block h-1.5 w-1.5 rounded-full ${open ? 'bg-open' : 'bg-ink-3'}`;
    if (text) {
      text.className = `js-open-label text-[12.5px] font-semibold ${open ? 'text-trust' : 'text-ink-2'}`;
      text.textContent = label;
    }
  });
}

// Sections marked data-open-only really mean it: hide whoever is shut.
// Without JS every listing shows, which is the right fallback for a directory.
function filterOpenOnly() {
  document.querySelectorAll('[data-open-only]').forEach((list) => {
    let shown = 0;
    // Direct children only: each card also contains an OpenNow span carrying
    // its own data-hours, which would otherwise be counted a second time.
    list.querySelectorAll(':scope > [data-hours]').forEach((item) => {
      let hours = null;
      try { hours = JSON.parse(item.dataset.hours || 'null'); } catch { /* leave null */ }
      const { open } = openState(hours);
      item.hidden = !open;
      if (open) shown++;
    });

    const counter = document.querySelector('.js-open-count');
    if (counter) {
      counter.textContent = shown === 0
        ? `Nobody is open right now — all ${counter.dataset.total} listings`
        : `${shown} business${shown === 1 ? '' : 'es'}`;
    }
    // If literally nobody is open, showing an empty section is worse than
    // showing the full list.
    if (shown === 0) list.querySelectorAll(':scope > [data-hours]').forEach((i) => { i.hidden = false; });
  });
}

paintOpenState();
filterOpenOnly();
