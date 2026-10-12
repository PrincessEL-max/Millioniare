import * as THREE from 'three';

/**
 * Mansion klasik (portico berpilar, dua sayap beratap sirap, dua menara berkerucut tembaga, cerobong, taman bundar dengan air mancur, gerbang berpilar)
 * sebagai THREE.Group. Depan menghadap +Z, dasar di y = 0.
 * Lebar sekitar 28 unit (x dari -15.5 sampai 15.5), tinggi sekitar 12 unit; taman dan gerbang sampai z = 23.
 *
 *   const rumah = createHouse5();
 *   rumah.position.set(x, 0, z);
 *   scene.add(rumah);
 *   // di loop animasi:
 *   rumah.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa taman, air mancur, topiari, pohon, pagar besi, gerbang, mobil.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHouse5({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'RumahBintang5';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s; }
  function cyl(r, h, m, x, y, z, p = root, seg = 16) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function ball(r, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; }, rnd = Math.random;
  function tex(fn, w, h, rx, ry) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return srgb(t); }
  function car(p, color, len, x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); const m = M(color, { roughness: 0.25, metalness: 0.5 });
    box(len, 0.6, 1.1, m, 0, 0.55, 0, g); box(len * 0.52, 0.5, 1, m, -len * 0.04, 1.05, 0, g); box(len * 0.46, 0.34, 1.02, M(0x151c2a, { roughness: 0.2 }), -len * 0.04, 1.05, 0, g);
    [-1, 1].forEach(a => [-1, 1].forEach(b => { cyl(0.28, 0.2, M(0x111111), a * len * 0.33, 0.28, b * 0.5, g, 14).rotation.x = Math.PI / 2; }));
  }
  const STONEW = M(0xffffff, { map: tex((g, w, h) => { g.fillStyle = '#eee6d2'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '120,100,60' : '255,255,255') + ',.04)'; g.fillRect(rnd() * w, rnd() * h, 4, 4); } g.strokeStyle = 'rgba(120,100,60,.12)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, 256, 256, 4, 4) });
  const CREAM = M(0xf1ead8), GOLD = M(0xd4af37, { metalness: 0.75, roughness: 0.3, emissive: 0x2a1f05 }), SLATE = M(0x3b434c, { roughness: 0.6 }), COPPER = M(0x3f8a76, { metalness: 0.5, roughness: 0.45 });
  const STONE = M(0xc9c5ba), green = M(0x2f6b3a), STEEL = M(0x8a9096, { metalness: 0.5, roughness: 0.4 }), BRICK = M(0x8a4a3a), SHUT = M(0x2f4a3a);
  const gl = (lit) => new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: lit ? 0xffdca8 : 0x0e1522, emissiveIntensity: lit ? 0.85 : 0.4, roughness: 0.25 });
  function hip(w, d, y, h, ratio, m, x, z) { const g = new THREE.CylinderGeometry(ratio, 1, h, 4); g.rotateY(Math.PI / 4); const r = new THREE.Mesh(g, m); r.scale.set(w / 1.414, 1, d / 1.414); r.position.set(x, y + h / 2, z); r.castShadow = true; root.add(r); }
  function win(x, y, zf, h, bal, lit, shut) {
    box(1.3, h + 0.2, 0.1, CREAM, x, y, zf + 0.04); const g = new THREE.Mesh(new THREE.BoxGeometry(1.05, h, 0.05), gl(lit)); g.position.set(x, y, zf + 0.1); root.add(g);
    box(1.6, 0.16, 0.22, CREAM, x, y + h / 2 + 0.18, zf + 0.1);
    if (shut) [-1, 1].forEach(s => box(0.4, h + 0.1, 0.06, SHUT, x + s * 0.85, y, zf + 0.06));
    if (bal) { box(1.6, 0.1, 0.45, CREAM, x, y - h / 2 - 0.05, zf + 0.22); box(1.6, 0.05, 0.05, GOLD, x, y - h / 2 + 0.42, zf + 0.43); }
  }

  /* Blok tengah, sayap, atap pelana joglo-hip, menara */
  box(12, 9, 8, STONEW, 0, 4.5, 0); box(12.4, 0.35, 8.4, GOLD, 0, 8.85, 0); hip(12.8, 8.8, 9, 3.2, 0.5, SLATE, 0, 0);
  [-1, 1].forEach(s => {
    const x = s * 10; box(8, 6.4, 7, STONEW, x, 3.2, -0.5); box(8.2, 0.3, 7.2, CREAM, x, 6.45, -0.5); hip(8.8, 7.8, 6.6, 3, 0.5, SLATE, x, -0.5);
    box(0.7, 2, 0.7, BRICK, x + s * 1.8, 8.6, -1.5); box(0.7, 2, 0.7, BRICK, x - s * 1.8, 8.6, -1.5);
    const tx = s * 14.1; cyl(1.3, 7.6, STONEW, tx, 3.8, 2.6, root, 24); cyl(1.45, 0.3, GOLD, tx, 7.7, 2.6, root, 24);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.8, 24), COPPER); cone.position.set(tx, 9.2, 2.6); cone.castShadow = true; root.add(cone); cyl(0.04, 1.2, GOLD, tx, 11, 2.6, root, 6); ball(0.12, GOLD, tx, 11.7, 2.6);
    [3.0, 6.0].forEach(y => { const w = box(0.7, 1.3, 0.2, gl(true), tx, y, 3.85); });
    [-1, 1].forEach(t => [2.0, 5.5].forEach((y, f) => win(x + t * 2.6 + (t < 0 ? 0 : 0), y, 3.0, 2.4, f > 0, (f + (s < 0 ? 1 : 0)) % 2 === 0, true)));
    win(x, 2.0, 3.0, 2.4, false, true, true); win(x, 5.5, 3.0, 2.4, true, false, true);
  });
  box(0.7, 2.4, 0.7, BRICK, -3.5, 10.8, -1); box(0.7, 2.4, 0.7, BRICK, 3.5, 10.8, -1);

  /* Portico bertiang, pintu besar, tangga */
  for (let i = 0; i < 3; i++) { const fe = 6.75 + (2 - i) * 0.6, dep = fe - 4; box(9.6, 0.2 * (i + 1), dep, STONE, 0, 0.1 * (i + 1), 4 + dep / 2); }
  const dm = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: 0xffe0b0, emissiveIntensity: 0.85, roughness: 0.2 });
  box(2.4, 3.6, 0.06, dm, 0, 2.5, 4.03); box(2.4, 0.9, 0.06, dm, 0, 4.7, 4.03); box(0.08, 3.6, 0.08, GOLD, 0, 2.5, 4.07);
  [-4.6, -2.3, 2.3, 4.6].forEach((x, i) => win(x, 5.0, 4.0, 2.0, false, i % 2 === 0, false));
  [-3.3, -1.1, 1.1, 3.3].forEach(x => { box(1, 0.3, 1, CREAM, x, 0.75, 5.9); cyl(0.35, 5.5, CREAM, x, 3.6, 5.9, root, 20); box(1, 0.3, 1, GOLD, x, 6.5, 5.9); ball(0.18, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), x, 1.2, 6.5); });
  box(9, 0.8, 2.9, CREAM, 0, 6.85, 5.4); box(9.2, 0.1, 3.1, GOLD, 0, 7.3, 5.4);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 3), CREAM); ped.rotation.x = -Math.PI / 2; ped.scale.set(9 / 1.732, 2.9, 1.7 / 1.5); ped.position.set(0, 7.35 + 0.5 * ped.scale.z, 5.4); ped.castShadow = true; root.add(ped);
  const crest = cyl(0.45, 0.1, GOLD, 0, 8.0, 6.87); crest.rotation.x = Math.PI / 2;

  const entL = new THREE.PointLight(0xffd9a0, 1.5, 14); entL.position.set(0, 3, 7.6); root.add(entL);
  [-1, 1].forEach(s => { const l = new THREE.PointLight(0xffe0b8, 0.8, 14); l.position.set(s * 10, 3.5, 5.5); root.add(l); });

  /* Halaman: taman bundar + air mancur, pagar besi, gerbang berpilar */
  const PR = new THREE.Group(); root.add(PR); PR.visible = props;
  const jets = []; box(36, 0.02, 28, M(0x2f6b3a), 0, 0.01, 10, PR); box(26, 0.04, 5, M(0xa39b8c), 0, 0.02, 5.2, PR);
  cyl(7.5, 0.04, M(0x9a948a), 0, 0.03, 15, PR, 48); cyl(4.6, 0.12, M(0x356f3e), 0, 0.06, 15, PR, 48);
  const hr = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.4, 8, 48), green); hr.rotation.x = Math.PI / 2; hr.position.set(0, 0.4, 15); hr.castShadow = true; PR.add(hr);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x3a9ad0, emissive: 0x2a7fb0, emissiveIntensity: 0.55, roughness: 0.1 });
  cyl(2.2, 0.8, STONE, 0, 0.5, 15, PR, 32); cyl(2.0, 0.05, waterM, 0, 0.92, 15, PR, 32); cyl(0.35, 1.5, STONE, 0, 1.6, 15, PR); cyl(1.1, 0.25, STONE, 0, 2.3, 15, PR, 24); cyl(0.95, 0.05, waterM, 0, 2.45, 15, PR, 24);
  const jetM = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.6 }); jets.push(cyl(0.05, 1.6, jetM, 0, 3.3, 15, PR, 8)); ball(0.13, GOLD, 0, 4.2, 15, PR);
  const fl = new THREE.PointLight(0x6fd0ff, 1.0, 12); fl.position.set(0, 2, 15); PR.add(fl);
  [-1, 1].forEach(s => { cyl(0.2, 2.2, M(0x4a3626), s * 19, 1.1, 8, PR, 8); ball(1.9, M(0x2f6b3a), s * 19, 3.4, 8, PR); ball(1.4, M(0x356f3e), s * 19.6, 4.8, 8.3, PR); box(6, 0.9, 0.8, green, s * 10, 0.45, 3.9, PR); });
  [-8, -5.5, 5.5, 8].forEach(x => { box(0.7, 0.5, 0.7, STONE, x, 0.3, 7.6, PR); const c = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 10), green); c.position.set(x, 1.7, 7.6); c.castShadow = true; PR.add(c); });
  const FZ = 23, IR = M(0x1c1c20, { metalness: 0.4 });
  [-1, 1].forEach(s => { [0.4, 1.7].forEach(y => box(13.4, 0.07, 0.07, IR, s * 9.3, y, FZ, PR)); for (let i = 0; i < 14; i++) box(0.05, 1.9, 0.05, IR, s * (3.1 + i * 0.95), 0.95, FZ, PR); box(0.9, 3, 0.9, STONE, s * 2.6, 1.5, FZ, PR); box(1.1, 0.2, 1.1, GOLD, s * 2.6, 3.1, FZ, PR); ball(0.28, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), s * 2.6, 3.5, FZ, PR); });
  box(2.1, 0.03, 8, M(0xa39b8c), 0, 0.03, 19, PR);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, x = Math.sin(a) * 7.9, z = 15 + Math.cos(a) * 7.9; cyl(0.07, 3, M(0x222222), x, 1.5, z, PR, 8); ball(0.2, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), x, 3.1, z, PR); }
  car(PR, 0x111114, 4.4, 5.2, 10.6, 0.2); car(PR, 0xd9c9a3, 2.8, -5.2, 10.6, -0.2);

  root.userData.update = (ms) => {
    const s = ms * 0.001; waterM.emissiveIntensity = 0.5 + 0.15 * Math.sin(s * 3);
    jets.forEach((j, i) => { j.scale.y = 0.85 + 0.15 * Math.sin(s * 4 + i); });
  };
  return root;
}
