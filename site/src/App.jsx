import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import * as data from './data.js';
import { asset, config } from './config.js';
import { prefersReducedMotion, scrollToSelector, scrollToY, setLenis } from './scroll.js';
import { gsap } from './motion.js';
import Header from './components/Header.jsx';
import Story from './story/Story.jsx';

const { profile, projects, about, experience, education, skills } = data;
// Places a link can point at (e.g. …/#contact for the letter).
const ANCHORS = ['work', 'work-2', 'work-3', 'about', 'experience', 'education', 'toolkit', 'contact', 'reply'];

export default function App() {
  const [reduce] = useState(prefersReducedMotion);
  const [chapter, setChapter] = useState(0);

  // Smooth scrolling, driven by GSAP's ticker so the scene stays in step.
  useEffect(() => {
    if (reduce || !config.smoothScroll) return undefined;
    const lenis = new Lenis({ lerp: 0.1, syncTouch: false });
    const tick = time => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); setLenis(null); };
  }, [reduce]);

  // If the link pointed at a place in the story, go there (once the fonts
  // are in, so the page has its final height).
  useEffect(() => {
    const h = location.hash.slice(1);
    if (!ANCHORS.includes(h)) return undefined;
    let alive = true, t = 0;
    document.fonts.ready.then(() => { if (alive) t = setTimeout(() => scrollToSelector('#' + h), 200); });
    return () => { alive = false; clearTimeout(t); };
  }, []);

  const nav = target => e => {
    e.preventDefault();
    if (target === 0) scrollToY(0); else scrollToSelector(target);
  };
  // "Write to me": go to the reply card and put the cursor in its first field.
  const write = () => {
    scrollToSelector('#contact');
    setTimeout(() => document.getElementById('reply-name')?.focus({ preventScroll: true }), 1300);
  };

  return (
    <div className="root">
      <Header chapter={chapter} onNav={nav} resume={asset(profile.resume)} onWrite={write} />
      <main id="top">
        <Story profile={profile} projects={projects} about={about} experience={experience} education={education} skills={skills}
          reduce={reduce} onChapter={setChapter} />
      </main>
    </div>
  );
}
