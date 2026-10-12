import * as THREE from 'three';

/**
 * Vila modern (fasad kaca besar, dinding batu, panel kayu, teras atap, kolam renang di depan, garasi, dua mobil, palem)
 * sebagai THREE.Group. Depan menghadap +Z, dasar di y = 0.
 * Badan rumah 14 x 7 x 8 (lantai atas 9 x 3.2), kolam di depan (z sampai 12), tinggi total sekitar 7.2 unit.
 *
 *   const rumah = createHouse4();
 *   rumah.position.set(x, 0, z);
 *   scene.add(rumah);
 *   // di loop animasi:
 *   rumah.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa kolam, jalan masuk, mobil, palem, tembok batu samping.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHouse4({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'RumahBintang4';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s; }
  function cyl(r, h, m, x, y, z, p = root, seg = 14) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function ball(r, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; }, rnd = Math.random;
  function tex(fn, w, h, rx, ry) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return srgb(t); }
  function car(p, color, len, x, z, ry, low) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); const m = M(color, { roughness: 0.2, metalness: 0.6 }), h = low ? 0.4 : 0.6;
    box(len, h, 1.2, m, 0, 0.5, 0, g); box(len * 0.5, h * 0.8, 1.05, m, -len * 0.05, 0.5 + h * 0.9, 0, g); box(len * 0.44, h * 0.6, 1.07, M(0x151c2a, { roughness: 0.2 }), -len * 0.05, 0.5 + h * 0.9, 0, g);
    [-1, 1].forEach(a => [-1, 1].forEach(b => { cyl(0.3, 0.22, M(0x111111), a * len * 0.32, 0.3, b * 0.55, g).rotation.x = Math.PI / 2; }));
  }
  function palm(p, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g); cyl(0.14, 4.2, M(0x6b5238), 0, 2.1, 0, g, 8).rotation.z = 0.06;
    const top = new THREE.Group(); top.position.set(0.25, 4.2, 0); g.add(top);
    for (let i = 0; i < 7; i++) { const piv = new THREE.Group(); piv.rotation.y = i * Math.PI * 2 / 7; top.add(piv); const lg = new THREE.BoxGeometry(1.8, 0.04, 0.28); lg.translate(0.9, 0, 0); const l = new THREE.Mesh(lg, M(0x2f7a3e, { side: THREE.DoubleSide })); l.rotation.z = -0.45; l.castShadow = true; piv.add(l); }
  }
  const WHITE = M(0xf0efea), DARK = M(0x2a2d32, { metalness: 0.2 }), STEEL = M(0x8a9096, { metalness: 0.5, roughness: 0.4 });
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x9fd0e0, transparent: true, opacity: 0.25, roughness: 0.1 });
  const STONE = M(0xffffff, { map: tex((g, w, h) => { g.fillStyle = '#8f8a82'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '0,0,0' : '255,255,255') + ',.12)'; g.fillRect(x * 64 + (y % 2) * 32, y * 32, 62, 30); } }, 256, 256, 1, 1), roughness: 0.9 });
  const SLAT = M(0xffffff, { map: tex((g, w, h) => { g.fillStyle = '#9a6a3c'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 12) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, 0, 3, h); } }, 128, 128, 3, 1), roughness: 0.6 });
  const DECK = M(0x7a5a3a, { roughness: 0.7 });
  const gl = (c, i) => new THREE.MeshStandardMaterial({ color: 0x222a38, emissive: c, emissiveIntensity: i, roughness: 0.15 });
  const warm = gl(0xffe0b0, 0.8), tvM = gl(0xb8dcff, 0.7);

  /* Volume bawah + atas dengan atap datar tipis */
  box(14, 3.3, 8, WHITE, 0, 1.65, 0); box(14.6, 0.3, 8.6, DARK, 0, 3.45, 0);
  box(9, 3.2, 6.5, WHITE, 2.5, 5.2, -0.7); box(9.6, 0.3, 7.1, DARK, 2.5, 6.95, -0.7);
  box(2.4, 3.2, 0.14, SLAT, 5.8, 5.2, 2.6);
  /* Fasad kaca lantai bawah */
  box(8.2, 3, 0.1, DARK, -2.5, 1.65, 4.02); const lobby = new THREE.Mesh(new THREE.BoxGeometry(8, 2.8, 0.05), warm); lobby.position.set(-2.5, 1.65, 4.08); root.add(lobby);
  for (let i = 0; i <= 4; i++) box(0.07, 2.8, 0.08, DARK, -6.5 + i * 2, 1.65, 4.11);
  box(1.2, 3.3, 0.4, STONE, 1.9, 1.65, 4.1); box(1.4, 2.7, 0.08, M(0x6a4a2a, { roughness: 0.5 }), 3.1, 1.4, 4.04); box(0.05, 1.0, 0.05, STEEL, 2.55, 1.4, 4.1);
  box(2.8, 2.6, 0.08, M(0x3a3e44, { metalness: 0.3 }), 5.6, 1.35, 4.03); for (let y = 0; y < 5; y++) box(2.8, 0.03, 0.1, DARK, 5.6, 0.5 + y * 0.5, 4.06);
  box(4.4, 0.18, 2.2, DARK, 3.6, 3.1, 5.0); box(4.2, 0.05, 0.05, new THREE.MeshBasicMaterial({ color: 0xffd98a }), 3.6, 2.98, 6.05);
  /* Jendela lantai atas */
  const upW = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 0.05), warm); upW.position.set(1.0, 5.2, 2.6); root.add(upW); box(3.6, 2.6, 0.1, DARK, 1.0, 5.2, 2.56);
  const upT = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.4, 0.05), tvM); upT.position.set(3.9, 5.2, 2.6); root.add(upT);
  /* Teras atap di kiri */
  box(5.4, 0.08, 7.8, DECK, -4.7, 3.64, 0); const r1 = box(5.4, 1.1, 0.05, GLASS, -4.7, 4.2, 3.9); const r2 = box(0.05, 1.1, 7.8, GLASS, -7.35, 4.2, 0); r1.castShadow = r2.castShadow = false;
  box(5.4, 0.05, 0.06, STEEL, -4.7, 4.75, 3.9); box(0.06, 0.05, 7.8, STEEL, -7.35, 4.75, 0);
  [-5.5, -4.2].forEach(x => { box(0.6, 0.12, 1.7, M(0xf2efe6), x, 3.78, 1.5); });
  cyl(0.03, 1.9, STEEL, -3.4, 4.6, 0.3, root, 6); const um = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.4, 16), M(0xe8dcc0)); um.position.set(-3.4, 5.6, 0.3); root.add(um);

  const PR = new THREE.Group(); root.add(PR); PR.visible = props;
  box(30, 0.02, 24, M(0x356f3e), 0, 0.01, 6, PR);
  /* Kolam renang depan */
  box(9, 0.06, 5.8, DECK, -3, 0.04, 9.5, PR); box(7.2, 0.25, 3.4, M(0xe8f0f2), -3, 0.14, 9, PR);
  const poolM = new THREE.MeshStandardMaterial({ color: 0x2aa7c9, emissive: 0x2aa7c9, emissiveIntensity: 0.6, roughness: 0.1 });
  box(6.8, 0.05, 3.0, poolM, -3, 0.28, 9, PR);
  [-5, -3.6, -2.2].forEach(x => { box(0.6, 0.14, 1.5, M(0xf2efe6), x, 0.2, 11.4, PR); const b = box(0.6, 0.08, 0.6, M(0xf2efe6), x, 0.5, 10.5, PR); b.rotation.x = -0.8; });
  const poolLight = new THREE.PointLight(0x4fd2ee, 1.1, 10); poolLight.position.set(-3, 1.2, 9); PR.add(poolLight);
  /* Jalan masuk, mobil, taman */
  box(4, 0.03, 10, M(0x3a3a3c), 5.6, 0.025, 9, PR); car(PR, 0xd8b22a, 3.6, 5.6, 7.4, Math.PI / 2, true); car(PR, 0x15161a, 4.2, 5.6, 11, Math.PI / 2);
  for (let i = 0; i < 6; i++) { box(1.2, 0.06, 0.6, M(0xa8a39a), 3.1, 0.04, 6 + i * 1.1, PR); box(0.1, 0.05, 0.1, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), 2.3, 0.07, 6 + i * 1.1, PR); }
  [[-9, 6], [8.5, 14], [-9, 12], [10, 5]].forEach(p => palm(PR, p[0], p[1]));
  box(0.4, 2.2, 18, STONE, -12, 1.1, 5, PR); box(0.4, 2.2, 18, STONE, 12, 1.1, 5, PR);
  [-6, 6].forEach(x => { const b = ball(0.8, M(0x2f6b3a), x, 0.5, 4.8, PR); b.scale.y = 0.7; });
  const entL = new THREE.PointLight(0xffd890, 1.3, 12); entL.position.set(3.2, 2.8, 5.6); root.add(entL);
  const glowL = new THREE.PointLight(0xffe0b0, 0.8, 12); glowL.position.set(-2.5, 2, 6); root.add(glowL);

  root.userData.update = (ms) => {
    const s = ms * 0.001; poolM.emissiveIntensity = 0.55 + 0.15 * Math.sin(s * 2.4); poolLight.intensity = 1.0 + 0.2 * Math.sin(s * 2.4 + 1);
    tvM.emissiveIntensity = 0.5 + 0.3 * Math.abs(Math.sin(s * 4) * Math.sin(s * 1.1));
  };
  return root;
}
