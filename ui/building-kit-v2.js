import * as THREE from 'three';

/*
 * DESAIN 2 - rumah dan hotel dengan bentuk, bahan, dan kelengkapan yang berbeda di tiap level.
 * Level tetap = jumlah lantai (1..5) dan ukuran tetap pas lahan: rumah <= 1.5 x 1.5, hotel <= 3.5 x 3.4.
 *   Rumah : L1 rumah kecil + carport | L2 lantai atas menjorok di atas carport | L3 massa bertingkat bergeser + teras + pergola
 *           L4 dasar batu + dinding kaca + menara tangga kaca + kebun atap | L5 piramida bertingkat + menara bundar emas + kolam atap
 *   Hotel : L1 motel bentuk L + kolam + papan tiang | L2 motel 2 lantai + selasar + tangga | L3 butik: atrium kaca tengah + dua sayap + air mancur
 *           L4 menara + podium + teras kolam + sudut kaca bundar | L5 resor megah: menara bertingkat + kubah emas + air mancur + papan vertikal
 * Hanya MeshLambertMaterial + tekstur kanvas, tanpa PointLight (ringan untuk banyak bangunan sekaligus).
 */
export const FIT_SMALL = 1.5, FIT_LARGE = 3.5;

const L = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
function box(w, h, d, m, x, y, z, p) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); p.add(s); return s; }
function cyl(r, h, m, x, y, z, p, seg = 14) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); p.add(s); return s; }
function ball(r, m, x, y, z, p) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m); s.position.set(x, y, z); p.add(s); return s; }
function tex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); } return t;
}
const TM = (w, h, draw, rx, ry, extra) => L(0xffffff, Object.assign({ map: tex(w, h, draw, rx, ry) }, extra || {}));
const FRAME = '#2a2f36', FH = 0.6, T = 0.04, HH = 0.62;
const slabM = L(0x585d65), roofM = L(0x4a4e54), glassRail = L(0x9fd0e0, { transparent: true, opacity: 0.35 }), gold = L(0xd4af37), steel = L(0x9aa0a8), green = L(0x4f9a46), wood = L(0x8a5a30);

/* ---------- tekstur fasad ---------- */
function glass(c, x, y, w, h) {
  const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#34506f'); g.addColorStop(0.55, '#2a3f5a'); g.addColorStop(1, '#4b6a90'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(x + w * 0.15, y); c.lineTo(x + w * 0.45, y); c.lineTo(x + w * 0.15, y + h); c.lineTo(x - w * 0.05, y + h); c.closePath(); c.fill();
  c.strokeStyle = FRAME; c.lineWidth = 4; c.strokeRect(x, y, w, h); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke();
}
const woodPanel = (c, x, y, w, h) => { c.fillStyle = '#a2693a'; c.fillRect(x, y, w, h); for (let i = x + 4; i < x + w; i += 9) { c.fillStyle = 'rgba(60,30,10,.35)'; c.fillRect(i, y, 2, h); c.fillStyle = 'rgba(255,210,150,.18)'; c.fillRect(i + 3, y, 2, h); } };
const stoneFill = (c, w, h) => { c.fillStyle = '#9a9c9f'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 19) for (let x = ((y / 19) % 2) * 22; x < w; x += 44) { c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(x, y, 42, 17); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x, y, 42, 3); } };
const curtain = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#5a8ab3'); g.addColorStop(1, '#2d4a6d'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(255,255,255,.13)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(i * w / 3, 0); c.lineTo(i * w / 3 + w / 8, 0); c.lineTo(i * w / 3 + w / 8 - h * 0.3, h); c.lineTo(i * w / 3 - h * 0.3, h); c.closePath(); c.fill(); }
  c.strokeStyle = '#d3dbe2'; c.lineWidth = 3; for (let x = 0; x <= w; x += w / 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  for (let i = 0; i < 8; i++) if ((i * 5) % 7 < 2) { c.fillStyle = 'rgba(255,220,150,.45)'; c.fillRect(i * w / 8 + 4, h / 2 + 4, w / 8 - 8, h / 2 - 8); }
};
const FX = {
  door: (c, w, h) => { glass(c, 14, 20, 108, 80); c.fillStyle = '#6a4524'; c.fillRect(150, 30, 48, h - 30); c.fillStyle = '#d8b44a'; c.fillRect(190, 72, 4, 14); glass(c, 206, 34, 34, 56); },
  glass: (c, w, h) => { glass(c, 16, 18, 100, 82); glass(c, 140, 18, 100, 82); },
  band: (c, w, h) => { glass(c, 8, 14, 240, 88); [64, 128, 192].forEach(x => { c.fillStyle = FRAME; c.fillRect(x - 2, 14, 4, 88); }); },
  win: (c, w, h) => { glass(c, 70, 18, 116, 82); },
  woodwin: (c, w, h) => { woodPanel(c, 10, 8, 104, h - 12); glass(c, 136, 18, 104, 82); },
  slats: (c, w, h) => { woodPanel(c, 0, 0, w, h); glass(c, 70, 22, 116, 70); },
  garage: (c, w, h) => { c.fillStyle = '#c9ccd0'; c.fillRect(16, 24, 130, h - 24); for (let y = 36; y < h; y += 14) { c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(16, y, 130, 2); } c.fillStyle = '#6a4524'; c.fillRect(170, 30, 44, h - 30); glass(c, 222, 36, 28, 52); }
};
const fx = (kind, wc) => { const f = FX[kind]; return TM(256, 116, (c, w, h) => { c.fillStyle = wc; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(0, h - 8, w, 8); f(c, w, h); }); };
const stoneM = (kind) => TM(256, 116, (c, w, h) => { stoneFill(c, w, h); if (kind === 'front') { glass(c, 16, 22, 100, 70); c.fillStyle = '#5a3a1c'; c.fillRect(150, 30, 48, h - 30); glass(c, 206, 34, 34, 56); } else glass(c, 70, 22, 116, 70); });
const curtainM = (extra) => TM(256, 116, curtain, 1, 1, extra);

