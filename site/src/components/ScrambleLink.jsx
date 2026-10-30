import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*01';

// Nav link whose label scrambles and resolves left to right on hover.
export default function ScrambleLink({ label, ...rest }) {
  const [text, setText] = useState(label);
  const iv = useRef(null);
  useEffect(() => () => clearInterval(iv.current), []);

  const scramble = () => {
    let f = 0;
    clearInterval(iv.current);
    iv.current = setInterval(() => {
      setText(label.split('').map((c, i) => (i < f / 2 ? c : CHARS[Math.floor(Math.random() * CHARS.length)])).join(''));
      if (++f > label.length * 2) { clearInterval(iv.current); setText(label); }
    }, 28);
  };

  return <a {...rest} aria-label={label} onMouseEnter={scramble}>{text}</a>;
}
