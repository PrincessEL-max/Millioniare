import * as THREE from 'three';

/**
 * Hotel bintang 4 (menara kaca modern di atas podium batu, kolam renang teras atap,
 * kanopi masuk, karpet merah) sebagai THREE.Group. Depan menghadap +Z, dasar di y = 0.
 * Ukuran: podium 20 x 5.2 x 10, tinggi total sekitar 22 unit (x dari -10 sampai 10).
 *
 *   const hotel = createHotel4();
 *   hotel.position.set(x, 0, z);
 *   hotel.scale.setScalar(0.7);   // kalau terlalu besar untuk lahanmu
 *   scene.add(hotel);
 *   // di loop animasi:
 *   hotel.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa plaza, jalan, mobil, taman, pohon, bollard.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHotel4({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'HotelBintang4';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s; }
  function cyl(r, h, m, x, y, z, p = root, seg = 14) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  function ball(r, m, x, y, z, p = root) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), m); s.position.set(x, y, z); s.castShadow = true; p.add(s); return s; }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; };
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x9fd0e0, transparent: true, opacity: 0.22, roughness: 0.1 });
  const GOLD = M(0xc9a24a, { metalness: 0.7, roughness: 0.35 });
  const STEEL = M(0x8a9096, { metalness: 0.5, roughness: 0.4 });
  const WARM = new THREE.MeshBasicMaterial({ color: 0xfff1c8 });
  const green = M(0x2f6b3a);
  const glassBox = (w, h, d, x, y, z) => { const m = box(w, h, d, GLASS, x, y, z); m.castShadow = false; return m; };

  function stoneTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#cfc2aa'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(90,75,50,.25)'; g.lineWidth = 2;
    for (let r = 0; r < 8; r++) { g.beginPath(); g.moveTo(0, r * 32); g.lineTo(256, r * 32); g.stroke(); for (let x = (r % 2) * 32; x < 256; x += 64) { g.beginPath(); g.moveTo(x, r * 32); g.lineTo(x, r * 32 + 32); g.stroke(); } }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 2); return srgb(t);
  }
  function curtain(cols, rows) {
    const cw = 48, ch = 96, W = cols * cw, H = rows * ch;
    const a = document.createElement('canvas'), b = document.createElement('canvas'); a.width = b.width = W; a.height = b.height = H;
    const g = a.getContext('2d'), e = b.getContext('2d'); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * cw, y = r * ch, gr = g.createLinearGradient(0, y, 0, y + ch);
      gr.addColorStop(0, '#3d5670'); gr.addColorStop(1, '#1f2e40'); g.fillStyle = gr; g.fillRect(x, y, cw, ch);
      if (Math.random() < 0.42) { e.fillStyle = Math.random() < 0.8 ? '#ffd9a0' : '#a8d4ff'; e.fillRect(x + 3, y + 3, cw - 6, ch - 6); }
    }
    g.strokeStyle = '#aab4bd'; g.lineWidth = 3;
    for (let c = 0; c <= cols; c++) { g.beginPath(); g.moveTo(c * cw, 0); g.lineTo(c * cw, H); g.stroke(); }
    for (let r = 0; r <= rows; r++) { g.beginPath(); g.moveTo(0, r * ch); g.lineTo(W, r * ch); g.stroke(); }
    return M(0xffffff, { map: srgb(new THREE.CanvasTexture(a)), emissive: 0xffffff, emissiveMap: srgb(new THREE.CanvasTexture(b)), emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.4 });
  }
  function signTex() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 123; const g = c.getContext('2d');
    g.fillStyle = '#101216'; g.fillRect(0, 0, 1024, 123); g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.strokeRect(5, 5, 1014, 113);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 66px Georgia,serif'; g.shadowColor = '#ffd98a'; g.shadowBlur = 14; g.fillStyle = '#fff3d6';
    g.fillText('HOTEL MELATI', 340, 64); g.font = 'bold 56px Georgia,serif'; g.shadowColor = '#ffd24a'; g.fillStyle = '#ffd24a'; g.fillText('\u2605\u2605\u2605\u2605', 760, 64);
    g.shadowBlur = 0; g.fillStyle = '#5a5a58'; g.fillText('\u2606', 920, 64); return srgb(new THREE.CanvasTexture(c));
  }

  const PW = 20, PD = 10, PH = 5.2, TW = 14, TD = 6.5, TH = 15, tz = -1.75, ZF = PD / 2;
  /* Podium batu */
  box(PW, PH, PD, M(0xffffff, { map: stoneTex() }), 0, PH / 2, 0);
  box(PW + 0.3, 0.25, PD + 0.3, M(0xe3d9c3), 0, PH - 0.1, 0);
  [-1, 1].forEach(s => [5.4, 9.8].forEach(x => box(0.5, PH, 0.5, M(0xe3d9c3), s * x, PH / 2, ZF)));
  const bronze = M(0x6b4a2a, { metalness: 0.5, roughness: 0.4 });
  box(10, 4.2, 0.12, bronze, 0, 2.2, ZF);
  const lg = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: 0xffe0b0, emissiveIntensity: 0.8, roughness: 0.2 });
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(9.6, 4, 0.06), lg); lobby.position.set(0, 2.2, ZF + 0.04); root.add(lobby);
  for (let k = 1; k <= 5; k++) box(0.07, 4, 0.08, bronze, -4.8 + 1.6 * k, 2.2, ZF + 0.08);
  [-1, 1].forEach(s => {
    box(3.9, 3.4, 0.1, bronze, s * 7.6, 2.2, ZF + 0.02);
    const bg = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: s < 0 ? 0xffc890 : 0xb8dcff, emissiveIntensity: 0.7, roughness: 0.25 }));
    bg.position.set(s * 7.6, 2.2, ZF + 0.08); root.add(bg);
  });
  /* Kanopi masuk */
  box(12, 0.3, 4, M(0x3a2c1e, { metalness: 0.4 }), 0, 4.55, ZF + 2);
  box(12, 0.05, 0.05, new THREE.MeshBasicMaterial({ color: 0xffd98a }), 0, 4.4, ZF + 4);
  [-5.8, -2.4, 2.4, 5.8].forEach(x => cyl(0.12, 4.4, GOLD, x, 2.2, ZF + 3.8));
  [-4, 0, 4].forEach(x => [1, 3].forEach(dz => cyl(0.12, 0.03, WARM, x, 4.38, ZF + dz)));
  const canopyLight = new THREE.PointLight(0xffd9a0, 1.4, 14); canopyLight.position.set(0, 3.8, ZF + 2); root.add(canopyLight);

  /* Teras kolam renang di atas podium */
  box(PW - 0.4, 0.1, 3.5, M(0x7a5a3a), 0, PH + 0.05, 3.25);
  glassBox(PW - 0.4, 1.1, 0.05, 0, PH + 0.65, 4.92); box(PW - 0.4, 0.05, 0.06, STEEL, 0, PH + 1.2, 4.92);
  box(9, 0.25, 2.2, M(0xe8f0f2), 0, PH + 0.12, 3.3);
  const poolM = new THREE.MeshStandardMaterial({ color: 0x2aa7c9, emissive: 0x2aa7c9, emissiveIntensity: 0.6, roughness: 0.1 });
  box(8.6, 0.05, 1.8, poolM, 0, PH + 0.27, 3.3);
  [-9, -7.9, -6.8, 6.8, 7.9, 9].forEach(x => { box(0.6, 0.14, 1.4, M(0xf2efe6), x, PH + 0.3, 3.4); const b = box(0.6, 0.08, 0.6, M(0xf2efe6), x, PH + 0.62, 2.55); b.rotation.x = -0.8; });
  [-9.3, 9.3].forEach(x => { box(0.8, 0.6, 0.8, M(0x4a3626), x, PH + 0.35, 2.0); ball(0.6, green, x, PH + 1.0, 2.0); });
  const poolLight = new THREE.PointLight(0x4fd2ee, 1.0, 10); poolLight.position.set(0, PH + 1.5, 3.3); root.add(poolLight);

  /* Menara kaca */
  const front = curtain(10, 5), side = curtain(5, 5), top = M(0x2b2f35);
  const tow = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, TD), [side, side, top, top, front, front]);
  tow.position.set(0, PH + TH / 2, tz); tow.castShadow = true; root.add(tow);
  [-1, 1].forEach(s => box(0.45, TH, 0.45, GOLD, s * TW / 2, PH + TH / 2, tz + TD / 2));
  const cy = PH + TH + 0.8, cz = tz + TD / 2 + 0.2;
  box(TW + 0.4, 1.6, TD + 0.4, M(0x24272c), 0, cy, tz);
  const led = new THREE.MeshBasicMaterial({ color: 0xffd98a });
  box(TW + 0.4, 0.08, 0.08, led, 0, PH + TH + 1.58, cz); box(TW + 0.4, 0.08, 0.08, led, 0, PH + TH + 0.04, cz);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex() });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.2), signMat); sign.position.set(0, cy, cz + 0.02); root.add(sign);

  const PR = new THREE.Group(); root.add(PR); PR.visible = props;
  box(26, 0.08, 13, M(0x9a948a), 0, 0.04, 6.5, PR);
  box(3, 0.02, 4.2, M(0x7a1c2a), 0, 0.09, 7.1, PR);
  box(60, 0.04, 8, M(0x26282e), 0, 0.02, 17, PR);
  for (let i = -5; i <= 5; i++) box(1.6, 0.01, 0.12, M(0xd8d4c4), i * 4.5, 0.05, 17, PR);
  [-1, 1].forEach(s => box(12, 0.1, 9, M(0x2f6b3a), s * 19, 0.05, 6, PR));
  [[-16, 7], [-21, 5], [16, 7], [21, 5]].forEach(p => { cyl(0.2, 2.4, M(0x4a3626), p[0], 1.2, p[1], PR, 8); ball(1.5, green, p[0], 3.4, p[1], PR); ball(1.1, green, p[0] + 0.5, 4.4, p[1] + 0.2, PR); });
  for (let x = -11; x <= 11; x += 2) cyl(0.1, 0.7, new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), x, 0.4, 12.4, PR, 8);
  function car(color, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); PR.add(g);
    box(2.6, 0.6, 1.1, M(color, { roughness: 0.3, metalness: 0.3 }), 0, 0.55, 0, g); box(1.4, 0.5, 1, M(color, { roughness: 0.3, metalness: 0.3 }), -0.1, 1.05, 0, g); box(1.2, 0.34, 1.02, M(0x151c2a, { roughness: 0.2 }), -0.1, 1.05, 0, g);
    [[-0.85, 0.5], [0.85, 0.5], [-0.85, -0.5], [0.85, -0.5]].forEach(p => { const w = cyl(0.28, 0.2, M(0x111111), p[0], 0.28, p[1], g); w.rotation.x = Math.PI / 2; });
  }
  car(0x15161a, 4.4, 7.4); car(0xe9e9e4, -4.4, 7.4);

  root.userData.update = (ms) => {
    const s = ms * 0.001, p = 0.95 + 0.05 * Math.sin(s * 1.5);
    signMat.color.setScalar(p); poolM.emissiveIntensity = 0.55 + 0.15 * Math.sin(s * 2.4); poolLight.intensity = 0.9 + 0.2 * Math.sin(s * 2.4 + 1);
  };
  return root;
}
