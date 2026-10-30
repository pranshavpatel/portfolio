import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import * as data from './data.js';
import { asset, config } from './config.js';
import { gsap, ScrollTrigger, initView } from './motion.js';
import { prefersReducedMotion, scrollToSelector, scrollToY, setLenis } from './scroll.js';
import Crosshair from './components/Crosshair.jsx';
import Preloader from './components/Preloader.jsx';
import ScrambleLink from './components/ScrambleLink.jsx';
import Hero from './sections/Hero.jsx';
import { About, Education } from './sections/About.jsx';
import Work from './sections/Work.jsx';
import Experience from './sections/Experience.jsx';
import Toolkit from './sections/Toolkit.jsx';
import Contact from './sections/Contact.jsx';
import CaseStudy from './sections/CaseStudy.jsx';

const { profile, projects, experience, education, skills } = data;
const slugFromHash = () => { const h = location.hash.slice(1); return projects.some(p => p.slug === h) ? h : null; };

export default function App() {
  const rootRef = useRef(null), wipeRef = useRef(null);
  const [reduce] = useState(prefersReducedMotion);
  const usePreloader = config.showPreloader && !reduce;
  const [booted, setBooted] = useState(!usePreloader);
  // `n` bumps on every page change so the view effect re-runs even for the same slug.
  const [view, setView] = useState(() => ({ slug: slugFromHash(), n: 0 }));
  const pending = useRef(null);
  const introDone = useRef(false);

  // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    gsap.set(wipeRef.current, { yPercent: 100 });
    if (!config.smoothScroll || reduce) return undefined;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = t => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); setLenis(null); };
  }, [reduce]);

  // (Re)build the view's animations once booted and after every page swap.
  useLayoutEffect(() => {
    if (!booted) return undefined;
    const swap = pending.current; pending.current = null;
    if (swap) {
      history.replaceState(null, '', view.slug ? '#' + view.slug : location.pathname + location.search);
      scrollToY(0, { immediate: true });
    }
    const cleanup = initView(rootRef.current, { onCase: !!view.slug, reduce, intro: !introDone.current });
    introDone.current = true;
    if (swap) {
      if (swap.after) setTimeout(swap.after, 60);
      if (!reduce) gsap.to(wipeRef.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut', onComplete: () => gsap.set(wipeRef.current, { yPercent: 100 }) });
    }
    return cleanup;
  }, [view, booted, reduce]);

  // Page change behind a full-screen wipe.
  const go = (slug, after) => {
    const swap = () => { pending.current = { after }; setView(v => ({ slug, n: v.n + 1 })); };
    if (reduce) return swap();
    gsap.fromTo(wipeRef.current, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut', onComplete: swap });
  };
  const nav = target => e => {
    e.preventDefault();
    const scroll = () => (target === 0 ? scrollToY(0) : scrollToSelector(target));
    if (view.slug) go(null, scroll); else scroll();
  };

  const idx = projects.findIndex(p => p.slug === view.slug);

  return (
    <div ref={rootRef} className="root">
      {usePreloader && <Preloader onReveal={() => setBooted(true)} />}
      <Crosshair color="#ffffff" blendMode="difference" opacity={0.6} fade={0.45} thickness={1} smoothing={0.22} targetEffect="lock" targetSelector="a, button, [data-crosshair-target]" />
      <div data-a="progress" className="progress" />
      <div ref={wipeRef} className="wipe" />

      <header className="nav">
        <a href="#top" onClick={nav(0)}>PP</a>
        <nav>
          <ScrambleLink label="Work" href="#work" onClick={nav('#work')} />
          <ScrambleLink label="About" href="#about" onClick={nav('#about')} />
          <ScrambleLink label="Contact" href="#contact" onClick={nav('#contact')} />
          <a href={asset(profile.resume)} target="_blank" rel="noreferrer">Résumé ↓</a>
        </nav>
      </header>

      {idx < 0 ? (
        <main id="top" key={'home' + view.n}>
          <Hero />
          <About />
          <Education education={education} />
          <Work projects={projects} />
          <Experience experience={experience} onOpenCase={slug => go(slug)} />
          <Toolkit skills={skills} />
          <Contact profile={profile} />
        </main>
      ) : (
        <CaseStudy key={view.slug + view.n} project={projects[idx]} next={projects[(idx + 1) % projects.length]} onBack={nav('#work')} onOpen={slug => go(slug)} />
      )}
    </div>
  );
}
