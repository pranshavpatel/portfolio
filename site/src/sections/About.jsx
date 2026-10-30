// Splits text into per-word spans so the scroll scrub can light them up one by one.
const words = text => text.split(/(\s+)/).filter(Boolean).map((w, i) => (/^\s+$/.test(w) ? w : <span key={i} data-w="">{w}</span>));

export function About() {
  return (
    <section id="about" className="split about">
      <span className="mono-label">(About)</span>
      <p data-a="scrub" className="about__text split__body">
        {words("I'm a master's student who likes building things ")}
        <em className="serif-em">{words('end to end')}</em>
        {words(": an LLM inference engine from scratch, a RAG assistant that's live on the web, an MCP server I use every day. In my internships I worked on LLM pipelines, test automation and ")}
        <em className="serif-em">{words('data validation')}</em>
        {words(". I'm looking for a team where I can keep doing that across AI, software and data.")}
      </p>
    </section>
  );
}

export function Education({ education }) {
  return (
    <section className="split education">
      <span className="mono-label">(Education)</span>
      <div className="split__body">
        {education.map(ed => (
          <div key={ed.school} data-a="reveal" className="edu-row">
            <span className="edu-row__school">{ed.school}</span>
            <span className="edu-row__degree">{ed.degree}</span>
            <span className="edu-row__meta">{ed.dates} · {ed.gpa}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
