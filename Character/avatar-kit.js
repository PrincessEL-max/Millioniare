import * as THREE from 'three';

/*
 * Enam avatar chibi bertema (wajah, proporsi, dan animasi idle sama dengan chibi.js / chibi-boy.js).
 *   createAvatar('princess' | 'prince' | 'witch' | 'pilot' | 'fairy' | 'builder', opsi)
 * Opsi umum: hair, eyes, skin, wave (true = tangan kanan melambai).
 * Menghadap +Z, kaki di y = 0, tinggi sekitar 3.7 - 4.3 unit. Butuh lampu di scene (MeshStandardMaterial).
 */
const MS = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0 }, o || {}));
const BA = c => new THREE.MeshBasicMaterial({ color: c });
const S = (r, w = 24, h = 18) => new THREE.SphereGeometry(r, w, h), C = (a, b, h, s = 20) => new THREE.CylinderGeometry(a, b, h, s);
const tip = (r, h, seg) => { const g = new THREE.ConeGeometry(r, h, seg); g.rotateX(Math.PI); return g; };
function add(g, m, x, y, z, p) { const s = new THREE.Mesh(g, m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
function tex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.encoding = THREE.sRGBEncoding; return t;
}
function frill(rt, rb, h, pleats, amp) {
  const g = new THREE.CylinderGeometry(rt, rb, h, 72, 1, true), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + amp * (y < 0 ? 1 : 0.35) * Math.sin(Math.atan2(z, x) * pleats); p.setXYZ(i, x * k, y, z * k); }
  g.computeVertexNormals(); return g;
}
function starGeo(n, ro, ri, depth = 0.04) {
  const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = i * Math.PI / n + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 }); g.translate(0, 0, -depth / 2); return g;
}
const GOLD = () => MS(0xd4af37, { metalness: 0.7, roughness: 0.3, emissive: 0x2a1f05 });

