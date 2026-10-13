import * as THREE from 'three';

/*
 * Rumah dan hotel modern, level 1..5 = 1..5 lantai.
 * Ukuran sudah PAS dengan petak game (satuan dunia game, tanpa diskalakan ulang):
 *   lahan kecil  2 x 2 (plot 1.68)  -> rumah  muat 1.5 x 1.5
 *   lahan besar  4 x 4 (plot 3.68)  -> hotel  muat 3.5 x 3.5
 * Menghadap +Z, dasar di y = 0. Hanya MeshLambertMaterial + tekstur kanvas (ringan, tanpa PointLight),
 * jadi aman dipasang banyak sekaligus di peta.
 */
export const FIT_SMALL = 1.5, FIT_LARGE = 3.5;

const L = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
function box(w, h, d, m, x, y, z, p) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); s.position.set(x, y, z); p.add(s); return s; }
function cyl(r, h, m, x, y, z, p, seg = 12) { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); s.position.set(x, y, z); p.add(s); return s; }
function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding; return t;
}
const TM = (w, h, draw) => L(0xffffff, { map: tex(w, h, draw) });
const WALL = '#f3f1ed', FRAME = '#2a2f36';
const wall = (c, w, h) => { c.fillStyle = WALL; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(0, h - 8, w, 8); };
function glass(c, x, y, w, h) {
  const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#34506f'); g.addColorStop(0.55, '#2a3f5a'); g.addColorStop(1, '#4b6a90'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(x + w * 0.15, y); c.lineTo(x + w * 0.45, y); c.lineTo(x + w * 0.15 + h * 0.0, y + h); c.lineTo(x - w * 0.05, y + h); c.closePath(); c.fill();
  c.strokeStyle = FRAME; c.lineWidth = 4; c.strokeRect(x, y, w, h); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke();
}
const woodPanel = (c, x, y, w, h) => { c.fillStyle = '#a2693a'; c.fillRect(x, y, w, h); for (let i = x + 4; i < x + w; i += 9) { c.fillStyle = 'rgba(60,30,10,.35)'; c.fillRect(i, y, 2, h); c.fillStyle = 'rgba(255,210,150,.18)'; c.fillRect(i + 3, y, 2, h); } };

/* ---------- RUMAH ---------- */
const HOUSE_FRONT = {
  door: (c, w, h) => { wall(c, w, h); glass(c, 14, 20, 108, 80); c.fillStyle = '#6a4524'; c.fillRect(150, 30, 48, h - 30); c.fillStyle = '#d8b44a'; c.fillRect(190, 72, 4, 14); glass(c, 206, 34, 34, 56); },
  glass: (c, w, h) => { wall(c, w, h); glass(c, 16, 18, 100, 82); glass(c, 140, 18, 100, 82); },
  wood: (c, w, h) => { wall(c, w, h); woodPanel(c, 10, 8, 104, h - 12); glass(c, 136, 18, 104, 82); },
  band: (c, w, h) => { wall(c, w, h); glass(c, 8, 14, 240, 88); [64, 128, 192].forEach(x => { c.fillStyle = FRAME; c.fillRect(x - 2, 14, 4, 88); }); }
};
const HOUSE_SIDE = (c, w, h) => { wall(c, w, h); glass(c, 70, 18, 116, 82); };

