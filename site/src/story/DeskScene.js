import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// A desk from about 1987, built as a small diorama that sits on the page: a
// compact Macintosh, its keyboard and mouse, floppies, a spiral notebook, a
// lamp. Flat toon colours with an ink outline, so it reads as a
// drawing. Units are roughly decimetres; the floor is y = 0, the wall z = -5.

export const C = {
  paper: '#f8f3e6', ink: '#1f2530', inkDeep: '#16181d',
  wall: '#c3d1cd', floor: '#dcc6a0', rug: '#b9603f', rugEdge: '#efdfbf',
  wood: '#b98555', woodDark: '#93643c', beige: '#ebe3cd', beigeDark: '#d3c9ae', key: '#f6f0de',
  mustard: '#e6b84c', sage: '#94ad80', teal: '#5f97a0', clay: '#d68a63', red: '#b3261e', cream: '#fbf5e6',
  navy: '#2f3d5c', leaf: '#5f9a6f', leafDark: '#3f7a56', metal: '#c5ccd6', glass: '#20242c', crt: '#f3f4ec'
};

// Camera shots. `dir` is the direction from the target to the camera; the
// distance is worked out so the shot fits the free part of the screen: `hull`
// is a set of points that must all be in view, `frame` [w, h] an area facing
// the camera, and `cover` an area the view must stay inside.
const SHOTS = {
  room: { target: [0, 9.6, 1.5], dir: [0.36, 0.46, 1], fov: 28, up: [0, 1, 0], hull: [[-18.5, 22.5, -6], [18.5, 22.5, -6], [-18.5, -0.9, -6], [18.5, -0.9, -6], [-18.5, -0.9, 14.4], [18.5, -0.9, 14.4], [-18.5, 0, 14.4], [18.5, 0, 14.4]] },
  mac: { target: [0, 0, 0], dir: [0, 0, 1], fov: 28, frame: [4.74, 3.3], up: [0, 1, 0] },
  book: { target: [0, 0, 0], dir: [0, 1, 0], fov: 28, cover: [3.3, 4.6], up: [0, 0, -1] }
};
const SCREEN = { w: 4.2, h: 2.8 };

// A canvas texture of size w × h px, drawn by `paint(g, w, h, ...args)`.
function canvasTexture(w, h, paint) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = (...args) => { paint(cv.getContext('2d'), w, h, ...args); tex.needsUpdate = true; };
  draw();
  return { tex, draw };
}

// Three flat tones for the toon shading.
function ramp() {
  const tex = new THREE.DataTexture(new Uint8Array([0, 150, 255]), 3, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

// Outlines push each vertex out along a normal. Hard edges have several
// normals per corner, which would split the outline open, so the outline uses
// the average of all normals that share a position.
function outlineNormals(geo) {
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const sums = new Map(), keys = [];
  for (let i = 0; i < pos.count; i++) {
    const k = `${Math.round(pos.getX(i) * 500)},${Math.round(pos.getY(i) * 500)},${Math.round(pos.getZ(i) * 500)}`;
    keys.push(k);
    const s = sums.get(k) || [0, 0, 0];
    s[0] += nor.getX(i); s[1] += nor.getY(i); s[2] += nor.getZ(i);
    sums.set(k, s);
  }
  const out = new Float32Array(pos.count * 3);
  keys.forEach((k, i) => {
    const [x, y, z] = sums.get(k), l = Math.hypot(x, y, z) || 1;
    out.set([x / l, y / l, z / l], i * 3);
  });
  geo.setAttribute('onormal', new THREE.BufferAttribute(out, 3));
  return geo;
}

// What the Mac shows from across the room: "hello." written out, then (once
// the story has moved on) a plain desktop for the live interface to sit on.
function screenTexture() {
  return canvasTexture(840, 560, (g, w, h, mode = 'hello', p = 1, caret = true) => {
    g.fillStyle = C.crt; g.fillRect(0, 0, w, h);
    if (mode === 'hello') {
      g.fillStyle = '#16181d'; g.textBaseline = 'alphabetic';
      g.font = '400 236px "Borel", cursive';
      const text = 'hello', tw = g.measureText(text).width, x = (w - tw) / 2 - 14, y = h / 2 + 96;
      g.save(); g.beginPath(); g.rect(0, 0, x + tw * p + 6, h); g.clip();
      g.fillText(text, x, y); g.restore();
      if (p >= 1 && caret) { g.beginPath(); g.arc(x + tw + 34, y - 92, 15, 0, Math.PI * 2); g.fill(); }
    } else {
      // Grey desktop, a menu bar and two empty windows.
      for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 * 4; x < w; x += 8) { g.fillStyle = '#16181d'; g.fillRect(x, y, 4, 4); }
      g.fillStyle = C.crt; g.fillRect(0, 0, w, 28);
      g.fillStyle = '#16181d'; g.fillRect(0, 27, w, 2);
      [[12, 40, 186, 500], [206, 40, 552, 500]].forEach(([x, y, ww, hh]) => {
        g.fillStyle = '#16181d'; g.fillRect(x + 4, y + 4, ww, hh);
        g.fillStyle = C.crt; g.fillRect(x, y, ww, hh);
        g.strokeStyle = '#16181d'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, ww - 2, hh - 2);
        for (let k = 0; k < 6; k++) g.fillRect(x + 6, y + 7 + k * 3, ww - 12, 1);
        g.fillRect(x, y + 26, ww, 2);
      });
    }
    // The tube's rounded corners.
    g.fillStyle = C.glass;
    const r = 34;
    [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].forEach(([x, y, sx, sy]) => {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * r, y); g.arcTo(x, y, x, y + sy * r, r); g.closePath(); g.fill();
    });
  });
}

