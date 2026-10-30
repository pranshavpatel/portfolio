# Portfolio site

React + Vite build of the Claude Design prototype `project/Portfolio v3 - Motion.dc.html`.

```bash
npm install
npm run dev      # local dev server
npm run build    # static site in dist/ (relative paths, deploys to any static host or subpath)
```

- Content: `src/data.js` (projects, experience, education, skills). Thumbnails live in `public/thumbs/`, the résumé in `public/uploads/`.
- Settings that were Tweaks in the prototype (preloader, smooth scroll, holo foil preset and strength): `src/config.js`.
- Motion: GSAP + ScrollTrigger (`src/motion.js`), Lenis smooth scroll, `Crosshair` and `HoloCard` from React Bits (`src/components/`).
- Routes are hash-based: `#lexisnexis` (or any project slug) opens that case study page.
- The holo cards need WebGL 2; without it they fall back to the plain thumbnail image.
