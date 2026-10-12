import * as THREE from 'three';

/**
 * Hotel bintang 3 (menara bisnis + sayap kafe/resto, pintu putar, air mancur)
 * sebagai THREE.Group. Depan menghadap +Z, dasar di y = 0.
 * Ukuran: menara 13 x 12.6 x 6, total lebar sekitar 21 unit (x dari -12.5 sampai 8.5).
 *
 *   const hotel = createHotel3();
 *   hotel.position.set(x, 0, z);
 *   hotel.scale.setScalar(0.8);   // kalau terlalu besar untuk lahanmu
 *   scene.add(hotel);
 *   // di loop animasi:
 *   hotel.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa paving, parkiran, mobil, air mancur, palem, bendera, lampu jalan.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHotel3({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'HotelBintang3';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s;
  }
  function cyl(r, h, m, x, y, z, p = root, seg = 14) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    s.position.set(x, y, z); s.castShadow = true; p.add(s); return s;
  }
  function ball(r, m, x, y, z, p = root) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), m);
    s.position.set(x, y, z); s.castShadow = true; p.add(s); return s;
  }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; };
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x9fd0e0, transparent: true, opacity: 0.25, roughness: 0.1 });
  const STEEL = M(0x8a9096, { metalness: 0.5, roughness: 0.4 });

  function wallTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#d6d5d0'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '60,60,60' : '255,255,255') + ',.04)'; g.fillRect(Math.random() * 256, Math.random() * 256, 4, 4); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return srgb(t);
  }
  function signTex() {
    const c = document.createElement('canvas'); c.width = 768; c.height = 240; const g = c.getContext('2d');
    g.fillStyle = '#16181c'; g.fillRect(0, 0, 768, 240);
    g.strokeStyle = '#c9a24a'; g.lineWidth = 8; g.strokeRect(8, 8, 752, 224);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 82px Georgia,serif'; g.shadowColor = '#ffd98a'; g.shadowBlur = 18; g.fillStyle = '#fff3d6';
    g.fillText('HOTEL MELATI', 384, 88);
    g.font = 'bold 62px Georgia,serif'; g.shadowColor = '#ffd24a'; g.fillStyle = '#ffd24a';
    g.fillText('\u2605 \u2605 \u2605', 300, 182);
    g.shadowBlur = 0; g.fillStyle = '#5a5a58'; g.fillText('\u2606 \u2606', 520, 182);
    return srgb(new THREE.CanvasTexture(c));
  }
  function plaqueTex(text) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#2a1a16'; g.fillRect(0, 0, 512, 128);
    g.strokeStyle = '#c9a24a'; g.lineWidth = 5; g.strokeRect(5, 5, 502, 118);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 56px Georgia,serif'; g.fillStyle = '#ffe8c0';
    g.fillText(text, 256, 66); return srgb(new THREE.CanvasTexture(c));
  }

  /* Ukuran: menara kanan, sayap restoran kiri. Depan menghadap +Z. */
  const TW = 13, TD = 6, TH = 12.6, tx = 2, Z = TD / 2;
  const AW = 8, AD = 5, AH = 6.4, ax = -8.5, ZA = 2.0, az = ZA - AD / 2;
  const wall = M(0xffffff, { map: wallTex() });
  box(TW, TH, TD, wall, tx, TH / 2, 0);
  box(AW, AH, AD, wall, ax, AH / 2, az);
  box(TW + 0.1, 0.5, TD + 0.1, M(0x44484d), tx, 0.25, 0);
  box(AW + 0.1, 0.5, AD + 0.1, M(0x44484d), ax, 0.25, az);
  [3.6, 6.6, 9.6].forEach(y => box(TW + 0.2, 0.14, TD + 0.2, M(0xf0ede6), tx, y, 0));
  box(AW + 0.2, 0.14, AD + 0.2, M(0xf0ede6), ax, 3.4, az);
  box(TW + 0.6, 0.35, TD + 0.6, M(0x3b3f45), tx, TH + 0.175, 0);
  box(AW + 0.4, 0.3, AD + 0.4, M(0x3b3f45), ax, AH + 0.15, az);
  box(4, 1.2, 3, M(0x777b80), tx + 3.5, TH + 0.95, -1);
  [-1, 1].forEach(s => box(0.5, TH, TD + 0.1, M(0x4a4f55), tx + s * (TW / 2 - 0.25), TH / 2, 0));
  box(3.2, TH - 3.6, 0.12, M(0x8a5a36, { roughness: 0.65 }), tx, (3.6 + TH) / 2, Z + 0.03);   // panel kayu tengah

  /* Jendela dengan balkon kaca */
  function win(x, y, zf, lit, hs = 1) {
    const h = 2.1 * hs;
    box(1.7, h + 0.2, 0.1, M(0x3a3f45), x, y, zf + 0.04);
    const gm = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: lit ? 0xffdca8 : 0x0e1522, emissiveIntensity: lit ? 0.8 : 0.4, roughness: 0.25 });
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.5, h, 0.05), gm); g.position.set(x, y, zf + 0.1); root.add(g);
    if (lit) box(1.5, h * 0.45, 0.04, M(0xeadfc8), x, y + h * 0.28, zf + 0.13);
    box(1.9, 0.1, 0.5, M(0xe6e2d8), x, y - h / 2 - 0.05, zf + 0.25);
    const r = box(1.9, 0.9, 0.03, GLASS, x, y - h / 2 + 0.4, zf + 0.5); r.castShadow = false;
    box(1.9, 0.04, 0.05, STEEL, x, y - h / 2 + 0.87, zf + 0.5);
  }
  [5.1, 8.1, 11.1].forEach((y, f) => [-5, -3.2, -0.8, 0.8, 3.2, 5].forEach((dx, i) => win(tx + dx, y, Z, (i * 5 + f * 3) % 7 < 3)));
  [-2.7, -0.9, 0.9, 2.7].forEach((dx, i) => win(ax + dx, 5.0, ZA, i % 3 !== 1, 0.85));

  /* Lobi kaca + pintu putar */
  box(8.2, 3.3, 0.14, M(0x3a3f45), tx, 1.75, Z + 0.04);
  const lg = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: 0xffe3b8, emissiveIntensity: 0.75, roughness: 0.2 });
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(7.8, 3.1, 0.05), lg); lobby.position.set(tx, 1.75, Z + 0.12); root.add(lobby);
  for (let i = 1; i <= 5; i++) box(0.07, 3.1, 0.08, M(0x2b3035), tx - 3.9 + 1.3 * i, 1.75, Z + 0.16);
  const door = new THREE.Group(); door.position.set(tx, 1.4, Z + 0.45); root.add(door);
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.7, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x9fd0e0, transparent: true, opacity: 0.22, side: THREE.DoubleSide }));
  door.add(housing); housing.rotation.y = 0;
  const vanes = new THREE.Group(); door.add(vanes);
  const v1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.5, 0.05), STEEL); const v2 = v1.clone(); v2.rotation.y = Math.PI / 2; vanes.add(v1, v2);
  cyl(1.05, 0.08, M(0x2b3035), 0, 1.3, 0, door); cyl(1.05, 0.08, M(0x2b3035), 0, -1.3, 0, door);

  /* Porte-cochère */
  box(9, 0.25, 3.6, M(0x3d4147), tx, 3.95, Z + 1.8);
  box(9, 0.06, 0.06, M(0xc9a24a), tx, 3.78, Z + 3.6);
  [[-4.2, 3.2], [4.2, 3.2], [-4.2, 0.9], [4.2, 0.9]].forEach(p => cyl(0.14, 3.9, STEEL, tx + p[0], 1.95, Z + p[1]));
  [[-3, 1], [0, 1], [3, 1], [-3, 2.8], [0, 2.8], [3, 2.8]].forEach(p => cyl(0.14, 0.04, new THREE.MeshBasicMaterial({ color: 0xfff1c8 }), tx + p[0], 3.8, Z + p[1], root, 12));
  const canopyLight = new THREE.PointLight(0xffd9a0, 1.5, 12); canopyLight.position.set(tx, 3.4, Z + 2); root.add(canopyLight);

  /* Papan atap */
  const signMat = new THREE.MeshBasicMaterial({ map: signTex() });
  const sy = TH + 2.1;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.5), signMat); sign.position.set(tx, sy, Z - 1.06); root.add(sign);
  box(8.4, 2.8, 0.25, M(0x24272c), tx, sy, Z - 1.25);
  [-3.2, 3.2].forEach(x => box(0.18, 1.4, 0.18, M(0x333b40), tx + x, TH + 0.9, Z - 1.2));
  const signLight = new THREE.PointLight(0xffe2a8, 1.0, 14); signLight.position.set(tx, sy, Z + 2); root.add(signLight);

  /* Kafe & resto di sayap kiri */
  box(7, 2.8, 0.14, M(0x4a2f22), ax, 1.8, ZA + 0.04);
  const cg = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: 0xffd9a0, emissiveIntensity: 0.85, roughness: 0.25 });
  const cafe = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.6, 0.05), cg); cafe.position.set(ax, 1.8, ZA + 0.12); root.add(cafe);
  for (let i = -2; i <= 2; i++) box(0.06, 2.6, 0.07, M(0x2b2018), ax + i * 1.3, 1.8, ZA + 0.15);
  for (let i = 0; i < 9; i++) { const a = box(0.8, 0.08, 1.5, M(i % 2 ? 0xf3ead8 : 0x8c2f3a), ax - 3.2 + 0.8 * i, 3.2, ZA + 0.8); a.rotation.x = 0.2; }
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.85), new THREE.MeshBasicMaterial({ map: plaqueTex('CAF\u00c9 & RESTO') })); pl.position.set(ax, 3.82, ZA + 0.05); root.add(pl);
  const seat = M(0x6b3b2a), cloth = [0xf3ead8, 0x8c2f3a, 0xf3ead8];
  [-2.5, 0, 2.5].forEach((dx, i) => {
    const x = ax + dx, z = ZA + 3.0;
    cyl(0.55, 0.05, M(0xf5f1e8), x, 0.78, z); cyl(0.04, 0.78, STEEL, x, 0.39, z, root, 6);
    cyl(0.03, 1.7, STEEL, x, 1.65, z, root, 6);
    const u = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.4, 16), M(cloth[i], { side: THREE.DoubleSide })); u.position.set(x, 2.65, z); u.castShadow = true; root.add(u);
    box(0.4, 0.06, 0.4, seat, x - 0.85, 0.5, z); box(0.4, 0.06, 0.4, seat, x + 0.85, 0.5, z);
    box(0.4, 0.4, 0.05, seat, x - 1.05, 0.75, z); box(0.4, 0.4, 0.05, seat, x + 1.05, 0.75, z);
  });
  const bm = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
  for (let i = 0; i <= 12; i++) { const t = i / 12; ball(0.06, bm, ax - 4.2 + 8.4 * t, 3.3 - 0.35 * Math.sin(Math.PI * t), ZA + 4.3); }
  [-4.2, 4.2].forEach(dx => cyl(0.05, 3.4, STEEL, ax + dx, 1.7, ZA + 4.3, root, 6));

  /* Properti: paving, parkiran, air mancur, palem, mobil, bendera, lampu */
  const flags = []; let waterM;
  const PR = new THREE.Group(); root.add(PR); if (!props) PR.visible = false;
  if (props) {
    box(26, 0.08, 11, M(0x8d8b86), -2.5, 0.04, Z + 2.5, PR);
    box(28, 0.04, 6, M(0x2b2d33), -2.5, 0.02, 14, PR);
    for (let i = -3; i <= 3; i++) box(0.12, 0.01, 3.2, M(0xd8d4c4), -2.5 + i * 3.6, 0.05, 14, PR);
    function car(color, x, z, ry) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; PR.add(g);
      box(2.4, 0.6, 1.1, M(color, { roughness: 0.4 }), 0, 0.55, 0, g);
      box(1.3, 0.5, 1, M(color, { roughness: 0.4 }), -0.1, 1.05, 0, g);
      box(1.1, 0.34, 1.02, M(0x151c2a, { roughness: 0.2 }), -0.1, 1.05, 0, g);
      [[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].forEach(p => { const w = cyl(0.28, 0.2, M(0x111111), p[0], 0.28, p[1], g, 14); w.rotation.x = Math.PI / 2; });
    }
    car(0xb8bcc2, tx - 2, Z + 2.6, 0); car(0x1f2a44, -4, 14, Math.PI / 2); car(0x8c2f3a, 3.2, 14, Math.PI / 2); car(0xe4e4e0, 6.8, 14, Math.PI / 2);

    const isl = new THREE.Vector3(tx, 0, Z + 5.5);
    cyl(2.4, 0.3, M(0xb8b4aa), isl.x, 0.15, isl.z, PR, 32); cyl(1.7, 0.55, M(0xc9c5ba), isl.x, 0.3, isl.z, PR, 32);
    waterM = new THREE.MeshStandardMaterial({ color: 0x3a9ad0, emissive: 0x2a7fb0, emissiveIntensity: 0.5, roughness: 0.1 });
    cyl(1.5, 0.05, waterM, isl.x, 0.58, isl.z, PR, 32);
    cyl(0.2, 1.4, M(0xc9c5ba), isl.x, 1.0, isl.z, PR); cyl(0.6, 0.12, M(0xc9c5ba), isl.x, 1.7, isl.z, PR, 20);
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 1.1, 8), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.6 }));
    jet.position.set(isl.x, 2.3, isl.z); PR.add(jet);
    const leafM = M(0x2f7a3e, { side: THREE.DoubleSide });
    [-2.05, 2.05].forEach(dx => {
      const g = new THREE.Group(); g.position.set(isl.x + dx, 0, isl.z + 0.3); PR.add(g);
      const tr = cyl(0.15, 4.2, M(0x6b5238), 0, 2.1, 0, g, 8); tr.rotation.z = 0.06;
      const top = new THREE.Group(); top.position.set(0.25, 4.2, 0); g.add(top);
      for (let i = 0; i < 7; i++) {
        const piv = new THREE.Group(); piv.rotation.y = i * Math.PI * 2 / 7; top.add(piv);
        const lg = new THREE.BoxGeometry(1.8, 0.04, 0.28); lg.translate(0.9, 0, 0);
        const l = new THREE.Mesh(lg, leafM); l.rotation.z = -0.45; l.castShadow = true; piv.add(l);
      }
    });
    const hedge = M(0x2f6b3a);
    [-1, 1].forEach(s => box(2.2, 0.8, 0.8, hedge, tx + s * 5.3, 0.4, Z + 0.5, PR));
    box(7, 0.8, 0.7, hedge, ax - 0.2, 0.4, ZA + 6.2, PR);

    [0, 1, 2].forEach(i => {
      const x = tx + 8.4 + i * 1.1;
      cyl(0.04, 5, STEEL, x, 2.5, Z + 1.2, PR, 6);
      const fg = new THREE.PlaneGeometry(1, 0.6); fg.translate(0.5, 0, 0);
      const f = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: [0xcf3b3b, 0xf3f1ea, 0xc9a24a][i], side: THREE.DoubleSide }));
      f.position.set(x + 0.04, 4.6, Z + 1.2); PR.add(f); flags.push(f);
    });
    [[-15.5, 9], [11.5, 9]].forEach(p => {
      cyl(0.08, 5.4, M(0x2f2f2f), p[0], 2.7, p[1], PR, 8);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe2a0 })); b.position.set(p[0], 5.5, p[1]); PR.add(b);
      const l = new THREE.PointLight(0xffd38a, 1.1, 16); l.position.set(p[0], 5.3, p[1]); PR.add(l);
    });
  }

  root.userData.update = (ms) => {
    const s = ms * 0.001;
    door.rotation.y = s * 0.6;
    const p = 0.95 + 0.05 * Math.sin(s * 1.6); signMat.color.setScalar(p); signLight.intensity = p;
    flags.forEach((f, i) => { f.rotation.y = Math.sin(s * 2.2 + i) * 0.3; });
    if (waterM) waterM.emissiveIntensity = 0.45 + 0.15 * Math.sin(s * 3);
  };
  return root;
}
