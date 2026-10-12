import * as THREE from 'three';

/**
 * Hotel bintang 5 (istana klasik: portico berpilar, kubah emas, dua sayap beratap mansard,
 * tangga besar, air mancur di taman bundar) sebagai THREE.Group.
 * Depan menghadap +Z, dasar di y = 0. Taman bundar ada di depan (z sekitar 9 sampai 33).
 * Ukuran: lebar sekitar 32 unit (x dari -16 sampai 16), tinggi sekitar 28.5 unit.
 *
 *   const hotel = createHotel5();
 *   hotel.position.set(x, 0, z);
 *   hotel.scale.setScalar(0.6);   // kemungkinan perlu dikecilkan
 *   scene.add(hotel);
 *   // di loop animasi:
 *   hotel.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa plaza, taman bundar, air mancur, topiari, mobil, bendera.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHotel5({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'HotelBintang5';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s; }
  function cyl(r, h, m, x, y, z, p = root, seg = 16) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function ball(r, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; };
  const CREAM = M(0xf1ead8), GOLD = M(0xd4af37, { metalness: 0.75, roughness: 0.3, emissive: 0x2a1f05 }), SLATE = M(0x38424c, { roughness: 0.6 });
  const STONE = M(0xc9c5ba), green = M(0x2f6b3a), STEEL = M(0x8a9096, { metalness: 0.5, roughness: 0.4 });
  const wallM = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#eee6d2'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '120,100,60' : '255,255,255') + ',.04)'; g.fillRect(Math.random() * 256, Math.random() * 256, 4, 4); }
    g.strokeStyle = 'rgba(120,100,60,.12)'; g.lineWidth = 2; for (let y = 0; y < 256; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return M(0xffffff, { map: srgb(t) });
  })();
  function friezeTex() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 117; const g = c.getContext('2d');
    g.fillStyle = '#1b1712'; g.fillRect(0, 0, 1024, 117); g.strokeStyle = '#d4af37'; g.lineWidth = 5; g.strokeRect(5, 5, 1014, 107);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 70px Georgia,serif'; g.shadowColor = '#ffd24a'; g.shadowBlur = 16; g.fillStyle = '#ffe08a';
    g.fillText('HOTEL MELATI  \u2605\u2605\u2605\u2605\u2605', 512, 60); return srgb(new THREE.CanvasTexture(c));
  }
  const warmGlass = (lit) => new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: lit ? 0xffdca8 : 0x0e1522, emissiveIntensity: lit ? 0.85 : 0.4, roughness: 0.25 });

  const CW = 12, CD = 8, CH = 18, ZC = CD / 2, WW = 10, WD = 7, WH = 11, WZ = -0.5, ZW = WZ + WD / 2;
  /* Blok tengah + sayap */
  box(CW, CH, CD, wallM, 0, CH / 2, 0);
  [-1, 1].forEach(s => {
    const x = s * 11;
    box(WW, WH, WD, wallM, x, WH / 2, WZ);
    box(WW + 0.2, 0.5, WD + 0.2, M(0x9a8f78), x, 0.25, WZ);
    [3.6, 7.2].forEach(y => box(WW + 0.2, 0.14, WD + 0.2, CREAM, x, y, WZ));
    box(WW + 0.7, 0.3, WD + 0.7, CREAM, x, WH + 0.15, WZ);
    const g = new THREE.CylinderGeometry(0.62, 1, 3, 4); g.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(g, SLATE); roof.scale.set((WW + 0.6) / 1.414, 1, (WD + 0.6) / 1.414); roof.position.set(x, WH + 1.8, WZ); roof.castShadow = true; root.add(roof);
    [-3, 0, 3].forEach(dx => { box(0.9, 1, 0.5, CREAM, x + dx, WH + 1.2, ZW - 0.1); const d = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), new THREE.MeshBasicMaterial({ color: 0xffd79a })); d.position.set(x + dx, WH + 1.2, ZW + 0.17); root.add(d); });
    [-2.5, 2.5].forEach(dx => box(0.6, 1.5, 0.6, M(0x8a6a5a), x + dx, WH + 3.2, WZ - 1.5));
  });
  function win(x, y, zf, h, bal, lit) {
    box(1.45, h + 0.2, 0.1, CREAM, x, y, zf + 0.04);
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.15, h, 0.05), warmGlass(lit)); g.position.set(x, y, zf + 0.1); root.add(g);
    box(1.7, 0.16, 0.22, CREAM, x, y + h / 2 + 0.18, zf + 0.1);
    if (bal) { box(1.7, 0.1, 0.45, CREAM, x, y - h / 2 - 0.05, zf + 0.22); box(1.7, 0.05, 0.05, GOLD, x, y - h / 2 + 0.42, zf + 0.43); }
  }
  [-1, 1].forEach((s, si) => [1.9, 5.5, 9.1].forEach((y, f) => [-4, -2, 0, 2, 4].forEach((dx, i) => win(s * 11 + dx, y, ZW, 2.4, f > 0, (i * 3 + f * 2 + si) % 5 < 3))));
  [-4, -2, 0, 2, 4].forEach((dx, i) => { win(dx, 6.0, ZC, 2.0, false, i % 2 === 0); win(dx, 12.2, ZC, 2.0, true, i !== 2); win(dx, 15.0, ZC, 2.0, true, i % 2 === 1); });
  box(12.4, 0.35, 8.4, GOLD, 0, 17.8, 0); box(12.6, 0.5, 8.6, SLATE, 0, 18.25, 0);

  /* Kubah emas */
  cyl(3.4, 2.4, CREAM, 0, 19.55, 0, root, 32); cyl(3.7, 0.3, GOLD, 0, 20.9, 0, root, 32);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, w = box(0.5, 1.1, 0.2, warmGlass(true), Math.sin(a) * 3.42, 19.5, Math.cos(a) * 3.42); w.rotation.y = a; }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), GOLD); dome.position.set(0, 21.05, 0); dome.castShadow = true; root.add(dome);
  cyl(0.6, 1.4, CREAM, 0, 25.1, 0, root, 16); ball(0.65, GOLD, 0, 25.8, 0); cyl(0.04, 2.4, GOLD, 0, 27.3, 0, root, 6); ball(0.14, GOLD, 0, 28.5, 0);

  /* Portico + tangga besar */
  for (let i = 0; i < 4; i++) { const fe = 6.9 + (3 - i) * 0.55, dep = fe - 4; box(10.8, 0.2 * (i + 1), dep, STONE, 0, 0.1 * (i + 1), 4 + dep / 2); }
  const dm = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: 0xffe0b0, emissiveIntensity: 0.8, roughness: 0.2 });
  box(3.6, 4, 0.06, dm, 0, 2.8, ZC + 0.03); [-1, 1].forEach(s => box(1.5, 4, 0.06, dm, s * 3.6, 2.8, ZC + 0.03));
  [-4, 4].forEach(x => box(0.15, 4.2, 0.1, GOLD, x * 0.45, 2.8, ZC + 0.06));
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 1.9;
    box(1.1, 0.3, 1.1, CREAM, x, 0.95, 6.2); cyl(0.42, 6.2, CREAM, x, 4.2, 6.2, root, 20); box(1.1, 0.3, 1.1, GOLD, x, 7.45, 6.2);
  }
  box(10.2, 1.3, 2.9, CREAM, 0, 8.25, 5.45);
  const frieze = new THREE.MeshBasicMaterial({ map: friezeTex() });
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 1.1), frieze); fr.position.set(0, 8.25, 6.91); root.add(fr);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 3), CREAM); ped.rotation.x = -Math.PI / 2;
  ped.scale.set(10.2 / 1.732, 2.9, 1.8 / 1.5); ped.position.set(0, 8.9 + 0.5 * ped.scale.z, 5.45); ped.castShadow = true; root.add(ped);
  const crest = cyl(0.5, 0.1, GOLD, 0, 9.7, 6.93); crest.rotation.x = Math.PI / 2;

  /* Cahaya */
  const entL = new THREE.PointLight(0xffd9a0, 1.6, 16); entL.position.set(0, 3, 7.6); root.add(entL);
  [-1, 1].forEach(s => { const l = new THREE.PointLight(0xffe0b8, 0.9, 16); l.position.set(s * 11, 4, 6.5); root.add(l); });
  const domeL = new THREE.PointLight(0xffe3a0, 1.2, 18); domeL.position.set(0, 23, 8); root.add(domeL);

  /* Properti: plaza, air mancur, taman bundar, topiari, mobil, bendera */
  const PR = new THREE.Group(); root.add(PR); PR.visible = props;
  const flags = [], jets = []; let waterM;
  box(56, 0.08, 12, M(0xa39b8c), 0, 0.04, 6, PR);
  cyl(12, 0.04, M(0x26282e), 0, 0.02, 21, PR, 48); cyl(8, 0.12, M(0xb7ad98), 0, 0.06, 21, PR, 48); cyl(7.0, 0.14, M(0x356f3e), 0, 0.07, 21, PR, 48);
  const hr = new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.5, 10, 64), green); hr.rotation.x = Math.PI / 2; hr.position.set(0, 0.5, 21); hr.castShadow = true; PR.add(hr);
  waterM = new THREE.MeshStandardMaterial({ color: 0x3a9ad0, emissive: 0x2a7fb0, emissiveIntensity: 0.55, roughness: 0.1 });
  cyl(3.8, 0.9, STONE, 0, 0.6, 21, PR, 40); cyl(3.5, 0.05, waterM, 0, 1.08, 21, PR, 40);
  cyl(0.5, 1.8, STONE, 0, 1.9, 21, PR); cyl(1.9, 0.3, STONE, 0, 2.6, 21, PR, 32); cyl(1.7, 0.05, waterM, 0, 2.78, 21, PR, 32); cyl(0.3, 1.2, STONE, 0, 3.4, 21, PR);
  const jetM = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.6 });
  const jc = cyl(0.06, 2.2, jetM, 0, 5.1, 21, PR, 8); jets.push(jc); ball(0.16, GOLD, 0, 6.3, 21, PR);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; jets.push(cyl(0.04, 1.2, jetM, Math.sin(a) * 3.0, 1.7, 21 + Math.cos(a) * 3.0, PR, 6)); }
  const fl = new THREE.PointLight(0x6fd0ff, 1.0, 14); fl.position.set(0, 2.2, 21); PR.add(fl);
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, x = Math.sin(a) * 8.6, z = 21 + Math.cos(a) * 8.6; cyl(0.07, 3.4, M(0x222222), x, 1.7, z, PR, 8); ball(0.22, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), x, 3.5, z, PR); }
  [-15, -12.5, -9.5, 9.5, 12.5, 15].forEach(x => { box(0.7, 0.5, 0.7, STONE, x, 0.33, 5.8, PR); const c = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 10), green); c.position.set(x, 1.7, 5.8); c.castShadow = true; PR.add(c); });
  [-1, 1].forEach((s, i) => {
    const x = s * 7.4; cyl(0.05, 6.5, STEEL, x, 3.25, 9.5, PR, 6);
    const fg = new THREE.PlaneGeometry(1.3, 0.8); fg.translate(0.65, 0, 0);
    const f = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: i ? 0xd4af37 : 0xb3202c, side: THREE.DoubleSide })); f.position.set(x + 0.05, 6.0, 9.5); PR.add(f); flags.push(f);
  });
  function car(color, len, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); PR.add(g); const m = M(color, { roughness: 0.25, metalness: 0.4 });
    box(len, 0.6, 1.1, m, 0, 0.55, 0, g); box(len * 0.52, 0.5, 1, m, -len * 0.04, 1.05, 0, g); box(len * 0.46, 0.34, 1.02, M(0x151c2a, { roughness: 0.2 }), -len * 0.04, 1.05, 0, g);
    [-1, 1].forEach(a => [-1, 1].forEach(b => { const w = cyl(0.28, 0.2, M(0x111111), a * len * 0.33, 0.28, b * 0.5, g); w.rotation.x = Math.PI / 2; }));
  }
  car(0x111114, 4.6, 5, 9.9); car(0xd9c9a3, 2.8, -5.5, 9.9);

  root.userData.update = (ms) => {
    const s = ms * 0.001;
    frieze.color.setScalar(0.94 + 0.06 * Math.sin(s * 1.4)); domeL.intensity = 1.2 + 0.1 * Math.sin(s * 1.1);
    flags.forEach((f, i) => { f.rotation.y = Math.sin(s * 2.2 + i) * 0.3; });
    waterM.emissiveIntensity = 0.5 + 0.15 * Math.sin(s * 3);
    jets.forEach((j, i) => { j.scale.y = 0.85 + 0.15 * Math.sin(s * 4 + i); });
  };
  return root;
}
