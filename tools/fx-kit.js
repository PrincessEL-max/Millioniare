import * as THREE from 'three';

/* Perangkat efek bersama (lawyer, thief, stop sign): pengatur waktu, label teks 3D, debu, cincin kejut, percikan, uang kertas, seruan "!". */
export const fxShake = new THREE.Vector3();   // tambahkan ke posisi kamera di loop render:  cam.position.add(fxShake)
export const clamp01 = t => Math.min(1, Math.max(0, t));
export const ease = { out: t => 1 - Math.pow(1 - clamp01(t), 3), in: t => Math.pow(clamp01(t), 3), io: t => { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, back: t => { t = clamp01(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };
export const rnd = (a, b) => a + Math.random() * (b - a);
export const shake = (amp, t, ms = 700) => { const k = Math.max(0, 1 - t / ms) * amp; fxShake.set(Math.sin(t * 0.09) * k, Math.cos(t * 0.11) * k * 0.7, Math.sin(t * 0.07 + 1) * k); };

const cache = {};
function canvasTex(key, w, h, draw) { if (cache[key]) return cache[key]; const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t._shared = true; return (cache[key] = t); }
export const softMap = () => softTex();
const softTex = () => canvasTex('soft', 64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(0.5, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
const billTex = () => canvasTex('bill', 128, 64, (g, w, h) => { g.fillStyle = '#3fb561'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e6ffe9'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#cfffd8'; g.beginPath(); g.arc(w / 2, h / 2, 21, 0, 7); g.fill(); g.fillStyle = '#1f7a3a'; g.font = '900 34px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', w / 2, h / 2 + 2); });

/** Satu sesi efek. fx.add(fn): fn(t_ms, dt_detik) mengembalikan false bila selesai. fx.run() -> Promise yang selesai setelah semua efek selesai. */
export function createFx(scene) {
  const root = new THREE.Group(); root.name = 'FX'; scene.add(root); const ups = [];
  const fx = {
    root, scene, add(fn) { ups.push(fn); return fn; },
    run(maxMs = 9000) {
      return new Promise(res => { const manual = () => typeof window !== 'undefined' && window.__fxClock != null, clock = () => manual() ? window.__fxClock : performance.now(), t0 = clock(); let last = t0; const f = () => { const now = clock(), t = now - t0, dt = manual() ? Math.min(0.033, Math.max(0, (now - last) / 1000)) : Math.min(0.033, (now - last) / 1000 || 0.016); last = now; for (let i = ups.length - 1; i >= 0; i--) if (ups[i](t, dt) === false) ups.splice(i, 1); if ((!ups.length && t > 60) || t > maxMs) { fx.dispose(); res(); } else requestAnimationFrame(f); }; requestAnimationFrame(f); });
    },
    dispose() { fxShake.set(0, 0, 0); scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(m => { if (m.map && !m.map._shared) m.map.dispose(); m.dispose(); }); }); }
  };
  return fx;
}

/** Sprite teks bergaya komik (putih/berwarna dengan garis tepi). size = tinggi dunia. */
export function labelSprite(text, o = {}) {
  const { color = '#fff', stroke = '#1a1a1a', size = 0.7, font = '900 italic 84px "Trebuchet MS","Segoe UI",Arial,sans-serif', pad = 26 } = o;
  const c = document.createElement('canvas'), g = c.getContext('2d'); g.font = font; const w = Math.ceil(g.measureText(text).width) + pad * 2, h = 128; c.width = w; c.height = h;
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = stroke; g.strokeText(text, w / 2, h / 2 + 4); g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false })); s.scale.set(size * w / h, size, 1); s.renderOrder = 50; return s;
}
/** Ledakan bintang komik berisi teks (mis. "SNATCH!"). */
export function burstSprite(text, o = {}) {
  const { fill = '#ffd23a', edge = '#d6301f', color = '#d6301f', size = 1.9 } = o, c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.translate(128, 128);
  g.beginPath(); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, r = i % 2 ? 78 : 122; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 9; g.strokeStyle = edge; g.lineJoin = 'round'; g.stroke();
  g.fillStyle = color; g.font = '900 italic 50px "Trebuchet MS",Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#fff'; g.strokeText(text, 0, 4); g.fillText(text, 0, 4);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false, depthWrite: false })); s.scale.setScalar(size); s.renderOrder = 55; return s;
}
export const exclaimSprite = (size = 0.9) => burstSprite('!', { fill: '#ff4a3a', edge: '#7a0f08', color: '#fff', size });

