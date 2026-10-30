export default function Experience({ experience, onOpenCase }) {
  return (
    <section className="split experience">
      <span className="mono-label">(Experience)</span>
      <div className="split__body">
        {experience.map(e => (
          <div key={e.org} data-a="reveal" className="exp-row">
            <div className="exp-row__head">
              <span className="exp-row__org">{e.org}</span>
              <span className="exp-row__role">{e.role}</span>
              <span className="exp-row__dates">{e.dates}</span>
            </div>
            <div className="exp-row__body">
              <p>{e.blurb}</p>
              {e.slug && <a className="text-link" href={'#' + e.slug} onClick={ev => { ev.preventDefault(); onOpenCase(e.slug); }}>Read the case study →</a>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
