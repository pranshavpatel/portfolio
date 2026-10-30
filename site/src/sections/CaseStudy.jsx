export default function CaseStudy({ project: cs, next, onBack, onOpen }) {
  return (
    <main className="case">
      <div data-a="cs" className="case__crumbs"><a href="#work" onClick={onBack}>← All work</a><span>({cs.n})</span></div>
      <div className="case__intro">
        <span data-a="cs" className="case__kind">{cs.kind}</span>
        <div className="case__title-mask"><h1 data-a="csTitle" className="case__title">{cs.title}</h1></div>
        <p data-a="cs" className="case__summary">{cs.summary}</p>
      </div>
      <div data-a="cs" className="case__meta">
        <span><span className="case__meta-key">Context — </span>{cs.context}</span>
        <span><span className="case__meta-key">Stack — </span>{cs.stack.join(' · ')}</span>
      </div>
      <div className="case__results">
        {cs.results.map(r => (
          <div key={r.l} data-a="cs" className="case__result"><span className="case__result-v">{r.v}</span><span className="case__result-l">{r.l}</span></div>
        ))}
      </div>
      <div data-a="cs" className="case__figure">{cs.figure}</div>
      {cs.sections.map(sec => (
        <div key={sec.h} data-a="cs" className="case__section">
          <h2>{sec.h}</h2>
          <div className="case__section-body">{sec.p.map((para, i) => <p key={i}>{para}</p>)}</div>
        </div>
      ))}
      <a className="case__next" href={'#' + next.slug} onClick={e => { e.preventDefault(); onOpen(next.slug); }}>
        <span className="case__next-label">Next project</span>
        <span className="case__next-title">{next.title} <em>→</em></span>
      </a>
    </main>
  );
}