function fl(g, w, d, x, z, y, front, side, wc, h = FH) { const wm = L(wc); return box(w, h, d, [side, wm, wm, wm, front, wm], x, y + h / 2, z, g); }
function car(g, x, z, color = 0x3f78c4, rotY = 0) {
  const c = new THREE.Group(); c.position.set(x, T, z); c.rotation.y = rotY; g.add(c);
  box(0.26, 0.09, 0.5, L(color), 0, 0.075, 0, c); box(0.22, 0.08, 0.26, L(0x1d2430), 0, 0.15, -0.02, c);
  [[-0.14, 0.15], [0.14, 0.15], [-0.14, -0.15], [0.14, -0.15]].forEach(p => box(0.03, 0.07, 0.07, L(0x111418), p[0], 0.035, p[1], c));
}
function tree(g, x, z, r = 0.14) { cyl(0.03, 0.2, wood, x, T + 0.1, z, g, 8); ball(r, L(0x3f8a3f), x, T + 0.2 + r * 0.8, z, g); }
function railX(g, w, x, y, z) { box(w, 0.2, 0.02, glassRail, x, y, z, g); }
function railZ(g, d, x, y, z) { box(0.02, 0.2, d, glassRail, x, y, z, g); }

/* =============================== RUMAH =============================== */
function house1() {
  const g = new THREE.Group(); g.name = 'Rumah1_D2'; const C = '#f1eadc';
  box(1.5, T, 1.5, L(0x86b86a), 0, T / 2, 0, g); box(0.62, 0.045, 1.2, L(0xb8bbc0), -0.44, 0.0225, -0.05, g);
  fl(g, 0.86, 1.0, 0.27, -0.12, T, fx('door', C), fx('win', C), C);
  box(0.96, 0.05, 1.14, roofM, 0.27, T + FH + 0.05, -0.12, g).rotation.x = 0.1;                               // atap miring satu arah
  [-0.72, -0.17].forEach(x => box(0.04, 0.5, 0.04, slabM, x, T + 0.25, 0.42, g)); box(0.62, 0.04, 0.9, slabM, -0.44, T + 0.52, -0.1, g);   // carport
  car(g, -0.44, -0.1, 0x3f78c4); box(0.7, 0.12, 0.1, green, 0.27, T + 0.06, 0.47, g); tree(g, 0.6, 0.58, 0.12);
  g.userData.update = () => {}; return g;
}
function house2() {
  const g = new THREE.Group(); g.name = 'Rumah2_D2'; const C = '#e8eaec', y2 = T + FH + T;
  box(1.5, T, 1.5, L(0x86b86a), 0, T / 2, 0, g); box(0.9, 0.045, 1.1, L(0xb8bbc0), -0.28, 0.0225, -0.1, g);
  fl(g, 0.78, 1.0, 0.33, -0.1, T, fx('door', C), fx('win', C), C);                                              // lantai bawah: setengah lebar
  box(1.44, T, 1.04, slabM, 0, T + FH + T / 2, -0.1, g);
  fl(g, 1.4, 1.0, 0, -0.1, y2, fx('slats', C), fx('glass', C), C);                                               // lantai atas menjorok di atas carport
  cyl(0.025, FH, steel, -0.64, T + FH / 2, 0.38, g, 8); box(0.62, T, 0.18, slabM, -0.38, T + FH + T / 2, 0.47, g); railX(g, 0.6, -0.38, y2 + 0.1, 0.55);
  box(1.48, 0.05, 1.08, roofM, 0, y2 + FH + 0.025, -0.1, g); box(0.26, 0.15, 0.2, L(0xd9dce0), 0.4, y2 + FH + 0.125, -0.3, g);
  car(g, -0.38, -0.1, 0xc9382f); box(0.3, 0.1, 0.1, L(0x6b4a2a), 0.45, 0.09, 0.47, g); ball(0.1, L(0x3f8a3f), 0.45, 0.2, 0.47, g);
  g.userData.update = () => {}; return g;
}
function house3() {
  const g = new THREE.Group(); g.name = 'Rumah3_D2'; const C = '#eadfcb', ry1 = T + FH + T, y2 = ry1, ry2 = y2 + FH + T, y3 = ry2;
  box(1.5, T, 1.5, L(0x86b86a), 0, T / 2, 0, g);
  fl(g, 1.3, 1.1, 0, -0.1, T, fx('door', C), fx('win', C), C); box(1.38, T, 1.18, slabM, 0, T + FH + T / 2, -0.1, g);
  fl(g, 0.86, 0.86, 0.22, -0.2, y2, fx('woodwin', C), fx('win', C), C); box(0.94, T, 0.94, slabM, 0.22, y2 + FH + T / 2, -0.2, g);   // lantai 2 bergeser ke kanan-belakang
  fl(g, 0.7, 0.74, -0.02, -0.28, y3, fx('band', C), fx('glass', C), C);                                           // lantai 3 bergeser ke kiri (menjorok)
  box(0.84, 0.05, 0.88, roofM, -0.02, y3 + FH + 0.06, -0.28, g).rotation.z = 0.12;
  railX(g, 1.28, 0, T + FH + T + 0.1, 0.47); railZ(g, 1.08, -0.64, T + FH + T + 0.1, -0.1);                      // teras di atap lantai 1
  [-0.62, -0.28].forEach(x => [0.5, -0.2].forEach(z => box(0.03, 0.4, 0.03, wood, x, ry1 + 0.2, z, g)));       // pergola kayu
  [0.5, 0.15, -0.2].forEach(z => box(0.4, 0.02, 0.03, wood, -0.45, ry1 + 0.41, z, g)); box(0.3, 0.1, 0.12, L(0x6b4a2a), -0.45, ry1 + 0.07, 0.3, g); ball(0.1, L(0x3f8a3f), -0.45, ry1 + 0.18, 0.3, g);
  [0.5, 0.58, 0.66].forEach(x => box(0.03, FH * 0.9, 0.05, wood, x, y2 + FH * 0.45, 0.28, g));                  // sirip kayu vertikal
  tree(g, 0.62, 0.6, 0.12);
  g.userData.update = () => {}; return g;
}
function house4() {
  const g = new THREE.Group(); g.name = 'Rumah4_D2'; const C = '#d9dde2', dark = L(0x3a3f46);
  box(1.5, T, 1.5, L(0x86b86a), 0, T / 2, 0, g);
  fl(g, 1.3, 1.1, -0.06, -0.1, T, stoneM('front'), stoneM('side'), '#8d8f92'); box(1.38, T, 1.18, dark, -0.06, T + FH + T / 2, -0.1, g);   // lantai dasar berlapis batu
  const cw = curtainM(), cwS = curtainM(); let y = T + FH + T;
  for (let i = 1; i < 4; i++) { fl(g, 1.14, 1.0, -0.08, -0.1, y, cw, cwS, C); box(1.22, T, 1.08, i === 3 ? roofM : dark, -0.08, y + FH + T / 2, -0.1, g); y += FH + T; }
  const top = y, coreH = top - T + 0.2;
  box(0.24, coreH, 0.56, L(0xffffff, { map: tex(64, 128, (c, w, h) => { c.fillStyle = 'rgba(150,200,225,.55)'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a2f36'; c.lineWidth = 3; for (let k = 0; k <= 4; k++) { c.beginPath(); c.moveTo(0, k * h / 4); c.lineTo(w, k * h / 4); c.stroke(); } c.strokeRect(1, 1, w - 2, h - 2); }), transparent: true, opacity: 0.8 }), 0.62, T + coreH / 2, 0.05, g);   // menara tangga kaca
  box(0.24, 0.05, 0.6, dark, 0.62, T + coreH + 0.02, 0.05, g);
  box(0.9, 0.03, 0.7, green, -0.15, top + 0.02, -0.1, g); [[-0.5, 0.2], [0.2, 0.2], [-0.5, -0.4], [0.2, -0.4]].forEach(p => box(0.03, 0.3, 0.03, wood, p[0], top + 0.18, p[1], g)); box(0.8, 0.02, 0.7, wood, -0.15, top + 0.34, -0.1, g); tree(g, 0.65, 0.62, 0.1);
  g.userData.update = () => {}; return g;
}
function house5() {
  const g = new THREE.Group(); g.name = 'Rumah5_D2'; const C = '#f7f7f4', gl = L(0xd4af37), kinds = ['door', 'band', 'glass', 'band', 'glass'];
  const wd = [1.34, 1.2, 1.06, 0.92, 0.78], dp = [1.15, 1.02, 0.9, 0.8, 0.7]; box(1.5, T, 1.5, L(0x86b86a), 0, T / 2, 0, g);
  let y = T;
  for (let i = 0; i < 5; i++) {
    const z = -0.7 + dp[i] / 2, fz = z + dp[i] / 2; fl(g, wd[i], dp[i], 0.02, z, y, fx(kinds[i], C), fx('win', C), C);
    box(wd[i] + 0.1, 0.03, dp[i] + 0.1, gl, 0.02, y + FH + 0.015, z, g);                                               // pelat emas tipis di tiap tingkat
    if (i < 4) { const nz = -0.7 + dp[i + 1]; railX(g, wd[i] - 0.04, 0.02, y + FH + 0.13, fz - 0.03); railZ(g, fz - nz - 0.02, wd[i] / 2, y + FH + 0.13, (fz + nz) / 2); }   // teras di tiap setback
    y += FH + 0.03;
  }
  const tH = 3 * (FH + 0.03), tur = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, tH, 24), TM(128, 128, (c, w, h) => { curtain(c, w, h); }, 3, 3)); tur.position.set(-0.5, T + tH / 2, 0.43); g.add(tur);   // menara bundar kaca
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), gl); cap.position.set(-0.5, T + tH, 0.43); g.add(cap); cyl(0.012, 0.25, steel, -0.5, T + tH + 0.3, 0.43, g, 6);
  box(0.5, 0.02, 0.28, L(0x35b6d8), 0.0, y + 0.015, -0.05, g); box(0.56, 0.03, 0.34, L(0xf4f2ec), 0, y + 0.01, -0.05, g); box(0.18, 0.04, 0.08, L(0xf4f2ec), 0.22, y + 0.05, 0.12, g);   // kolam di puncak
  cyl(0.012, 0.5, steel, 0.28, y + 0.25, -0.3, g, 6); box(0.14, 0.08, 0.01, L(0xd0342c), 0.35, y + 0.46, -0.3, g);
  g.userData.update = () => {}; return g;
}

/* =============================== HOTEL =============================== */
const wallH = '#efe9df';
const motel = (up) => TM(512, 100, (c, w, h) => { c.fillStyle = wallH; c.fillRect(0, 0, w, h); const n = 6, st = w / n; for (let i = 0; i < n; i++) { const x = i * st; glass(c, x + 12, 22, 34, 44); c.fillStyle = i % 2 ? '#2f8f8a' : '#d9822b'; c.fillRect(x + 64, 22, 34, h - 22); c.fillStyle = '#fff'; c.fillRect(x + 76, 32, 10, 8); } if (up) { c.fillStyle = '#3a3f46'; c.fillRect(0, h - 10, w, 4); for (let x = 0; x < w; x += 24) c.fillRect(x, h - 26, 3, 20); c.fillRect(0, h - 26, w, 3); } });
const roomsH = (n, lit) => TM(512, 106, (c, w, h) => { c.fillStyle = wallH; c.fillRect(0, 0, w, h); const st = w / n, ww = st * 0.56; for (let i = 0; i < n; i++) { const x = i * st + (st - ww) / 2; c.fillStyle = (i * 5 + lit) % 7 < 3 ? '#ffd89a' : '#2d435e'; c.fillRect(x, 14, ww, h - 26); if ((i * 3 + lit) % 4 === 0) { c.fillStyle = '#e8d8bc'; c.fillRect(x, 14, ww, (h - 26) * 0.5); } c.strokeStyle = FRAME; c.lineWidth = 3; c.strokeRect(x, 14, ww, h - 26); } });
const balc = (n) => TM(512, 106, (c, w, h) => { c.fillStyle = wallH; c.fillRect(0, 0, w, h); const st = w / n, ww = st * 0.6; for (let i = 0; i < n; i++) { const x = i * st + (st - ww) / 2; glass(c, x, 10, ww, h - 40); c.fillStyle = '#d6d9dd'; c.fillRect(x - 6, h - 26, ww + 12, 7); c.fillStyle = 'rgba(160,210,235,.6)'; c.fillRect(x - 6, h - 46, ww + 12, 20); c.strokeStyle = '#555'; c.lineWidth = 2; c.strokeRect(x - 6, h - 46, ww + 12, 20); } });
const atrium = () => TM(256, 106, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a5b80'); g.addColorStop(1, '#f2c27a'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = FRAME; c.lineWidth = 4; for (let x = 0; x <= w; x += w / 4) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(8, 8, 40, h - 16); });
const lobbyG = () => TM(512, 110, (c, w, h) => { c.fillStyle = '#e9e6df'; c.fillRect(0, 0, w, h); c.fillStyle = '#2d3138'; c.fillRect(0, 0, w, 14); glass(c, 10, 22, w - 20, h - 28); for (let x = 66; x < w - 20; x += 56) { c.fillStyle = FRAME; c.fillRect(x - 2, 22, 4, h - 28); } c.fillStyle = '#ffe3b0'; c.fillRect(w / 2 - 56, 30, 112, h - 36); c.fillStyle = FRAME; c.fillRect(w / 2 - 2, 30, 4, h - 36); c.fillStyle = '#d8b44a'; c.fillRect(w / 2 - 12, 66, 6, 14); c.fillRect(w / 2 + 6, 66, 6, 14); });
const sideW = (n) => TM(256, 70, (c, w, h) => { c.fillStyle = wallH; c.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) glass(c, 12 + i * (w - 20) / n, 14, (w - 20) / n - 10, h - 24); });
const signTex = (stars) => tex(512, 112, (c, w, h) => { c.fillStyle = '#16181c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a24a'; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 58px Georgia,serif'; c.fillStyle = '#fff3d6'; c.fillText('HOTEL', w / 2, 44); c.font = 'bold 34px Georgia,serif'; let s = ''; for (let i = 0; i < 5; i++) s += (i < stars ? '\u2605' : '\u2606') + (i < 4 ? ' ' : ''); c.fillStyle = '#ffd24a'; c.fillText(s, w / 2, 88); });
const bladeTex = (stars) => tex(96, 384, (c, w, h) => { c.fillStyle = '#16181c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a24a'; c.lineWidth = 6; c.strokeRect(4, 4, w - 8, h - 8); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 54px Georgia,serif'; c.fillStyle = '#fff3d6'; 'HOTEL'.split('').forEach((ch, i) => c.fillText(ch, w / 2, 40 + i * 50)); c.font = 'bold 26px Georgia,serif'; c.fillStyle = '#ffd24a'; c.fillText('\u2605'.repeat(stars), w / 2, 340); });
function board(g, stars, x, y, z, w = 1.1) { const m = L(0xffffff, { map: signTex(stars) }); box(w + 0.04, w * 0.24 + 0.04, 0.05, L(0x24272c), x, y, z - 0.03, g); const s = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.2), m); s.position.set(x, y, z); g.add(s); return m; }
function lounger(g, x, y, z) { box(0.1, 0.03, 0.22, L(0xf4f2ec), x, y + 0.03, z, g); }
function parasol(g, x, y, z, col = 0xd9822b) { cyl(0.012, 0.28, steel, x, y + 0.14, z, g, 6); const c = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.08, 10), L(col)); c.position.set(x, y + 0.3, z); g.add(c); }
function palm(g, x, z) { cyl(0.03, 0.4, wood, x, T + 0.2, z, g, 8); for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5, l = box(0.22, 0.015, 0.06, L(0x3f8a3f), x + Math.cos(a) * 0.1, T + 0.42, z + Math.sin(a) * 0.1, g); l.rotation.y = -a; l.rotation.z = -0.25; } }
function plate(g, col = 0x7a8088) { box(3.5, T, 3.4, L(col), 0, T / 2, -0.02, g); }
function pool(g, x, z, w, d) { box(w + 0.1, 0.04, d + 0.1, L(0xf4f2ec), x, 0.02 + T / 2, z, g); box(w, 0.03, d, L(0x35b6d8), x, 0.06, z, g); }

