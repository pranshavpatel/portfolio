import { useEffect, useRef, useState } from 'react';
import { gsap } from '../motion.js';
import { asset } from '../config.js';
import { scrollToSelector } from '../scroll.js';
import { monitorTransform } from './monitorTransform.js';
import MacScreen, { ProjectWindow } from './MacScreen.jsx';
import Notebook from './Notebook.jsx';

// The story, told by one camera. It starts on the whole desk, pushes into the
// Macintosh (the projects are a document on its screen, read by scrolling),
// then lifts over the notebook and flies into a page, and the rest is written
// on the pages that follow. Positions are in screen heights of scroll from
// the top of the track.
const BEATS = { hero: 0.45, mac: 1.45, macEnd: 4.45, book: 5.5, end: 6 };
// The document turns to the next project over these stretches of scroll, and
// the Finder list's buttons land in the middle of each project's hold.
const TURNS = [[2.15, 2.75], [3.15, 3.75]], PROJECT_AT = [1.85, 2.95, 3.95];
// Help balloons on the room: text, the world point it points at, the offset
// (px) of the balloon from that point, and where a click on it goes.
const MARKS = [
  { text: 'My projects are in here', at: [1.6, 14.6, 0.2], dx: 60, dy: 20, to: '#work' },
  { text: 'The rest is in\nmy notebook', at: [11.6, 7.75, -0.4], dx: 36, dy: -72, to: '#about' },
  { clock: true, at: [-2.95, 19.3, -4.9], dx: -44, dy: -30 }
];
const SCREEN_W = 960, SCREEN_H = 640;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };

// The time in Raleigh, as the Mac's menu bar shows it.
function useRaleighTime() {
  const read = () => new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(new Date());
  const [time, setTime] = useState(read);
  useEffect(() => { const id = setInterval(() => setTime(read()), 15000); return () => clearInterval(id); }, []);
  return time;
}
const raleighParts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
function setClock(scene) {
  const t = Object.fromEntries(raleighParts.formatToParts(new Date()).map(p => [p.type, +p.value]));
  scene.setClock(t.hour, t.minute, t.second);
}

function Hero({ profile, hint }) {
  return (
    <div className="hero" data-layer="hero">
      <span className="hero__eyebrow">CS master’s @ NC State · Raleigh, NC</span>
      <h1>Pranshav Patel</h1>
      <p className="hero__builds">builds <mark>LLM engines</mark>, <mark>RAG apps</mark> &amp; <mark>AI agents</mark></p>
      <p className="hero__open">Open to AI, software &amp; data roles from May 2027.</p>
      <div className="hero__links">
        <a className="mac-btn" href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        <a className="mac-btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a className="mac-btn" href={'mailto:' + profile.email}>Email</a>
      </div>
      {hint && <p className="hero__hint" aria-hidden="true">Scroll to pull up a chair ↓</p>}
    </div>
  );
}

function Mark({ m, time }) {
  const text = m.clock ? `${time} in Raleigh` : m.text;
  const style = { transform: `translate(calc(${m.dx}px + ${m.dx < 0 ? '-100%' : '0px'}), calc(${m.dy}px - 50%))` };
  return (
    <div data-mark="" className="mark" aria-hidden="true">
      <svg width="1" height="1"><path d={`M ${m.dx} ${m.dy} L 0 0`} /><circle r="3.5" /></svg>
      {m.to ? <button type="button" tabIndex={-1} style={style} onClick={() => scrollToSelector(m.to)}>{text}</button> : <span style={style}>{text}</span>}
    </div>
  );
}

