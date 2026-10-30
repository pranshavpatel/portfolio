import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// Dark screen that counts 0 → 100, then slides up. `onReveal` fires while it
// is still sliding so the hero intro overlaps the exit.
export default function Preloader({ onReveal }) {
  const ref = useRef(null);
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let revealed = false;
    const reveal = () => { if (revealed) return; revealed = true; onReveal(); };
    const o = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => setGone(true) })
      .to(o, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => setPct(Math.round(o.v)) })
      .to(ref.current, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=.15')
      .add(reveal, '-=.55');
    const fallback = setTimeout(() => { reveal(); setGone(true); }, 4500);
    return () => { tl.kill(); clearTimeout(fallback); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (gone) return null;
  return (
    <div ref={ref} className="loader" aria-hidden="true">
      <div className="loader__top"><span>Pranshav Patel</span><span>loading weights</span></div>
      <div className="loader__bottom">
        <span className="loader__year">portfolio, 2026</span>
        <span className="loader__pct">{String(pct).padStart(3, '0')}</span>
      </div>
    </div>
  );
}