export function buildHouse(level = 1, opts = {}) {
  const N = Math.max(1, Math.min(5, level | 0)), g = new THREE.Group(); g.name = 'Rumah' + N;
  const W = 1.34, D = 1.2, CZ = -0.05, FH = 0.6, FRONT = CZ + D / 2;   // badan rumah; z depan = 0.55
  const wallM = L(0xf3f1ed), slabM = L(0x585d65), roofM = L(0x4a4e54), glassRail = L(0x9fd0e0, { transparent: true, opacity: 0.35 });
  const sideM = TM(256, 116, HOUSE_SIDE), frontM = {};
  const front = k => frontM[k] || (frontM[k] = TM(256, 116, HOUSE_FRONT[k]));
  box(1.5, 0.04, 1.5, L(0x7c8087), 0, 0.02, 0, g);                                  // alas tipis
  const order = ['door', 'glass', 'wood', 'band', 'glass'];
  let top = 0.04, roofY = 0, roofW = 0, roofD = 0, roofCZ = 0;
  for (let i = 0; i < N; i++) {
    const set = N >= 4 && i === N - 1, w = set ? 0.94 : W, d = set ? 0.9 : D, cz = set ? CZ - 0.1 : CZ, kind = order[i], ry = top + FH;
    box(w, FH, d, [sideM, wallM, wallM, wallM, front(set ? 'band' : kind), wallM], 0, top + FH / 2, cz, g);
    if (i === 0) box(0.5, 0.04, 0.22, slabM, 0.24, 0.04 + FH * 0.82, FRONT + 0.08, g);                    // kanopi pintu
    if (!set && i > 0 && i % 2 === 1) {                                                                      // balkon dengan pagar kaca (di pelat lantai ini)
      box(w, 0.04, 0.17, slabM, 0, top - 0.02, FRONT + 0.085, g); box(w - 0.04, 0.2, 0.02, glassRail, 0, top + 0.1, FRONT + 0.16, g); }
    if (i < N - 1) {
      box(w + 0.16, 0.04, d + 0.16, slabM, 0, ry + 0.02, cz, g);                                           // pelat antar-lantai
      if (N >= 4 && i === N - 2) {                                                                          // lantai teratas mundur: pagar kaca di tepi teras
        box(W - 0.02, 0.2, 0.02, glassRail, 0, ry + 0.14, FRONT + 0.06, g); box(0.02, 0.2, D - 0.02, glassRail, W / 2 - 0.01, ry + 0.14, CZ, g); }
      top = ry + 0.04;
    } else { roofW = w + 0.16; roofD = d + 0.16; roofCZ = cz; roofY = ry + 0.05; box(roofW, 0.05, roofD, roofM, 0, ry + 0.025, cz, g); }   // pelat atap
  }
  // perlengkapan atap: makin tinggi level, makin lengkap
  if (N === 2) box(0.26, 0.15, 0.2, L(0xd9dce0), 0.3, roofY + 0.075, roofCZ - 0.2, g);
  if (N === 3) { box(0.3, 0.04, 0.3, slabM, -0.28, roofY + 0.02, roofCZ - 0.15, g); cyl(0.11, 0.22, L(0x8aa0b8), -0.28, roofY + 0.15, roofCZ - 0.15, g, 14); }
  if (N === 4) [-0.2, 0.2].forEach(x => { const p = box(0.32, 0.02, 0.22, L(0x28406a), x, roofY + 0.1, roofCZ - 0.1, g); p.rotation.x = -0.4; });
  if (N === 5) { cyl(0.012, 0.5, L(0x888c94), 0.25, roofY + 0.25, roofCZ - 0.2, g, 6); box(0.34, 0.07, 0.14, L(0x5a8f3a), -0.18, roofY + 0.035, roofCZ + 0.12, g); }
  g.userData.update = () => {};
  return g;
}

/* ---------- HOTEL ---------- */
function signTex(stars) {
  return tex(512, 112, (c, w, h) => {
    c.fillStyle = '#16181c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a24a'; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 58px Georgia,serif'; c.fillStyle = '#fff3d6'; c.fillText('HOTEL', w / 2, 44);
    c.font = 'bold 34px Georgia,serif'; let s = ''; for (let i = 0; i < 5; i++) s += (i < stars ? '\u2605' : '\u2606') + (i < 4 ? ' ' : ''); c.fillStyle = '#ffd24a'; c.fillText(s, w / 2, 88);
  });
}
const HOTEL_LOBBY = (c, w, h) => {
  c.fillStyle = '#e9e6df'; c.fillRect(0, 0, w, h); c.fillStyle = '#2d3138'; c.fillRect(0, 0, w, 14);
  glass(c, 10, 22, w - 20, h - 28); for (let x = 66; x < w - 20; x += 56) { c.fillStyle = FRAME; c.fillRect(x - 2, 22, 4, h - 28); }
  c.fillStyle = '#ffe3b0'; c.fillRect(w / 2 - 56, 30, 112, h - 36); c.fillStyle = FRAME; c.fillRect(w / 2 - 2, 30, 4, h - 36); c.fillRect(w / 2 - 58, 30, 4, h - 36); c.fillRect(w / 2 + 54, 30, 4, h - 36); c.fillStyle = '#d8b44a'; c.fillRect(w / 2 - 12, 66, 6, 14); c.fillRect(w / 2 + 6, 66, 6, 14);
};
const HOTEL_LOBBY_SIDE = (c, w, h) => { c.fillStyle = '#e9e6df'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) glass(c, 12 + i * 61, 14, 50, h - 24); };
const hotelRooms = (n, lit) => (c, w, h) => {
  c.fillStyle = '#e9e6df'; c.fillRect(0, 0, w, h); const step = w / n, ww = step * 0.56;
  for (let i = 0; i < n; i++) { const x = i * step + (step - ww) / 2; c.fillStyle = (i * 5 + lit) % 7 < 3 ? '#ffd89a' : '#2d435e'; c.fillRect(x, 14, ww, h - 26); if ((i * 3 + lit) % 4 === 0) { c.fillStyle = '#e8d8bc'; c.fillRect(x, 14, ww, (h - 26) * 0.5); } c.strokeStyle = FRAME; c.lineWidth = 3; c.strokeRect(x, 14, ww, h - 26); }
  c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(0, h - 6, w, 6);
};

