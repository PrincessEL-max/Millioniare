import * as THREE from 'three';

/*
 * Petak papan "Millionaire Tafa":
 *   1) Petak LAHAN  -> drawLotHD(l)      : pengganti isi drawLot() di world.js (tekstur resolusi tinggi, warna lebih pekat dan tajam)
 *   2) Petak HIJAU  -> createGrass(opts) : pengganti bidang hijau polos di scene.js (berpetak, warnanya bervariasi, sebagian berbunga kecil)
 * Aman dipakai dengan kamera ortografik dan pencahayaan game (Ambient + Directional, sRGB).
 */

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const cv = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function srgb(t) { t.encoding = THREE.sRGBEncoding; return t; }
const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };

/* ================================ 1) PETAK LAHAN ================================ */
export const OWNER_COLORS = ['#ff2a2a', '#17d150', '#1d96ff'];   // merah, hijau, biru yang pekat (sudah dikoreksi sRGB di setFrameColor)
export const NEUTRAL_FRAME = '#f7dea0';
/** Ukuran kanvas: lahan kecil (lebar 2) = 1024 px, lahan besar (lebar 4) = 2048 px. Pakai saat membuat kanvas: cvs(lotPx(w)). */
export const lotPx = w => (w >= 4 ? 2048 : 1024);

/** Tekstur lantai lahan yang DIBAGI: semua lahan kecil memakai satu kanvas 1024, semua lahan besar satu kanvas 2048 (hemat memori HP). */
const LOT_TEX = {};
export function lotTexture(w, aniso = 8) {
  const key = w >= 4 ? 4 : 2;
  if (!LOT_TEX[key]) { const c = cv(lotPx(key)), t = srgb(new THREE.CanvasTexture(c)); t.anisotropy = aniso; LOT_TEX[key] = { c, tex: t }; }
  return LOT_TEX[key];
}
export function resetLotTextures() { for (const k in LOT_TEX) { LOT_TEX[k].tex.dispose(); delete LOT_TEX[k]; } }

