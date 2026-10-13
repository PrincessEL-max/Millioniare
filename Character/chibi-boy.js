import * as THREE from 'three';

/**
 * Dua karakter cowok chibi (kepala besar, shading lembut) sebagai THREE.Group.
 *   outfit: 'hoodie'  -> Kai: hoodie, jeans, sneakers, rambut jabrik, headphone di leher, melambai
 *   outfit: 'uniform' -> Ren: blazer sekolah, dasi, kacamata bulat, celana pendek, bawa buku
 * Menghadap +Z, kaki di y = 0, tinggi sekitar 3.7 unit.
 *
 *   const kai = createChibiBoy({ outfit: 'hoodie' });
 *   kai.position.set(x, 0, z);
 *   kai.scale.setScalar(0.4);
 *   scene.add(kai);
 *   // di loop animasi (butuh lampu di scene):
 *   kai.userData.update(performance.now());
 *
 * Opsi (semua boleh dikosongkan): hair, eyes, skin, top (baju), trim (manset, pinggang),
 *   pants, shoes, accent (dasi / buku / garis sepatu), glasses: true/false, wave: true/false, book: true/false
 */
export function createChibiBoy(opts = {}) {
  const outfit = opts.outfit === 'uniform' ? 'uniform' : 'hoodie', hood = outfit === 'hoodie';
  const D = hood
    ? { hair: 0x4a2f22, eyes: 0x3a8ae8, skin: 0xffd9c4, top: 0xf2994a, trim: 0xd9772a, pants: 0x3f6fb0, shoes: 0xf4f4f4, accent: 0xe84a4a, glasses: false, wave: false }
    : { hair: 0x23273a, eyes: 0x8a5cff, skin: 0xffd9c4, top: 0x2b3a67, trim: 0xf4f4f4, pants: 0x6a6f7a, shoes: 0x5a3a2c, accent: 0xb3202c, glasses: true, wave: false, book: true };
  const o = Object.assign({}, D, opts);
  const root = new THREE.Group(); root.name = hood ? 'ChibiKai' : 'ChibiRen';
  const MS = (c, x) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.65, metalness: 0 }, x || {}));
  const B = c => new THREE.MeshBasicMaterial({ color: c });
  const S = (r, w = 24, h = 18) => new THREE.SphereGeometry(r, w, h), C = (a, b, h, s = 20) => new THREE.CylinderGeometry(a, b, h, s);
  const tip = (r, h, seg) => { const g = new THREE.ConeGeometry(r, h, seg); g.rotateX(Math.PI); return g; };
  function add(g, m, x, y, z, p) { const s = new THREE.Mesh(g, m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const skinM = MS(o.skin, { roughness: 0.5 }), hairM = MS(o.hair, { roughness: 0.35, metalness: 0.1, side: THREE.DoubleSide });
  const topM = MS(o.top, { roughness: 0.85 }), trimM = MS(o.trim, { roughness: 0.9 }), pantsM = MS(o.pants, { roughness: 0.85 }), gold = MS(0xd8b44a, { metalness: 0.6, roughness: 0.4 });
  const body = new THREE.Group(); root.add(body);

  /* Kaki + sepatu */
  const legs = [];
  [-1, 1].forEach(s => {
    const leg = new THREE.Group(); leg.position.set(s * 0.17, 1.1, 0); body.add(leg); legs.push({ leg, s });
    if (hood) {
      add(C(0.115, 0.105, 1.1, 16), pantsM, 0, -0.32, 0, leg); add(C(0.12, 0.12, 0.12, 16), MS(new THREE.Color(o.pants).lerp(new THREE.Color(0xffffff), 0.3)), 0, -0.83, 0, leg);
      add(S(0.17, 20, 12), MS(o.shoes, { roughness: 0.5 }), 0, -0.96, 0.06, leg).scale.set(0.95, 0.72, 1.5);
      add(S(0.17, 20, 10), MS(0xdcdcdc), 0, -1.06, 0.06, leg).scale.set(1, 0.22, 1.6);
      add(S(0.1, 12, 8), MS(0xffffff), 0, -1, 0.21, leg).scale.set(1, 0.7, 0.9);
      add(new THREE.BoxGeometry(0.02, 0.05, 0.2), B(o.accent), s * 0.16, -0.96, 0.06, leg);
      [-0.91, -0.94].forEach((y, i) => add(new THREE.BoxGeometry(0.11, 0.016, 0.016), B(0xffffff), 0, y, 0.12 + i * 0.05, leg));
    } else {
      add(C(0.14, 0.15, 0.34, 18), pantsM, 0, 0.1, 0, leg); add(C(0.085, 0.08, 0.6, 14), skinM, 0, -0.34, 0, leg);
      add(C(0.1, 0.095, 0.5, 14), MS(0xf4f4f4, { roughness: 0.95 }), 0, -0.6, 0, leg); add(new THREE.TorusGeometry(0.099, 0.014, 6, 16), MS(o.top), 0, -0.42, 0, leg).rotation.x = Math.PI / 2;
      add(S(0.17, 20, 12), MS(0x2e1e18), 0, -1.055, 0.07, leg).scale.set(0.95, 0.25, 1.5);
      add(S(0.16, 20, 14), MS(o.shoes, { roughness: 0.35 }), 0, -0.98, 0.07, leg).scale.set(0.95, 0.65, 1.45);
    }
  });

  /* Badan */
  const th = hood ? 0.88 : 0.6, torso = add(C(0.29, hood ? 0.37 : 0.345, th, 28), topM, 0, 2.0 - th / 2, 0, body);
  add(S(0.3, 24, 14), topM, 0, 1.93, 0, body).scale.set(1.15, 0.5, 0.82);
  add(C(0.1, 0.1, 0.14, 14), skinM, 0, 2.02, 0, body);
  if (hood) {
    add(C(0.378, 0.378, 0.1, 28), trimM, 0, 1.17, 0, body);
    add(S(0.3, 20, 12), topM, 0, 2.0, -0.2, body).scale.set(1.2, 0.65, 0.8);
    [-1, 1].forEach(s => { add(C(0.012, 0.012, 0.22, 6), B(0xffffff), s * 0.07, 1.84, 0.31, body); add(S(0.022, 8, 6), B(0xffffff), s * 0.07, 1.72, 0.31, body); });
    add(new THREE.BoxGeometry(0.34, 0.15, 0.05), trimM, 0, 1.4, 0.35, body);
    add(new THREE.TorusGeometry(0.2, 0.04, 8, 24), MS(0x37b7b0), 0, 1.99, 0.02, body).rotation.x = Math.PI / 2;
  } else {
    add(C(0.352, 0.352, 0.05, 28), MS(0xf4f4f4), 0, 1.4, 0, body);
    add(new THREE.BoxGeometry(0.2, 0.34, 0.02), MS(0xf8f8f8), 0, 1.82, 0.305, body);
    [-1, 1].forEach(s => { add(new THREE.BoxGeometry(0.1, 0.34, 0.03), MS(0x34467a), s * 0.1, 1.8, 0.31, body).rotation.z = s * 0.28; });
    add(new THREE.TorusGeometry(0.15, 0.035, 8, 22), MS(0xf8f8f8), 0, 1.98, 0, body).rotation.x = Math.PI / 2;
    add(S(0.045, 10, 8), MS(o.accent), 0, 1.93, 0.3, body); add(tip(0.06, 0.34, 4), MS(o.accent), 0, 1.74, 0.315, body).scale.z = 0.3;
    [1.56, 1.44].forEach(y => add(S(0.025, 8, 6), gold, 0, y, 0.335, body)); add(C(0.05, 0.05, 0.015, 14), gold, -0.14, 1.68, 0.31, body).rotation.x = Math.PI / 2;
  }

  /* Lengan */
  const arms = [];
  function hand(p) {
    const h = new THREE.Group(); p.add(h);
    add(S(0.085, 14, 10), skinM, 0, -0.05, 0, h).scale.set(1, 1.1, 0.6);
    [-0.045, -0.015, 0.015, 0.045].forEach((x, i) => { const f = new THREE.Group(); f.position.set(x, -0.1, 0); f.rotation.z = -x * 2.2; h.add(f); const dy = (i === 1 || i === 2) ? 0.01 : 0; add(C(0.02, 0.019, 0.1, 8), skinM, 0, -0.05 - dy, 0, f); add(S(0.02, 8, 6), skinM, 0, -0.105 - dy, 0, f); });
    add(C(0.022, 0.02, 0.08, 8), skinM, 0.075, -0.06, 0.01, h).rotation.z = -0.9;
    return h;
  }
  [-1, 1].forEach(s => {
    const a = new THREE.Group(); a.position.set(s * 0.37, 1.9, 0); body.add(a);
    add(C(0.108, 0.1, 0.34, 16), topM, 0, -0.17, 0, a); add(S(0.105, 14, 10), topM, 0, 0, 0, a);
    const e = new THREE.Group(); e.position.y = -0.34; a.add(e);
    add(S(0.1, 14, 10), topM, 0, 0, 0, e); add(C(0.098, 0.09, 0.3, 16), topM, 0, -0.15, 0, e); add(C(0.096, 0.096, 0.07, 16), trimM, 0, -0.27, 0, e);
    const h = new THREE.Group(); h.position.y = -0.33; e.add(h); const hd = hand(h);
    if (!hood && o.book && s === -1) add(new THREE.BoxGeometry(0.07, 0.34, 0.26), MS(o.accent), 0.02, -0.14, 0.04, hd);
    arms.push({ a, e, hd, s });
  });

  /* Kepala */
  const head = new THREE.Group(); head.position.set(0, 2.0, 0); body.add(head);
  const hc = new THREE.Group(); hc.position.y = 0.72; head.add(hc);
  add(S(0.78, 48, 36), skinM, 0, 0, 0, hc).scale.set(1.03, 0.98, 1);
  [-1, 1].forEach(s => add(S(0.11, 14, 10), skinM, s * 0.8, -0.08, -0.02, hc).scale.x = 0.6);
  const dark = new THREE.Color(o.eyes).multiplyScalar(0.5), glow = new THREE.Color(o.eyes).lerp(new THREE.Color(0xffffff), 0.35), eyes = [], browC = new THREE.Color(o.hair).multiplyScalar(0.75);
  [-1, 1].forEach(s => {
    const g = new THREE.Group(); g.position.set(s * 0.28, -0.06, 0.72); g.rotation.y = s * 0.37; hc.add(g);
    add(S(1, 20, 14), B(0xfdfdfd), 0, 0, 0, g).scale.set(0.19, 0.235, 0.045);
    add(S(1, 20, 14), B(dark), 0, -0.005, 0.018, g).scale.set(0.165, 0.215, 0.045);
    add(S(1, 20, 14), B(o.eyes), 0, -0.02, 0.022, g).scale.set(0.15, 0.19, 0.045);
    add(S(1, 20, 14), B(glow), 0, -0.08, 0.026, g).scale.set(0.11, 0.095, 0.045);
    add(S(1, 20, 14), B(0x10202a), 0, 0, 0.034, g).scale.set(0.08, 0.11, 0.045);
    add(S(1, 14, 10), B(0xffffff), -0.055, 0.09, 0.05, g).scale.set(0.06, 0.065, 0.045);
    add(S(1, 10, 8), B(0xffffff), 0.065, -0.08, 0.05, g).scale.set(0.028, 0.028, 0.045);
    const lash = add(new THREE.TorusGeometry(0.2, 0.017, 6, 24, 2.4), B(0x2a1712), 0, 0, 0.03, g); lash.rotation.z = Math.PI / 2 - 1.2; lash.scale.y = 1.15;
    const br = add(new THREE.TorusGeometry(0.14, 0.024, 6, 16, 1.1), B(browC), 0, 0.33, 0, g); br.rotation.z = Math.PI / 2 - 0.55 + s * 0.2;
    if (o.glasses) { add(new THREE.TorusGeometry(0.27, 0.02, 8, 36), B(0x1a1a22), 0, -0.01, 0.07, g).scale.y = 1.1; }
    eyes.push(g);
  });
  if (o.glasses) { add(new THREE.BoxGeometry(0.1, 0.022, 0.03), B(0x1a1a22), 0, 0.0, 0.79, hc); [-1, 1].forEach(s => { add(new THREE.BoxGeometry(0.02, 0.02, 0.5), B(0x1a1a22), s * 0.68, 0.0, 0.42, hc).rotation.y = -s * 0.37; }); }
  add(S(0.04, 10, 8), MS(0xf5bfa9), 0, -0.2, 0.77, hc);
  add(new THREE.TorusGeometry(0.07, 0.012, 6, 14, Math.PI), B(0xb55a58), 0, -0.36, 0.7, hc).rotation.z = Math.PI;
  [-1, 1].forEach(s => { add(new THREE.CircleGeometry(0.08, 18), new THREE.MeshBasicMaterial({ color: 0xff8f9c, transparent: true, opacity: 0.25 }), s * 0.46, -0.22, 0.6, hc).rotation.y = s * 0.66; });

  /* Rambut */
  add(new THREE.SphereGeometry(0.84, 40, 24, 0, Math.PI * 2, 0, 1.0), hairM, 0, 0, -0.02, hc);
  add(new THREE.SphereGeometry(0.85, 40, 24, Math.PI / 2 + 1.4, Math.PI * 2 - 2.8, 0.9, hood ? 1.3 : 1.15), hairM, 0, 0, -0.03, hc);
  const up = new THREE.Vector3(0, 1, 0), locks = [];
  function spike(d, len, r) { const v = d.clone().normalize(), m = add(new THREE.ConeGeometry(r, len, 6), hairM, 0, 0, 0, hc); m.position.copy(v).multiplyScalar(0.8 + len * 0.5 - 0.06); m.quaternion.setFromUnitVectors(up, v); return m; }
  for (let i = 0; i < 11; i++) {
    const a = -1.15 + i * 0.23, L = (hood ? 0.28 : 0.34) + 0.07 * Math.abs(Math.sin(i * 1.7)), pv = new THREE.Group(); pv.rotation.y = a; hc.add(pv);
    const m = add(tip(0.1, L, 6), hairM, 0, 0.5 - L / 2 + 0.04, 0.69, pv); m.scale.z = 0.45; m.rotation.z = hood ? (a < 0 ? -0.2 : 0.2) : 0.38; locks.push(m);
  }
  [-1, 1].forEach(s => { const pv = new THREE.Group(); pv.rotation.y = s * 1.2; hc.add(pv); const m = add(tip(0.12, hood ? 0.45 : 0.6, 6), hairM, 0, hood ? 0.07 : 0, 0.75, pv); m.scale.z = 0.5; locks.push(m); });
  if (hood) {
    for (let i = 0; i < 10; i++) { const a = i * 0.628, t = 0.75 + 0.1 * Math.sin(i * 2.3); locks.push(spike(new THREE.Vector3(Math.sin(t) * Math.cos(a), Math.cos(t), Math.sin(t) * Math.sin(a)), 0.42 + 0.1 * Math.sin(i * 1.9), 0.17)); }
    locks.push(spike(new THREE.Vector3(0, 1, 0), 0.55, 0.18), spike(new THREE.Vector3(0.1, 0.9, 0.45), 0.45, 0.13));
    for (let i = 0; i < 8; i++) { const a = Math.PI * 1.5 + (i - 3.5) * 0.45; locks.push(spike(new THREE.Vector3(Math.sin(1.45) * Math.cos(a), Math.cos(1.45), Math.sin(1.45) * Math.sin(a)), 0.38, 0.16)); }
  } else locks.push(spike(new THREE.Vector3(0.25, 1, 0.45), 0.3, 0.1));

  root.userData.update = (ms) => {
    const t = ms * 0.001, walking = root.userData.walking;
    body.position.y = 0; body.rotation.z = walking ? Math.sin(t * 10) * 0.004 : 0; torso.scale.set(1 + Math.sin(t * 2.4) * 0.003, 1, 1 + Math.sin(t * 2.4) * 0.003);
    head.rotation.z = -0.03 + Math.sin(t * 0.9) * 0.04; head.rotation.y = Math.sin(t * 0.6) * 0.12;
    const bl = (t % 4.1) < 0.13 ? 0.08 : 1; eyes.forEach(e => { e.scale.y = bl; });
    locks.forEach((m, i) => { m.rotation.x = Math.sin(t * 1.3 + i) * 0.012; });
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
