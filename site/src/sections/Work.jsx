import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import HoloCard from '../components/HoloCard.jsx';
import { gsap, ScrollTrigger } from '../motion.js';
import { scrollToY } from '../scroll.js';
import { asset, config } from '../config.js';
import { useWindowWidth } from '../hooks.js';

const GITHUB = 'https://github.com/pranshavpatel';

const cardWidth = w => Math.round(w < 700 ? w * 0.82 : Math.min(760, w * 0.6));

function buildItems(projects) {
  return projects
    .filter(p => p.personal !== false)
    .map(p => ({
      src: asset('thumbs/' + p.slug + '.png'), alt: p.title + ': ' + p.kind, title: p.title, subtitle: p.kind, slug: p.slug, n: p.n,
      summary: p.summary, stackStr: p.stack.join(' · '), results: p.results, highlights: p.results.slice(0, 2), sections: p.sections, hasDetails: true
    }))
    .concat([{
      src: asset('thumbs/github.png'), alt: 'More projects on GitHub', title: 'More on GitHub', subtitle: 'github.com/pranshavpatel', n: '04',
      summary: 'Source code for these projects and other experiments.', stackStr: 'github.com/pranshavpatel', results: [], highlights: [], sections: [], hasDetails: false
    }]);
}

// Personal projects as a looping deck of holo cards, with an info panel for
// the centre card and an in-place write-up that opens below it.
export default function Work({ projects }) {
  const items = useMemo(() => buildItems(projects), [projects]);
  const n = items.length;
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const vw = useWindowWidth();
  const sectionRef = useRef(null), panelRef = useRef(null), detailsRef = useRef(null);
  const drag = useRef({ x0: null, dragged: false });

  const cur = items[active];
  const showDetails = open && cur.hasDetails;
  const select = i => setActive(((i % n) + n) % n);
  const step = d => setActive(a => (((a + d) % n) + n) % n);

  const openDetails = next => {
    setOpen(next);
    if (next) {
      setTimeout(() => {
        const d = detailsRef.current; if (!d) return;
        scrollToY(d.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, { duration: 1.1 });
      }, 60);
    } else {
      const s = sectionRef.current;
      if (s && s.getBoundingClientRect().top < -40) scrollToY(s.getBoundingClientRect().top + window.scrollY, { duration: 1 });
    }
  };
  const activate = () => { if (!cur.hasDetails) return window.open(GITHUB, '_blank'); openDetails(!open); };

  // ← → move the deck while the section is in the middle of the screen.
  useEffect(() => {
    const onKey = e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const r = sectionRef.current?.getBoundingClientRect();
      if (r && r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4) { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  // Write-up opening / closing: animate in and let ScrollTrigger re-measure.
  const prevOpen = useRef(showDetails);
  useLayoutEffect(() => {
    if (prevOpen.current === showDetails) return;
    prevOpen.current = showDetails;
    if (showDetails && detailsRef.current) gsap.from(detailsRef.current.children, { y: 24, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 });
    ScrollTrigger.refresh();
  }, [showDetails]);

  // Changing project: slide the panel (and an open write-up) in fresh.
  const prevActive = useRef(active);
  useLayoutEffect(() => {
    if (prevActive.current === active) return;
    prevActive.current = active;
    if (panelRef.current) gsap.fromTo(panelRef.current.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, overwrite: true });
    if (detailsRef.current) gsap.fromTo(detailsRef.current.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, overwrite: true });
  }, [active]);

  const cw = cardWidth(vw);
  const half = Math.floor(n / 2);

  return (
    <section id="work" ref={sectionRef} className="work">
      <div className="work__head">
        <h2 className="work__title">Personal <em className="serif-em accent-light">projects</em></h2>
        <div className="work__controls">
          <span className="work__count"><b>{cur.n}</b> / {String(n).padStart(2, '0')}</span>
          <div className="work__arrows">
            <button className="round-btn" onClick={() => step(-1)} aria-label="Previous project">←</button>
            <button className="round-btn" onClick={() => step(1)} aria-label="Next project">→</button>
          </div>
        </div>
      </div>

      <div className="deck" style={{ height: Math.round(cw / 1.6 + 48) }}
        onPointerDown={e => { drag.current.x0 = e.clientX; drag.current.dragged = false; }}
        onPointerUp={e => {
          const d = drag.current; if (d.x0 == null) return;
          const dx = e.clientX - d.x0; d.x0 = null;
          if (Math.abs(dx) > 50) { d.dragged = true; step(dx < 0 ? 1 : -1); setTimeout(() => { d.dragged = false; }, 50); }
        }}>
        {items.map((it, i) => {
          const off = ((i - active + n + half) % n) - half, ab = Math.abs(off), centre = off === 0;
          return (
            <div key={it.title} className="deck__card" aria-label={it.alt} data-crosshair-target={centre ? 'active' : undefined}
              onClick={() => { if (drag.current.dragged) return; if (!centre) return select(i); activate(); }}
              style={{
                width: cw, zIndex: 10 - ab, opacity: centre ? 1 : ab === 1 ? 0.45 : 0, pointerEvents: ab > 1 ? 'none' : 'auto',
                transform: `translate(-50%,-50%) translateX(${Math.round(off * cw * 0.84)}px) scale(${centre ? 1 : 0.72})`
              }}>
              <HoloCard image={it.src} alt={it.alt} preset={config.holoPreset} intensity={centre ? config.holoIntensity : 0.25} width={cw}
                radius={8} frame={2.5} edgeSparkle={0.7} glare={0.45} tiltMax={centre ? 10 : 4} hoverScale={1.02} style={{ display: 'block' }} />
            </div>
          );
        })}
      </div>

      <div className="tabs">
        {items.map((it, i) => (
          <button key={it.title} className={'tab' + (i === active ? ' is-active' : '')} onClick={() => select(i)}>
            <span className="tab__bar"><span className="tab__fill" /></span>
            <span className="tab__label">({it.n}) {it.title}</span>
          </button>
        ))}
      </div>

      <div ref={panelRef} className="cpanel">
        <div className="cpanel__col" style={{ gap: 8 }}>
          <span className="cpanel__title">{cur.title}</span>
          <span className="cpanel__subtitle">{cur.subtitle}</span>
        </div>
        <div className="cpanel__col" style={{ gap: 14 }}>
          <p className="cpanel__summary">{cur.summary}</p>
          <span className="cpanel__stack">{cur.stackStr}</span>
        </div>
        <div className="cpanel__col" style={{ gap: 20, alignItems: 'flex-start' }}>
          <div className="cpanel__highlights">
            {cur.highlights.map(r => <div key={r.l} className="stat"><span className="stat__v">{r.v}</span><span className="stat__l">{r.l}</span></div>)}
          </div>
          <button className="cta" onClick={activate}>{!cur.hasDetails ? 'Open GitHub ↗' : open ? 'Hide the write-up ↑' : 'Read the write-up ↓'}</button>
        </div>
      </div>

      {showDetails && (
        <div ref={detailsRef} className="details">
          <div className="results">
            {cur.results.map(r => <div key={r.l} className="result"><span className="result__v">{r.v}</span><span className="result__l">{r.l}</span></div>)}
          </div>
          {cur.sections.map(sec => (
            <div key={sec.h} className="writeup">
              <h3>{sec.h}</h3>
              <div className="writeup__body">{sec.p.map((para, i) => <p key={i}>{para}</p>)}</div>
            </div>
          ))}
          <div className="details__actions">
            <button className="pill-btn" onClick={() => openDetails(false)}>Close ↑</button>
            <button className="pill-btn" onClick={() => step(1)}>Next project →</button>
          </div>
        </div>
      )}
    </section>
  );
}
