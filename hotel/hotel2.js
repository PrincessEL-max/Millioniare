import * as THREE from 'three';

/**
 * Hotel bintang 2 (bersih, rapi, neon menyala) sebagai THREE.Group.
 * Lebar ~12 unit, depan menghadap +Z, dasar di y = 0.
 *
 *   const hotel = createHotel2();
 *   hotel.position.set(x, 0, z);
 *   scene.add(hotel);
 *   // di loop animasi:
 *   hotel.userData.update(performance.now());
 *
 * Opsi: { props: false } -> tanpa parkiran, mobil, lampu jalan, pohon, tong sampah.
 * Aktifkan renderer.shadowMap.enabled = true untuk bayangan.
 */
export function createHotel2({ props = true } = {}) {
  const root = new THREE.Group(); root.name = 'HotelBintang2';
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85, metalness: 0 }, o || {}));
  function box(w, h, d, m, x, y, z, p = root) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    s.position.set(x, y, z); s.castShadow = s.receiveShadow = true; p.add(s); return s;
  }
  function cyl(r, h, m, x, y, z, p = root, seg = 12) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    s.position.set(x, y, z); s.castShadow = true; p.add(s); return s;
  }
  function ball(r, m, x, y, z, sy = 1, p = root) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), m);
    s.position.set(x, y, z); s.scale.y = sy; s.castShadow = true; p.add(s); return s;
  }
  const srgb = t => { t.encoding = THREE.sRGBEncoding; return t; };

  function wallTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#e9e0cb'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '90,70,40' : '255,255,255') + ',.04)';
      g.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return srgb(t);
  }

  const W = 12, D = 5.5, H = 8.7, Z = D / 2, TEAL = 0x2f7f86;
  box(W, H, D, M(0xffffff, { map: wallTex() }), 0, H / 2, 0);
  box(W + 0.1, 0.6, D + 0.1, M(0x6b6f72), 0, 0.3, 0);
  [2.9, 5.8].forEach(y => box(W + 0.25, 0.14, D + 0.25, M(0xf3efe4), 0, y, 0));
  box(W + 0.7, 0.3, D + 0.7, M(0x4a4f55), 0, H + 0.15, 0);
  [-1, 1].forEach(s => box(0.7, H, D + 0.15, M(TEAL), s * (W / 2 - 0.35), H / 2, 0));

  /* Jendela + balkon kecil */
  const tv = [];
  function win(x, y, lit) {
    box(1.25, 1.4, 0.12, M(0xf1eee6), x, y, Z + 0.02);
    const gm = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: lit ? 0xffd9a0 : 0x0e1522, emissiveIntensity: lit ? 0.85 : 0.4, roughness: 0.3 });
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.2, 0.05), gm); g.position.set(x, y, Z + 0.09); root.add(g);
    if (lit) { box(1.05, 0.5, 0.04, M(0xe9dcc0), x, y + 0.35, Z + 0.12); tv.push(gm); }
    box(1.5, 0.08, 0.4, M(0xd8d4c8), x, y - 0.8, Z + 0.2);
    box(1.5, 0.04, 0.04, M(0x8a8f94), x, y - 0.5, Z + 0.39);
  }
  const ys = [1.75, 4.65, 7.55];
  ys.forEach((y, f) => {
    const xs = f === 0 ? [-4.3, -2.6, 2.6, 4.3] : [-4.3, -2.6, -0.9, 0.9, 2.6, 4.3];
    xs.forEach((x, i) => win(x, y, (i * 7 + f * 3) % 5 < 2));
  });

  /* Lobi kaca + kanopi */
  box(4, 2.6, 0.14, M(TEAL), 0, 1.4, Z + 0.04);
  const lg = new THREE.MeshStandardMaterial({ color: 0x2a3a52, emissive: 0xffe0b0, emissiveIntensity: 0.8, roughness: 0.2 });
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.05), lg); lobby.position.set(0, 1.4, Z + 0.12); root.add(lobby);
  [-1.8, 0, 1.8].forEach(x => box(0.06, 2.4, 0.07, M(0x2b3a40), x, 1.4, Z + 0.15));
  box(5.4, 0.16, 2.2, M(TEAL), 0, 2.95, Z + 1.1);
  box(5.4, 0.04, 0.05, M(0xf3efe4), 0, 2.84, Z + 2.2);
  [-2.5, 2.5].forEach(x => cyl(0.1, 2.9, M(0xe9e6dd), x, 1.45, Z + 2.0));
  box(4.8, 0.06, 2.4, M(0x5a5a58), 0, 0.1, Z + 1.2);
  const canopyLight = new THREE.PointLight(0xffd9a0, 1.1, 9); canopyLight.position.set(0, 2.6, Z + 1.3); root.add(canopyLight);

  /* Papan atap: HOTEL MELATI + bintang 2 */
  function signTex() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 200; const g = c.getContext('2d');
    g.fillStyle = '#0f1c26'; g.fillRect(0, 0, 640, 200);
    g.strokeStyle = '#2f7f86'; g.lineWidth = 8; g.strokeRect(8, 8, 624, 184);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 62px Georgia,serif'; g.shadowColor = '#7fe8f0'; g.shadowBlur = 16; g.fillStyle = '#e6fdff';
    g.fillText('HOTEL MELATI', 320, 70);
    g.font = 'bold 50px Georgia,serif'; g.shadowColor = '#ffd24a'; g.shadowBlur = 14; g.fillStyle = '#ffd24a';
    g.fillText('\u2605 \u2605', 250, 148);
    g.shadowBlur = 0; g.fillStyle = '#4a5a62'; g.fillText('\u2606 \u2606 \u2606', 415, 148);
    return srgb(new THREE.CanvasTexture(c));
  }
  const signMat = new THREE.MeshBasicMaterial({ map: signTex() });
  const sy = H + 1.5;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.19), signMat); sign.position.set(0, sy, Z - 0.8); root.add(sign);
  box(7.3, 2.4, 0.2, M(0x1d2a33), 0, sy, Z - 0.95);
  [-2.8, 2.8].forEach(x => box(0.16, 1.2, 0.16, M(0x333b40), x, H + 0.6, Z - 0.9));
  const signLight = new THREE.PointLight(0x9fe8f0, 1.0, 12); signLight.position.set(0, sy, Z + 1.5); root.add(signLight);

  /* Bendera */
  cyl(0.04, 3, M(0x999999), -5.2, H + 1.5, Z - 1.2, root, 6);
  const fgeo = new THREE.PlaneGeometry(1.2, 0.7); fgeo.translate(0.6, 0, 0);
  const flag = new THREE.Mesh(fgeo, new THREE.MeshStandardMaterial({ color: 0xcf3b3b, side: THREE.DoubleSide }));
  flag.position.set(-5.16, H + 2.8, Z - 1.2); root.add(flag);

  /* Semak depan */
  const green = M(0x2f6b3a);
  [-4.9, -3.4, -1.9, 1.9, 3.4, 4.9].forEach(x => ball(0.48, green, x, 0.5, Z + 0.4, 0.8));
  [-3.1, 3.1].forEach(x => { box(0.7, 0.5, 0.7, M(0x6b4a34), x, 0.35, Z + 1.4); ball(0.5, green, x, 0.95, Z + 1.4); });

  let lamp;
  if (props) {
    box(15, 0.1, 2.8, M(0x77777a), 0, 0.05, Z + 1.4);
    box(16, 0.04, 6, M(0x2b2d33), 0, 0.02, Z + 6.4);
    for (let i = -2; i <= 2; i++) box(0.12, 0.01, 2.8, M(0xd8d4c4), i * 3.4, 0.05, Z + 6.4);
    function car(color, x, z, ry) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
      box(2.4, 0.6, 1.1, M(color, { roughness: 0.4 }), 0, 0.55, 0, g);
      box(1.3, 0.5, 1, M(color, { roughness: 0.4 }), -0.1, 1.05, 0, g);
      box(1.1, 0.34, 1.02, M(0x151c2a, { roughness: 0.2 }), -0.1, 1.05, 0, g);
      [[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].forEach(p => { const w = cyl(0.28, 0.2, M(0x111111), p[0], 0.28, p[1], g, 14); w.rotation.x = Math.PI / 2; });
    }
    car(0x3a6a8a, -1.7, Z + 6.4, Math.PI / 2); car(0xe4e4e0, 1.7, Z + 6.4, Math.PI / 2);

    cyl(0.08, 5.4, M(0x2f2f2f), 8.4, 2.7, Z + 3, root, 8);
    box(1, 0.08, 0.08, M(0x2f2f2f), 7.9, 5.4, Z + 3);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe2a0 }));
    bulb.position.set(7.5, 5.3, Z + 3); root.add(bulb);
    lamp = new THREE.PointLight(0xffd38a, 1.2, 16); lamp.position.set(7.5, 5.1, Z + 3); root.add(lamp);

    const wood = M(0x4a3626);
    cyl(0.22, 2.6, wood, -9, 1.3, Z + 2, root, 8);
    [[0, 3.4, 0, 1.3], [0.7, 4.1, 0.2, 1.0], [-0.7, 3.9, -0.2, 1.0]].forEach(b => ball(b[3], green, -9 + b[0], b[1], Z + 2 + b[2]));
    cyl(0.3, 0.9, M(0x2e4a5a), 6.6, 0.5, Z + 1.4); cyl(0.33, 0.08, M(0x223a47), 6.6, 1, Z + 1.4);
  }

  root.userData.update = (timeMs) => {
    const s = timeMs * 0.001;
    const p = 0.94 + 0.06 * Math.sin(s * 2);
    signMat.color.setScalar(p); signLight.intensity = p;
    flag.rotation.y = Math.sin(s * 2.2) * 0.3;
  };
  return root;
}
