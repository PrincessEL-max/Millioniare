import * as THREE from 'three';

/**
 * Rumah kecil level bintang 1 (cat kusam, atap seng berkarat, teras plastik,
 * pagar karatan, toren air, motor tua, jemuran) sebagai THREE.Group.
 * Depan menghadap +Z, dasar di y = 0. Badan rumah 6 x 2.8 x 5, tinggi total sekitar 5.4 unit.
 *
 *   const rumah = createHouse1();
 *   rumah.position.set(x, 0, z);
 *   scene.add(rumah);
 *   // di loop animasi:
 *   rumah.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa halaman, pagar, motor, jemuran, sampah, tiang listrik.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHouse1({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'RumahBintang1';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.9, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s; }
  function cyl(r, h, m, x, y, z, p = root, seg = 12) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function ball(r, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; };
  const rnd = Math.random, RUST = M(0x6b3a22, { roughness: 0.8 });

  function wallTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#a9b69b'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '255,255,255' : '60,50,30') + ',.09)'; g.fillRect(rnd() * 220, rnd() * 200, 20 + rnd() * 50, 20 + rnd() * 50); }
    for (let i = 0; i < 40; i++) { const x = rnd() * 256, h = 40 + rnd() * 150, gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(50,60,40,.3)'); gr.addColorStop(1, 'rgba(50,60,40,0)'); g.fillStyle = gr; g.fillRect(x, 0, 2 + rnd() * 6, h); }
    const dp = g.createLinearGradient(0, 170, 0, 256); dp.addColorStop(0, 'rgba(40,45,30,0)'); dp.addColorStop(1, 'rgba(40,45,30,.55)'); g.fillStyle = dp; g.fillRect(0, 170, 256, 86);
    g.strokeStyle = 'rgba(40,35,25,.55)'; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { let x = rnd() * 256, y = rnd() * 110; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += rnd() * 14 - 7; y += 8 + rnd() * 10; g.lineTo(x, y); } g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return srgb(t);
  }
  function roofTex() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    for (let x = 0; x < 128; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#8e9498'); gr.addColorStop(0.5, '#c0c5c8'); gr.addColorStop(1, '#7a8084'); g.fillStyle = gr; g.fillRect(x, 0, 16, 128); }
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(140,70,30,' + (0.15 + rnd() * 0.3) + ')'; g.beginPath(); g.arc(rnd() * 128, rnd() * 128, 3 + rnd() * 12, 0, 6.3); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); return srgb(t);
  }

  /* Badan rumah + atap seng */
  const wall = M(0xffffff, { map: wallTex(), roughness: 0.95 });
  box(6, 2.8, 5, wall, 0, 1.4, 0);
  box(6.1, 0.25, 5.1, M(0x6b6a5e), 0, 0.125, 0);
  const gg = new THREE.CylinderGeometry(1, 1, 1, 3); gg.rotateX(-Math.PI / 2); gg.rotateY(Math.PI / 2);
  const gab = new THREE.Mesh(gg, wall); gab.scale.set(6, 1.27 / 1.5, 5 / 1.732); gab.position.set(0, 2.8 + 0.5 * gab.scale.y, 0); gab.castShadow = true; root.add(gab);
  const roofM = M(0xffffff, { map: roofTex(), roughness: 0.6, metalness: 0.3 });
  box(6.8, 0.08, 3.3, roofM, 0, 3.43, 1.5).rotation.x = 0.4;
  box(6.8, 0.08, 3.3, roofM, 0, 3.43, -1.5).rotation.x = -0.4;
  box(6.9, 0.1, 0.3, M(0x6b7075), 0, 4.1, 0);
  box(6.6, 0.06, 1.7, roofM, 0, 2.68, 3.85).rotation.x = 0.12;     // atap teras
  cyl(0.06, 2.5, M(0x7a5a3a), -2.9, 1.3, 4.55, root, 8); cyl(0.06, 2.5, M(0x7a5a3a), 2.9, 1.3, 4.55, root, 8).rotation.z = 0.03;
  cyl(0.02, 2, STEELISH(), 1.6, 5.0, 0.2, root, 6);
  function STEELISH() { return M(0x8a9096, { metalness: 0.5 }); }
  [4.6, 5.0, 5.4].forEach((y, i) => box(0.9 - i * 0.15, 0.02, 0.02, STEELISH(), 1.6, y, 0.2));

  /* Teras */
  box(6.2, 0.15, 1.9, M(0x8d8a80), 0, 0.075, 3.45); box(1.6, 0.1, 0.5, M(0x8d8a80), 0.3, 0.05, 4.65);
  box(1.05, 2.15, 0.08, M(0x3a2e24), 0.3, 1.17, 2.54); box(0.9, 2.05, 0.06, M(0x4f6a78), 0.3, 1.12, 2.58); box(0.06, 0.12, 0.05, M(0x999999), 0.65, 1.1, 2.63);
  box(0.3, 0.4, 0.14, M(0x777b7e), -2.75, 1.7, 2.57);
  const warmM = new THREE.MeshStandardMaterial({ color: 0x222a38, emissive: 0xffc860, emissiveIntensity: 0.9, roughness: 0.3 });
  const tvM = new THREE.MeshStandardMaterial({ color: 0x222a38, emissive: 0x6fa8ff, emissiveIntensity: 0.7, roughness: 0.3 });
  [[-1.9, warmM], [2.1, tvM]].forEach(([x, gm]) => {
    box(1.3, 1.1, 0.1, M(0x4a3a2a), x, 1.7, 2.54);
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.05), gm); g.position.set(x, 1.7, 2.6); root.add(g);
    box(1.1, 0.4, 0.03, M(gm === warmM ? 0xb9506a : 0x6b6a5e), x, 1.95, 2.64);
    for (let i = -2; i <= 2; i++) box(0.025, 1.0, 0.03, RUST, x + i * 0.24, 1.7, 2.68);
  });
  const plastic = M(0xb03a3a, { roughness: 0.6 }), white = M(0xe6e2d8, { roughness: 0.6 });
  [-1.75, -0.85].forEach(x => { box(0.45, 0.05, 0.45, plastic, x, 0.5, 3.6); box(0.45, 0.5, 0.05, plastic, x, 0.78, 3.4); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(p => cyl(0.02, 0.45, plastic, x + p[0] * 0.19, 0.3, 3.6 + p[1] * 0.19, root, 6)); });
  cyl(0.3, 0.04, white, -1.3, 0.55, 4.0); cyl(0.03, 0.5, white, -1.3, 0.3, 4.0, root, 6); cyl(0.05, 0.1, M(0x3a7a9a), -1.3, 0.62, 4.0, root, 8);
  cyl(0.2, 0.3, M(0x6b3a26), 2.6, 0.3, 3.7); [[0.05, 0.1], [-0.08, -0.12], [0, 0.2]].forEach((s, i) => { const t = cyl(0.01, 0.55, M(0x4a3626), 2.6 + s[0], 0.7, 3.7, root, 4); t.rotation.z = s[1] * 3; t.rotation.x = s[0] * 2; });

  /* Lampu teras (berkedip) */
  const bulb = ball(0.07, new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), 1.2, 2.3, 3.4); bulb.castShadow = false; cyl(0.008, 0.2, M(0x222222), 1.2, 2.45, 3.4, root, 4);
  const lamp = new THREE.PointLight(0xffd890, 1.0, 8); lamp.position.set(1.2, 2.2, 3.5); root.add(lamp);

  /* Toren air */
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(p => cyl(0.04, 1.6, M(0x555555), -3.9 + p[0] * 0.35, 0.8, -1.2 + p[1] * 0.35, root, 6));
  box(0.9, 0.08, 0.9, M(0x555555), -3.9, 1.6, -1.2); cyl(0.42, 1.0, M(0x2a5d9a), -3.9, 2.15, -1.2, root, 16); cyl(0.2, 0.06, M(0x1f4a7a), -3.9, 2.68, -1.2, root, 10);

  /* Properti halaman */
  const PR = new THREE.Group(); root.add(PR); PR.visible = props;
  box(12, 0.03, 10, M(0x6b6350), 0, 0.015, 3, PR); box(1.2, 0.05, 1.9, M(0x8d8a80), 0.3, 0.03, 5.85, PR);
  [[1.5, 5.3], [-1.6, 5.9]].forEach(p => cyl(0.6 + rnd() * 0.2, 0.01, M(0x1a2230, { roughness: 0.05, metalness: 0.3 }), p[0], 0.04, p[1], PR, 16));
  const FZ = 6.8;
  [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].forEach(x => box(0.08, 1.1, 0.08, RUST, x, 0.55, FZ, PR));
  [-0.85, 0.85].forEach(x => box(0.12, 1.2, 0.12, RUST, x, 0.6, FZ, PR));
  [-1, 1].forEach(s => [0.4, 0.9].forEach(y => box(4.2, 0.05, 0.05, RUST, s * 3.0, y, FZ, PR)));
  [-1, 1].forEach(s => { for (let i = 0; i < 9; i++) { if (rnd() < 0.15) continue; const b = box(0.06, 0.85, 0.02, M(0x7a6a52), s * (1.1 + i * 0.45), 0.5, FZ + 0.03, PR); if (rnd() < 0.2) b.rotation.z = 0.25; } });
  const gate = new THREE.Group(); gate.position.set(-0.85, 0, FZ); gate.rotation.y = 1.0; PR.add(gate); box(0.8, 1, 0.04, M(0x4f5a3a), 0.4, 0.6, 0, gate);
  box(0.8, 1, 0.04, M(0x4f5a3a), 0.45, 0.6, FZ, PR);

  const bike = new THREE.Group(); bike.position.set(-3.7, 0, 5.2); bike.rotation.y = 0.5; PR.add(bike);
  [-0.55, 0.55].forEach(x => { const w = cyl(0.3, 0.1, M(0x111111), x, 0.3, 0, bike, 14); w.rotation.x = Math.PI / 2; });
  const red = M(0x9a3a2a, { roughness: 0.5 });
  box(1.1, 0.15, 0.2, red, 0, 0.5, 0, bike); box(0.5, 0.12, 0.22, M(0x1a1a1a), -0.2, 0.72, 0, bike); box(0.35, 0.22, 0.22, red, 0.2, 0.7, 0, bike);
  box(0.05, 0.5, 0.05, M(0x888888), 0.55, 0.6, 0, bike); box(0.05, 0.05, 0.5, M(0x333333), 0.55, 0.88, 0, bike); ball(0.08, new THREE.MeshBasicMaterial({ color: 0xfff1c8 }), 0.62, 0.8, 0, bike);

  const pivots = [];
  [0.4, 3.2].forEach(z => cyl(0.03, 2, M(0x8a7a50), 3.7, 1, z, PR, 6)); box(0.01, 0.01, 2.8, M(0xcccccc), 3.7, 1.95, 1.8, PR);
  [0xd9d6cf, 0x3a6a8a, 0xb9506a, 0xe8c24a, 0x6b8a58].forEach((c, i) => { const pv = new THREE.Group(); pv.position.set(3.7, 1.95, 0.7 + i * 0.5); PR.add(pv); box(0.04, 0.5, 0.35, M(c), 0, -0.27, 0, pv); pivots.push(pv); });
  [[-4.6, 4.2], [-4.2, 4.6], [-4.9, 4.7]].forEach((p, i) => { const b = ball(0.28, M(i === 1 ? 0xcfcab8 : 0x1a1a1a), p[0], 0.22, p[1], PR); b.scale.y = 0.8; });
  const bin = cyl(0.3, 0.7, M(0x2e5a3a), -5.3, 0.2, 5.0, PR); bin.rotation.z = Math.PI / 2.1;
  cyl(0.13, 7, M(0x4a3a2a), 6, 3.5, 7.5, PR, 8); box(1.8, 0.1, 0.1, M(0x4a3a2a), 6, 6.6, 7.5, PR);

  root.userData.update = (ms) => {
    const s = ms * 0.001;
    const lf = Math.sin(s * 3.3) * Math.sin(s * 9.1) > 0.6 ? 0.3 : 1;
    lamp.intensity = lf; bulb.material.color.setScalar(0.45 + 0.55 * lf);
    tvM.emissiveIntensity = 0.45 + 0.4 * Math.abs(Math.sin(s * 5) * Math.sin(s * 1.3));
    pivots.forEach((p, i) => { p.rotation.x = Math.sin(s * 1.6 + i) * 0.12; });
  };
  return root;
}
