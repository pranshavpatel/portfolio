import { Star } from '../story/MacScreen.jsx';

// The menu bar along the top of the page: whose desk this is, the four places
// the story stops, the résumé, and the one way to write.

export const CHAPTERS = [['Desk', 0], ['Projects', '#work'], ['About', '#about'], ['Contact', '#contact']];

export default function Header({ chapter, onNav, resume, onWrite }) {
  return (
    <header className="bar">
      <a className="bar__who" href="#top" onClick={onNav(0)}><Star /><b>Pranshav Patel</b></a>
      <nav className="bar__chapters" aria-label="Chapters">
        {CHAPTERS.map(([name, target], i) => (
          <a key={name} href={typeof target === 'string' ? target : '#top'} onClick={onNav(target)}
            className={i === chapter ? 'is-on' : ''} aria-current={i === chapter ? 'step' : undefined}>{name}</a>
        ))}
      </nav>
      <div className="bar__right">
        <a className="bar__resume" href={resume} target="_blank" rel="noreferrer">Résumé ↓</a>
        <button type="button" className="bar__write" onClick={onWrite}>Write to me</button>
      </div>
    </header>
  );
}
