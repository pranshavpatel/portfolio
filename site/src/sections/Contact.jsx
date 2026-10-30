import Ticker from '../components/Ticker.jsx';
import { asset } from '../config.js';

const HELP = ['ship an AI agent.', 'speed up inference.', 'fix your retrieval.', 'test your pipelines.', 'clean up your data.'];
const NAME = 'Pranshav Patel';

export default function Contact({ profile }) {
  return (
    <section id="contact" data-a="contact" className="contact">
      <div className="contact__inner">
        <span className="mono-label">(Contact) — AI · Software · Data Science, from May 2027</span>
        <h2 data-a="heading" className="contact__title">Hiring new grads for <em className="serif-em accent-light">2027?</em></h2>
        <div data-a="reveal" className="contact__help">I can help you <Ticker words={HELP} /></div>
        <a data-a="magnet" className="magnet" href={'mailto:' + profile.email}>{profile.email} <span>→</span></a>
        <div className="contact__links">
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href={asset(profile.resume)} target="_blank" rel="noreferrer">Résumé (PDF) ↓</a>
        </div>
      </div>
      <div data-a="bigname" className="bigname"><span>© 2026</span><span>{profile.location}</span></div>
      <div className="footname-mask">
        <div data-a="footname" className="footname" aria-label={NAME}>
          {NAME.split('').map((c, i) => <span key={i} data-c="" aria-hidden="true">{c === ' ' ? ' ' : c}</span>)}
        </div>
      </div>
    </section>
  );
}