// Wide screens: the desk is pinned and the scroll drives the camera.
function Pinned({ profile, projects, onChapter, onFail, children }) {
  const rootRef = useRef(null), canvasRef = useRef(null), overlayRef = useRef(null);
  const [index, setIndex] = useState(0), [live, setLive] = useState(false);
  const time = useRaleighTime();

  useEffect(() => {
    let alive = true, stop;
    import('./DeskScene.js').then(({ DeskScene }) => {
      if (!alive) return;
      let scene;
      try { scene = new DeskScene(canvasRef.current); } catch { onFail(); return; }
      const root = rootRef.current, track = root.querySelector('.track'), overlay = overlayRef.current;
      const hero = root.querySelector('[data-layer="hero"]'), marks = [...root.querySelectorAll('[data-mark]')];
      let trackTop = 0, contactTop = Infinity;
      const measure = () => {
        const W = innerWidth, H = innerHeight;
        // The room keeps clear of the headline; the Mac keeps clear of the menu bar.
        scene.frames = {
          room: W >= 1100 ? { l: W * 0.36, t: 50, r: 0, b: 0 } : { l: 0, t: Math.min(H * 0.38, 290), r: 0, b: 0 },
          mac: { l: 20, t: 52, r: 20, b: 22 }
        };
        // On short screens the tube fills more of the view, so its text stays readable.
        scene.shots.mac.frame = H < 820 ? [4.46, 2.98] : [4.74, 3.3];
        scene.fits = {};
        scene.resize();
        trackTop = track.getBoundingClientRect().top + scrollY;
        contactTop = (document.getElementById('contact')?.getBoundingClientRect().top ?? Infinity) + scrollY;
      };
      const observer = new ResizeObserver(measure);
      observer.observe(root);
      window.addEventListener('resize', measure);
      measure();
      const pointer = e => scene.pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
      window.addEventListener('pointermove', pointer, { passive: true });

      const rest = scene.pointer.clone().set(0, 0);
      let lastS = -1, lastY = -1, lastIndex = 0, lastLive = false, lastChapter = 0, lastClock = -1, helloFrom = null;
      const tick = time => {
        if (document.hidden) return;
        const y = scrollY, s = clamp((y - trackTop) / innerHeight, 0, BEATS.end + 1);
        if (y !== lastY) {
          lastY = y;
          const chapter = s < 1 ? 0 : s < BEATS.book - 0.2 ? 1 : y + innerHeight * 0.5 > contactTop ? 3 : 2;
          if (chapter !== lastChapter) { lastChapter = chapter; onChapter?.(chapter); }
        }
        if (s <= BEATS.end + 0.99) {
          // Signs of life: steam, the greeting being written, the wall clock.
          scene.animate(time, s < BEATS.mac);
          if (helloFrom === null) helloFrom = time + 0.6;
          if (s < 0.6) scene.setScreen('hello', clamp((time - helloFrom) / 1.4)); else scene.setScreen('desk');
          const sec = Math.floor(Date.now() / 1000);
          if (sec !== lastClock) { lastClock = sec; setClock(scene); }
        }
        // The camera leans a little with the pointer while the room is in view.
        const lx = scene.look.x, ly = scene.look.y;
        scene.look.lerp(s < BEATS.hero + 0.1 ? scene.pointer : rest, 0.05);
        const leaned = Math.abs(lx - scene.look.x) + Math.abs(ly - scene.look.y) > 1e-4;
        if (s === lastS && !leaned && !scene.dirty) return;
        lastS = s;

        if (s < BEATS.hero) scene.setView('room', 'room', 0);
        else if (s < BEATS.mac) scene.setView('room', 'mac', ease((s - BEATS.hero) / (BEATS.mac - BEATS.hero)));
        else if (s < BEATS.macEnd) scene.setView('mac', 'mac', 0);
        else if (s < BEATS.book) scene.setView('mac', 'book', ease((s - BEATS.macEnd) / (BEATS.book - BEATS.macEnd)), [1.5, 5, 9]);
        else scene.setView('book', 'book', 0);
        scene.render();

        // Headline and help balloons, on the room shot only.
        const heroA = 1 - smooth(0.04, 0.34, s);
        hero.style.opacity = heroA;
        hero.style.visibility = heroA > 0 ? 'visible' : 'hidden';
        marks.forEach((el, i) => {
          const pt = scene.point(...MARKS[i].at), markA = 1 - smooth(0.02, 0.26, s);
          el.style.opacity = markA;
          el.style.visibility = markA > 0 ? 'visible' : 'hidden';
          el.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
        });

        // The live interface, kept exactly on the tube. It replaces the
        // greeting as the camera starts in, and is put away as it leaves.
        const a = smooth(0.5, 0.62, s) * (1 - smooth(BEATS.macEnd + 0.02, BEATS.macEnd + 0.24, s));
        overlay.style.opacity = a;
        overlay.style.visibility = a > 0 ? 'visible' : 'hidden';
        if (a > 0) overlay.style.transform = monitorTransform(scene.screenQuad(), SCREEN_W, SCREEN_H);
        // The document scrolls from one project to the next with the page.
        const reel = TURNS.reduce((sum, [from, to]) => sum + ease((s - from) / (to - from)), 0);
        overlay.style.setProperty('--reel', reel.toFixed(4));
        const isLive = s > BEATS.mac - 0.1 && s < BEATS.macEnd + 0.05;
        if (isLive !== lastLive) { lastLive = isLive; setLive(isLive); }
        const i = Math.round(reel);
        if (i !== lastIndex) { lastIndex = i; setIndex(i); }
      };
      gsap.ticker.add(tick);
      stop = () => { gsap.ticker.remove(tick); observer.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('pointermove', pointer); scene.dispose(); };
    }).catch(() => { if (alive) onFail(); });
    return () => { alive = false; stop?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={rootRef} className="story story--pinned">
      <div className="track" style={{ '--beats': BEATS.end }}>
        <div className="stage">
          <canvas ref={canvasRef} className="stage__canvas" aria-hidden="true" />
          <div ref={overlayRef} className="stage__screen" inert={!live} aria-hidden={!live}>
            <MacScreen projects={projects} index={index} profile={profile} resume={asset(profile.resume)} time={time}
              onSelect={k => scrollToSelector(k ? `#work-${k + 1}` : '#work')} />
          </div>
          {MARKS.map((m, i) => <Mark key={i} m={m} time={time} />)}
          <Hero profile={profile} hint />
        </div>
        {PROJECT_AT.map((at, k) => <i key={at} id={k ? `work-${k + 1}` : 'work'} className="track__anchor" data-land="" style={{ top: at * 100 + 'vh' }} />)}
      </div>
      {children}
    </div>
  );
}

// Phones, reduced motion and no WebGL: the same things in the page's own
// order. The desk is a picture at the top, and each project is a window.
function Flow({ profile, projects, onChapter, still, bare, children }) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (bare) return undefined;
    let alive = true, stop;
    import('./DeskScene.js').then(({ DeskScene }) => {
      if (!alive) return;
      let scene;
      try { scene = new DeskScene(canvasRef.current); } catch { setFailed(true); return; }
      const canvas = canvasRef.current;
      scene.frames = { room: { l: 12, t: 8, r: 12, b: 16 } };
      const frame = () => { scene.resize(); scene.setView('room', 'room', 0); scene.setScreen('hello', 1); setClock(scene); scene.render(); };
      const observer = new ResizeObserver(frame);
      observer.observe(canvas);
      document.fonts.ready.then(() => alive && frame());
      let seen = true;
      const watch = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
      watch.observe(canvas);
      const tick = time => {
        if (still || !seen || document.hidden) return;
        scene.animate(time, true);
        scene.setScreen('hello', 1);
        if (scene.dirty) { setClock(scene); scene.render(); }
      };
      gsap.ticker.add(tick);
      stop = () => { gsap.ticker.remove(tick); observer.disconnect(); watch.disconnect(); scene.dispose(); };
    }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; stop?.(); };
  }, [still, bare]);

  // Which chapter the menu bar marks.
  useEffect(() => {
    const update = () => {
      let current = 0;
      ['work', 'about', 'contact'].forEach((id, i) => { if (document.getElementById(id)?.getBoundingClientRect().top < innerHeight * 0.5) current = i + 1; });
      onChapter?.(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [onChapter]);

  return (
    <div className="story story--flow">
      <section className="flowhero">
        <Hero profile={profile} />
        {!bare && !failed && <canvas ref={canvasRef} className="flowhero__canvas" aria-hidden="true" />}
      </section>
      <section id="work" className="flowwork" data-land="" aria-label="Projects">
        {projects.map((p, k) => <ProjectWindow key={p.slug} id={k ? `work-${k + 1}` : undefined} p={p} total={projects.length} />)}
      </section>
      {children}
    </div>
  );
}

export default function Story({ profile, projects, about, experience, education, skills, reduce, onChapter }) {
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const on = () => setView({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const pinned = !reduce && !failed && view.w >= 900 && view.h >= 560 && view.w / view.h > 1.05;
  const rest = <Notebook profile={profile} projects={projects} about={about} experience={experience} education={education} skills={skills} />;
  return pinned
    ? <Pinned profile={profile} projects={projects} onChapter={onChapter} onFail={() => setFailed(true)}>{rest}</Pinned>
    : <Flow profile={profile} projects={projects} onChapter={onChapter} still={reduce} bare={failed}>{rest}</Flow>;
}
