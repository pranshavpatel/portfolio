import { useEffect, useState } from 'react';
import { asset } from '../config.js';
import { scrollToSelector, scrollToY } from '../scroll.js';
import ReplySheet from '../components/ReplySheet.jsx';
import { Star } from './MacScreen.jsx';

// Everything that isn't a project, on the pages of the spiral notebook: squared
// paper inked the way the Macintosh draws. Five sections, each behind an index
// tab: a note about me, the two internships on a timeline, school, the toolkit
// sorted into boxes, and a letter beside a postcard to reply on.

const SECTIONS = [['about', 'About'], ['experience', 'Experience'], ['education', 'Education'], ['toolkit', 'Toolkit'], ['contact', 'Write to me']];

// Splits a skills list on its top-level commas only, so "AWS (S3, EC2), Docker"
// stays two items rather than breaking inside the brackets.
function topItems(list) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of list) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// A section of the notebook: its number in a block, a large title, a double rule.
function Section({ n, id, title, aside, children }) {
  return (
    <section id={id} className="nb" data-land="" aria-labelledby={id + '-title'}>
      <header className="nb__head">
        <span className="nb__n" aria-hidden="true">{String(n).padStart(2, '0')}</span>
        <h2 id={id + '-title'}>{title}</h2>
        {aside && <span className="nb__aside">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

const Clip = () => <svg className="clip" viewBox="0 0 26 62" width="26" height="62" aria-hidden="true"><path d="M7 16v32a6 6 0 0 0 12 0V12a9 9 0 0 0-18 0v38" fill="none" stroke="#16181d" strokeWidth="2.5" strokeLinecap="round" /></svg>;

export default function Notebook({ profile, projects, about, experience, education, skills }) {
  // Which index tab is marked: the last section whose top has passed the reading line.
  const [at, setAt] = useState('about');
  useEffect(() => {
    const update = () => {
      let current = SECTIONS[0][0];
      SECTIONS.forEach(([id]) => { if (document.getElementById(id)?.getBoundingClientRect().top < innerHeight * 0.45) current = id; });
      setAt(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const facts = [
    { v: education[0].gpa.replace('GPA ', '').split(' / ')[0], l: 'GPA, master’s at NC State' },
    { v: String(experience.length), l: 'internships: AI and software' },
    { v: String(projects.length), l: 'projects built and measured' },
    { v: 'May ’27', l: 'graduating' }
  ];

  return (
    <section className="desk" aria-label="Notebook">
      <nav className="tabs" aria-label="Notebook sections">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={'#' + id} className={id === at ? 'is-on' : ''} aria-current={id === at ? 'true' : undefined}
            onClick={e => { e.preventDefault(); scrollToSelector('#' + id); }}>{label}</a>
        ))}
      </nav>
      <div className="desk__inner">
        <div className="desk__strip"><span>Pranshav Patel · Notebook</span><span>The rest of me</span></div>

        <Section n={1} id="about" title="About" aside="read me first">
          <div className="about">
            <p className="lede">{about.text}</p>
            <div className="slip"><span>Now</span><p>Focused on {about.now}</p></div>
            <dl className="facts">{facts.map(f => <div key={f.l}><dt>{f.v}</dt><dd>{f.l}</dd></div>)}</dl>
          </div>
        </Section>

        <Section n={2} id="experience" title="Experience" aside={experience.length + ' internships'}>
          <div className="jobs">
            {experience.map(e => (
              <article key={e.org} className="job">
                <div className="job__when"><span className="job__dates">{e.dates}</span><span className="job__role">{e.role}</span></div>
                <div className="job__body">
                  <h3>{e.org}</h3>
                  <dl className="stats">{e.stats.map(st => <div key={st.l}><dt>{st.v}</dt><dd>{st.l}</dd></div>)}</dl>
                  <ul className="points">{e.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section n={3} id="education" title="Education" aside="still learning">
          <div className="schools">
            {education.map(e => {
              const [score, of] = e.gpa.replace('GPA ', '').split(' / ');
              return (
                <article key={e.school} className="school">
                  <span className="school__years">{e.dates}</span>
                  <div className="school__main"><h3>{e.school}</h3><p>{e.degree}</p><p className="school__courses">{e.courses}</p></div>
                  <div className="school__gpa"><b>{score}</b><span>GPA / {of}</span></div>
                </article>
              );
            })}
          </div>
        </Section>

        <Section n={4} id="toolkit" title="Toolkit" aside="what I reach for">
          <div className="kit">
            {skills.map(s => (
              <article key={s.g} className="kit__box">
                <h3>{s.g}</h3>
                <ul>{topItems(s.items).map(item => <li key={item} className="chip">{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </Section>

        <Section n={5} id="contact" title="Write to me" aside="it comes straight to my inbox">
          <div className="contact">
            <div className="letter">
              <Clip />
              <p className="letter__to">To the team hiring in 2027,</p>
              <p>I’m Pranshav, a CS master’s student at NC State, graduating in May 2027.</p>
              <p>The part of engineering I keep coming back to is finding out whether something actually works. At LexisNexis that meant twenty A/B runs before claiming a 63% cost cut. On my own projects it meant tracing PolicyBot’s last retrieval miss to a chunking bug, and running 192 agent trials against my Fitbit server until a confirmation-expiry failure showed up.</p>
              <p>I’m looking for an AI, software or data role where that habit is useful. If that sounds like your team, I’d love to talk.</p>
              <p className="letter__sign">— Pranshav</p>
            </div>
            <div id="reply" className="postcard">
              <span className="postcard__stamp" aria-hidden="true"><Star /><i>Raleigh NC</i></span>
              <ReplySheet profile={profile} />
            </div>
          </div>
        </Section>

        <footer className="desk__foot">
          <div className="desk__links">
            <a className="mac-btn" href={'mailto:' + profile.email}>{profile.email}</a>
            <a className="mac-btn" href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="mac-btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a className="mac-btn" href={asset(profile.resume)} target="_blank" rel="noreferrer">Résumé ↓</a>
          </div>
          <div className="desk__end">
            <span>Built at a 1987 desk · © {new Date().getFullYear()} Pranshav Patel</span>
            <a href="#top" onClick={e => { e.preventDefault(); scrollToY(0); }}>Back to the desk ↑</a>
          </div>
        </footer>
      </div>
    </section>
  );
}
