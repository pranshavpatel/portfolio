import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Sets up every scroll/intro animation for the current view (home or case
// study). Elements opt in through `data-a` attributes. Returns a cleanup.
export function initView(root, { onCase, reduce, intro }) {
  const $ = s => Array.from(root.querySelectorAll(s));
  const cleanups = [];

  const ctx = gsap.context(() => {
    gsap.fromTo($('[data-a="progress"]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    if (onCase) {
      gsap.from($('[data-a="csTitle"]'), { yPercent: 105, duration: 1.1, ease: 'expo.out' });
      gsap.from($('[data-a="cs"]'), { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
      return;
    }
    if (reduce) return;

    // Hero intro
    gsap.from($('[data-a="line"]'), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: intro ? 0 : 0.1 });
    gsap.from($('[data-a="fade"]'), { opacity: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5 });

    // Marquee: constant drift that speeds up with scroll velocity and follows scroll direction.
    const mq = gsap.to($('[data-a="marquee"]'), { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    let vel = 0, dir = 1;
    ScrollTrigger.create({ onUpdate: s => { vel = s.getVelocity(); if (Math.abs(vel) > 20) dir = vel < 0 ? -1 : 1; } });
    const mqTick = () => {
      const t = dir * (1 + Math.min(Math.abs(vel) / 500, 3));
      mq.timeScale(mq.timeScale() + (t - mq.timeScale()) * 0.06);
      vel *= 0.92;
    };
    gsap.ticker.add(mqTick);
    cleanups.push(() => gsap.ticker.remove(mqTick));

    // About paragraph: words light up as it scrolls past.
    const p = $('[data-a="scrub"]')[0];
    if (p) gsap.fromTo(p.querySelectorAll('[data-w]'), { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 55%', scrub: true } });

    // Toolkit shrinks and fades as the contact sheet slides over it.
    const under = $('[data-a="under"]')[0], contact = $('[data-a="contact"]')[0];
    if (under && contact) gsap.to(under, { scale: 0.93, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: contact, start: 'top bottom', end: 'top 15%', scrub: true } });

    $('[data-a="reveal"]').forEach(r => gsap.from(r, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: r, start: 'top 90%' } }));

    const fn = $('[data-a="footname"]')[0];
    if (fn) gsap.from(fn.querySelectorAll('[data-c]'), { yPercent: 110, rotate: 8, duration: 1.2, ease: 'expo.out', stagger: 0.035, scrollTrigger: { trigger: $('[data-a="bigname"]')[0], start: 'top 95%' } });

    // Email button pulls toward the cursor.
    const btn = $('[data-a="magnet"]')[0];
    if (btn) {
      const move = e => { const b = btn.getBoundingClientRect(); gsap.to(btn, { x: (e.clientX - b.left - b.width / 2) * 0.35, y: (e.clientY - b.top - b.height / 2) * 0.35, duration: 0.4, ease: 'power3' }); };
      const leave = () => gsap.to(btn, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)' });
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', leave);
      cleanups.push(() => { btn.removeEventListener('mousemove', move); btn.removeEventListener('mouseleave', leave); });
    }
  }, root);

  ScrollTrigger.refresh();
  return () => { cleanups.forEach(c => c()); ctx.revert(); };
}

export { gsap, ScrollTrigger };