function paintLot(c, px, large) {
  const g = c.getContext('2d'), u = px / 128, R = rng(large ? 91 : 17);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, px, px); g.setTransform(u, 0, 0, u, 0, 0);
  // dasar emas pekat
  let f = g.createLinearGradient(0, 0, 128, 128); f.addColorStop(0, '#ffd95a'); f.addColorStop(0.5, '#fcc13a'); f.addColorStop(1, '#f2a01c'); g.fillStyle = f; g.fillRect(0, 0, 128, 128);
  // alur silang yang dalam (tempat 4 lempeng bertemu)
  g.fillStyle = '#c47a0c'; g.fillRect(0, 60, 128, 8); g.fillRect(60, 0, 8, 128);
  g.fillStyle = 'rgba(90,40,0,.35)'; g.fillRect(0, 60, 128, 2.2); g.fillRect(60, 0, 2.2, 128);
  g.fillStyle = 'rgba(255,226,140,.5)'; g.fillRect(0, 66.4, 128, 1.6); g.fillRect(66.4, 0, 1.6, 128);
  // empat lempeng bersudut halus: lebih terang, tepi tajam
  [[4, 4], [68, 4], [4, 68], [68, 68]].forEach(([x, y]) => {
    rrect(g, x, y, 56, 56, 5.5);
    const sg = g.createLinearGradient(x, y, x + 56, y + 56); sg.addColorStop(0, '#ffe27a'); sg.addColorStop(0.55, '#fdc943'); sg.addColorStop(1, '#f5a923'); g.fillStyle = sg; g.fill();
    g.lineWidth = 1.15; g.strokeStyle = 'rgba(150,74,0,.9)'; g.stroke();
    rrect(g, x + 1.6, y + 1.6, 52.8, 52.8, 4.4); g.lineWidth = 0.8; g.strokeStyle = 'rgba(255,246,190,.85)'; g.stroke();
    // kilau tipis di pojok kiri-atas tiap lempeng
    const hl = g.createRadialGradient(x + 12, y + 10, 1, x + 20, y + 18, 38); hl.addColorStop(0, 'rgba(255,255,255,.32)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); rrect(g, x, y, 56, 56, 5.5); g.fillStyle = hl; g.fill();
  });
  // butiran halus supaya terlihat HD, bukan warna datar
  for (let i = 0; i < 1600; i++) {
    const x = R() * 128, y = R() * 128, r = 0.16 + R() * 0.24, a = 0.04 + R() * 0.07;
    g.fillStyle = R() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(120,58,0,${a})`; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }
  // bayangan dalam di tepi
  g.save(); g.beginPath(); g.rect(0, 0, 128, 128); g.clip();
  g.shadowColor = 'rgba(110,52,0,.55)'; g.shadowBlur = 7 * u; g.fillStyle = '#000';
  g.beginPath(); g.rect(-30, -30, 188, 188); g.rect(0, 0, 128, 128); g.fill('evenodd'); g.restore();
  // garis tepi tegas
  g.lineWidth = 1.6; g.strokeStyle = 'rgba(160,80,0,.9)'; g.strokeRect(0.8, 0.8, 126.4, 126.4);
}

/** Pengganti isi drawLot(i) di world.js:  export function drawLot(i){ drawLotHD(L[i]); }
 *  Lantai digambar SEKALI per kanvas; pemanggilan berikutnya hanya mengganti warna bingkai pemilik. */
export function drawLotHD(l, owners = OWNER_COLORS) {
  const large = l.s == 2, c = l.c, px = lotPx(large ? 4 : 2);
  if (!c._hd) { if (c.width !== px) c.width = c.height = px; paintLot(c, px, large); c._hd = 1; l.tex.needsUpdate = true; }
  if (l.frame) { if (l.frame.glow !== undefined) setFrameColor(l.frame, l.o < 0 ? NEUTRAL_FRAME : owners[l.o], l.o >= 0); else l.frame.material.color.set(l.o < 0 ? NEUTRAL_FRAME : owners[l.o]); }
}

/* ================================ 2) PETAK HIJAU ================================ */
const BASES = ['#78d24f', '#6cc644', '#82d85a', '#63bb40'];
const FLOWERS = [
  { petals: ['#ffffff', '#fff6e0'], center: '#ffcf26', n: [9, 12] },       // aster putih
  { petals: ['#ffd53d', '#ffb52e'], center: '#e58700', n: [7, 10] },       // kuning
  { petals: ['#ff7aa8', '#ff5a82', '#ffa6c6'], center: '#fff3a6', n: [7, 10] }, // merah muda
  { petals: ['#8f7dff', '#6fa6ff', '#c59bff'], center: '#fff3a6', n: [7, 10] }  // ungu-biru
];

function flower(g, x, y, r, F, R) {
  g.save(); g.translate(x, y); g.rotate(R() * 6.28);
  g.fillStyle = 'rgba(15,70,8,.30)'; g.beginPath(); g.ellipse(r * 0.18, r * 0.62, r * 0.95, r * 0.42, 0, 0, 6.28); g.fill();
  g.fillStyle = '#3f9a2a'; [-0.9, 0.9].forEach(s => { g.save(); g.rotate(s); g.beginPath(); g.ellipse(0, r * 0.95, r * 0.22, r * 0.55, 0, 0, 6.28); g.fill(); g.restore(); });
  const pc = F.petals, k = R() < 0.5 ? 5 : 6, col = pc[Math.floor(R() * pc.length)];
  for (let i = 0; i < k; i++) { g.save(); g.rotate(i * 6.2832 / k); g.fillStyle = col; g.beginPath(); g.ellipse(0, -r * 0.58, r * 0.36, r * 0.56, 0, 0, 6.28); g.fill(); g.lineWidth = r * 0.07; g.strokeStyle = 'rgba(40,40,40,.16)'; g.stroke(); g.restore(); }
  g.fillStyle = F.center; g.beginPath(); g.arc(0, 0, r * 0.32, 0, 6.28); g.fill(); g.lineWidth = r * 0.06; g.strokeStyle = 'rgba(120,70,0,.35)'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.65)'; g.beginPath(); g.arc(-r * 0.09, -r * 0.1, r * 0.09, 0, 6.28); g.fill();
  g.restore();
}
function grassCell(g, x0, y0, S, base, F, R) {
  g.save(); g.translate(x0, y0); g.beginPath(); g.rect(0, 0, S, S); g.clip();
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  const lg = g.createLinearGradient(0, 0, S, S); lg.addColorStop(0, 'rgba(255,255,230,.12)'); lg.addColorStop(1, 'rgba(0,50,0,.10)'); g.fillStyle = lg; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 16; i++) { // bercak lembut agar tidak datar
    const x = R() * S, y = R() * S, r = S * (0.12 + R() * 0.2), light = R() < 0.5, rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, light ? 'rgba(200,255,140,.10)' : 'rgba(20,100,20,.09)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.lineCap = 'round';
  for (let i = 0; i < 300; i++) { // helai rumput kecil
    const x = R() * S, y = R() * S, len = S * (0.025 + R() * 0.04), a = -Math.PI / 2 + (R() - 0.5) * 0.9, light = R() < 0.55;
    g.strokeStyle = light ? 'rgba(210,255,150,.42)' : 'rgba(25,105,25,.34)'; g.lineWidth = S * (0.0035 + R() * 0.004);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.5) * len * 0.5, y + Math.sin(a + 0.5) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  // tepi petak lembut: terlihat berpetak tapi tidak kaku
  g.lineWidth = S * 0.014; g.strokeStyle = 'rgba(20,95,20,.11)'; g.strokeRect(S * 0.007, S * 0.007, S * 0.986, S * 0.986);
  g.lineWidth = S * 0.007; g.strokeStyle = 'rgba(235,255,190,.13)'; g.beginPath(); g.moveTo(S * 0.02, S * 0.99); g.lineTo(S * 0.02, S * 0.02); g.lineTo(S * 0.99, S * 0.02); g.stroke();
  if (F) {
    const n = F.n[0] + Math.floor(R() * (F.n[1] - F.n[0] + 1)), pts = [], m = S * 0.1;
    for (let t = 0; t < 200 && pts.length < n; t++) {
      const x = m + R() * (S - 2 * m), y = m + R() * (S - 2 * m);
      if (pts.every(p => Math.hypot(p[0] - x, p[1] - y) > S * 0.12)) pts.push([x, y]);
    }
    pts.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => flower(g, x, y, S * (0.034 + R() * 0.018), F, R));
  }
  g.restore();
}
function grassAtlas(cell, seed) {
  const R = rng(seed), c = cv(cell * 4, cell * 2), g = c.getContext('2d');
  for (let k = 0; k < 8; k++) grassCell(g, (k % 4) * cell, Math.floor(k / 4) * cell, cell, BASES[k < 4 ? k : (k * 3 + 1) % 4], k < 4 ? null : FLOWERS[k - 4], R);
  return c;
}

/**
 * Alas rumput berpetak. Satu mesh untuk seluruh lapangan (cepat).
 *   half       setengah lebar lapangan (default 80 -> 160 x 160 seperti bidang lama)
 *   tile       ukuran satu petak (default 2 = satu petak jalan)
 *   flowerRate peluang sebuah petak berbunga (default 0.13 = "beberapa" petak)
 *   avoid      kotak yang tidak diberi bunga: [[cx, cz, setengahX, setengahZ], ...] (jalan, lahan, titik START)
 */
export function createGrass(o = {}) {
  const half = o.half || 80, tile = o.tile || 2, seed = o.seed || 11, rate = o.flowerRate == null ? 0.13 : o.flowerRate, avoid = o.avoid || [], cell = o.cell || 512;
  const n = Math.round(half * 2 / tile), R = rng(seed), atlas = grassAtlas(cell, seed + 5), map = srgb(new THREE.CanvasTexture(atlas));
  map.anisotropy = o.aniso || 8;
  const pos = new Float32Array(n * n * 12), uv = new Float32Array(n * n * 8), col = new Float32Array(n * n * 12), idx = new Uint16Array(n * n * 6), kind = new Uint8Array(n * n);
  const pad = 4 / (cell * 4), padV = 4 / (cell * 2), free = (cx, cz) => avoid.every(([bx, bz, hx, hz]) => Math.abs(cx - bx) >= hx + tile / 2 - 0.01 || Math.abs(cz - bz) >= (hz == null ? hx : hz) + tile / 2 - 0.01);
  let flowers = 0; const centers = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const q = j * n + i, x0 = -half + i * tile, z0 = -half + j * tile, cx = x0 + tile / 2, cz = z0 + tile / 2;
    let k;
    const nb = i > 0 ? kind[q - 1] : 9, up = j > 0 ? kind[q - n] : 9, flowerNear = (nb >= 4 && nb < 8) || (up >= 4 && up < 8);
    if (!flowerNear && R() < rate && free(cx, cz)) { k = 4 + Math.floor(R() * 4); flowers++; centers.push([cx, cz]); }
    else { let t = 0; do { k = Math.floor(R() * 4); t++; } while (t < 4 && (k === nb || k === up)); }
    kind[q] = k;
    const p = q * 12; pos.set([x0, 0, z0, x0, 0, z0 + tile, x0 + tile, 0, z0 + tile, x0 + tile, 0, z0], p);
    const cxk = k % 4, cyk = Math.floor(k / 4), u0 = cxk / 4 + pad, u1 = (cxk + 1) / 4 - pad, vTop = 1 - cyk / 2 - padV, vBot = 1 - (cyk + 1) / 2 + padV;
    const corners = [[u0, vTop], [u0, vBot], [u1, vBot], [u1, vTop]], rot = Math.floor(R() * 4);
    for (let v = 0; v < 4; v++) { const c = corners[(v + rot) % 4]; uv[q * 8 + v * 2] = c[0]; uv[q * 8 + v * 2 + 1] = c[1]; }
    const t = 0.965 + R() * 0.07 + Math.sin(i * 0.37 + j * 0.21) * 0.015, r = t * (1 + (R() - 0.5) * 0.03), b = t * (1 + (R() - 0.5) * 0.05);
    for (let v = 0; v < 4; v++) { col[q * 12 + v * 3] = r; col[q * 12 + v * 3 + 1] = t; col[q * 12 + v * 3 + 2] = b; }
    const iv = q * 4; idx.set([iv, iv + 1, iv + 2, iv, iv + 2, iv + 3], q * 6);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map, vertexColors: true }));
  mesh.name = 'GrassTiles'; mesh.userData.tiles = n * n; mesh.userData.flowerTiles = flowers; mesh.userData.flowerCenters = centers;
  return mesh;
}

/** Daftar kotak "bebas bunga" dari MAP game (jalan 2x2, lahan kecil 2x2, lahan besar 4x4) + titik START. */
export function avoidFromMap(MAP, START) {
  const a = [], seen = new Set();
  MAP.forEach(m => { a.push([m.p[0] * 2, m.p[1] * 2, 1, 1]); if (m.lot && !seen.has(m.lot.id)) { seen.add(m.lot.id); const h = m.lot.s == 2 ? 2 : 1; a.push([m.lot.x * 2, m.lot.z * 2, h, h]); } });
  if (START) a.push([START[0] * 2, START[1] * 2, 0.6, 0.6]);
  return a;
}


/* ============================ BINGKAI PEMILIK (tepi merah / hijau / biru) ============================ */
// Kenapa tadinya pucat: warna Basic dipasang mentah (hex), lalu dikodekan sRGB lagi oleh renderer sehingga merah jadi merah muda.
// Di sini warna dikoreksi ke linear (hanya jika color management belum aktif), jadi tampil persis seperti hex-nya.
const colorManagement=Reflect.get(THREE,'ColorManagement');
const FIX_SRGB = !(colorManagement && colorManagement.enabled);
/** Ganti warna bingkai. css = '#rrggbb' atau angka 0xrrggbb. Dipakai juga untuk flashLot (kedip). */
export function setFrameColor(frame, css, owned = true) {
  frame.material.color.set(css); if (FIX_SRGB && frame.material.color.convertSRGBToLinear) frame.material.color.convertSRGBToLinear();
  if (frame.glow) frame.glow.visible = !!owned;
}
function mergeGeos(parts) {
  const P = [], N = [], U = [];
  parts.forEach(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); P.push(q.attributes.position.array); N.push(q.attributes.normal.array); U.push(q.attributes.uv.array); });
  const cat = arr => { const o = new Float32Array(arr.reduce((a, b) => a + b.length, 0)); let k = 0; arr.forEach(a => { o.set(a, k); k += a.length; }); return o; };
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(cat(P), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat(N), 3)); g.setAttribute('uv', new THREE.BufferAttribute(cat(U), 2)); return g;
}
let GLOW_TEX = null;
function glowTex() {
  if (GLOW_TEX) return GLOW_TEX; const c = cv(8, 64), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.45, 'rgba(255,255,255,.32)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 64);
  return (GLOW_TEX = new THREE.CanvasTexture(c));
}
/**
 * Bingkai lahan yang lebih tebal dan mengilap: pita berwarna + kilau putih di tepi dalam + garis gelap di tepi luar
 * + manik di empat sudut + pendar warna lembut ke dalam lahan. Hanya 4 mesh per lahan.
 * Mengembalikan { group, material, glow } (group sudah diposisikan di lx, lz; tambahkan ke scene sendiri).
 * material.color = warna pemilik (dipakai bersama oleh pita, manik, dan pendar), jadi flashLot lama tetap jalan.
 */
export function createLotFrame(w, lx, lz) {
  const T = 0.15, e = w / 2, y = 0.17, tr = (x, yy, z) => new THREE.Matrix4().makeTranslation(x, yy, z), box = (sx, sy, sz, x, yy, z) => [new THREE.BoxGeometry(sx, sy, sz), tr(x, yy, z)];
  const band = [box(w, 0.02, T, 0, y, -(e - T / 2)), box(w, 0.02, T, 0, y, e - T / 2), box(T, 0.02, w - 2 * T, -(e - T / 2), y, 0), box(T, 0.02, w - 2 * T, e - T / 2, y, 0)];
  const hl = [], dk = [], hy = y + 0.0115, k = e - T / 2;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { band.push([new THREE.CylinderGeometry(0.125, 0.125, 0.05, 20), tr(sx * k, y + 0.015, sz * k)]); hl.push([new THREE.SphereGeometry(0.05, 12, 8), tr(sx * k - sx * 0.03, y + 0.045, sz * k - sz * 0.03)]); });
  hl.push(box(w - 2 * T, 0.003, 0.03, 0, hy, -(e - T + 0.015)), box(w - 2 * T, 0.003, 0.03, 0, hy, e - T + 0.015), box(0.03, 0.003, w - 2 * T, -(e - T + 0.015), hy, 0), box(0.03, 0.003, w - 2 * T, e - T + 0.015, hy, 0));
  dk.push(box(w - 0.3, 0.003, 0.035, 0, hy, -(e - 0.0175)), box(w - 0.3, 0.003, 0.035, 0, hy, e - 0.0175), box(0.035, 0.003, w - 0.3, -(e - 0.0175), hy, 0), box(0.035, 0.003, w - 0.3, e - 0.0175, hy, 0));
  const gl = [], gw = 0.5, gp = new THREE.PlaneGeometry(w - 0.32, gw);
  for (let i = 0; i < 4; i++) gl.push([gp, new THREE.Matrix4().makeRotationY(i * Math.PI / 2).multiply(tr(0, 0.114, -(e - 0.16 - gw / 2))).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2))]);
  const material = new THREE.MeshBasicMaterial({ color: NEUTRAL_FRAME });
  const hlM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65, depthWrite: false });
  const dkM = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false });
  const glM = new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, opacity: 0.55, depthWrite: false }); glM.color = material.color;   // warna dibagi
  const group = new THREE.Group(); group.name = 'LotFrame';
  const add = (parts, m, order) => { const me = new THREE.Mesh(mergeGeos(parts), m); me.renderOrder = order; group.add(me); return me; };
  add(band, material, 0); add(dk, dkM, 1); add(hl, hlM, 2); const glow = add(gl, glM, 0);
  group.position.set(lx, 0, lz);
  return { group, material, glow };
}

/* ============================ JALAN dengan margin putih kiri-kanan ============================ */
const ROAD_TEX = {};
/**
 * Tekstur jalan 1024 px (pengganti roadTex(arms) di world.js). arms = ['n','e','s','w'] yang tersambung.
 * Sisi petak yang TIDAK tersambung ke jalan lain diberi margin putih (kiri-kanan jalan, juga di tikungan dan ujung jalan).
 * Dibagi per bentuk jalan (kunci = arms), jadi hanya beberapa tekstur untuk puluhan petak: lebih tajam dan lebih hemat memori.
 */
export function roadTexture(arms, aniso = 8) {
  const key = [...arms].sort().join('') || '-';
  if (ROAD_TEX[key]) return ROAD_TEX[key];
  const px = 1024, c = cv(px), g = c.getContext('2d'), has = new Set(arms), R = rng(key.length * 31 + 7);
  g.scale(px / 128, px / 128);
  const base = g.createLinearGradient(0, 0, 128, 128); base.addColorStop(0, '#92979e'); base.addColorStop(1, '#868b92'); g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1100; i++) { const a = 0.04 + R() * 0.06; g.fillStyle = R() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; g.fillRect(R() * 128, R() * 128, 0.4, 0.4); }
  // garis putus-putus tengah (sama dengan world.js)
  g.strokeStyle = '#fff'; g.lineWidth = 7; g.setLineDash([20, 18]); g.lineCap = 'butt';
  const ends = { n: [64, 0], e: [128, 64], s: [64, 128], w: [0, 64] }, remaining = new Set(arms);
  for (const [a, b] of [['n', 's'], ['e', 'w']]) if (remaining.has(a) && remaining.has(b)) { g.beginPath(); g.moveTo(...ends[a]); g.lineTo(...ends[b]); g.stroke(); remaining.delete(a); remaining.delete(b); }
  if (remaining.size == 2) { const [a, b] = [...remaining], vertical = d => d == 'n' || d == 's'; if (vertical(a) != vertical(b)) { g.beginPath(); g.moveTo(...ends[a]); g.quadraticCurveTo(64, 64, ...ends[b]); g.stroke(); remaining.clear(); } }
  if (remaining.size >= 3) { const straight = remaining.has('n') && remaining.has('s') ? ['n', 's'] : remaining.has('e') && remaining.has('w') ? ['e', 'w'] : []; if (straight.length) { g.beginPath(); g.moveTo(...ends[straight[0]]); g.lineTo(...ends[straight[1]]); g.stroke(); straight.forEach(d => remaining.delete(d)); } }
  for (const d of remaining) { g.beginPath(); g.moveTo(...ends[d]); g.lineTo(64, 64); g.stroke(); }
  g.setLineDash([]);
  // margin putih di setiap sisi yang bukan sambungan jalan
  const m = 7, edge = (d, x, y, w, h, sx, sy, sw, sh) => { if (has.has(d)) return; g.fillStyle = '#fff'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(40,44,52,.38)'; g.fillRect(sx, sy, sw, sh); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(sx - (sw > sh ? 0 : 0), sy, sw, sh); };
  edge('n', 0, 0, 128, m, 0, m, 128, 1.1); edge('s', 0, 128 - m, 128, m, 0, 128 - m - 1.1, 128, 1.1);
  edge('w', 0, 0, m, 128, m, 0, 1.1, 128); edge('e', 128 - m, 0, m, 128, 128 - m - 1.1, 0, 1.1, 128);
  const t = srgb(new THREE.CanvasTexture(c)); t.anisotropy = aniso; return (ROAD_TEX[key] = t);
}
export function resetRoadTextures() { for (const k in ROAD_TEX) { ROAD_TEX[k].dispose(); delete ROAD_TEX[k]; } }
