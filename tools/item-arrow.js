import * as THREE from 'three';
import { _G, _add, _canvasTex } from './item-utils.js';

/* Panah 3D berdiri tegak dan melayang di atas tanah.
   dir: 'left' (-x) | 'right' (+x)  -> badan menghadap depan (+z), menunjuk ke samping
        'front' (+z, depan) | 'back' (-z, belakang) -> menunjuk lurus ke depan/belakang, badan menghadap samping (+x)
        'up' | 'down' -> menunjuk ke atas/bawah layar (badan menghadap +z), untuk HUD
   mode: opsional, paksa 'screen' atau 'depth' */
function _roundedPoly(pts, r) {
  const s = new THREE.Shape(), n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const d0 = new THREE.Vector2().subVectors(p0, p1), d2 = new THREE.Vector2().subVectors(p2, p1), rr = Math.min(r, d0.length() / 2, d2.length() / 2);
    d0.normalize(); d2.normalize();
    const a = p1.clone().addScaledVector(d0, rr), b = p1.clone().addScaledVector(d2, rr);
    i ? s.lineTo(a.x, a.y) : s.moveTo(a.x, a.y);
    s.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
  }
  s.closePath(); return s;
}
export function createItemArrow(opts = {}) {
  const o = Object.assign({ dir: 'right', hover: 0.5, color: 0x5a73e3, rim: 0xe3a9d0, ground: true }, opts);
  const D = { left: [-1, 0], right: [1, 0], front: [0, 1], up: [0, 1], back: [0, -1], down: [0, -1] }[o.dir] || [1, 0];
  const g = new THREE.Group(); g.name = 'ItemPanah-' + o.dir; g.userData.dir = o.dir;
  const V = (x, y) => new THREE.Vector2(x, y);
  const outerPts = [V(1.7, 0), V(0.1, 1.15), V(0.1, 0.5), V(-1.7, 0.5), V(-1.7, -0.5), V(0.1, -0.5), V(0.1, -1.15)];
  const innerPts = [V(1.45, 0), V(0.12, 0.98), V(0.12, 0.39), V(-1.5, 0.39), V(-1.5, -0.39), V(0.12, -0.39), V(0.12, -0.98)];
  const geo = (pts, r, depth, bt, bs) => { const e = new THREE.ExtrudeGeometry(_roundedPoly(pts, r), { depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 8, curveSegments: 12 }); e.translate(0, 0, -depth / 2); return e; };
  const depth = o.mode ? o.mode === 'depth' : (o.dir === 'front' || o.dir === 'back'), vertical = !depth && D[1] !== 0, halfH = vertical ? 1.95 : 1.3;

  /* Bayangan di tanah (tidak ikut melayang) */
  let sh = null;
  if (o.ground) {
    sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: _canvasTex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(30,20,60,.45)'); gr.addColorStop(1, 'rgba(30,20,60,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }) }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; g.add(sh);
  }
  const bx = depth ? 1.2 : (vertical ? 2.8 : 4.4), bz = depth ? 4.4 : 1.6;

  /* Badan panah: bidang XY, menghadap +z. mir = cermin (kiri / bawah), spin = putaran di bidangnya */
  const fl = new THREE.Group(); fl.position.y = (o.ground ? o.hover + halfH : 0); g.add(fl);
  const yaw = new THREE.Group(); yaw.rotation.y = depth ? Math.PI / 2 : 0; fl.add(yaw);
  const mir = new THREE.Group(); mir.scale.set(depth ? (D[1] > 0 ? -1 : 1) : (D[0] < 0 ? -1 : 1), depth ? 1 : (D[1] < 0 ? -1 : 1), 1); yaw.add(mir);
  const spin = new THREE.Group(); spin.rotation.z = vertical ? Math.PI / 2 : 0; mir.add(spin);
  const rim = new THREE.Mesh(geo(outerPts, 0.3, 0.22, 0.16, 0.14), _G(o.rim, { roughness: 0.25, clearcoat: 1 })); rim.castShadow = true; spin.add(rim);
  const inner = new THREE.Mesh(geo(innerPts, 0.26, 0.26, 0.2, 0.16), _G(o.color, { roughness: 0.2, clearcoat: 1, emissive: 0x1b2a8a, emissiveIntensity: 0.25 })); inner.position.z = 0.05; inner.castShadow = true; spin.add(inner);
  const hl = new THREE.Shape(); hl.absarc(-0.8, 0, 0.05, Math.PI / 2, Math.PI * 1.5, false); hl.lineTo(0.2, -0.05); hl.absarc(0.2, 0, 0.05, -Math.PI / 2, Math.PI / 2, false); hl.closePath();
  const hlm = new THREE.Mesh(new THREE.ShapeGeometry(hl), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); hlm.position.set(-0.45, 0.2, 0.41); spin.add(hlm);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.07, 14), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })); dot.position.set(0.5, 0.5, 0.41); spin.add(dot);

  g.userData.update = (ms) => {
    const t = ms * 0.001, s = Math.sin(t * 2), n = (1 + Math.sin(t * 3)) * 0.1, base = o.ground ? o.hover + halfH : 0;
    const dx = depth ? 0 : D[0], dy = vertical ? D[1] : 0, dz = depth ? (D[1] || 0) : 0;
    fl.position.set(dx * n, base + s * 0.09 + dy * n, dz * n); fl.rotation.y = Math.sin(t * 1.3) * 0.14; fl.rotation.z = Math.sin(t * 1.7) * 0.03;
    if (sh) { const k = 1 - (s * 0.09) / (o.hover + 1); sh.scale.set(bx * k, bz * k, 1); sh.material.opacity = 0.9 * k; }
  };
  g.userData.update(0);
  return g;
}
export function createItemArrowLeft(o) { return createItemArrow(Object.assign({}, o, { dir: 'left' })); }
export function createItemArrowRight(o) { return createItemArrow(Object.assign({}, o, { dir: 'right' })); }
export function createItemArrowFront(o) { return createItemArrow(Object.assign({}, o, { dir: 'front' })); }
export function createItemArrowBack(o) { return createItemArrow(Object.assign({}, o, { dir: 'back' })); }

/* Satu set "kompas": empat panah berdiri mengelilingi tombol bulat di tanah (kiri, kanan, depan, belakang) */
export function createItemArrowPad(opts = {}) {
  const o = Object.assign({ gap: 2.6, size: 0.6, rim: 0xe3a9d0 }, opts), g = new THREE.Group(); g.name = 'ItemPanahPad'; const ar = [];
  [['left', -o.gap, 0], ['right', o.gap, 0], ['front', 0, o.gap], ['back', 0, -o.gap]].forEach(([d, x, z]) => { const a = createItemArrow(Object.assign({}, opts, { dir: d })); a.position.set(x, 0, z); a.scale.setScalar(o.size); g.add(a); ar.push(a); });
  const hub = _add(new THREE.SphereGeometry(0.85, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2), _G(o.rim, { roughness: 0.25, clearcoat: 1 }), 0, 0.02, 0, g); hub.scale.y = 0.5;
  g.userData.update = (ms) => { ar.forEach(a => a.userData.update(ms)); };
  g.userData.update(0);
  return g;
}
