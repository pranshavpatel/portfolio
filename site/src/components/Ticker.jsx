import { useEffect, useState } from 'react';

// Rotating word: rolls up one slot every 2.2s, then snaps back to the start
// from a duplicate of the first word so the loop looks seamless.
export default function Ticker({ words }) {
  const [tick, setTick] = useState(0);
  const [jump, setJump] = useState(false);

  useEffect(() => {
    let t = 0, reset;
    const iv = setInterval(() => {
      t += 1; setTick(t); setJump(false);
      if (t >= words.length) reset = setTimeout(() => { t = 0; setTick(0); setJump(true); }, 950);
    }, 2200);
    return () => { clearInterval(iv); clearTimeout(reset); };
  }, [words.length]);

  return (
    <span className="ticker">
      <span className="ticker__track" style={{ transform: `translateY(${tick * -1.2}em)`, transition: jump ? 'none' : 'transform .9s cubic-bezier(.85,0,.15,1)' }}>
        {[...words, words[0]].map((w, i) => <span key={i} aria-hidden={i > 0 || undefined}>{w}</span>)}
      </span>
    </span>
  );
}