// Squared paper in the page's own two tones.
function graph(g, w, h, step) {
  g.fillStyle = C.crt; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(22,24,29,.13)'; g.lineWidth = 1;
  g.beginPath();
  for (let x = step; x < w; x += step) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, h); }
  for (let y = step; y < h; y += step) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(w, Math.round(y) + 0.5); }
  g.stroke();
}

// The view from the window: Raleigh by day, NC State's belltower among the roofs.
function skyTexture() {
  return canvasTexture(512, 384, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#8fb6d2'); grad.addColorStop(1, '#e2ebe6');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fbf7ec';
    [[90, 96, 36], [128, 82, 46], [172, 100, 34], [372, 150, 30], [408, 138, 40], [448, 154, 28]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
    g.fillRect(64, 100, 136, 30); g.fillRect(350, 152, 122, 24);
    g.fillStyle = '#f0cf7a'; g.beginPath(); g.arc(300, 70, 30, 0, Math.PI * 2); g.fill();
    const r = (x, y, ww, hh) => g.fillRect(x, h - y - hh, ww, hh + 1);
    g.fillStyle = '#a3b6c2';
    [[0, 0, 80, 120], [70, 0, 70, 84], [320, 0, 90, 150], [400, 0, 60, 100], [450, 0, 62, 132], [246, 0, 80, 92]].forEach(b => r(...b));
    g.fillStyle = '#6c8598';
    r(166, 0, 54, 190); r(175, 190, 36, 50);
    g.beginPath(); g.moveTo(171, h - 240); g.lineTo(193, h - 290); g.lineTo(215, h - 240); g.fill();
    g.fillStyle = '#e2ebe6'; r(186, 150, 14, 22);
  });
}

