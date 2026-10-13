import * as THREE from 'three';

/**
 * Karakter chibi 3D (kepala besar, mata teal raksasa, rambut panjang + cepol berpita,
 * sweater, rok kotak-kotak tiga lapis, sepatu bot) sebagai THREE.Group.
 * Menghadap +Z, kaki di y = 0, tinggi sekitar 3.6 unit. Shading lembut (MeshStandardMaterial).
 *
 *   const anak = createChibi({ hair: 0x6b3d2e, eyes: 0x2f9aa0, wave: true });
 *   anak.position.set(x, 0, z);
 *   anak.scale.setScalar(0.4);
 *   scene.add(anak);
 *   // di loop animasi (butuh lampu di scene):
 *   anak.userData.update(performance.now());
 *
 * Opsi (semua boleh dikosongkan):
 *   hair, eyes, skin, sweater, trim (garis sweater + manset bot), plaidA/plaidB (warna rok kotak),
 *   boots, socks, ribbon (pita, tali sepatu)     wave: true -> melambai
 */
export function createChibi(opts = {}) {
  const o = Object.assign({ hair: 0x6b3d2e, eyes: 0x2f9aa0, skin: 0xffd9c4, sweater: 0xec9a9c, trim: 0x86aebd, plaidA: 0x3b7f95, plaidB: 0xf1d3d3, boots: 0xb4705a, socks: 0x9b949b, ribbon: 0xf08aa0, wave: false }, opts);
  const root = new THREE.Group(); root.name = 'Chibi';
  const hex = c => '#' + new THREE.Color(c).getHexString();
  const MS = (c, x) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0 }, x || {}));
  const B = c => new THREE.MeshBasicMaterial({ color: c });
  const S = (r, w = 24, h = 18) => new THREE.SphereGeometry(r, w, h), C = (a, b, h, s = 20) => new THREE.CylinderGeometry(a, b, h, s);
  const tip = (r, h, seg) => { const g = new THREE.ConeGeometry(r, h, seg); g.rotateX(Math.PI); return g; };
  function add(g, m, x, y, z, p) { const s = new THREE.Mesh(g, m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function tex(fn, w, h, rx, ry) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.encoding = THREE.sRGBEncoding; return t; }
  function frill(rt, rb, h, pleats, amp) {
    const g = new THREE.CylinderGeometry(rt, rb, h, 72, 1, true), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + amp * (y < 0 ? 1 : 0.35) * Math.sin(Math.atan2(z, x) * pleats); p.setXYZ(i, x * k, y, z * k); }
    g.computeVertexNormals(); return g;
  }
  const plaid = MS(0xffffff, { map: tex((g, w, h) => {
    g.fillStyle = hex(o.plaidA); g.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 32) { g.globalAlpha = 0.45; g.fillStyle = '#16324a'; g.fillRect(i + 4, 0, 12, h); g.fillRect(0, i + 4, w, 12); g.globalAlpha = 0.6; g.fillStyle = hex(o.plaidB); g.fillRect(i + 22, 0, 4, h); g.fillRect(0, i + 22, w, 4); }
    g.globalAlpha = 1;
  }, 128, 128, 5, 1), roughness: 0.8, side: THREE.DoubleSide });
  const stripe = MS(0xffffff, { map: tex((g, w, h) => { g.fillStyle = hex(o.trim); g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, 20, w, 8); g.fillStyle = 'rgba(30,60,90,.3)'; g.fillRect(0, 38, w, 8); }, 64, 64, 6, 1), roughness: 0.8 });
  const skinM = MS(o.skin, { roughness: 0.5 }), hairM = MS(o.hair, { roughness: 0.32, metalness: 0.1, side: THREE.DoubleSide }), pink = MS(o.sweater, { roughness: 0.85 });
  const body = new THREE.Group(); root.add(body);

  /* Sepatu bot, kaus kaki, kaki */
  const legs = [];
  [-1, 1].forEach(s => {
    const leg = new THREE.Group(); leg.position.set(s * 0.17, 1.1, 0); body.add(leg); legs.push({ leg, s });
    add(C(0.09, 0.08, 0.5, 14), skinM, 0, -0.55, 0, leg); add(C(0.105, 0.098, 0.34, 14), MS(o.socks, { roughness: 0.95 }), 0, -0.64, 0, leg);
    add(S(0.17, 20, 12), MS(0x5a3a2c), 0, -1.055, 0.07, leg).scale.set(0.95, 0.28, 1.5);
    add(S(0.16, 20, 14), MS(o.boots, { roughness: 0.55 }), 0, -0.95, 0.07, leg).scale.set(0.95, 0.75, 1.45);
    add(C(0.128, 0.138, 0.27, 20), MS(o.boots, { roughness: 0.55 }), 0, -0.9, 0, leg);
    add(new THREE.TorusGeometry(0.135, 0.032, 8, 20), stripe, 0, -0.77, 0, leg).rotation.x = Math.PI / 2;
    [[-0.83, 0.12], [-0.9, 0.15], [-0.97, 0.19]].forEach(([y, z]) => add(new THREE.BoxGeometry(0.13, 0.016, 0.016), B(o.ribbon), 0, y, z, leg));
    add(S(0.025, 8, 6), B(o.ribbon), -0.03, -0.79, 0.11, leg); add(S(0.025, 8, 6), B(o.ribbon), 0.03, -0.79, 0.11, leg);
  });

  /* Rok kotak-kotak tiga lapis + sweater */
  add(frill(0.4, 0.58, 0.26, 18, 0.07), plaid, 0, 0.88, 0, body); add(frill(0.34, 0.5, 0.26, 16, 0.07), plaid, 0, 1.06, 0, body); add(frill(0.28, 0.42, 0.26, 14, 0.06), plaid, 0, 1.24, 0, body);
  add(C(0.35, 0.35, 0.13, 28), stripe, 0, 1.4, 0, body);
  const torso = add(C(0.28, 0.34, 0.56, 28), pink, 0, 1.7, 0, body);
  add(S(0.3, 24, 14), pink, 0, 1.93, 0, body).scale.set(1.08, 0.5, 0.82);
  add(C(0.1, 0.1, 0.14, 14), skinM, 0, 2.02, 0, body); add(new THREE.TorusGeometry(0.16, 0.04, 8, 22), pink, 0, 1.97, 0, body).rotation.x = Math.PI / 2;

  /* Lengan (kanan = melambai) */
  const arms = [];
  function hand(p) {
    const h = new THREE.Group(); p.add(h);
    add(S(0.085, 14, 10), skinM, 0, -0.05, 0, h).scale.set(1, 1.1, 0.6);
    [-0.045, -0.015, 0.015, 0.045].forEach((x, i) => { const f = new THREE.Group(); f.position.set(x, -0.1, 0); f.rotation.z = -x * 2.2; h.add(f); add(C(0.02, 0.019, 0.1, 8), skinM, 0, -0.05 - (i === 1 || i === 2 ? 0.01 : 0), 0, f); add(S(0.02, 8, 6), skinM, 0, -0.105 - (i === 1 || i === 2 ? 0.01 : 0), 0, f); });
    const th = add(C(0.022, 0.02, 0.08, 8), skinM, 0.075, -0.06, 0.01, h); th.rotation.z = -0.9;
    return h;
  }
  [-1, 1].forEach(s => {
    const a = new THREE.Group(); a.position.set(s * 0.36, 1.9, 0); body.add(a);
    add(C(0.1, 0.095, 0.34, 16), pink, 0, -0.17, 0, a); add(C(0.102, 0.102, 0.07, 16), stripe, 0, -0.12, 0, a);
    add(S(0.1, 14, 10), pink, 0, 0, 0, a);
    const e = new THREE.Group(); e.position.y = -0.34; a.add(e);
    add(S(0.095, 14, 10), pink, 0, 0, 0, e); add(C(0.094, 0.086, 0.3, 16), pink, 0, -0.15, 0, e); add(C(0.092, 0.092, 0.07, 16), stripe, 0, -0.27, 0, e);
    const h = new THREE.Group(); h.position.y = -0.33; e.add(h); const hd = hand(h);
    arms.push({ a, e, hd, s });
  });

  /* Kepala besar */
  const head = new THREE.Group(); head.position.set(0, 2.0, 0); body.add(head);
  const hc = new THREE.Group(); hc.position.y = 0.72; head.add(hc);
  add(S(0.78, 48, 36), skinM, 0, 0, 0, hc).scale.set(1.04, 0.98, 1);
  [-1, 1].forEach(s => { add(S(0.11, 14, 10), skinM, s * 0.8, -0.08, -0.02, hc).scale.x = 0.6; add(S(0.035, 10, 8), B(o.eyes), s * 0.83, -0.2, 0.02, hc); });
  const dark = new THREE.Color(o.eyes).multiplyScalar(0.5), glow = new THREE.Color(o.eyes).lerp(new THREE.Color(0xffffff), 0.35), eyes = [];
  [-1, 1].forEach(s => {
    const g = new THREE.Group(); g.position.set(s * 0.28, -0.06, 0.72); g.rotation.y = s * 0.37; hc.add(g);
    add(S(1, 20, 14), B(0xfdfdfd), 0, 0, 0, g).scale.set(0.2, 0.245, 0.045);
    add(S(1, 20, 14), B(dark), 0, -0.005, 0.018, g).scale.set(0.175, 0.225, 0.045);
    add(S(1, 20, 14), B(o.eyes), 0, -0.02, 0.022, g).scale.set(0.16, 0.2, 0.045);
    add(S(1, 20, 14), B(glow), 0, -0.08, 0.026, g).scale.set(0.12, 0.1, 0.045);
    add(S(1, 20, 14), B(0x10202a), 0, 0, 0.034, g).scale.set(0.085, 0.115, 0.045);
    add(S(1, 14, 10), B(0xffffff), -0.06, 0.09, 0.05, g).scale.set(0.065, 0.07, 0.045);
    add(S(1, 10, 8), B(0xffffff), 0.07, -0.08, 0.05, g).scale.set(0.03, 0.03, 0.045); add(S(1, 8, 6), B(0xffffff), 0.03, -0.12, 0.05, g).scale.set(0.015, 0.015, 0.045);
    const lash = add(new THREE.TorusGeometry(0.215, 0.022, 6, 24, 2.5), B(0x2a1712), 0, 0, 0.03, g); lash.rotation.z = Math.PI / 2 - 1.25; lash.scale.y = 1.15;
    add(new THREE.BoxGeometry(0.09, 0.022, 0.03), B(0x2a1712), s * 0.2, 0.1, 0.03, g).rotation.z = s * 0.5;
    const br = add(new THREE.TorusGeometry(0.13, 0.014, 6, 16, 1.3), B(new THREE.Color(o.hair).multiplyScalar(0.7)), 0, 0.36, 0.0, g); br.rotation.z = Math.PI / 2 - 0.65 - s * 0.12;
    eyes.push(g);
  });
  add(S(0.04, 10, 8), MS(0xf5bfa9), 0, -0.2, 0.77, hc);
  add(new THREE.TorusGeometry(0.075, 0.011, 6, 14, Math.PI), B(0xc4605f), 0, -0.36, 0.7, hc).rotation.z = Math.PI;
  [-1, 1].forEach(s => { const b = add(new THREE.CircleGeometry(0.09, 18), new THREE.MeshBasicMaterial({ color: 0xff8f9c, transparent: true, opacity: 0.4 }), s * 0.46, -0.22, 0.6, hc); b.rotation.y = s * 0.66; });

  /* Rambut: tutup kepala, poni miring, helai samping, rambut panjang, cepol + pita */
  add(new THREE.SphereGeometry(0.84, 40, 24, 0, Math.PI * 2, 0, 1.0), hairM, 0, 0, -0.02, hc);
  add(new THREE.SphereGeometry(0.85, 40, 24, Math.PI / 2 + 1.4, Math.PI * 2 - 2.8, 0.9, 1.5), hairM, 0, 0, -0.03, hc);
  const bangs = [], backs = [];
  for (let i = 0; i < 11; i++) {
    const a = -1.15 + i * 0.23, L = 0.36 + 0.08 * Math.abs(Math.sin(i * 1.7)), pv = new THREE.Group(); pv.rotation.y = a; hc.add(pv);
    const m = add(tip(0.1, L, 6), hairM, 0, 0.5 - L / 2 + 0.04, 0.69, pv); m.scale.z = 0.45; m.rotation.z = a < -0.2 ? -0.28 : 0.28; bangs.push(m);
  }
  [-1, 1].forEach(s => { const pv = new THREE.Group(); pv.rotation.y = s * 1.15; hc.add(pv); const m = add(tip(0.13, 0.95, 7), hairM, 0, -0.17, 0.75, pv); m.scale.z = 0.5; m.rotation.z = -s * 0.06; bangs.push(m); });
  for (let i = 0; i < 9; i++) {
    const pv = new THREE.Group(); pv.rotation.y = Math.PI + (i - 4) * 0.33; hc.add(pv);
    const m = add(tip(0.17, 1.55 - Math.abs(i - 4) * 0.05, 7), hairM, 0, -0.65, 0.66, pv); m.rotation.x = 0.2; m.userData.base = Math.sin(i * 1.7) * 0.08; m.rotation.z = m.userData.base; m.scale.z = 0.5; backs.push(m);
  }
  add(S(0.2, 20, 16), hairM, -0.52, 0.72, -0.1, hc); add(new THREE.TorusGeometry(0.2, 0.05, 8, 20), MS(o.ribbon), -0.52, 0.72, -0.1, hc).rotation.y = Math.PI / 2 - 0.5;
  [-0.7, -0.34].forEach(x => add(S(0.09, 14, 10), MS(o.ribbon), x, 0.95, -0.1, hc).scale.set(1.5, 0.85, 0.6)); add(S(0.05, 10, 8), MS(o.ribbon), -0.52, 0.95, -0.1, hc);

  root.userData.update = (ms) => {
    const t = ms * 0.001, walking = root.userData.walking;
    body.position.y = 0; body.rotation.z = walking ? Math.sin(t * 10) * 0.004 : 0; torso.scale.set(1 + Math.sin(t * 2.4) * 0.003, 1, 1 + Math.sin(t * 2.4) * 0.003);
    head.rotation.z = 0.04 + Math.sin(t * 0.9) * 0.04; head.rotation.y = Math.sin(t * 0.6) * 0.12;
    const bl = (t % 3.8) < 0.13 ? 0.08 : 1; eyes.forEach(e => { e.scale.y = bl; });
    backs.forEach((m, i) => { m.rotation.z = m.userData.base + Math.sin(t * 1.4 + i * 0.7) * 0.03; });
    bangs.forEach((m, i) => { m.rotation.x = Math.sin(t * 1.1 + i) * 0.015; });
    legs.forEach(({ leg, s }) => { leg.rotation.x = walking ? s * Math.sin(t * 10) * 0.16 : 0; });
    arms.forEach(({ a, e, hd, s }) => {
      if (root.userData.waving && s === 1) { a.rotation.z = 1.5 + Math.sin(t * 2) * 0.05; e.rotation.z = 1.15 + Math.sin(t * 7) * 0.32; hd.rotation.z = Math.sin(t * 7 + 1) * 0.25; }
      else { a.rotation.z = walking ? -s * Math.sin(t * 10) * 0.2 : 0; e.rotation.z = walking ? s * 0.08 : 0; hd.rotation.z = 0; }
    });
  };
  root.userData.setWalking = value => { root.userData.walking = value; };
  root.userData.setWaving = value => { root.userData.waving = value; };
  return root;
}