/* ---------- dasar chibi: kepala, mata, rambut, lengan ---------- */
function mkBase(o) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const skinM = MS(o.skin, { roughness: 0.5 }), hairM = MS(o.hair, { roughness: 0.32, metalness: 0.1, side: THREE.DoubleSide }), ups = [];
  const head = new THREE.Group(); head.position.set(0, 2.0, 0); body.add(head); const hc = new THREE.Group(); hc.position.y = 0.72; head.add(hc);
  add(C(0.1, 0.1, 0.14, 14), skinM, 0, 2.02, 0, body);
  add(S(0.78, 48, 36), skinM, 0, 0, 0, hc).scale.set(1.04, 0.98, 1);
  [-1, 1].forEach(s => { if (o.pointyEars) { const e = add(new THREE.ConeGeometry(0.11, 0.38, 10), skinM, s * 0.84, 0.04, -0.02, hc); e.rotation.z = -s * (Math.PI / 2 - 0.35); } else add(S(0.11, 14, 10), skinM, s * 0.8, -0.08, -0.02, hc).scale.x = 0.6; });
  const dark = new THREE.Color(o.eyes).multiplyScalar(0.5), glow = new THREE.Color(o.eyes).lerp(new THREE.Color(0xffffff), 0.35), eyes = [], k = o.boyEyes ? 0.94 : 1, brow = new THREE.Color(o.hair).multiplyScalar(0.7);
  [-1, 1].forEach(s => {
    const g = new THREE.Group(); g.position.set(s * 0.28, -0.06, 0.72); g.rotation.y = s * 0.37; hc.add(g);
    add(S(1, 20, 14), BA(0xfdfdfd), 0, 0, 0, g).scale.set(0.2 * k, 0.245 * k, 0.045); add(S(1, 20, 14), BA(dark), 0, -0.005, 0.018, g).scale.set(0.175 * k, 0.225 * k, 0.045);
    add(S(1, 20, 14), BA(o.eyes), 0, -0.02, 0.022, g).scale.set(0.16 * k, 0.2 * k, 0.045); add(S(1, 20, 14), BA(glow), 0, -0.08, 0.026, g).scale.set(0.12 * k, 0.1 * k, 0.045);
    add(S(1, 20, 14), BA(0x10202a), 0, 0, 0.034, g).scale.set(0.085 * k, 0.115 * k, 0.045); add(S(1, 14, 10), BA(0xffffff), -0.06, 0.09, 0.05, g).scale.set(0.065, 0.07, 0.045); add(S(1, 10, 8), BA(0xffffff), 0.07, -0.08, 0.05, g).scale.set(0.03, 0.03, 0.045);
    const lash = add(new THREE.TorusGeometry(0.215 * k, o.boyEyes ? 0.017 : 0.022, 6, 24, 2.5), BA(0x2a1712), 0, 0, 0.03, g); lash.rotation.z = Math.PI / 2 - 1.25; lash.scale.y = 1.15;
    if (!o.boyEyes) add(new THREE.BoxGeometry(0.09, 0.022, 0.03), BA(0x2a1712), s * 0.2, 0.1, 0.03, g).rotation.z = s * 0.5;
    add(new THREE.TorusGeometry(0.13, o.boyEyes ? 0.024 : 0.014, 6, 16, 1.3), BA(brow), 0, 0.36, 0, g).rotation.z = Math.PI / 2 - 0.65 - s * 0.12; eyes.push(g);
  });
  add(S(0.04, 10, 8), MS(0xf5bfa9), 0, -0.2, 0.77, hc); add(new THREE.TorusGeometry(0.075, 0.011, 6, 14, Math.PI), BA(0xc4605f), 0, -0.36, 0.7, hc).rotation.z = Math.PI;
  [-1, 1].forEach(s => { add(new THREE.CircleGeometry(0.09, 18), new THREE.MeshBasicMaterial({ color: 0xff8f9c, transparent: true, opacity: o.boyEyes ? 0.25 : 0.4 }), s * 0.46, -0.22, 0.6, hc).rotation.y = s * 0.66; });
  // rambut
  const h = Object.assign({ back: 0, side: 0.6, bang: 0.36, part: -0.2, backTheta: 1.5 }, o.hairCfg), backs = [], bangs = [];
  add(new THREE.SphereGeometry(0.84, 40, 24, 0, Math.PI * 2, 0, 1.0), hairM, 0, 0, -0.02, hc); add(new THREE.SphereGeometry(0.85, 40, 24, Math.PI / 2 + 1.4, Math.PI * 2 - 2.8, 0.9, h.backTheta), hairM, 0, 0, -0.03, hc);
  for (let i = 0; i < 11; i++) { const a = -1.15 + i * 0.23, L = h.bang + 0.08 * Math.abs(Math.sin(i * 1.7)), pv = new THREE.Group(); pv.rotation.y = a; hc.add(pv); const m = add(tip(0.1, L, 6), hairM, 0, 0.5 - L / 2 + 0.04, 0.69, pv); m.scale.z = 0.45; m.rotation.z = a < h.part ? -0.28 : 0.28; bangs.push(m); }
  [-1, 1].forEach(s => { const pv = new THREE.Group(); pv.rotation.y = s * 1.15; hc.add(pv); const m = add(tip(0.13, h.side, 7), hairM, 0, 0.3 - h.side / 2, 0.75, pv); m.scale.z = 0.5; m.rotation.z = -s * 0.06; bangs.push(m); });
  if (h.back) for (let i = 0; i < 9; i++) { const L = h.back - Math.abs(i - 4) * 0.05, pv = new THREE.Group(); pv.rotation.y = Math.PI + (i - 4) * 0.33; hc.add(pv); const m = add(tip(0.17, L, 7), hairM, 0, 0.12 - L / 2, 0.66, pv); m.rotation.x = 0.2; m.userData.base = Math.sin(i * 1.7) * 0.08; m.rotation.z = m.userData.base; m.scale.z = 0.5; backs.push(m); }
  return { root, body, head, hc, skinM, hairM, eyes, backs, bangs, ups, legs: [], arms: [], o };
}
function mkHand(p, m) {
  const h = new THREE.Group(); p.add(h); add(S(0.085, 14, 10), m, 0, -0.05, 0, h).scale.set(1, 1.1, 0.6);
  [-0.045, -0.015, 0.015, 0.045].forEach((x, i) => { const f = new THREE.Group(); f.position.set(x, -0.1, 0); f.rotation.z = -x * 2.2; h.add(f); const dy = (i === 1 || i === 2) ? 0.01 : 0; add(C(0.02, 0.019, 0.1, 8), m, 0, -0.05 - dy, 0, f); add(S(0.02, 8, 6), m, 0, -0.105 - dy, 0, f); });
  add(C(0.022, 0.02, 0.08, 8), m, 0.075, -0.06, 0.01, h).rotation.z = -0.9; return h;
}
/* a = { upper, fore, hand, cuff, puff, x }  (warna hex; kosong = kulit) */
function mkArms(b, a = {}) {
  [-1, 1].forEach(s => {
    const arm = new THREE.Group(); arm.position.set(s * (a.x || 0.36), 1.9, 0); b.body.add(arm); const um = a.upper ? MS(a.upper, { roughness: 0.85 }) : b.skinM, fm = a.fore ? MS(a.fore, { roughness: 0.85 }) : b.skinM, hm = a.hand ? MS(a.hand, { roughness: 0.6 }) : b.skinM;
    add(C(0.1, 0.095, 0.34, 16), um, 0, -0.17, 0, arm); add(S(0.1, 14, 10), um, 0, 0, 0, arm); if (a.puff) add(S(0.15, 16, 12), MS(a.puff, { roughness: 0.8 }), 0, 0.02, 0, arm);
    const e = new THREE.Group(); e.position.y = -0.34; arm.add(e); add(S(0.095, 14, 10), fm, 0, 0, 0, e); add(C(0.094, 0.086, 0.3, 16), fm, 0, -0.15, 0, e); if (a.cuff) add(C(0.098, 0.098, 0.06, 16), MS(a.cuff, { roughness: 0.5 }), 0, -0.27, 0, e);
    const h = new THREE.Group(); h.position.y = -0.33; e.add(h); const hd = mkHand(h, hm); b.arms.push({ a: arm, e, hd, s, h });
  });
}
function boot(leg, col, tall, toe) {
  const m = MS(col, { roughness: 0.5 }); add(S(0.17, 20, 12), MS(0x2e1e18), 0, 0.045, 0.07, leg).scale.set(0.95, 0.28, 1.5); add(S(0.16, 20, 14), m, 0, 0.15, 0.07, leg).scale.set(0.95, 0.75, 1.45); add(C(0.128, 0.138, tall, 20), m, 0, 0.07 + tall / 2, 0, leg);
  if (toe) { const t = add(new THREE.ConeGeometry(0.1, 0.3, 12), m, 0, 0.2, 0.3, leg); t.rotation.x = Math.PI / 2 + 0.5; }
}
function finish(b, wave) {
  const { root, body, head, eyes, backs, bangs, ups, legs, arms } = b;
  root.userData.waving = !!wave;
  root.userData.update = (ms) => {
    const t = ms * 0.001, walking = root.userData.walking;
    body.position.y = walking ? 0 : Math.abs(Math.sin(t * 1.2)) * 0.015;
    body.rotation.z = walking ? Math.sin(t * 10) * 0.004 : Math.sin(t * 1.2) * 0.02;
    head.rotation.z = 0.04 + Math.sin(t * 0.9) * 0.04; head.rotation.y = Math.sin(t * 0.6) * 0.12;
    const bl = (t % 3.8) < 0.13 ? 0.08 : 1; eyes.forEach(e => { e.scale.y = bl; });
    backs.forEach((m, i) => { m.rotation.z = m.userData.base + Math.sin(t * 1.4 + i * 0.7) * 0.03; }); bangs.forEach((m, i) => { m.rotation.x = Math.sin(t * 1.1 + i) * 0.015; });
    legs.forEach(({ leg, s }) => { leg.rotation.x = walking ? s * Math.sin(t * 10) * 0.16 : 0; });
    arms.forEach(({ a, e, hd, s }) => {
      if (root.userData.waving && s === 1) { a.rotation.z = 1.5 + Math.sin(t * 2) * 0.05; e.rotation.z = 1.15 + Math.sin(t * 7) * 0.32; hd.rotation.z = Math.sin(t * 7 + 1) * 0.25; }
      else { a.rotation.z = walking ? -s * Math.sin(t * 10) * 0.2 : 0; e.rotation.z = walking ? s * 0.08 : 0; hd.rotation.z = 0; }
    });
    ups.forEach(f => f(t));
  };
  root.userData.setWalking = value => { root.userData.walking = value; };
  root.userData.setWaving = value => { root.userData.waving = value; };
  root.userData.update(0); return root;
}