export class DeskScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Nothing that casts a shadow moves, so shadows are drawn once.
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.5, 300);
    // Per shot, the px to keep clear on each side: { l, t, r, b }. Set by the story.
    this.frames = {};

    const tones = ramp(), mats = {};
    const mat = c => (mats[c] ||= new THREE.MeshToonMaterial({ color: c, gradientMap: tones }));
    this.outline = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(C.ink) }, k: { value: 0.001 } },
      vertexShader: 'attribute vec3 onormal; uniform float k; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); mv.xyz += normalize(normalMatrix * onormal) * k * -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0);\n#include <colorspace_fragment>\n}',
      side: THREE.BackSide
    });

    // Every solid gets an ink outline unless `line` is false.
    const add = (geo, color, [x, y, z], rot = [0, 0, 0], parent = this.scene, line = true) => {
      const m = new THREE.Mesh(geo, typeof color === 'string' ? mat(color) : color);
      m.position.set(x, y, z);
      m.rotation.set(...rot);
      m.castShadow = m.receiveShadow = true;
      if (line) m.add(new THREE.Mesh(outlineNormals(geo), this.outline));
      parent.add(m);
      return m;
    };
    const box = (w, h, d, color, pos, rot, r = 0.06, parent, line) => add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.98), color, pos, rot, parent, line);
    const cyl = (rt, rb, h, color, pos, rot, parent, seg = 28) => add(new THREE.CylinderGeometry(rt, rb, h, seg), color, pos, rot, parent);
    const ball = (r, color, pos, parent) => add(new THREE.SphereGeometry(r, 18, 12), color, pos, undefined, parent);
    const rod = (a, b, r, color, parent) => {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
      const m = add(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 12), color, A.clone().lerp(B, 0.5).toArray(), undefined, parent);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
      return m;
    };
    const tube = (pts, r, color, parent) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v => new THREE.Vector3(...v))), pts.length * 10, r, 6), color, [0, 0, 0], undefined, parent);
    // A flat, unlit picture (screens, labels, pages) that takes no part in shadows.
    const decal = (tex, w, h, pos, rot = [0, 0, 0], parent = this.scene) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
      m.position.set(...pos); m.rotation.set(...rot);
      parent.add(m);
      return m;
    };
    const group = (pos, ry = 0, parent = this.scene) => { const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = ry; parent.add(g); return g; };

    const FLAT = [-Math.PI / 2, 0, 0];

    // The set: a floor slab and one wall, with a soft shadow on the paper.
    box(37, 0.9, 20, C.floor, [0, -0.45, 4.4], undefined, 0.3);
    box(37, 23.4, 0.9, C.wall, [0, 10.8, -5.55], undefined, 0.3);
    box(36.2, 0.7, 0.2, C.cream, [0, 0.35, -5.02], undefined, 0.05);
    const soft = canvasTexture(256, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.shadowColor = 'rgba(39,50,74,.5)'; g.shadowBlur = 26; g.fillStyle = 'rgba(39,50,74,.5)';
      g.beginPath(); g.roundRect(34, 34, w - 68, h - 68, 10); g.fill();
    });
    decal(soft.tex, 47, 28, [0.6, -0.93, 5.4], FLAT).material.depthWrite = false;
    // Rug.
    box(24, 0.1, 10.5, C.rug, [-1, 0.05, 6.4], undefined, 0.4);
    box(21.6, 0.12, 8.1, C.rugEdge, [-1, 0.06, 6.4], undefined, 0.3, undefined, false);
    box(20.4, 0.14, 6.9, C.rug, [-1, 0.07, 6.4], undefined, 0.3, undefined, false);

    // Window on the wall, left of the desk.
    decal(skyTexture().tex, 8.6, 6.4, [-10.6, 14.9, -5.06]);
    [[-10.6, 18.3, 9.6, 0.5], [-10.6, 11.5, 9.6, 0.5]].forEach(([x, y, w, h]) => box(w, h, 0.5, C.cream, [x, y, -4.9]));
    [[-15.15, 14.9, 0.5, 7.3], [-6.05, 14.9, 0.5, 7.3], [-10.6, 14.9, 0.26, 6.4]].forEach(([x, y, w, h]) => box(w, h, 0.5, C.cream, [x, y, -4.9]));
    box(10.4, 0.3, 1.3, C.cream, [-10.6, 11.15, -4.5]);
    // A cactus on the sill.
    cyl(0.5, 0.4, 0.75, C.clay, [-13.6, 11.68, -4.4]);
    add(new THREE.CapsuleGeometry(0.3, 0.8, 4, 12), C.leaf, [-13.6, 12.6, -4.4]);
    add(new THREE.CapsuleGeometry(0.15, 0.3, 4, 10), C.leaf, [-13.22, 12.65, -4.4], [0, 0, -0.9]);

    // Desk: a wooden top on a slab leg and a pedestal of three drawers.
    box(23, 0.6, 9.6, C.wood, [0.5, 7.2, -0.2], undefined, 0.12);
    box(0.7, 6.9, 8.4, C.woodDark, [-10.2, 3.45, -0.2], undefined, 0.1);
    box(5.6, 6.9, 8.4, C.woodDark, [9.0, 3.45, -0.2], undefined, 0.1);
    box(13.2, 3.4, 0.3, C.woodDark, [-0.5, 5.2, -4.1], undefined, 0.08);
    [5.55, 3.45, 1.35].forEach(y => {
      box(4.8, 1.75, 0.18, C.wood, [9.0, y, 4.05], undefined, 0.06);
      cyl(0.16, 0.16, 0.3, C.inkDeep, [9.0, y, 4.25], [Math.PI / 2, 0, 0], undefined, 12);
    });

    // The Macintosh. `this.screen` is the lit picture on its tube; the story
    // lays the live interface over it.
    const mac = group([-1.5, 7.5, -1.3]);
    box(5.8, 0.4, 5.6, C.beigeDark, [0, 0.2, 0], undefined, 0.1, mac);
    box(6.2, 7.4, 6.0, C.beige, [0, 4.05, 0], undefined, 0.38, mac);
    box(5.2, 3.9, 0.12, C.beigeDark, [0, 5.3, 3.0], undefined, 0.3, mac, false);
    box(4.66, 3.26, 0.1, C.glass, [0, 5.3, 3.05], undefined, 0.26, mac, false);
    this.shown = screenTexture();
    this.screen = decal(this.shown.tex, SCREEN.w, SCREEN.h, [0, 5.3, 3.12], undefined, mac);
    box(5.9, 0.07, 0.07, C.beigeDark, [0, 2.95, 3.0], undefined, 0.02, mac, false);
    box(2.1, 0.2, 0.08, C.glass, [1.25, 2.1, 3.0], undefined, 0.04, mac, false);
    box(0.5, 0.36, 0.08, C.beigeDark, [1.25, 1.84, 3.0], undefined, 0.1, mac, false);
    // A badge in the four highlighter colours, and a disk left in the drive.
    [C.mustard, C.sage, C.teal, C.clay].forEach((c, i) => box(0.52, 0.1, 0.06, c, [-2.2, 2.26 - i * 0.11, 3.01], undefined, 0.01, mac, false));
    box(1.9, 0.14, 1.1, C.mustard, [1.25, 2.1, 3.3], undefined, 0.04, mac);
    box(2.8, 0.1, 1.3, C.beigeDark, [0, 7.74, -1.5], undefined, 0.2, mac, false);
    for (let i = 0; i < 6; i++) box(0.06, 0.08, 2.2, C.beigeDark, [3.08, 6.9 - i * 0.22, -1.2], undefined, 0.02, mac, false);

    // Keyboard, its coiled cable, and the one-button mouse.
    const kb = group([-1.5, 7.5, 3.25]);
    box(5.9, 0.5, 2.3, C.beige, [0, 0.27, 0], [0.06, 0, 0], 0.12, kb);
    const keys = canvasTexture(560, 200, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const rows = [[...Array(14).fill(1)], [1.5, ...Array(12).fill(1), 1.5], [1.8, ...Array(11).fill(1), 2.2], [2.3, ...Array(10).fill(1), 2.7], [1.4, 1.6, 8, 1.6, 1.4]];
      rows.forEach((row, r) => {
        const unit = (w - 12) / row.reduce((a, b) => a + b, 0);
        let x = 6;
        row.forEach(u => {
          g.fillStyle = C.key; g.strokeStyle = C.ink; g.lineWidth = 2.5;
          g.beginPath(); g.roundRect(x + 3, 6 + r * 38, u * unit - 6, 31, 5); g.fill(); g.stroke();
          x += u * unit;
        });
      });
    });
    decal(keys.tex, 5.4, 1.9, [0, 0.54, 0], [-Math.PI / 2 + 0.06, 0, 0], kb);
    const coil = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, a = t * Math.PI * 16, wob = Math.sin(Math.PI * t);
      coil.push([1.9 + t * 1.0 + Math.cos(a) * 0.11 * wob, 7.72 - wob * 0.04 + Math.sin(a) * 0.11 * wob, 2.2 - t * 0.5]);
    }
    tube(coil, 0.04, C.beigeDark);
    const mouse = group([3.3, 7.5, 3.3], -0.12);
    box(1.0, 0.52, 1.55, C.beige, [0, 0.27, 0], undefined, 0.16, mouse);
    box(0.62, 0.06, 0.5, C.beigeDark, [0, 0.52, -0.38], undefined, 0.04, mouse, false);
    tube([[3.4, 7.62, 2.5], [3.5, 7.56, 1.6], [3.0, 7.56, 0.4], [2.2, 7.56, -0.6], [1.75, 7.7, -1.6]], 0.045, C.beigeDark);

    // Floppies beside the Mac, one for each project.
    [[C.teal, -7.4, 0.2, 0.25], [C.sage, -7.0, 0.55, -0.2], [C.clay, -7.5, 0.95, 0.08]].forEach(([c, x, z, ry], i) => {
      const f = group([x, 7.5 + i * 0.16, z], ry);
      box(2.0, 0.14, 2.1, c, [0, 0.08, 0], undefined, 0.05, f);
      box(1.0, 0.03, 0.72, C.metal, [0.2, 0.16, -0.68], undefined, 0.01, f, false);
      box(1.5, 0.03, 0.95, C.cream, [0, 0.16, 0.45], undefined, 0.01, f, false);
    });

    // Mug of coffee (an NC State one), steam rising off it.
    cyl(0.62, 0.56, 1.3, C.red, [-6.0, 8.15, 3.1]);
    add(new THREE.TorusGeometry(0.34, 0.1, 10, 20), C.red, [-6.66, 8.2, 3.1], [0, 0, Math.PI / 2]);
    cyl(0.52, 0.52, 0.04, '#5b3b2c', [-6.0, 8.81, 3.1], undefined, undefined, 20).children[0].visible = false;
    this.mugPrint = canvasTexture(128, 64, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#fbf5e6'; g.textAlign = 'center';
      g.font = '600 30px "IBM Plex Mono", monospace'; g.fillText('NC', w / 2, 30);
      g.font = '600 17px "IBM Plex Mono", monospace'; g.fillText('STATE', w / 2, 54);
    });
    decal(this.mugPrint.tex, 0.66, 0.33, [-6.0 + 0.2, 8.2, 3.1 + 0.6], [0, 0.32, 0]);
    const puff = new THREE.SphereGeometry(0.16, 12, 8);
    this.steam = Array.from({ length: 8 }, (_, i) => {
      const m = new THREE.Mesh(puff, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }));
      m.userData.phase = i / 8;
      this.scene.add(m);
      return m;
    });
    this.steamAt = [-6.0, 8.9, 3.1];
    this.puffs(0);

    // Desk lamp: a jointed arm with a mustard shade.
    cyl(0.95, 1.05, 0.26, C.mustard, [-8.6, 7.63, -3.2]);
    rod([-8.6, 7.7, -3.2], [-9.3, 11.0, -3.0], 0.09, C.metal);
    rod([-9.3, 11.0, -3.0], [-7.2, 13.4, -2.4], 0.09, C.metal);
    ball(0.2, C.inkDeep, [-9.3, 11.0, -3.0]);
    const shade = add(new THREE.CylinderGeometry(0.4, 1.25, 1.4, 28, 1, true), new THREE.MeshToonMaterial({ color: C.mustard, gradientMap: tones, side: THREE.DoubleSide }), [-6.75, 13.0, -2.25]);
    shade.rotation.set(0.25, 0, -0.85);
    ball(0.36, C.cream, [-6.55, 12.75, -2.15]).children[0].visible = false;

    // The notebook, open beside the keyboard. The story ends by flying into
    // its right-hand page.
    const book = group([8.0, 7.5, 1.5], -0.1);
    box(7.9, 0.12, 5.5, C.navy, [0, 0.06, 0], undefined, 0.08, book);
    box(3.78, 0.1, 5.24, C.cream, [-1.93, 0.17, 0], undefined, 0.04, book);
    box(3.78, 0.1, 5.24, C.cream, [1.93, 0.17, 0], undefined, 0.04, book);
    // The pages are inked the way the Mac draws: black, pixel type, dither fills.
    const BIT = '#16181d';
    const dither = (g, x, y, w, h) => { g.fillStyle = BIT; for (let j = 0; j < h; j += 6) for (let i = (j / 6) % 2 * 6; i < w; i += 12) g.fillRect(x + i, y + j, 6, 6); };
    this.pageLeft = canvasTexture(520, 728, (g, w, h) => {
      graph(g, w, h, 20);
      g.fillStyle = BIT; g.fillRect(40, 40, 170, 56);
      g.fillStyle = C.crt; g.font = '400 54px "Jersey 20", monospace'; g.fillText('TO DO', 54, 86);
      g.strokeStyle = BIT; g.lineCap = 'butt';
      [150, 196, 242, 288].forEach((y, i) => {
        g.lineWidth = 3; g.strokeRect(40, y - 14, 20, 20);
        if (i < 3) { g.beginPath(); g.moveTo(43, y - 4); g.lineTo(49, y + 3); g.lineTo(58, y - 12); g.stroke(); }
        g.lineWidth = 4; g.beginPath(); g.moveTo(76, y - 2); g.lineTo(76 + [300, 240, 330, 200][i], y - 2); g.stroke();
      });
      g.fillStyle = BIT; g.font = '400 40px "Jersey 20", monospace'; g.fillText('paged KV cache', 40, 388);
      g.fillRect(40, 398, 214, 3);
      // A little block-table sketch.
      g.lineWidth = 3;
      for (let i = 0; i < 4; i++) { if (i % 2 === 0) dither(g, 60 + i * 62, 430, 52, 52); g.strokeRect(60 + i * 62, 430, 52, 52); }
      for (let i = 0; i < 6; i++) { if ([1, 4].includes(i)) { g.fillStyle = BIT; g.fillRect(60 + i * 62, 560, 52, 52); } g.strokeRect(60 + i * 62, 560, 52, 52); }
      g.beginPath(); g.moveTo(86, 484); g.lineTo(148, 558); g.moveTo(210, 484); g.lineTo(334, 558); g.stroke();
    });
    decal(this.pageLeft.tex, 3.7, 5.16, [-1.93, 0.225, 0], FLAT, book);
    this.pageRight = canvasTexture(1480, 2064, (g, w, h) => {
      graph(g, w, h, w / 54);
      g.save(); g.translate(w / 2, h * 0.47); g.textAlign = 'center';
      g.fillStyle = BIT; g.font = '400 150px "Jersey 20", monospace'; g.fillText('The rest of me', 0, 0);
      g.fillRect(-330, 30, 660, 8);
      g.font = '400 62px "Jersey 20", monospace'; g.fillText('experience · school · tools  ↓', 0, 122);
      g.restore();
    });
    this.page = decal(this.pageRight.tex, 3.7, 5.16, [1.93, 0.225, 0], FLAT, book);
    for (let i = 0; i < 15; i++) add(new THREE.TorusGeometry(0.2, 0.035, 8, 18), C.metal, [0, 0.22, -2.38 + i * 0.34], undefined, book);
    // A pencil across the left page.
    const pencil = group([-2.3, 0.3, 1.5], 1.0, book);
    cyl(0.08, 0.08, 2.6, C.mustard, [0, 0, 0], [0, 0, Math.PI / 2], pencil, 8);
    cyl(0.08, 0.08, 0.3, C.clay, [1.45, 0, 0], [0, 0, Math.PI / 2], pencil, 8);
    add(new THREE.ConeGeometry(0.08, 0.34, 8), C.cream, [-1.47, 0, 0], [0, 0, Math.PI / 2], pencil);

    // Highlighters in a cup at the back of the desk.
    cyl(0.75, 0.65, 1.7, C.navy, [10.6, 8.35, -3.5]);
    [[C.mustard, -0.3, 0.2, 0.2, -0.16], [C.sage, 0.3, 0.25, -0.12, 0.2], [C.clay, 0.05, -0.3, 0.22, 0.14], [C.teal, -0.2, -0.15, -0.2, -0.2]].forEach(([c, dx, dz, rx, rz]) => {
      const p = group([10.6 + dx, 8.9, -3.5 + dz]);
      p.rotation.set(rx, 0, rz);
      cyl(0.17, 0.17, 1.9, c, [0, 0.6, 0], undefined, p, 12);
      cyl(0.18, 0.18, 0.5, C.inkDeep, [0, 1.7, 0], undefined, p, 12);
    });

    // Shelf on the wall: books, a radio, a puzzle cube.
    box(7.6, 0.3, 1.7, C.wood, [11.0, 16.0, -4.25], undefined, 0.08);
    [8.1, 13.9].forEach(x => box(0.25, 1.1, 1.3, C.woodDark, [x, 15.35, -4.45], undefined, 0.05));
    [[C.navy, 2.5], [C.clay, 2.2], [C.cream, 2.6], [C.sage, 2.3], [C.mustard, 2.05]].forEach(([c, h], i) => box(0.52, h, 1.4, c, [7.75 + i * 0.58, 16.15 + h / 2, -4.3], i === 4 ? [0, 0, -0.14] : undefined, 0.05));
    box(2.7, 1.5, 1.0, C.sage, [12.0, 16.9, -4.3], undefined, 0.16);
    [11.3, 12.7].forEach(x => cyl(0.44, 0.44, 0.08, C.inkDeep, [x, 16.85, -3.78], [Math.PI / 2, 0, 0], undefined, 20));
    box(0.46, 0.24, 0.06, C.cream, [12.0, 17.15, -3.79], undefined, 0.03, undefined, false);
    rod([13.0, 17.65, -4.5], [13.7, 19.1, -4.5], 0.03, C.metal);
    const cube = canvasTexture(96, 96, (g, w) => {
      g.fillStyle = C.inkDeep; g.fillRect(0, 0, w, w);
      const cs = [C.mustard, C.red, C.teal, C.sage, C.cream, C.clay, C.teal, C.mustard, C.red];
      cs.forEach((c, i) => { g.fillStyle = c; g.fillRect(5 + (i % 3) * 30, 5 + Math.floor(i / 3) * 30, 26, 26); });
    });
    add(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshToonMaterial({ map: cube.tex, gradientMap: tones }), [14.2, 16.6, -4.2], [0, 0.5, 0]);

    // An NC State pennant above the shelf.
    const flag = new THREE.Shape();
    flag.moveTo(0, 1.25); flag.lineTo(6.4, 0); flag.lineTo(0, -1.25); flag.closePath();
    const pennant = add(new THREE.ExtrudeGeometry(flag, { depth: 0.06, bevelEnabled: false }), C.red, [8.0, 20.6, -5.08], [0, 0, -0.07]);
    this.pennantPrint = canvasTexture(384, 96, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#fbf5e6'; g.font = '600 54px "IBM Plex Mono", monospace'; g.textBaseline = 'middle'; g.fillText('NC STATE', 8, h / 2 + 2);
    });
    decal(this.pennantPrint.tex, 3.5, 0.88, [2.05, 0, 0.07], undefined, pennant);

    // Wall clock above the Mac, kept to Raleigh time by setClock(). Its hands
    // cast no shadow, because shadows are only drawn once.
    const CLOCK = { x: -1.5, y: 18.9, z: -5.1, r: 1.35 };
    add(new THREE.CylinderGeometry(CLOCK.r, CLOCK.r, 0.2, 48), C.cream, [CLOCK.x, CLOCK.y, CLOCK.z + 0.1], [Math.PI / 2, 0, 0]);
    add(new THREE.TorusGeometry(CLOCK.r, 0.11, 10, 48), C.ink, [CLOCK.x, CLOCK.y, CLOCK.z + 0.2], undefined, undefined, false);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, long = i % 3 === 0;
      add(new THREE.BoxGeometry(0.07, long ? 0.28 : 0.14, 0.02), C.ink, [CLOCK.x + Math.sin(a) * (CLOCK.r - 0.26), CLOCK.y + Math.cos(a) * (CLOCK.r - 0.26), CLOCK.z + 0.21], [0, 0, -a], undefined, false).castShadow = false;
    }
    const hand = (len, width, color, z) => {
      const pivot = group([CLOCK.x, CLOCK.y, CLOCK.z + z]);
      const m = new THREE.Mesh(new THREE.BoxGeometry(width, len, 0.03), mat(color));
      m.position.y = len / 2 - 0.12;
      pivot.add(m);
      return pivot;
    };
    this.clockHands = { h: hand(0.72, 0.12, C.ink, 0.23), m: hand(1.08, 0.08, C.ink, 0.25), s: hand(1.14, 0.035, C.red, 0.27) };
    add(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), C.red, [CLOCK.x, CLOCK.y, CLOCK.z + 0.29], [Math.PI / 2, 0, 0], undefined, false).castShadow = false;
    this.clockKey = '';

    // The task chair, pulled back from the desk: five-star base, mesh back
    // with a headrest, adjustable arms.
    const chair = group([-12.8, 0, 9.2], 0.72);
    const cbox = (w, h, d, c, p, rot, r = 0.25, parent = chair) => box(w, h, d, c, p, rot, r, parent);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3, x = Math.sin(a) * 2.3, z = Math.cos(a) * 2.3;
      rod([0, 0.8, 0], [x, 0.5, z], 0.15, C.metal, chair);
      ball(0.24, C.inkDeep, [x, 0.24, z], chair);
    }
    cyl(0.32, 0.36, 1.4, C.inkDeep, [0, 1.3, 0], undefined, chair, 16);
    cyl(0.19, 0.19, 2.6, C.metal, [0, 2.9, 0], undefined, chair, 12);
    cbox(1.8, 0.45, 1.8, C.inkDeep, [0, 4.3, 0.2], undefined, 0.1);
    cbox(4.6, 0.75, 4.3, C.navy, [0, 4.85, 0], undefined, 0.35);
    cbox(0.55, 2.4, 0.35, C.inkDeep, [0, 5.7, 2.15], [-0.35, 0, 0], 0.12);
    const back = group([0, 9.4, 2.4], 0, chair);
    back.rotation.x = -0.14;
    cbox(4.3, 6, 0.3, C.inkDeep, [0, 0, 0], undefined, 0.3, back);
    const weave = canvasTexture(256, 360, (g, w, h) => {
      g.fillStyle = C.navy; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(253,250,240,.16)'; g.lineWidth = 1;
      for (let k = -h; k < w + h; k += 9) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h * 0.35, h); g.stroke(); g.beginPath(); g.moveTo(k, 0); g.lineTo(k - h * 0.35, h); g.stroke(); }
    });
    [0.16, -0.16].forEach(z => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 5.4), new THREE.MeshToonMaterial({ map: weave.tex, gradientMap: tones }));
      mesh.position.z = z; mesh.rotation.y = z < 0 ? Math.PI : 0; mesh.receiveShadow = true;
      back.add(mesh);
    });
    cbox(3.2, 0.5, 0.22, C.navy, [0, -1.7, 0.2], undefined, 0.1, back);
    cbox(0.4, 1.1, 0.25, C.inkDeep, [0, 3.4, 0], undefined, 0.1, back);
    cbox(2.8, 1.1, 0.45, C.navy, [0, 4.25, -0.05], undefined, 0.3, back);
    [-1, 1].forEach(sx => {
      cbox(0.3, 2.1, 0.45, C.inkDeep, [sx * 2.4, 5.95, 0.3], undefined, 0.1);
      cbox(0.75, 0.28, 2.5, C.navy, [sx * 2.4, 7.05, 0.15], undefined, 0.12);
    });

    // Plant in the corner, and a wastebasket of crumpled drafts.
    cyl(1.4, 1.1, 2.6, C.cream, [-15.4, 1.3, -2.6]);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4, tilt = 0.25 + (i % 3) * 0.18, len = 2.1 + (i % 4) * 0.4;
      const leaf = add(new THREE.SphereGeometry(1, 16, 12), i % 2 ? C.leafDark : C.leaf, [-15.4 + Math.sin(a) * tilt * len, 2.6 + Math.cos(tilt) * len, -2.6 + Math.cos(a) * tilt * len], [Math.cos(a) * tilt, 0, -Math.sin(a) * tilt]);
      leaf.scale.set(0.42, len, 0.12);
    }
    add(new THREE.CylinderGeometry(1.25, 0.95, 2.5, 24, 1, true), new THREE.MeshToonMaterial({ color: C.navy, gradientMap: tones, side: THREE.DoubleSide }), [15.2, 1.25, 1.2]);
    [[15.0, 2.3, 1.1, 0.62], [15.6, 2.45, 1.5, 0.5], [13.4, 0.42, 3.4, 0.5]].forEach(([x, y, z, r], i) => add(new THREE.IcosahedronGeometry(r, 0), C.cream, [x, y, z], [i, i * 2, 0]));

    // Light: an even fill, and a key from the front-left for the flat shadows.
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#e6ddcc', 2.25));
    const key = new THREE.DirectionalLight('#ffffff', 0.95);
    key.position.set(-16, 34, 26);
    key.target.position.set(0, 6, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 110 });
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.03;
    key.shadow.radius = 2;
    this.scene.add(key, key.target);

    // Shots that depend on where things ended up.
    this.scene.updateMatrixWorld(true);
    this.shots = structuredClone(SHOTS);
    this.shots.mac.target = this.screen.getWorldPosition(new THREE.Vector3()).toArray();
    this.shots.book.target = this.page.localToWorld(new THREE.Vector3(0, 0.1, 0)).toArray();
    this.shots.book.up = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), book.rotation.y).toArray();

    // Canvas text needs its web fonts; draw it again once they've loaded.
    Promise.all(['400 48px "Jersey 20"', '400 200px "Borel"', '600 30px "IBM Plex Mono"'].map(f => document.fonts.load(f)))
      .then(() => { this.mugPrint.draw(); this.pennantPrint.draw(); this.pageLeft.draw(); this.pageRight.draw(); this.shownKey = ''; this.dirty = true; }).catch(() => {});

    this.look = new THREE.Vector2(); this.pointer = new THREE.Vector2();
    this._v = new THREE.Vector3(); this._a = new THREE.Vector3(); this._b = new THREE.Vector3();
    this.lastAnim = 0; this.blink = true; this.shownKey = ''; this.fits = {};
    this.dirty = true;
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  // Where the camera sits for a shot, and how far the picture is shifted so
  // the shot lands in the middle of the free part of the screen.
  fit(name) {
    const shot = this.shots[name], W = this.canvas.clientWidth || 1, H = this.canvas.clientHeight || 1;
    const m = this.frames[name] || { l: 0, t: 0, r: 0, b: 0 };
    const key = [name, W, H, m.l, m.t, m.r, m.b].join();
    if (this.fits[key]) return this.fits[key];
    const tan = Math.tan((shot.fov * Math.PI) / 360), aspect = W / H;
    const fw = Math.max(0.2, (W - m.l - m.r) / W), fh = Math.max(0.2, (H - m.t - m.b) / H);
    const len = Math.hypot(...shot.dir), at = d => shot.target.map((v, i) => v + (shot.dir[i] / len) * d);
    let d, dx = (m.l - m.r) / 2, dy = (m.t - m.b) / 2;
    if (shot.hull) {
      // The nearest distance from which every point of the hull is in the
      // free area, found by trying distances; then centre what is seen.
      const cam = this.probe ||= new THREE.PerspectiveCamera();
      cam.fov = shot.fov; cam.aspect = aspect; cam.near = 0.5; cam.far = 600; cam.updateProjectionMatrix();
      const seen = dist => {
        cam.position.set(...at(dist)); cam.up.set(...shot.up); cam.lookAt(...shot.target); cam.updateMatrixWorld();
        const b = [Infinity, -Infinity, Infinity, -Infinity];
        shot.hull.forEach(pt => { this._v.set(...pt).project(cam); b[0] = Math.min(b[0], this._v.x); b[1] = Math.max(b[1], this._v.x); b[2] = Math.min(b[2], this._v.y); b[3] = Math.max(b[3], this._v.y); });
        return b;
      };
      let lo = 10, hi = 500;
      for (let i = 0; i < 26; i++) {
        const mid = (lo + hi) / 2, b = seen(mid);
        if (b[1] - b[0] <= 2 * fw && b[3] - b[2] <= 2 * fh) hi = mid; else lo = mid;
      }
      d = hi;
      const b = seen(d);
      dx -= ((b[0] + b[1]) / 4) * W; dy += ((b[2] + b[3]) / 4) * H;
    } else if (shot.cover) d = Math.min(shot.cover[0] / (2 * tan * aspect), shot.cover[1] / (2 * tan));
    else d = Math.max(shot.frame[1] / (2 * tan * fh), shot.frame[0] / (2 * tan * aspect * fw));
    return (this.fits[key] = { pos: at(d), target: shot.target, up: shot.up, fov: shot.fov, dx, dy });
  }

  // Places the camera between two shots (t: 0 → a, 1 → b). `arc` bows the
  // path out by that much at its middle, so a move can step back as it turns.
  setView(a, b, t, arc = [0, 0, 0]) {
    const A = this.fit(a), B = this.fit(b), L = (p, q) => p + (q - p) * t, bow = Math.sin(Math.PI * t);
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    this.camera.position.set(L(A.pos[0], B.pos[0]) + arc[0] * bow + this.look.x * 1.6, L(A.pos[1], B.pos[1]) + arc[1] * bow - this.look.y * 0.9, L(A.pos[2], B.pos[2]) + arc[2] * bow);
    this.camera.up.set(L(A.up[0], B.up[0]), L(A.up[1], B.up[1]), L(A.up[2], B.up[2])).normalize();
    this.camera.lookAt(L(A.target[0], B.target[0]), L(A.target[1], B.target[1]), L(A.target[2], B.target[2]));
    this.camera.fov = L(A.fov, B.fov);
    const dx = L(A.dx, B.dx), dy = L(A.dy, B.dy);
    if (dx || dy) this.camera.setViewOffset(W, H, -dx, -dy, W, H); else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    // Keep the ink outline about 1.5 px wide at any distance.
    this.outline.uniforms.k.value = (1.5 * 2 * Math.tan((this.camera.fov * Math.PI) / 360)) / H;
    this.dirty = true;
  }

  // What the tube shows: 'hello' being written (p: 0 → 1) or the bare desktop.
  setScreen(mode, p = 1) {
    const key = mode + Math.round(p * 60) + (this.blink ? 'b' : '');
    if (key === this.shownKey) return;
    this.shownKey = key;
    this.shown.draw(mode, p, this.blink);
    this.dirty = true;
  }

  // Sets the wall clock's hands (hours, minutes, seconds).
  setClock(h, m, sec) {
    const key = `${h}:${m}:${sec}`;
    if (key === this.clockKey) return;
    this.clockKey = key;
    const turn = f => -f * Math.PI * 2;
    this.clockHands.h.rotation.z = turn(((h % 12) + m / 60) / 12);
    this.clockHands.m.rotation.z = turn((m + sec / 60) / 60);
    this.clockHands.s.rotation.z = turn(sec / 60);
    this.dirty = true;
  }

  // Places the steam puffs at time t (s): each rises, drifts and fades in turn.
  puffs(t) {
    const [x, y, z] = this.steamAt;
    this.steam.forEach(m => {
      const f = (t / 3.2 + m.userData.phase) % 1;
      m.position.set(x + Math.sin(f * 5 + m.userData.phase * 9) * 0.2, y + f * 2.2, z + Math.cos(f * 4) * 0.1);
      m.scale.set(0.5 + f * 1.0, 0.8 + f * 1.6, 0.5 + f * 1.0);
      m.material.opacity = Math.sin(Math.PI * f) * 0.5;
    });
  }

  // The room's small signs of life while it is in view. About 30 frames a
  // second is plenty.
  animate(t, live) {
    if (!live || t - this.lastAnim < 1 / 30) return;
    this.lastAnim = t;
    this.puffs(t);
    this.blink = t % 1.1 < 0.6;
    this.dirty = true;
  }

  // The tube's four corners on screen (CSS px), clockwise from top-left, so
  // the live interface can be laid exactly over it.
  screenQuad() {
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    return [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([x, y]) => {
      this._v.set((x * SCREEN.w) / 2, (y * SCREEN.h) / 2, 0).applyMatrix4(this.screen.matrixWorld).project(this.camera);
      return { x: (this._v.x * 0.5 + 0.5) * W, y: (-this._v.y * 0.5 + 0.5) * H };
    });
  }

  // A world point on screen, for the hand-written annotations.
  point(x, y, z) {
    this._v.set(x, y, z).project(this.camera);
    return { x: (this._v.x * 0.5 + 0.5) * this.canvas.clientWidth, y: (-this._v.y * 0.5 + 0.5) * this.canvas.clientHeight };
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.dirty = false;
  }

  dispose() {
    this.renderer.dispose();
    const materials = new Set(), textures = new Set();
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
    });
    materials.forEach(m => { Object.values(m).forEach(v => { if (v?.isTexture) textures.add(v); }); m.dispose(); });
    textures.forEach(t => t.dispose());
  }
}