/** Gumpalan debu/asap. */
export function puffs(fx, p, n = 6, o = {}) {
  const { color = 0xe6dfd0, size = 1.1, rise = 0.7, spread = 0.7, delay = 0, life = 900 } = o;
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color, transparent: true, opacity: 0, depthWrite: false })); s.position.copy(p); s.renderOrder = 20; fx.root.add(s);
    const d = delay + rnd(0, 140), v = new THREE.Vector3(rnd(-spread, spread), rnd(0.1, rise), rnd(-spread, spread)), sz = size * rnd(0.7, 1.2), t0 = performance.now();
    fx.add(t => { const k = (t - d) / life; if (k < 0) return true; if (k >= 1) { fx.root.remove(s); return false; } s.material.opacity = 0.72 * (1 - k) * Math.min(1, k * 7); s.scale.setScalar(0.25 + sz * ease.out(k)); s.position.set(p.x + v.x * k, p.y + v.y * k, p.z + v.z * k); return true; });
  }
}
/** Cincin kejut di lantai. */
export function ringWave(fx, x, z, color, maxR = 2.4, ms = 700, delay = 0, y = 0.2) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.34, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 15; fx.root.add(m);
  fx.add(t => { const k = (t - delay) / ms; if (k < 0) return true; if (k >= 1) { fx.root.remove(m); return false; } m.scale.setScalar(1 + k * maxR * 3); m.material.opacity = 0.85 * (1 - k); return true; });
}
/** Percikan/konfeti yang jatuh. colors = array hex. */
export function sparks(fx, p, colors, n = 24, o = {}) {
  const { speed = 3.2, up = 4.4, life = 1100, size = 0.14, delay = 0, gravity = 11 } = o;
  for (let i = 0; i < n; i++) {
    const col = colors[i % colors.length], s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: col, transparent: true, depthWrite: false })); s.position.copy(p); s.scale.setScalar(size * rnd(0.7, 1.5)); s.renderOrder = 30; fx.root.add(s);
    const a = Math.random() * 6.283, sp = rnd(0.4, 1) * speed, v = new THREE.Vector3(Math.cos(a) * sp, rnd(0.4, 1) * up, Math.sin(a) * sp), q = p.clone(), d = delay + rnd(0, 100);
    fx.add((t, dt) => { const k = (t - d) / life; if (k < 0) return true; if (k >= 1) { fx.root.remove(s); return false; } v.y -= gravity * dt; q.addScaledVector(v, dt); s.position.copy(q); s.material.opacity = 1 - Math.pow(k, 3); return true; });
  }
}
export function billMesh(w = 0.42) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, w * 0.5), [0, 1, 2, 3, 4, 5].map(i => new THREE.MeshLambertMaterial(i === 2 ? { map: billTex() } : { color: 0x2f8f4a }))); return m; }
/** Tiang cahaya vertikal (additive). */
export function beam(fx, x, z, color, h = 7, r = 1.2, inMs = 400, holdMs = 900, outMs = 600, delay = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, h, 28, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.position.set(x, h / 2, z); m.renderOrder = 10; fx.root.add(m);
  fx.add(t => { const k = t - delay; if (k < 0) return true; const tot = inMs + holdMs + outMs; if (k >= tot) { fx.root.remove(m); return false; } m.material.opacity = 0.26 * (k < inMs ? k / inMs : k < inMs + holdMs ? 1 : 1 - (k - inMs - holdMs) / outMs); return true; });
  return m;
}
export const screenRight = new THREE.Vector3(1, 0, -1).normalize();   // arah "kanan layar" untuk kamera isometrik game (offset kamera 12, 8.5, 12)
