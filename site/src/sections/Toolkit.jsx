import { useState } from 'react';

// Six fixed-width columns; hovering (or tapping) one turns it dark and slides its skills open.
export default function Toolkit({ skills }) {
  const [active, setActive] = useState(0);
  return (
    <section data-a="under" className="toolkit">
      <div className="toolkit__head mono-label"><span>(Toolkit)</span><span>hover a column</span></div>
      <div className="toolkit__grid">
        {skills.map((s, i) => (
          <div key={s.g} data-a="col" className={'skill' + (active === i ? ' is-active' : '')} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}>
            <div className="skill__top"><span className="skill__n">({String(i + 1).padStart(2, '0')})</span><span className="skill__plus">+</span></div>
            <div className="skill__bottom">
              <span className="skill__name">{s.g}</span>
              <div className="skill__reveal"><div><span className="skill__items">{s.items}</span></div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