/* =============================== PRINCESS =============================== */
function princess(opt) {
  const o = Object.assign({ hair: 0xf2c75c, eyes: 0x5a8cff, skin: 0xffe0cf, wave: true }, opt), b = mkBase(Object.assign({}, o, { hairCfg: { back: 1.55, side: 1.0, bang: 0.36, part: -0.15 } })), { body, hc } = b, gold = GOLD();
  const gm = MS(0xffffff, { roughness: 0.55, side: THREE.DoubleSide, map: tex(128, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e2508f'); g.addColorStop(0.55, '#f0709f'); g.addColorStop(1, '#f9a8c9'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; for (let x = 0; x < w; x += 16) { c.beginPath(); c.arc(x + 8, h - 6, 9, Math.PI, 0); c.fill(); } for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(Math.random() * w, Math.random() * (h - 24), 2, 2); } }, 6, 1) });
  [[0.5, 0.88, 0.5, 0.32, 16], [0.4, 0.74, 0.5, 0.68, 14], [0.3, 0.57, 0.6, 1.05, 12]].forEach(([rt, rb, h, y, p]) => add(frill(rt, rb, h, p, 0.05), gm, 0, y, 0, body));
  add(C(0.26, 0.3, 0.62, 24), MS(0xe9709f, { roughness: 0.6 }), 0, 1.66, 0, body); add(S(0.3, 24, 14), MS(0xe9709f), 0, 1.93, 0, body).scale.set(1.08, 0.5, 0.82); add(new THREE.TorusGeometry(0.165, 0.04, 8, 22), MS(0xffffff), 0, 1.97, 0, body).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(0.29, 0.07, 10, 28), MS(0xc9467f), 0, 1.36, 0, body).rotation.x = Math.PI / 2; add(S(0.07, 12, 10), gold, 0, 1.36, 0.3, body);
  for (let i = 0; i < 9; i++) { const a = -1.3 + i * 0.325; add(S(0.032, 10, 8), MS(0xffffff, { roughness: 0.3 }), Math.sin(a) * 0.17, 1.93 - Math.abs(a) * 0.04, Math.cos(a) * 0.17 + 0.03, body); }
  add(S(0.06, 10, 8), MS(0x4aa8ff, { roughness: 0.2 }), 0, 1.84, 0.2, body);
  const bow = new THREE.Group(); bow.position.set(0, 1.4, -0.33); body.add(bow); [-1, 1].forEach(s => add(S(0.15, 14, 10), MS(0xc9467f), s * 0.17, 0.0, 0, bow).scale.set(1.5, 0.9, 0.5)); add(S(0.07, 10, 8), MS(0xe9709f), 0, 0, 0.03, bow); [-1, 1].forEach(s => { const t = add(new THREE.BoxGeometry(0.1, 0.6, 0.03), MS(0xe9709f), s * 0.1, -0.35, 0, bow); t.rotation.z = s * 0.12; });
  [-1, 1].forEach(s => add(S(0.1, 14, 8), MS(0xf8b4cf), s * 0.17, 0.06, 0.62, body).scale.set(1, 0.55, 1.4));
  mkArms(b, { upper: null, fore: 0xffffff, hand: 0xffffff, cuff: 0xf49ac2, puff: 0xf7a5c6 });
  add(new THREE.TorusGeometry(0.69, 0.03, 8, 48), gold, 0, 0.5, 0, hc).rotation.x = Math.PI / 2;
  for (let i = 0; i < 7; i++) { const a = (i - 3) * 0.3, c = add(new THREE.ConeGeometry(0.045, i === 3 ? 0.24 : 0.14, 8), gold, Math.sin(a) * 0.69, 0.5 + (i === 3 ? 0.12 : 0.07), Math.cos(a) * 0.69, hc); c.rotation.x = Math.sin(a) * 0; }
  add(S(0.065, 12, 10), MS(0x4aa8ff, { roughness: 0.15, emissive: 0x1a5aa0 }), 0, 0.68, 0.69, hc);
  [-1, 1].forEach(s => [[-0.5, 0.11], [-0.68, 0.1], [-0.84, 0.085]].forEach(([y, r]) => add(S(r, 12, 10), b.hairM, s * 0.7, y, 0.33, hc)));
  return finish(b, o.wave);
}

/* =============================== PANGERAN =============================== */
function prince(opt) {
  const o = Object.assign({ hair: 0x6b4a2e, eyes: 0x2f9aa0, skin: 0xffd9c4, wave: true }, opt), b = mkBase(Object.assign({}, o, { boyEyes: true, hairCfg: { back: 0, side: 0.5, bang: 0.3, part: -1.6, backTheta: 1.2 } })), { body, hc } = b, gold = GOLD(), blue = MS(0x2d4aa8, { roughness: 0.75 }), white = MS(0xf6f6f2, { roughness: 0.7 });
  [-1, 1].forEach(s => { const leg = new THREE.Group(); leg.position.set(s * 0.17, 0, 0); body.add(leg); b.legs.push({ leg, s }); add(C(0.115, 0.105, 1.1, 16), white, 0, 0.8, 0, leg); boot(leg, 0x3a2418, 0.42, false); });
  add(C(0.29, 0.36, 0.62, 28), blue, 0, 1.69, 0, body); add(C(0.37, 0.52, 0.5, 32), blue, 0, 1.15, 0, body); add(C(0.525, 0.525, 0.05, 32), gold, 0, 0.92, 0, body); add(C(0.29, 0.29, 0.04, 28), gold, 0, 1.4, 0, body);
  add(S(0.3, 24, 14), blue, 0, 1.94, 0, body).scale.set(1.15, 0.5, 0.82); add(new THREE.TorusGeometry(0.17, 0.05, 8, 22), white, 0, 1.97, 0, body).rotation.x = Math.PI / 2; add(tip(0.13, 0.34, 10), white, 0, 1.78, 0.3, body).scale.z = 0.5;
  [-1, 1].forEach(s => { add(new THREE.BoxGeometry(0.2, 0.05, 0.16), gold, s * 0.33, 2.0, 0, body); for (let i = 0; i < 4; i++) add(C(0.012, 0.012, 0.12, 6), gold, s * 0.33 + (i - 1.5) * 0.045, 1.94, 0, body); });
  add(new THREE.BoxGeometry(0.13, 0.95, 0.03), MS(0xc0283a, { roughness: 0.6 }), 0, 1.66, 0.335, body).rotation.z = 0.72; add(S(0.055, 12, 10), gold, -0.16, 1.4, 0.36, body);
  [1.72, 1.58, 1.44].forEach(y => add(S(0.025, 8, 6), gold, 0.06, y, 0.35, body));
  const cape = new THREE.Group(); cape.position.set(0, 1.98, -0.3); body.add(cape); add(new THREE.BoxGeometry(0.82, 1.2, 0.04), MS(0xc0283a, { roughness: 0.7, side: THREE.DoubleSide }), 0, -0.62, 0, cape); add(new THREE.BoxGeometry(0.84, 0.1, 0.05), white, 0, -1.22, 0, cape);
  add(new THREE.TorusGeometry(0.3, 0.075, 10, 24), white, 0, 1.97, -0.02, body).rotation.x = Math.PI / 2;
  b.ups.push(t => { cape.rotation.x = 0.08 + Math.sin(t * 1.6) * 0.05; });
  mkArms(b, { upper: 0x2d4aa8, fore: 0x2d4aa8, hand: 0xffffff, cuff: 0xd4af37, x: 0.37 });
  add(new THREE.TorusGeometry(0.69, 0.05, 8, 48), gold, 0, 0.5, 0, hc).rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 6 + 0.0; const c = add(new THREE.ConeGeometry(0.07, 0.22, 8), gold, Math.sin(a) * 0.69, 0.62, Math.cos(a) * 0.69, hc); add(S(0.04, 8, 6), MS(0xd0342c, { roughness: 0.2, emissive: 0x500a0a }), Math.sin(a) * 0.69, 0.76, Math.cos(a) * 0.69, hc); c.rotation.x = 0; }
  add(S(0.05, 8, 6), MS(0x4aa8ff, { emissive: 0x1a5aa0 }), 0, 0.5, 0.72, hc);
  return finish(b, o.wave);
}

/* =============================== PENYIHIR =============================== */
function witch(opt) {
  const o = Object.assign({ hair: 0x2a2050, eyes: 0x8a5cff, skin: 0xffe3d6, wave: true }, opt), b = mkBase(Object.assign({}, o, { hairCfg: { back: 1.4, side: 0.9, bang: 0.34, part: 0 } })), { body, hc } = b, gold = GOLD(), purple = MS(0x5a3a9a, { roughness: 0.7 });
  const stripe = MS(0xffffff, { map: tex(32, 64, (c, w, h) => { c.fillStyle = '#2b2040'; c.fillRect(0, 0, w, h); c.fillStyle = '#b48cf0'; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 8); }, 1, 5), roughness: 0.9 });
  [-1, 1].forEach(s => { const leg = new THREE.Group(); leg.position.set(s * 0.17, 0, 0); body.add(leg); b.legs.push({ leg, s }); add(C(0.088, 0.08, 0.9, 14), b.skinM, 0, 0.5, 0, leg); add(C(0.1, 0.092, 0.82, 14), stripe, 0, 0.46, 0, leg); boot(leg, 0x2b2040, 0.22, true); });
  add(C(0.28, 0.34, 0.6, 24), MS(0xffffff, { roughness: 0.7, map: tex(64, 64, (c, w, h) => { c.fillStyle = '#5a3a9a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd24a'; for (let i = 0; i < 9; i++) { c.fillRect((i * 29) % w, (i * 17) % h, 4, 4); } }, 2, 2) }), 0, 1.67, 0, body);
  add(frill(0.3, 0.64, 0.55, 14, 0.06), MS(0x3b2570, { roughness: 0.75, side: THREE.DoubleSide }), 0, 1.1, 0, body); add(S(0.3, 24, 14), purple, 0, 1.93, 0, body).scale.set(1.08, 0.5, 0.82);
  add(C(0.34, 0.34, 0.06, 24), gold, 0, 1.38, 0, body); add(new THREE.TorusGeometry(0.17, 0.045, 8, 22), MS(0xe8e0f8), 0, 1.97, 0, body).rotation.x = Math.PI / 2;
  const cape = new THREE.Group(); cape.position.set(0, 1.98, -0.3); body.add(cape); add(new THREE.BoxGeometry(0.95, 1.5, 0.04), MS(0xffffff, { roughness: 0.8, side: THREE.DoubleSide, map: tex(16, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1f55'); g.addColorStop(0.9, '#3d2a7a'); g.addColorStop(1, '#d04a9a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }) }), 0, -0.76, 0, cape);
  add(S(0.06, 10, 8), gold, 0, 1.93, 0.3, body); add(S(0.04, 8, 6), MS(0xd0342c, { emissive: 0x500a0a }), 0, 1.93, 0.35, body); const moon = add(new THREE.TorusGeometry(0.07, 0.025, 8, 16, 4.2), gold, 0, 1.74, 0.33, body); moon.rotation.z = 0.9;
  b.ups.push(t => { cape.rotation.x = 0.06 + Math.sin(t * 1.5) * 0.05; });
  mkArms(b, { upper: 0x5a3a9a, fore: 0x5a3a9a, hand: null, cuff: 0xd4af37 });
  const hat = new THREE.Group(); hat.position.y = 0.5; hat.rotation.set(0.05, 0, -0.07); hc.add(hat); const hm = MS(0x2f2058, { roughness: 0.8 });
  add(C(0.98, 0.98, 0.06, 40), hm, 0, 0, 0, hat); add(new THREE.ConeGeometry(0.62, 1.05, 28), hm, 0, 0.52, 0, hat); const bend = add(new THREE.ConeGeometry(0.22, 0.6, 20), hm, 0.2, 1.2, 0, hat); bend.rotation.z = -0.55;
  add(new THREE.TorusGeometry(0.6, 0.065, 10, 36), MS(0xd04a9a), 0, 0.12, 0, hat).rotation.x = Math.PI / 2; add(starGeo(5, 0.15, 0.065, 0.05), gold, 0, 0.12, 0.62, hat);
  const wh = b.arms[1].hd; add(C(0.022, 0.022, 0.9, 8), MS(0x7a4a2a), 0, -0.3, 0, wh); add(starGeo(5, 0.17, 0.075, 0.05), gold, 0, -0.78, 0, wh); add(S(0.07, 10, 8), MS(0xfff2a0, { emissive: 0xffd24a, emissiveIntensity: 0.9 }), 0, -0.78, 0, wh);
  return finish(b, o.wave);
}

/* =============================== PILOT =============================== */
function pilot(opt) {
  const o = Object.assign({ hair: 0xf0c860, eyes: 0x3a8ae8, skin: 0xf6d2b8, wave: true }, opt), b = mkBase(Object.assign({}, o, { hairCfg: { back: 0.75, side: 0.6, bang: 0.34, part: -0.2 } })), { body, hc } = b, brown = MS(0x8a5a34, { roughness: 0.7 }), leather = MS(0x6b4a2a, { roughness: 0.55 });
  [-1, 1].forEach(s => { const leg = new THREE.Group(); leg.position.set(s * 0.17, 0, 0); body.add(leg); b.legs.push({ leg, s }); add(C(0.09, 0.08, 0.95, 14), b.skinM, 0, 0.62, 0, leg); boot(leg, 0x5a3a20, 0.6, false); add(C(0.14, 0.15, 0.46, 18), MS(0xb8944e, { roughness: 0.85 }), 0, 1.05, 0, leg); });
  add(C(0.3, 0.37, 0.62, 28), brown, 0, 1.68, 0, body); add(C(0.375, 0.375, 0.06, 28), MS(0x5a3a20), 0, 1.38, 0, body); add(S(0.3, 24, 14), brown, 0, 1.94, 0, body).scale.set(1.12, 0.5, 0.82);
  add(new THREE.BoxGeometry(0.025, 0.58, 0.01), MS(0xe8dcc0), 0, 1.68, 0.335, body); add(new THREE.TorusGeometry(0.28, 0.1, 10, 26), MS(0xf3ead2, { roughness: 0.95 }), 0, 1.97, 0, body).rotation.x = Math.PI / 2;
  [-1, 1].forEach(s => { const w = add(new THREE.BoxGeometry(0.09, 0.025, 0.01), GOLD(), 0.2 + s * 0.06, 1.8, 0.34, body); w.rotation.z = s * 0.3; }); add(S(0.035, 10, 8), GOLD(), 0.2, 1.79, 0.345, body);
  add(new THREE.BoxGeometry(0.12, 0.1, 0.03), MS(0xc0283a), -0.38, 1.9, 0.12, body);
  add(new THREE.TorusGeometry(0.19, 0.07, 10, 22), MS(0xffffff), 0, 1.92, 0, body).rotation.x = Math.PI / 2; const sc = new THREE.Group(); sc.position.set(0.1, 1.82, -0.28); body.add(sc); add(new THREE.BoxGeometry(0.16, 0.8, 0.03), MS(0xffffff, { side: THREE.DoubleSide }), 0, -0.4, 0, sc);
  b.ups.push(t => { sc.rotation.z = 0.15 + Math.sin(t * 2.2) * 0.1; sc.rotation.x = 0.2 + Math.sin(t * 1.7) * 0.08; });
  mkArms(b, { upper: 0x8a5a34, fore: 0x8a5a34, hand: 0x5a3a20, cuff: 0xf3ead2 });
  add(new THREE.SphereGeometry(0.9, 36, 20, 0, Math.PI * 2, 0, 1.25), leather, 0, 0, 0, hc); [-1, 1].forEach(s => add(S(0.22, 14, 10), leather, s * 0.82, -0.05, 0.05, hc).scale.set(0.45, 1.25, 0.9));
  add(new THREE.TorusGeometry(0.84, 0.05, 8, 48), BA(0x1a1a1a), 0, 0.42, 0, hc).rotation.x = Math.PI / 2;
  [-1, 1].forEach(s => { const g = new THREE.Group(); g.position.set(s * 0.22, 0.52, 0.74); g.rotation.x = -0.35; hc.add(g); add(new THREE.TorusGeometry(0.17, 0.04, 8, 24), GOLD(), 0, 0, 0, g); add(C(0.15, 0.15, 0.04, 20), MS(0x7ac0f0, { roughness: 0.15, transparent: true, opacity: 0.8 }), 0, 0, 0, g).rotation.x = Math.PI / 2; });
  return finish(b, o.wave);
}

/* =============================== PERI =============================== */
function fairy(opt) {
  const o = Object.assign({ hair: 0xf7a5b6, eyes: 0x4ab36a, skin: 0xffd9c8, wave: true }, opt), b = mkBase(Object.assign({}, o, { pointyEars: true, hairCfg: { back: 0.6, side: 0.55, bang: 0.34, part: -0.15 } })), { body, hc } = b, mint = MS(0x7fd8b0, { roughness: 0.7 });
  [-1, 1].forEach(s => { const leg = new THREE.Group(); leg.position.set(s * 0.17, 0, 0); body.add(leg); b.legs.push({ leg, s }); add(C(0.088, 0.08, 1.0, 14), b.skinM, 0, 0.55, 0, leg); add(S(0.15, 16, 12), MS(0x5fbf6a), 0, 0.07, 0.06, leg).scale.set(0.9, 0.5, 1.5); const t = add(new THREE.ConeGeometry(0.07, 0.28, 10), MS(0x5fbf6a), 0, 0.1, 0.28, leg); t.rotation.x = Math.PI / 2 + 0.4; add(S(0.055, 10, 8), MS(0xff8fb8), 0, 0.12, 0.08, leg); });
  add(C(0.27, 0.31, 0.62, 24), mint, 0, 1.66, 0, body); add(S(0.3, 24, 14), mint, 0, 1.93, 0, body).scale.set(1.05, 0.5, 0.82); add(new THREE.TorusGeometry(0.165, 0.04, 8, 22), MS(0xfff2f8), 0, 1.97, 0, body).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.29, 0.05, 8, 26), MS(0xff8fb8), 0, 1.38, 0, body).rotation.x = Math.PI / 2;
  [[9, 0.34, 0.5, 0x7fd8b0, 0.55], [9, 0.26, 0.4, 0xff8fb8, 0.35]].forEach(([n, r, len, col, y], li) => { for (let i = 0; i < n; i++) { const pv = new THREE.Group(); pv.rotation.y = (i + li * 0.5) * Math.PI * 2 / n; pv.position.y = 1.36; body.add(pv); const p = add(S(1, 14, 10), MS(col, { roughness: 0.6 }), 0, -len / 2 + (li ? 0.0 : 0.0), r, pv); p.scale.set(0.22, len * 0.55, 0.07); p.rotation.x = -0.55 - li * 0.12; } });
  const wing = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, side: THREE.DoubleSide, roughness: 0.2, emissive: 0x6ab8d8, emissiveIntensity: 0.35, depthWrite: false, map: tex(128, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#78d4ff'); g.addColorStop(0.5, '#d8a0ff'); g.addColorStop(1, '#7ff0cc'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(40,110,180,.8)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, h / 2); c.quadraticCurveTo(w * 0.5, h * (i / 5), w, h * (0.15 + i * 0.14)); c.stroke(); } }) });
  const wings = []; [-1, 1].forEach(s => [[1.15, 0.62, 0.65, 0.35, 0.0], [0.8, 0.42, 0.5, -0.45, -0.32]].forEach(([wl, wh, ang, lift, dy], k) => {
    const pv = new THREE.Group(); pv.position.set(s * 0.1, 1.85 + dy, -0.3); body.add(pv); const sh = new THREE.Shape(); sh.absellipse(wl * 0.5, 0, wl * 0.5, wh * 0.5, 0, Math.PI * 2, false); const g = new THREE.ShapeGeometry(sh, 24); const m = new THREE.Mesh(g, wing); m.scale.x = s; pv.add(m); pv.userData = { s, ang: s * ang, lift };
    pv.rotation.set(0, s * ang, s * lift); wings.push(pv); }));
  b.ups.push(t => { wings.forEach((pv, i) => { const f = Math.sin(t * 5 + (i % 2) * 0.4) * 0.22; pv.rotation.y = pv.userData.s * (0.55 + f) * (i % 2 ? 0.9 : 1); }); });
  mkArms(b, { upper: null, fore: null, hand: null, cuff: 0xff8fb8, puff: 0xff9ec4, x: 0.36 });
  for (let i = 0; i < 10; i++) { const a = i * Math.PI * 2 / 10, col = [0xff8fb8, 0xffd24a, 0xffffff, 0xb48cf0][i % 4]; add(S(0.075, 10, 8), MS(col, { roughness: 0.5 }), Math.sin(a) * 0.7, 0.52, Math.cos(a) * 0.7, hc); add(new THREE.ConeGeometry(0.04, 0.16, 6), MS(0x4fb85a), Math.sin(a + 0.16) * 0.7, 0.52, Math.cos(a + 0.16) * 0.7, hc).rotation.z = 1.2; }
  [-1, 1].forEach(s => { const pv = new THREE.Group(); pv.position.set(s * 0.66, 0.12, -0.12); hc.add(pv); add(S(0.07, 10, 8), MS(0xff8fb8), 0, 0.1, 0, pv); add(tip(0.12, 0.55, 8), b.hairM, 0, -0.2, 0, pv); });
  const sparks = [0, 1, 2].map(i => add(starGeo(5, 0.1, 0.045, 0.03), MS(0xfff2a0, { emissive: 0xffd24a, emissiveIntensity: 0.9 }), 0, 0, 0, hc)); b.ups.push(t => sparks.forEach((st, i) => { const a = t * 1.1 + i * 2.1; st.position.set(Math.cos(a) * 1.15, 0.2 + Math.sin(t * 1.7 + i) * 0.3, Math.sin(a) * 1.15); st.rotation.y = t * 2; }));
  return finish(b, o.wave);
}

/* =============================== PEKERJA BANGUNAN =============================== */
function builder(opt) {
  const o = Object.assign({ hair: 0x3a2a1e, eyes: 0x8a5a2a, skin: 0xf0cba8, wave: true }, opt), b = mkBase(Object.assign({}, o, { boyEyes: true, hairCfg: { back: 0, side: 0.45, bang: 0.28, part: 0, backTheta: 1.2 } })), { body, hc } = b;
  const jeans = MS(0x3f6fb0, { roughness: 0.85 }), vest = MS(0xff7a1a, { roughness: 0.75 }), silver = MS(0xe8e8ee, { roughness: 0.3, metalness: 0.4 }), tan = 0xb5834a;
  [-1, 1].forEach(s => { const leg = new THREE.Group(); leg.position.set(s * 0.17, 0, 0); body.add(leg); b.legs.push({ leg, s }); add(C(0.115, 0.105, 1.1, 16), jeans, 0, 0.8, 0, leg); add(C(0.122, 0.122, 0.07, 16), MS(0x5a8ad0), 0, 0.31, 0, leg); boot(leg, tan, 0.34, false); });
  add(C(0.3, 0.37, 0.62, 28), MS(0x70767e, { roughness: 0.8 }), 0, 1.69, 0, body); add(S(0.3, 24, 14), MS(0x70767e), 0, 1.94, 0, body).scale.set(1.15, 0.5, 0.82);
  add(C(0.305, 0.38, 0.58, 28), vest, 0, 1.66, 0, body); [1.82, 1.55].forEach((y, i) => add(C(0.325 + (i ? 0.035 : 0), 0.325 + (i ? 0.035 : 0), 0.06, 28), silver, 0, y, 0, body));
  add(new THREE.TorusGeometry(0.34, 0.05, 8, 28), MS(0x4a3220, { roughness: 0.6 }), 0, 1.4, 0, body).rotation.x = Math.PI / 2; add(new THREE.BoxGeometry(0.1, 0.08, 0.03), GOLD(), 0, 1.4, 0.37, body);
  [-1, 1].forEach(s => add(new THREE.BoxGeometry(0.15, 0.15, 0.1), MS(0x5a3a20), s * 0.31, 1.32, 0.12, body)); const ham = new THREE.Group(); ham.position.set(-0.4, 1.22, 0.08); ham.rotation.z = 0.12; body.add(ham); add(C(0.022, 0.022, 0.34, 8), MS(0x8a5a30), 0, -0.1, 0, ham); add(new THREE.BoxGeometry(0.16, 0.07, 0.07), MS(0x9aa0a8, { metalness: 0.6 }), 0, 0.1, 0, ham);
  add(C(0.1, 0.1, 0.14, 14), MS(0x70767e), 0, 2.02, 0, body);
  mkArms(b, { upper: 0x70767e, fore: 0x70767e, hand: 0xf2b01e, cuff: 0xff7a1a, x: 0.37 });
  const yel = MS(0xf7b43a, { roughness: 0.5 }), deep = MS(0xf3a62a, { roughness: 0.5 }), dome = add(new THREE.SphereGeometry(0.93, 40, 22, 0, Math.PI * 2, 0, Math.PI / 2), yel, 0, 0.4, 0, hc); dome.scale.set(1, 0.85, 1.08);
  const pts = []; for (let i = -10; i <= 10; i++) { const f = i / 10 * 1.3; pts.push(new THREE.Vector3(0, 0.79 * 1.05 * Math.cos(f) + 0.4, 1.0 * 1.04 * Math.sin(f))); } add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.1, 10), deep, 0, 0, 0, hc).scale.x = 1.5;
  const lip = add(new THREE.TorusGeometry(0.95, 0.1, 14, 48), deep, 0, 0.4, 0, hc); lip.rotation.x = Math.PI / 2; lip.scale.set(1, 1.08, 0.6); add(S(0.7, 24, 12), deep, 0, 0.44, 0.88, hc).scale.set(1.1, 0.12, 0.6); add(S(0.09, 12, 10), MS(0xdadde2, { metalness: 0.5 }), 0, 0.66, 0.97, hc);
  return finish(b, o.wave);
}

export const AVATAR_TYPES = ['princess', 'prince', 'witch', 'pilot', 'fairy', 'builder'];
export function createAvatar(type, opts = {}) {
  const f = { princess, prince, witch, pilot, fairy, builder }[type]; if (!f) throw new Error('Avatar tidak dikenal: ' + type);
  const g = f(opts); g.name = 'Avatar_' + type; g.userData.type = type; return g;
}
export const createPrincess = o => createAvatar('princess', o), createPrince = o => createAvatar('prince', o), createWitch = o => createAvatar('witch', o), createPilot = o => createAvatar('pilot', o), createFairy = o => createAvatar('fairy', o), createBuilder = o => createAvatar('builder', o);
