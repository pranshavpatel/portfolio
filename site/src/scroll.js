// Single place to scroll the page, through Lenis when it is running.
let lenis = null;

export const setLenis = instance => { lenis = instance; };

export function scrollToY(y, { duration, immediate = false } = {}) {
  if (lenis) lenis.scrollTo(y, { duration, immediate });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

export function scrollToSelector(selector, offset = -60) {
  const el = document.querySelector(selector);
  if (!el) return;
  // resize() first: after a page swap Lenis may still hold the old page height and clamp.
  if (lenis) { lenis.resize(); lenis.scrollTo(el, { offset }); }
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
