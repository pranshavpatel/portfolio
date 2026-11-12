# Portfolio site

React + Vite portfolio: a 3D desk from about 1987, and the desktop of the
Macintosh on it. On wide screens the desk is pinned and the scroll drives one
camera: the whole desk, then into the Macintosh, whose screen holds the projects
as a document that scrolls from one to the next, then up over the notebook and
into one of its pages. The pages that follow hold the rest on squared paper
with a spiral binding and index tabs: about, an internship timeline, school
cards, the toolkit in boxes, and a letter beside a postcard to reply on. The whole page is drawn in the Mac's two tones, with a pixel face for
titles and a mono face for text; only the desk itself is in colour.

```bash
npm install
npm run dev      # local preview
npm run build    # static site in dist/
```

- Scroll beats, camera moves, the help balloons on the room, and the page-layout fallback: `src/story/Story.jsx`.
- The 3D diorama (toon colours with an ink outline), camera shots and fitting: `src/story/DeskScene.js`.
- What runs on the Mac (Finder list, the scrolling project document, charts, desktop icons): `src/story/MacScreen.jsx`. It is real HTML laid over the 3D tube with `src/story/monitorTransform.js`.
- The notebook pages after the projects (index tabs, timeline, school cards, toolkit boxes, letter and postcard): `src/story/Notebook.jsx`. Contact form and validation: `src/components/ReplySheet.jsx`. Menu bar: `src/components/Header.jsx`.
- Content, project URLs and the per-project chart rows: `src/data.js`. Résumé: `public/uploads/`.
- Endpoint for the form and other settings: `src/config.js`.
- The two tones, type, window chrome and all layout: `src/styles.css`.

Links: `#work`, `#work-2`, `#work-3`, `#about`, `#experience`, `#education`, `#toolkit`, `#contact`.

Phones, narrow or portrait windows, reduced-motion preferences, `?view=page` and
browsers without WebGL get the same content in the page's own order: the desk as
a picture at the top and each project as a window.

The build uses relative asset paths for deployment at a domain root or subpath.
GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.
