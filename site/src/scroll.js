// Single place to scroll the page, through Lenis when it is running.
let lenis = null;

export const setLenis = instance => { lenis = instance; };

export function scrollToY(y, { duration, immediate = false } = {}) {
  if (lenis) lenis.scrollTo(y, { duration, immediate, userData: { initiator: 'nav' } });
  else window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
}

// Where an element should sit when we land on it: its top on the reading line
// (its CSS scroll-margin-top, so layout decides, not this file).
export function landY(el) {
  return el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
}

// Scrolls to a section, landing on its first landing point if it has one.
export function scrollToSelector(selector) {
  const sec = document.querySelector(selector);
  if (!sec) return;
  const el = sec.matches('[data-land]') ? sec : sec.querySelector('[data-land]') || sec;
  // resize() first: after a page swap Lenis may still hold the old page height and clamp.
  if (lenis) lenis.resize();
  scrollToY(landY(el));
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('view') === 'page';
