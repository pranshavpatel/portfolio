import Ticker from '../components/Ticker.jsx';

const BUILDS = ['AI agents.', 'RAG apps.', 'LLM engines.', 'data tools.', 'software.'];
const BAND = [['b', 'AI engineering'], ['i', 'retrieval'], ['b', 'Agents'], ['i', 'evaluation'], ['b', 'Software'], ['i', 'data science']];

function BandGroup({ hidden }) {
  return (
    <span className="marquee__group" aria-hidden={hidden || undefined}>
      {BAND.map(([tag, word]) => [
        tag === 'b' ? <b key={word}>{word}</b> : <i key={word}>{word}</i>,
        <span key={word + '-dot'} className="marquee__dot" />
      ])}
    </span>
  );
}

export default function Hero() {
  return (
    <>
      <section className="hero">
        <div data-a="fade" className="hero__meta"><span>CS grad student, NC State</span><span>Raleigh, NC</span></div>
        <h1 className="hero__title">
          <span className="hero__mask"><span data-a="line" className="hero__line">Pranshav Patel.</span></span>
          <span className="hero__mask hero__mask--ticker"><span data-a="line" className="hero__line">I build <Ticker words={BUILDS} /></span></span>
        </h1>
        <div data-a="fade" className="hero__foot">
          <p style={{ maxWidth: 340 }}>Master's in Computer Science at NC State, graduating May 2027. Previously interned at LexisNexis and Trading Technologies.</p>
          <p style={{ maxWidth: 300 }}>Looking for full-time AI Engineer, Software Engineer and Data Science roles starting May 2027.</p>
          <div className="hero__scroll"><span>Scroll</span><span className="hero__drip"><span /></span></div>
        </div>
      </section>

      <section className="marquee">
        <div data-a="marquee" className="marquee__track"><BandGroup /><BandGroup hidden /></div>
      </section>
    </>
  );
}