function hotel1() {
  const g = new THREE.Group(); g.name = 'Hotel1_D2'; plate(g); box(2.1, 0.045, 1.3, L(0x86b86a), -0.4, 0.0225, 0.1, g); pool(g, -0.55, 0.15, 1.1, 0.55);
  fl(g, 3.2, 0.8, 0, -1.05, T, motel(false), sideW(3), wallH, HH); box(3.28, T, 0.88, roofM, 0, T + HH + T / 2, -1.05, g);
  fl(g, 0.8, 2.0, 1.2, -0.1, T, L(0xe9e6df), motel(false), wallH, HH); box(0.88, T, 2.08, roofM, 1.2, T + HH + T / 2, -0.1, g);
  lounger(g, -0.05, T, 0.55); lounger(g, 0.15, T, 0.55); parasol(g, -0.95, T, 0.55); car(g, -0.4, 1.25, 0xc9382f, Math.PI / 2); car(g, 0.2, 1.25, 0xe8e8e2, Math.PI / 2); car(g, 0.8, 1.25, 0x3f78c4, Math.PI / 2);
  cyl(0.04, 1.2, steel, -1.3, T + 0.6, 1.05, g, 8); const sm = board(g, 1, -1.3, 1.38, 1.05, 0.8);
  g.userData.update = (ms) => { sm.color.setScalar(0.92 + 0.08 * Math.sin(ms * 0.0015)); }; return g;
}
function hotel2() {
  const g = new THREE.Group(); g.name = 'Hotel2_D2'; plate(g); pool(g, -0.55, 0.2, 1.1, 0.5); const y2 = T + HH + T;
  fl(g, 3.2, 0.8, 0, -1.05, T, motel(false), sideW(3), wallH, HH); box(3.28, T, 0.88, slabM, 0, T + HH + T / 2, -1.05, g);
  fl(g, 3.2, 0.8, 0, -1.05, y2, motel(true), sideW(3), wallH, HH); box(3.28, T, 0.88, roofM, 0, y2 + HH + T / 2, -1.05, g);
  fl(g, 0.8, 1.6, 1.1, 0.0, T, L(0xe9e6df), motel(false), wallH, HH); box(0.88, T, 1.68, slabM, 1.1, T + HH + T / 2, 0, g);
  fl(g, 0.8, 1.6, 1.1, 0.0, y2, L(0xe9e6df), motel(true), wallH, HH); box(0.88, T, 1.68, roofM, 1.1, y2 + HH + T / 2, 0, g);
  box(3.2, T, 0.22, slabM, 0, y2 - T / 2, -0.55, g); railX(g, 3.2, 0, y2 + 0.1, -0.44);                           // selasar lantai 2 + pagar kaca
  const st = box(0.3, 0.03, 0.8, steel, -1.5, y2 / 2, -0.2, g); st.rotation.x = Math.atan2(y2, 0.8);              // tangga
  [-1.0, -0.3].forEach(x => box(0.04, 0.5, 0.04, slabM, x, T + 0.25, 1.2, g)); box(1.2, T, 0.7, slabM, -0.65, T + 0.5, 1.0, g); car(g, -0.9, 1.0, 0xc9382f, Math.PI / 2); car(g, -0.4, 1.0, 0xe8e8e2, Math.PI / 2);
  lounger(g, 0.1, T, 0.4); parasol(g, -0.05, T, 0.45, 0x2f8f8a); cyl(0.04, 1.4, steel, 1.3, T + 0.7, 1.15, g, 8); const sm = board(g, 2, 1.3, 1.52, 1.15, 0.8);
  g.userData.update = (ms) => { sm.color.setScalar(0.92 + 0.08 * Math.sin(ms * 0.0015)); }; return g;
}
function hotel3() {
  const g = new THREE.Group(); g.name = 'Hotel3_D2'; plate(g, 0x8a9096); const ac = atrium(); let y = T;
  for (let i = 0; i < 3; i++) { fl(g, 1.7, 2.0, 0, -0.45, y, ac, sideW(4), wallH, HH); box(1.78, T, 2.08, i === 2 ? roofM : slabM, 0, y + HH + T / 2, -0.45, g); y += HH + T; }
  [-1.28, 1.28].forEach((x, k) => { let yy = T; for (let i = 0; i < 2; i++) { fl(g, 0.85, 1.8, x, -0.5, yy, roomsH(3, i + k), sideW(4), wallH, HH); box(0.92, T, 1.88, i === 1 ? roofM : slabM, x, yy + HH + T / 2, -0.5, g); yy += HH + T; }
    const ty = yy; railX(g, 0.85, x, ty + 0.1, 0.38); [-0.1, 0.3].forEach(zz => [x - 0.3, x + 0.3].forEach(xx => box(0.025, 0.3, 0.025, wood, xx, ty + 0.15, zz, g))); box(0.7, 0.02, 0.5, wood, x, ty + 0.31, 0.1, g); });
  [-0.8, 0.8].forEach(x => cyl(0.045, 0.6, gold, x, T + 0.3, 1.0, g, 10)); box(1.8, 0.05, 0.7, slabM, 0, T + 0.62, 0.7, g);                     // kanopi masuk
  cyl(0.38, 0.1, L(0xb8b4aa), 0, T + 0.05, 1.25, g, 28); cyl(0.32, 0.03, L(0x35b6d8), 0, T + 0.1, 1.25, g, 28); cyl(0.04, 0.22, L(0xb8b4aa), 0, T + 0.2, 1.25, g, 10); ball(0.06, L(0x7fd3f0), 0, T + 0.36, 1.25, g);   // air mancur
  palm(g, -1.45, 1.2); palm(g, 1.45, 1.2); const sm = board(g, 3, 0, y + 0.3, 0.45, 1.3); cyl(0.03, 0.3, steel, -0.5, y + 0.15, 0.4, g, 6); cyl(0.03, 0.3, steel, 0.5, y + 0.15, 0.4, g, 6);
  g.userData.update = (ms) => { sm.color.setScalar(0.92 + 0.08 * Math.sin(ms * 0.0015)); }; return g;
}
function hotel4() {
  const g = new THREE.Group(); g.name = 'Hotel4_D2'; plate(g, 0x8a9096); const PH = 0.72, py = T + PH + 0.05;
  box(3.36, PH, 2.7, [sideW(4), L(0xe9e6df), L(0xe9e6df), L(0xe9e6df), lobbyG(), L(0xe9e6df)], 0, T + PH / 2, -0.15, g); box(3.48, 0.05, 2.82, slabM, 0, T + PH + 0.025, -0.15, g);
  box(1.9, 0.05, 0.42, slabM, -0.6, T + PH * 0.86, 1.42, g); [-1.4, -0.2].forEach(x => cyl(0.04, PH * 0.86, gold, x, T + PH * 0.43, 1.58, g, 10));
  pool(g, -0.85, 0.85, 1.3, 0.4); [-1.2, -0.95, -0.7].forEach(x => lounger(g, x, py, 0.45)); parasol(g, -1.4, py, 0.45); railX(g, 3.3, 0, py + 0.1, 1.17); railZ(g, 2.0, -1.62, py + 0.1, 0.17);
  let y = py; const bm = balc(7);
  for (let i = 0; i < 3; i++) { fl(g, 1.6, 1.6, 0.8, -0.7, y, bm, sideW(3), wallH, HH); box(1.68, T, 1.68, i === 2 ? roofM : slabM, 0.8, y + HH + T / 2, -0.7, g); y += HH + T; }
  const bay = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3 * (HH + T), 24), TM(128, 128, curtain, 2, 3)); bay.position.set(0.0, py + 1.5 * (HH + T), 0.0); g.add(bay); cyl(0.43, 0.04, roofM, 0, y, 0, g, 24);   // sudut kaca bundar
  [-1.6, -1.45].forEach((x, k) => { cyl(0.012, 1.0, steel, x, T + 0.5, 1.5 + k * 0.0, g, 6); box(0.14, 0.08, 0.01, L(k ? 0xd0342c : 0x2f7ae8), x + 0.08, T + 0.92, 1.5, g); });
  const bl = L(0xffffff, { map: bladeTex(4) }); const blade = box(0.26, 1.0, 0.06, [bl, bl, L(0x24272c), L(0x24272c), bl, bl], 1.55, y + 0.5, 0.1, g);
  g.userData.update = (ms) => { bl.color.setScalar(0.92 + 0.08 * Math.sin(ms * 0.0015)); }; return g;
}
function hotel5() {
  const g = new THREE.Group(); g.name = 'Hotel5_D2'; plate(g, 0x8a9096); const PH = 0.72, py = T + PH + 0.05, cw = TM(256, 106, curtain), goldTrim = (x, y, z, w, d) => box(w, 0.04, d, gold, x, y, z, g);
  box(3.36, PH, 2.6, [sideW(4), L(0xe9e6df), L(0xe9e6df), L(0xe9e6df), lobbyG(), L(0xe9e6df)], 0, T + PH / 2, -0.2, g); box(3.48, 0.05, 2.72, gold, 0, T + PH + 0.025, -0.2, g);
  box(2.4, 0.05, 0.5, slabM, 0, T + PH * 0.9, 1.35, g); [-1.0, -0.35, 0.35, 1.0].forEach(x => cyl(0.045, PH * 0.9, gold, x, T + PH * 0.45, 1.55, g, 12));
  let y = py; for (let i = 0; i < 2; i++) { fl(g, 2.4, 1.7, 0, -0.7, y, cw, sideW(4), wallH, HH); goldTrim(0, y + HH + 0.02, -0.7, 2.48, 1.78); y += HH + T; }
  [-1.05, 1.05].forEach(x => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2 * (HH + T), 20), TM(128, 106, curtain, 2, 2)); b.position.set(x, py + (HH + T), 0.15, 0); b.position.z = 0.15; g.add(b); cyl(0.33, 0.04, gold, x, y, 0.15, g, 20); });
  for (let i = 0; i < 2; i++) { fl(g, 1.5, 1.2, 0, -0.8, y, balc(5), sideW(3), wallH, HH); goldTrim(0, y + HH + 0.02, -0.8, 1.58, 1.28); y += HH + T; }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), L(0xd4af37)); dome.position.set(0, y, -0.8); g.add(dome); cyl(0.015, 0.4, steel, 0, y + 0.7, -0.8, g, 6); ball(0.04, gold, 0, y + 0.92, -0.8, g);
  cyl(0.5, 0.1, L(0xb8b4aa), 0, T + 0.05, 1.0, g, 32); cyl(0.43, 0.03, L(0x35b6d8), 0, T + 0.1, 1.0, g, 32); cyl(0.05, 0.3, L(0xb8b4aa), 0, T + 0.25, 1.0, g, 10); ball(0.09, gold, 0, T + 0.45, 1.0, g);   // air mancur
  [-1.6, -1.45, -1.3].forEach((x, k) => { cyl(0.012, 1.1, steel, x, T + 0.55, 1.5, g, 6); box(0.14, 0.08, 0.01, L([0xd0342c, 0xf2f2f2, 0xd4af37][k]), x + 0.08, T + 1.02, 1.5, g); });
  const bl = L(0xffffff, { map: bladeTex(5) }); box(0.28, 1.1, 0.06, [bl, bl, L(0x24272c), L(0x24272c), bl, bl], 1.5, T + 0.55, 1.25, g);
  g.userData.update = (ms) => { bl.color.setScalar(0.92 + 0.08 * Math.sin(ms * 0.0015)); }; return g;
}

export function buildHouseV2(level = 1, opts = {}) { return [house1, house2, house3, house4, house5][Math.max(1, Math.min(5, level | 0)) - 1](); }
export function buildHotelV2(level = 1, opts = {}) { return [hotel1, hotel2, hotel3, hotel4, hotel5][Math.max(1, Math.min(5, level | 0)) - 1](); }
