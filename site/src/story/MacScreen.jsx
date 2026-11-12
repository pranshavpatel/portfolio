// What runs on the Macintosh: a one-bit desktop with the projects on it. A
// Finder list picks the disk, the big window is the document being read (it
// scrolls from one project to the next as the page scrolls), and the icons
// down the right edge are real links. The story lays this over the 3D tube;
// on phones each project is its own window in the page instead.

const Icon = ({ children }) => <svg viewBox="0 0 16 16" width="32" height="32" shapeRendering="crispEdges" aria-hidden="true"><g transform="translate(.5 .5)" fill="#f3f4ec" stroke="#16181d">{children}</g></svg>;
const Floppy = () => <Icon><path d="M1 1h11l3 3v11H1z" /><path d="M4 1h7v5H4z" fill="#16181d" /><path d="M8 2h1v3H8z" stroke="none" /><path d="M3 9h10v6H3z" /></Icon>;
const Doc = () => <Icon><path d="M3 1h7l3 3v11H3z" /><path d="M10 1v3h3M5 7h6M5 9h6M5 11h4" fill="none" /></Icon>;
const Link = () => <Icon><path d="M2 3h12v10H2z" /><path d="M2 6h12M4 9h8M4 11h5" fill="none" /></Icon>;
const Trash = () => <Icon><path d="M4 4h8v11H4z" /><path d="M2 4h12M6 4V2h4v2M6 7v6M8 7v6M10 7v6" fill="none" /></Icon>;
export const Star = () => <svg className="star" viewBox="0 0 9 9" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true"><path d="M4 0h1v9H4zM0 4h9v1H0zM1 1h1v1H1zM2 2h1v1H2zM6 2h1v1H6zM7 1h1v1H7zM2 6h1v1H2zM1 7h1v1H1zM6 6h1v1H6zM7 7h1v1H7z" /></svg>;

// A window's striped title bar. `as` is the tag the title is written in.
export function Bar({ title, as: Tag = 'span', id }) {
  return <header className="win__bar"><i className="win__close" aria-hidden="true" /><Tag id={id}>{title}</Tag></header>;
}

function Chart({ chart }) {
  return (
    <figure className="chart">
      <figcaption>{chart.title}</figcaption>
      {chart.rows.map(r => (
        <div key={r.l} className="chart__row">
          <span className="chart__label">{r.l}</span>
          <span className="chart__track"><i className={r.tone === 'light' ? 'is-light' : ''} style={{ width: (r.v / r.max) * 100 + '%' }} /></span>
          <b>{r.show}</b>
        </div>
      ))}
    </figure>
  );
}

// One project, as a page of the document.
function ProjectDoc({ p, hidden }) {
  return (
    <div className="doc" inert={hidden} aria-hidden={hidden || undefined}>
      <div className="doc__head">
        <div><span className="doc__kind">{p.kind}</span><h3>{p.title}</h3></div>
        <div className="doc__metric"><b>{p.metric}</b><span>{p.metricLabel}</span></div>
      </div>
      <p className="doc__note">{p.personalNote}</p>
      <div className="doc__cols">
        <div className="doc__decision"><span>One decision I made</span><p>{p.decision}</p></div>
        <Chart chart={p.chart} />
      </div>
      <dl className="doc__results">{p.results.map(r => <div key={r.l}><dt>{r.v}</dt><dd>{r.l}</dd></div>)}</dl>
      <div className="doc__foot">
        <span className="doc__stack">{p.stack.join(' · ')}</span>
        {p.live && <a className="mac-btn" href={p.live} target="_blank" rel="noreferrer">Live demo ↗</a>}
        <a className="mac-btn mac-btn--default" href={p.github} target="_blank" rel="noreferrer">Code on GitHub ↗</a>
      </div>
    </div>
  );
}

// One project in a window of its own, for the page layout.
export function ProjectWindow({ p, total, id }) {
  return (
    <section id={id} className="win win--page" aria-label={p.title}>
      <Bar title={p.title} />
      <div className="win__info"><span>Project {p.n} of {String(total).padStart(2, '0')}</span><span>{p.context}</span></div>
      <div className="win__body"><ProjectDoc p={p} /></div>
    </section>
  );
}

export default function MacScreen({ projects, index, onSelect, profile, resume, time }) {
  const p = projects[index];
  return (
    <div className="mac">
      <div className="mac__menubar"><Star /><b>File</b><span>Edit</span><span>View</span><span>Special</span><span className="mac__clock">Raleigh {time}</span></div>
      <div className="mac__desk">
        <section className="win win--finder" aria-label="Projects">
          <Bar title="Projects" />
          <div className="win__info"><span>{projects.length} items</span><span>792K in disk</span></div>
          <ul className="finder">
            {projects.map((q, k) => (
              <li key={q.slug}>
                <button type="button" className={k === index ? 'is-on' : ''} aria-current={k === index ? 'true' : undefined} onClick={() => onSelect(k)}>
                  <Floppy /><span><b>{q.title}</b><small>{q.metric}</small></span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="win win--readme" aria-label="Read Me">
          <Bar title="Read Me" />
          <div className="win__body">
            <p>Three things I built, one per disk.</p>
            <p>Keep scrolling to read on to the next, or click a disk in the list above.</p>
            <p>After the third, the rest of me is further down.</p>
          </div>
        </section>
        {/* The reel of pages is moved by the story (--reel: 0 → 2) as the page scrolls. */}
        <section className="win win--doc" aria-label={p.title}>
          <Bar title={p.title} />
          <div className="win__info"><span>Project {p.n} of {String(projects.length).padStart(2, '0')}</span><span>{p.context}</span></div>
          <div className="win__scroll">
            <div className="win__view"><div className="reel">{projects.map((q, k) => <ProjectDoc key={q.slug} p={q} hidden={k !== index} />)}</div></div>
            <div className="sbar" aria-hidden="true"><i className="sbar__arrow" /><div className="sbar__track"><i className="sbar__thumb" /></div><i className="sbar__arrow sbar__arrow--down" /></div>
          </div>
        </section>
        <nav className="mac__icons" aria-label="Links">
          <a href={resume} target="_blank" rel="noreferrer"><Doc /><span>Résumé</span></a>
          <a href={profile.github} target="_blank" rel="noreferrer"><Link /><span>GitHub</span></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer"><Link /><span>LinkedIn</span></a>
          <span className="mac__trash"><Trash /><span>Trash</span></span>
        </nav>
      </div>
    </div>
  );
}
