import * as THREE from 'three';

/**
 * Rumah rapi sederhana (cat krem, atap genteng, teras berpilar, jendela berdaun dan bunga, carport, pagar putih)
 * sebagai THREE.Group. Depan menghadap +Z, dasar di y = 0.
 * Badan rumah 8 x 2.9 x 6, tinggi total sekitar 4.7 unit; carport di kiri (x sampai -7.5), halaman sampai z = 12.
 *
 *   const rumah = createHouse2();
 *   rumah.position.set(x, 0, z);
 *   scene.add(rumah);
 *   // di loop animasi:
 *   rumah.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa halaman, pagar, pohon, taman bunga, lampu jalan kecil.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHouse2({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'RumahBintang2';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s; }
  function cyl(r, h, m, x, y, z, p = root, seg = 12) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function ball(r, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; }, rnd = Math.random;
  function tex(fn, w, h, rx, ry) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return srgb(t); }
  function gable(w, d, y0, rise, over, roofM, wallM, x = 0, z = 0) {
    const hs = d / 2 + over, a = Math.atan(rise / hs), L = Math.hypot(hs, rise);
    [1, -1].forEach(s => { box(w + 0.8, 0.08, L, roofM, x, y0 + rise / 2, z + s * hs / 2).rotation.x = s * a; });
    box(w + 0.9, 0.1, 0.28, M(0x6b3a2a), x, y0 + rise + 0.03, z);
    const g = new THREE.CylinderGeometry(1, 1, 1, 3); g.rotateX(-Math.PI / 2); g.rotateY(Math.PI / 2);
    const p = new THREE.Mesh(g, wallM); p.scale.set(w, rise / 1.5, d / 1.732); p.position.set(x, y0 + 0.5 * p.scale.y, z); p.castShadow = true; root.add(p);
  }
  function car(p, color, len, x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); const m = M(color, { roughness: 0.3, metalness: 0.4 });
    box(len, 0.6, 1.1, m, 0, 0.55, 0, g); box(len * 0.52, 0.5, 1, m, -len * 0.04, 1.05, 0, g); box(len * 0.46, 0.34, 1.02, M(0x151c2a, { roughness: 0.2 }), -len * 0.04, 1.05, 0, g);
    [-1, 1].forEach(a => [-1, 1].forEach(b => { cyl(0.28, 0.2, M(0x111111), a * len * 0.33, 0.28, b * 0.5, g).rotation.x = Math.PI / 2; }));
  }
  const WALL = M(0xffffff, { map: tex((g, w, h) => { g.fillStyle = '#efe6d0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(120,100,60,.04)'; g.fillRect(rnd() * w, rnd() * h, 4, 4); } }, 256, 256, 2, 1) });
  const tileM = M(0xffffff, { map: tex((g, w, h) => { g.fillStyle = '#a44a2e'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '0,0,0' : '255,200,150') + ',.08)'; g.fillRect(c * 16 + (r % 2) * 8, r * 16, 16, 16); } g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, r * 16 + 13, w, 3); } }, 128, 128, 7, 3), roughness: 0.85 });
  const WHITE = M(0xf6f4ee), WOOD = M(0x5a3b26), TEAL = M(0x3f7a76), green = M(0x3e7a3e), CONC = M(0x8d8a80);

  /* Badan rumah + atap genteng */
  box(8, 2.9, 6, WALL, 0, 1.45, 0); box(8.1, 0.3, 6.1, M(0x8a8a84), 0, 0.15, 0);
  gable(8, 6, 2.9, 1.7, 0.6, tileM, WALL);
  box(0.6, 2, 0.6, M(0x8a5a44), 2.2, 4.7, -1);

  /* Teras + pintu */
  box(3.6, 0.2, 1.9, M(0xcfcac0), 0, 0.1, 3.9); box(2.2, 0.12, 0.5, M(0xcfcac0), 0, 0.06, 5.1);
  box(4, 0.08, 1.9, tileM, 0, 2.72, 4.0).rotation.x = 0.1;
  [-1.5, 1.5].forEach(x => { cyl(0.09, 2.6, WHITE, x, 1.4, 4.7); box(0.3, 0.12, 0.3, WHITE, x, 0.26, 4.7); });
  box(1.1, 2.2, 0.08, WHITE, 0, 1.2, 3.04); box(0.95, 2.1, 0.06, WOOD, 0, 1.15, 3.08); box(0.06, 0.12, 0.05, M(0xc9a24a), 0.35, 1.1, 3.14);
  const gl = (c, i) => new THREE.MeshStandardMaterial({ color: 0x222a38, emissive: c, emissiveIntensity: i, roughness: 0.25 });
  [-0.85, 0.85].forEach(x => { const g = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.8, 0.04), gl(0xffd9a0, 0.7)); g.position.set(x, 1.2, 3.06); root.add(g); });
  const bulb = ball(0.08, new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), 0.9, 2.45, 3.3); bulb.castShadow = false;
  const doorLight = new THREE.PointLight(0xffd890, 1.1, 9); doorLight.position.set(0, 2.3, 4.2); root.add(doorLight);

  /* Jendela berdaun dan bunga */
  const tvM = gl(0x6fa8ff, 0.7);
  [[-2.7, gl(0xffd9a0, 0.85)], [2.7, tvM]].forEach(([x, gm]) => {
    box(1.4, 1.2, 0.1, WHITE, x, 1.6, 3.03); const g = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.05), gm); g.position.set(x, 1.6, 3.09); root.add(g);
    [-1, 1].forEach(s => box(0.45, 1.2, 0.05, TEAL, x + s * 0.95, 1.6, 3.07));
    box(1.4, 0.2, 0.3, WOOD, x, 0.92, 3.2); [0xe8506a, 0xf2c14e, 0xe8506a, 0xffffff, 0xf2c14e].forEach((c, i) => ball(0.1, M(c), x - 0.55 + i * 0.27, 1.07, 3.2));
  });

  /* Carport kiri + mobil */
  box(3.4, 0.08, 5, CONC, -5.8, 0.04, 0.5); box(3.6, 0.1, 5.2, M(0x6a6f74, { metalness: 0.3 }), -5.8, 2.65, 0.5);
  [[-7.4, 2.9], [-7.4, -1.9]].forEach(p => cyl(0.07, 2.6, WHITE, p[0], 1.3, p[1], root, 8));
  car(root, 0x9aa3ab, 2.6, -5.8, 0.5, Math.PI / 2);

  /* Halaman, pagar putih, pohon */
  const PR = new THREE.Group(); root.add(PR); PR.visible = props;
  box(22, 0.02, 16, green, 0, 0.01, 4, PR); box(1.2, 0.05, 5.4, CONC, 0, 0.05, 7.6, PR);
  [-2.6, 2.6].forEach(x => box(2.4, 0.6, 0.6, M(0x2f6b3a), x, 0.3, 3.9, PR));
  const FZ = 10;
  [-1, 1].forEach(s => {
    [0.35, 0.8].forEach(y => box(7.1, 0.06, 0.06, WHITE, s * 4.45, y, FZ, PR));
    for (let i = 0; i < 16; i++) box(0.07, 0.95, 0.04, WHITE, s * (1.2 + i * 0.45), 0.5, FZ + 0.03, PR);
    box(0.35, 1.3, 0.35, M(0xcfcac0), s * 0.75, 0.65, FZ, PR); ball(0.12, new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), s * 0.75, 1.42, FZ, PR);
  });
  cyl(0.04, 1, M(0x555555), 1.5, 0.5, FZ + 0.4, PR, 6); box(0.3, 0.22, 0.2, M(0xc03a3a), 1.5, 1.1, FZ + 0.4, PR);
  [[6.5, 5], [-7, 7]].forEach((p, i) => { cyl(0.18, 2, M(0x4a3626), p[0], 1, p[1], PR, 8); ball(1.3 - i * 0.2, M(0x2f6b3a), p[0], 2.8, p[1], PR); ball(0.9, M(0x356f3e), p[0] + 0.5, 3.6, p[1], PR); });
  box(2.4, 0.12, 0.8, M(0x4a3626), 1.9, 0.06, 5.6, PR); [0xe8506a, 0xf2c14e, 0xffffff, 0xe8506a, 0xf2c14e, 0xffffff].forEach((c, i) => ball(0.11, M(c), 1.0 + i * 0.35, 0.22, 5.6, PR));
  [[-0.9, 6], [0.9, 6], [-0.9, 8.5], [0.9, 8.5]].forEach(p => cyl(0.06, 0.5, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), p[0], 0.3, p[1], PR, 8));

  root.userData.update = (ms) => {
    const s = ms * 0.001; tvM.emissiveIntensity = 0.45 + 0.4 * Math.abs(Math.sin(s * 5) * Math.sin(s * 1.3));
  };
  return root;
}