export function buildHotel(level = 1, opts = {}) {
  const N = Math.max(1, Math.min(5, level | 0)), g = new THREE.Group(); g.name = 'Hotel' + N;
  const PW = 3.36, PD = 2.8, PCZ = -0.2, PH = 0.72, FH = 0.62, TW = 2.96, TD = 2.0, TCZ = -0.6;   // podium/lobi + menara
  const slabM = L(0x575c64), glassRail = L(0x9fd0e0, { transparent: true, opacity: 0.35 }), gold = L(0xd4af37), green = L(0x3f8a4a), white = L(0xf4f2ec);
  const plain = L(0xe9e6df), lobbyF = TM(512, 110, HOTEL_LOBBY), lobbySide = TM(256, 66, HOTEL_LOBBY_SIDE);
  box(3.5, 0.04, 3.4, L(0x7c8087), 0, 0.02, -0.02, g);
  box(PW, PH, PD, [lobbySide, plain, plain, plain, lobbyF, plain], 0, 0.04 + PH / 2, PCZ, g);
  box(PW + 0.12, 0.05, PD + 0.12, slabM, 0, 0.04 + PH + 0.025, PCZ, g);
  box(2.1, 0.05, 0.42, slabM, 0, 0.04 + PH * 0.86, PCZ + PD / 2 + 0.21, g);                  // kanopi masuk
  [-0.95, 0.95].forEach(x => cyl(0.04, PH * 0.86, gold, x, 0.04 + PH * 0.43, PCZ + PD / 2 + 0.38, g, 10));
  let top = 0.04 + PH + 0.05;
  for (let i = 1; i < N; i++) {
    const mats = [TM(256, 80, hotelRooms(5, i)), plain, plain, plain, TM(512, 106, hotelRooms(8, i)), plain];
    box(TW, FH, TD, mats, 0, top + FH / 2, TCZ, g);
    box(TW + 0.1, 0.04, TD + 0.1, slabM, 0, top + FH + 0.02, TCZ, g);
    top += FH + 0.04;
  }
  if (N >= 5) [-TW / 2, TW / 2].forEach(x => box(0.08, top - 0.04 - PH, 0.08, gold, x, 0.04 + PH + (top - 0.04 - PH) / 2, TCZ + TD / 2 + 0.02, g));
  // teras di atap lobi (di depan menara)
  if (N >= 2) {
    const ty = 0.04 + PH + 0.05, fz = PCZ + PD / 2 - 0.05;
    box(PW - 0.06, 0.2, 0.02, glassRail, 0, ty + 0.1, fz, g); box(0.02, 0.2, fz - (TCZ + TD / 2), glassRail, PW / 2 - 0.04, ty + 0.1, (fz + TCZ + TD / 2) / 2, g);
    if (N >= 3) [-1.2, -0.6, 1.2].forEach(x => { box(0.3, 0.12, 0.2, L(0x6b4a2a), x, ty + 0.06, fz - 0.15, g); box(0.26, 0.14, 0.16, green, x, ty + 0.19, fz - 0.15, g); });
    if (N >= 4) { box(1.5, 0.05, 0.42, white, 0.15, ty + 0.025, fz - 0.28, g); box(1.42, 0.03, 0.34, L(0x35b6d8), 0.15, ty + 0.06, fz - 0.28, g); }
  }
  // papan nama di atap: bintang sesuai level
  const roofY = top, sz = N >= 2 ? TCZ + TD / 2 - 0.2 : PCZ + PD / 2 - 0.25, signMat = L(0xffffff, { map: signTex(N) });
  box(2.3, 0.04, 0.14, slabM, 0, roofY + 0.02, sz - 0.05, g);
  const sy = roofY + 0.42; [-1.0, 1.0].forEach(x => box(0.05, 0.4, 0.05, L(0x333a40), x, roofY + 0.22, sz - 0.05, g));
  box(2.34, 0.62, 0.08, L(0x24272c), 0, sy, sz - 0.05, g);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.24, 0.5), signMat); sign.position.set(0, sy, sz); g.add(sign);
  if (N >= 5) { box(2.0, 0.3, 1.1, L(0x7aa6c8, { transparent: true, opacity: 0.55 }), 0, roofY + 0.19, TCZ - 0.3, g); box(2.1, 0.04, 1.2, gold, 0, roofY + 0.36, TCZ - 0.3, g); }
  g.userData.update = (ms) => { const k = 0.92 + 0.08 * Math.sin(ms * 0.0015); signMat.color.setScalar(k); };
  return g;
}
