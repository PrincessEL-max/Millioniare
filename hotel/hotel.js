import * as THREE from 'three';

/**
 * Hotel bintang 1 (kusam, neon rusak) sebagai THREE.Group.
 * Lebar bangunan ~11 unit, depan menghadap +Z, dasar di y = 0.
 *
 * Pakai:
 *   const hotel = createHotel();
 *   hotel.position.set(x, 0, z);
 *   hotel.rotation.y = Math.PI / 2;   // putar kalau perlu
 *   hotel.scale.setScalar(1);         // ubah ukuran
 *   scene.add(hotel);
 *   // di loop animasi:
 *   hotel.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa mobil, lampu jalan, tong sampah, pohon, trotoar.
 * Catatan: aktifkan renderer.shadowMap.enabled = true supaya bayangan muncul.
 */
export function createHotel({ props = true } = {}) {
  const root = new THREE.Group();
  root.name = 'HotelBintang1';

  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.9, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s;
  }
  function cyl(r, h, m, x, y, z, p = root, seg = 12) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    s.position.set(x, y, z); s.castShadow = true; p.add(s); return s;
  }

  /* Tekstur dinding kusam */
  function wallTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#c4b58a'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 55; i++) {
      const x = Math.random() * 256, w = 2 + Math.random() * 8, h = 40 + Math.random() * 170;
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(70,50,25,.38)'); gr.addColorStop(1, 'rgba(70,50,25,0)');
      g.fillStyle = gr; g.fillRect(x, 0, w, h);
    }
    for (let i = 0; i < 500; i++) {
      g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0' : '255,255,255') + ',.05)';
      g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2);
    t.encoding = THREE.sRGBEncoding; return t;
  }

  /* Bangunan utama */
  box(11, 6.4, 5, M(0xffffff, { map: wallTex() }), 0, 3.2, 0);
  box(11.7, 0.3, 5.7, M(0x3b3835), 0, 6.55, 0);
  box(11.2, 0.16, 5.2, M(0x7b7258), 0, 3.3, 0);
  box(11.1, 0.5, 5.1, M(0x4a4436), 0, 0.25, 0);
  const Z = 2.5;

  /* Jendela */
  const OFF = 0x151c2a;
  const glassOn = [0xffc860, 0x6fa8ff, OFF, OFF, 0xffc860, OFF, OFF, 0xffb347, OFF];
  const tv = []; let gi = 0;
  function win(x, y) {
    box(1.3, 1.2, 0.14, M(0x4a3524), x, y, Z + 0.02);
    const col = glassOn[gi++ % glassOn.length]; const lit = col !== OFF;
    const gm = new THREE.MeshStandardMaterial({ color: 0x222a38, emissive: col, emissiveIntensity: lit ? 0.9 : 0.05, roughness: 0.3 });
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.98, 0.05), gm); g.position.set(x, y, Z + 0.1); root.add(g);
    if (col === 0x6fa8ff) tv.push(gm);
    if (lit) box(1.08, 0.42, 0.04, M(0x8a5a3a), x, y + 0.28, Z + 0.13);
    if (Math.random() < 0.5) box(0.75, 0.45, 0.4, M(0xd9d6cf), x + 0.15, y - 1.05, Z + 0.25);
  }
  [-4.2, -2.1, 2.1, 4.2].forEach(x => win(x, 1.9));
  [-4.2, -2.1, 0, 2.1, 4.2].forEach(x => win(x, 4.9));

  /* Balkon lorong */
  box(11.4, 0.14, 1, M(0x6d675a), 0, 3.42, Z + 0.5);
  box(11.4, 0.1, 0.1, M(0x3a3a3a), 0, 4.3, Z + 0.95);
  for (let i = -5; i <= 5; i++) box(0.07, 0.9, 0.07, M(0x3a3a3a), i, 3.9, Z + 0.95);

  /* Pintu lobi + kanopi */
  box(1.8, 2.7, 0.14, M(0x3a2a1c), 0, 1.45, Z + 0.04);
  const dm = new THREE.MeshStandardMaterial({ color: 0x2a3040, emissive: 0xffd490, emissiveIntensity: 0.55 });
  const dg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.3, 0.05), dm); dg.position.set(0, 1.45, Z + 0.13); root.add(dg);
  const awn = box(3.2, 0.12, 1.5, M(0x8a2f2f), 0, 2.95, Z + 0.75); awn.rotation.x = 0.12;
  box(3.2, 0.04, 0.04, M(0xe9e0cf), 0, 2.78, Z + 1.5);
  box(1.6, 0.04, 0.9, M(0x3d5a3a), 0, 0.14, Z + 1.0);
  const doorLight = new THREE.PointLight(0xffc890, 0.9, 7); doorLight.position.set(0, 2, Z + 1.6); root.add(doorLight);

  /* Papan neon: HOTEL (E mati) MELATI + bintang 1 */
  function signTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 192; const g = c.getContext('2d');
    g.fillStyle = '#1a1216'; g.fillRect(0, 0, 512, 192);
    g.strokeStyle = '#5a4a50'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 180);
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = 'bold 78px Georgia,serif';
    let x = 46;
    for (const ch of 'HOTEL') {
      const dead = ch === 'E';
      g.shadowColor = dead ? 'transparent' : '#ff3a8c'; g.shadowBlur = dead ? 0 : 18;
      g.fillStyle = dead ? '#4a2c3a' : '#ff7ab8';
      g.fillText(ch, x, 62); x += g.measureText(ch).width + 4;
    }
    g.font = 'bold 52px Georgia,serif'; g.shadowColor = '#ffb0d0'; g.shadowBlur = 12; g.fillStyle = '#ffd0e4';
    g.fillText('MELATI', x + 18, 62);
    g.shadowColor = '#ffd24a'; g.shadowBlur = 14; g.fillStyle = '#ffd24a'; g.font = 'bold 54px Georgia,serif';
    g.textAlign = 'center'; g.fillText('\u2605  \u2606  \u2606  \u2606  \u2606', 256, 142);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  const signMat = new THREE.MeshBasicMaterial({ map: signTex() });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.4), signMat); sign.position.set(0.2, 8, Z - 0.5); root.add(sign);
  box(6.6, 2.6, 0.12, M(0x2b2326), 0.2, 8, Z - 0.58);
  box(0.14, 1.5, 0.14, M(0x333333), -2.6, 7.0, Z - 0.5); box(0.14, 1.5, 0.14, M(0x333333), 3.0, 7.0, Z - 0.5);
  const signLight = new THREE.PointLight(0xff4a96, 1.3, 12); signLight.position.set(0.2, 8, Z + 1.5); root.add(signLight);

  /* Tandon & antena */
  cyl(0.8, 1.5, M(0x3d6a8a), -4, 7.45, -0.8, root, 16);
  cyl(0.03, 2.6, M(0x888888), 4.3, 8.1, -1.2, root, 6);

  /* Properti sekitar (opsional) */
  let bulb, lamp;
  if (props) {
    box(14, 0.12, 2.2, M(0x4a4a48), 0, 0.06, 3.9);
    for (let i = -2; i <= 2; i++) box(0.12, 0.01, 2.6, M(0xd8d4c4), i * 3.2, 0.01, 8.2);

    const car = new THREE.Group(); car.position.set(-3.2, 0, 8.4); car.rotation.y = 0.12; root.add(car);
    box(2.4, 0.6, 1.1, M(0x3a6a8a, { roughness: 0.5 }), 0, 0.55, 0, car);
    box(1.3, 0.5, 1, M(0x2f566f, { roughness: 0.5 }), -0.1, 1.05, 0, car);
    box(1.1, 0.34, 1.02, M(0x151c2a, { roughness: 0.2 }), -0.1, 1.05, 0, car);
    [[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].forEach(p => {
      const w = cyl(0.28, 0.2, M(0x111111), p[0], 0.28, p[1], car, 14); w.rotation.x = Math.PI / 2;
    });

    cyl(0.08, 5.4, M(0x2f2f2f), 8, 2.7, 5.2, root, 8);
    box(1, 0.08, 0.08, M(0x2f2f2f), 7.5, 5.4, 5.2);
    bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe2a0 }));
    bulb.position.set(7.1, 5.3, 5.2); root.add(bulb);
    lamp = new THREE.PointLight(0xffd38a, 1.4, 16); lamp.position.set(7.1, 5.1, 5.2); root.add(lamp);

    cyl(0.38, 0.9, M(0x2e5a3a), 6.2, 0.5, 3.6); cyl(0.42, 0.08, M(0x244a2f), 6.2, 1, 3.6);
    const tipped = cyl(0.34, 0.85, M(0x3a5a44), 5.5, 0.35, 4.5); tipped.rotation.z = Math.PI / 2.2;
    box(0.3, 0.2, 0.25, M(0xcfcab8), 5.0, 0.1, 4.7);

    const wood = M(0x3a2e24);
    cyl(0.2, 3.2, wood, -8, 1.6, 3.5, root, 8);
    [[0.9, 3.0, 0.5], [-0.8, 2.6, -0.6], [0.3, 3.4, -0.7]].forEach(b => {
      const br = cyl(0.06, 1.8, wood, -8 + b[0] * 0.6, b[1], 3.5 + b[2] * 0.4, root, 6);
      br.rotation.z = b[0] > 0 ? -0.9 : 0.9; br.rotation.x = b[2] * 0.6;
    });
  }

  /* Animasi: neon berkedip, lampu jalan sekarat, TV berkelip. Panggil tiap frame. */
  root.userData.update = (timeMs) => {
    const s = timeMs * 0.001;
    const flick = (Math.sin(s * 23) > 0.92 || Math.sin(s * 7.3) > 0.985) ? 0.35 : 1;
    signMat.color.setScalar(flick); signLight.intensity = 1.3 * flick;
    if (lamp) {
      const lf = Math.sin(s * 3.1) * Math.sin(s * 11.7) > 0.55 ? 0.25 : 1;
      lamp.intensity = 1.4 * lf; bulb.material.color.setScalar(0.4 + 0.6 * lf);
    }
    tv.forEach((m, i) => { m.emissiveIntensity = 0.5 + 0.5 * Math.abs(Math.sin(s * 5 + i * 2) * Math.sin(s * 1.7)); });
  };

  return root;
}
