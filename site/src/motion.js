import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clamp = gsap.utils.clamp(-1, 1);

// Scroll-triggered entrances shared by the home page and case studies. Each
// group is batched so elements entering together cascade instead of popping in.
function reveals($) {
  // Blocks rise and fade in.
  const blocks = $('[data-a="reveal"]');
  gsap.set(blocks, { y: 48, opacity: 0 });
  ScrollTrigger.batch(blocks, {
    start: 'top 88%', once: true,
    onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true })
  });

  // Big headings wipe up from behind their own baseline.
  $('[data-a="heading"]').forEach(h => {
    gsap.fromTo(h, { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 35 }, {
      clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1.2, ease: 'expo.out', clearProps: 'clipPath',
      scrollTrigger: { trigger: h, start: 'top 85%', once: true }
    });
  });

  // Ruled rows: the rule draws across, then the row's columns follow it in.
  const rows = $('[data-a="row"]');
  rows.forEach(r => { gsap.set(r, { '--rule': 0 }); gsap.set(r.children, { y: 28, opacity: 0 }); });
  ScrollTrigger.batch(rows, {
    start: 'top 88%', once: true,
    onEnter: els => els.forEach((r, i) => {
      gsap.timeline({ delay: i * 0.12 })
        .to(r, { '--rule': 1, duration: 1.1, ease: 'expo.inOut' })
        .to(r.children, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.35);
    })
  });
}

// Sets up every scroll/intro animation for the current view (home or case
// study). Elements opt in through `data-a` attributes. Returns a cleanup.
export function initView(root, { onCase, reduce, intro }) {
  const $ = s => Array.from(root.querySelectorAll(s));
  const cleanups = [];

  const ctx = gsap.context(() => {
    gsap.fromTo($('[data-a="progress"]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    if (reduce) return;

    if (onCase) {
      gsap.from($('[data-a="csTitle"]'), { yPercent: 105, duration: 1.1, ease: 'expo.out' });
      gsap.from($('[data-a="cs"]'), { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
      reveals($);
      return;
    }

    // Hero intro
    gsap.from($('[data-a="line"]'), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: intro ? 0 : 0.1 });
    gsap.from($('[data-a="fade"]'), { opacity: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5 });

    // Hero exit: the title lags behind the scroll (second line more than the
    // first) and dims, so the marquee band slides over it.
    const hero = $('[data-a="hero"]')[0];
    if (hero) {
      const out = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      $('[data-a="heroMask"]').forEach((m, i) => gsap.to(m, { yPercent: 40 + i * 30, ease: 'none', scrollTrigger: out }));
      gsap.to($('[data-a="heroTitle"]'), { opacity: 0.15, ease: 'none', scrollTrigger: out });
      gsap.to($('[data-a="fade"] > *'), { opacity: 0, y: -30, ease: 'none', scrollTrigger: { ...out, end: 'center top' } });
      gsap.to(hero, { backgroundPositionY: '-=120px', ease: 'none', scrollTrigger: out });
    }

    // Marquee: constant drift that speeds up with scroll velocity, follows
    // scroll direction, and leans into fast scrolls.
    const track = $('[data-a="marquee"]');
    const mq = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    const setSkew = gsap.quickSetter(track, 'skewX', 'deg');
    let vel = 0, dir = 1, skew = 0;
    ScrollTrigger.create({ onUpdate: s => { vel = s.getVelocity(); if (Math.abs(vel) > 20) dir = vel < 0 ? -1 : 1; } });
    const mqTick = () => {
      const t = dir * (1 + Math.min(Math.abs(vel) / 500, 3));
      mq.timeScale(mq.timeScale() + (t - mq.timeScale()) * 0.06);
      skew += (clamp(-vel / 3000) * 7 - skew) * 0.1;
      setSkew(skew);
      vel *= 0.92;
    };
    gsap.ticker.add(mqTick);
    cleanups.push(() => gsap.ticker.remove(mqTick));

    // About paragraph: words light up as it scrolls past.
    const p = $('[data-a="scrub"]')[0];
    if (p) gsap.fromTo(p.querySelectorAll('[data-w]'), { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 55%', scrub: true } });

    // Work: the dark panel opens out to full width as it arrives, then the
    // card deck rises into it.
    const work = $('[data-a="work"]')[0];
    if (work) {
      const gx = parseFloat(getComputedStyle(work.querySelector('.work__head')).paddingLeft) || 32;
      gsap.fromTo(work, { clipPath: `inset(0px ${gx}px 0px ${gx}px round 28px)` }, {
        clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'none',
        scrollTrigger: { trigger: work, start: 'top bottom', end: 'top 20%', scrub: 0.4 }
      });
      gsap.from($('[data-a="deck"]'), { y: 90, scale: 0.94, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: work, start: 'top 55%', once: true } });
    }

    // Toolkit columns rise in one after another.
    const cols = $('[data-a="col"]');
    if (cols.length) gsap.from(cols, { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: cols[0], start: 'top 85%', once: true } });

    // Toolkit shrinks and fades as the contact sheet slides over it.
    const under = $('[data-a="under"]')[0], contact = $('[data-a="contact"]')[0];
    if (under && contact) gsap.to(under, { scale: 0.93, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: contact, start: 'top bottom', end: 'top 15%', scrub: true } });

    reveals($);

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
