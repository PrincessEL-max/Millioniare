import * as THREE from 'three';

/**
 * Rumah modern minimalis dua lantai (volume putih, panel kayu, carport menjorok, balkon kaca, gerbang geser)
 * sebagai THREE.Group. Depan menghadap +Z, dasar di y = 0.
 * Badan rumah 9 x 6.3 x 7, tinggi total sekitar 7.7 unit (dengan tandon di atap); halaman sampai z = 10.
 *
 *   const rumah = createHouse3();
 *   rumah.position.set(x, 0, z);
 *   scene.add(rumah);
 *   // di loop animasi:
 *   rumah.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa halaman, pagar, gerbang, pohon, semak, lampu jalan kecil.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHouse3({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'RumahBintang3';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s; }
  function cyl(r, h, m, x, y, z, p = root, seg = 12) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function ball(r, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; }, rnd = Math.random;
  function tex(fn, w, h, rx, ry) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return srgb(t); }
  function car(p, color, len, x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); const m = M(color, { roughness: 0.3, metalness: 0.4 });
    box(len, 0.7, 1.2, m, 0, 0.6, 0, g); box(len * 0.56, 0.6, 1.1, m, -len * 0.05, 1.2, 0, g); box(len * 0.5, 0.4, 1.12, M(0x151c2a, { roughness: 0.2 }), -len * 0.05, 1.2, 0, g);
    [-1, 1].forEach(a => [-1, 1].forEach(b => { cyl(0.3, 0.22, M(0x111111), a * len * 0.32, 0.3, b * 0.55, g).rotation.x = Math.PI / 2; }));
  }
  const WHITE = M(0xe9e8e3), GREY = M(0x4a4e54), STEEL = M(0x8a9096, { metalness: 0.5, roughness: 0.4 }), CONC = M(0x8d8a80);
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x9fd0e0, transparent: true, opacity: 0.25, roughness: 0.1 });
  const WOODW = M(0xffffff, { map: tex((g, w, h) => { g.fillStyle = '#8a5a36'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,200,140,.06)'; g.fillRect(x + 4, 0, 5, h); } }, 128, 128, 2, 1), roughness: 0.6 });
  const gl = (c, i) => new THREE.MeshStandardMaterial({ color: 0x222a38, emissive: c, emissiveIntensity: i, roughness: 0.2 });
  const tvM = gl(0x6fa8ff, 0.7);
  function win(x, y, w, h, z, gm, parent = root) { box(w + 0.2, h + 0.2, 0.1, GREY, x, y, z, parent); const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), gm); g.position.set(x, y, z + 0.06); parent.add(g); }

  /* Volume bawah (kanan) + volume atas (menjorok di atas carport) */
  box(5.5, 3.2, 7, WHITE, 1.75, 1.6, 0); box(9, 3, 7, WHITE, 0, 4.7, 0); box(9.1, 0.1, 7.1, GREY, 0, 3.2, 0);
  box(9.8, 0.25, 7.8, GREY, 0, 6.33, 0); box(9.2, 0.12, 7.2, M(0xc8c7c1), 0, 6.5, 0);
  box(3.2, 3, 0.14, WOODW, -2.9, 4.7, 3.56);
  cyl(0.6, 1.2, M(0x2a5d9a), 3.3, 7.1, -2, root, 16); box(1.2, 0.1, 1.2, STEEL, 3.3, 6.55, -2);

  /* Carport */
  box(3.5, 0.06, 7, CONC, -2.75, 0.03, 0); box(3.5, 3.2, 0.2, GREY, -2.75, 1.6, -3.4);
  [-4.3, -1.2].forEach(x => cyl(0.08, 3.2, WHITE, x, 1.6, 3.3, root, 8));
  car(root, 0xeeeeea, 3.0, -2.75, 0.2, Math.PI / 2);
  const carportLight = new THREE.PointLight(0xcfe6ff, 0.8, 8); carportLight.position.set(-2.75, 2.8, 2); root.add(carportLight);

  /* Jendela, pintu, balkon */
  win(1.0, 1.7, 1.4, 1.6, 3.5, gl(0xffd9a0, 0.85));
  box(1.2, 2.3, 0.08, M(0x4a2f1c), 3.4, 1.25, 3.55); box(0.3, 2.1, 0.04, gl(0xffe0b0, 0.8), 2.5, 1.25, 3.55);
  win(0.4, 4.7, 1.4, 1.8, 3.5, tvM); win(3.0, 4.6, 2.6, 2.3, 3.5, gl(0xffd9a0, 0.8));
  box(3.4, 0.18, 1.1, GREY, 2.9, 3.3, 4.05);
  const r = box(3.4, 0.95, 0.04, GLASS, 2.9, 3.9, 4.58); r.castShadow = false; box(3.4, 0.05, 0.06, STEEL, 2.9, 4.4, 4.58);
  [1.25, 4.55].forEach(x => box(0.05, 0.95, 0.05, STEEL, x, 3.9, 4.58));
  [[3.4, 3.5], [-0.6, 3.5]].forEach(p => box(0.12, 0.35, 0.05, new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), p[0] + 0.85, 2.0, 3.6));
  const doorLight = new THREE.PointLight(0xffd890, 1.0, 8); doorLight.position.set(3.3, 2.6, 5); root.add(doorLight);

  /* Halaman, pagar, gerbang geser */
  const PR = new THREE.Group(); root.add(PR); PR.visible = props;
  box(22, 0.02, 15, M(0x3e7a3e), 0, 0.01, 3, PR); box(3.6, 0.05, 6, CONC, -2.75, 0.03, 6.5, PR); box(1, 0.05, 4.5, CONC, 3.3, 0.03, 5.8, PR);
  const FZ = 9.5, fw = M(0xdedcd6);
  [[-6.4, 3.2], [1.6, 2.8], [6.4, 3.6]].forEach(s => { box(s[1], 1.5, 0.22, fw, s[0], 0.75, FZ, PR); box(s[1] + 0.1, 0.08, 0.28, GREY, s[0], 1.54, FZ, PR); });
  box(3.4, 1.4, 0.05, M(0x2f3338), -2.75, 0.75, FZ, PR); for (let i = 0; i < 8; i++) box(0.04, 1.4, 0.07, STEEL, -4.1 + i * 0.38, 0.75, FZ + 0.03, PR);
  box(0.9, 1.4, 0.05, M(0x2f3338), 3.35, 0.75, FZ, PR); [-4.8, -0.9].forEach(x => { box(0.4, 1.8, 0.4, fw, x, 0.9, FZ, PR); box(0.2, 0.06, 0.2, new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), x, 1.84, FZ, PR); });
  [[-6.5, 5.5], [6.8, 4]].forEach((p, i) => { cyl(0.14, 2.4, M(0x6b5238), p[0], 1.2, p[1], PR, 8); ball(1.1, M(0x2f7a3e), p[0], 3.0, p[1], PR); ball(0.8, M(0x3a8a4a), p[0] + 0.5, 3.8, p[1] + 0.2, PR); });
  [[1.4, 4.6], [5.2, 4.6], [-5.2, 6.5], [6.2, 7]].forEach(p => { const b = ball(0.55, M(0x2f6b3a), p[0], 0.4, p[1], PR); b.scale.y = 0.8; });
  [[2.5, 6.5], [4.1, 6.5], [2.5, 8.2], [4.1, 8.2]].forEach(p => cyl(0.06, 0.5, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), p[0], 0.3, p[1], PR, 8));

  root.userData.update = (ms) => {
    const s = ms * 0.001; tvM.emissiveIntensity = 0.45 + 0.4 * Math.abs(Math.sin(s * 5) * Math.sin(s * 1.3));
  };
  return root;
}
