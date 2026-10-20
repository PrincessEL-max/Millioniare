import * as THREE from 'three';
import { createFx, ease, rnd, clamp01, burstSprite, exclaimSprite, puffs, sparks, ringWave, shake, softMap } from './fx-kit.js';
import { confirmDialog } from './confirm-dialog.js';

/*
 * Alat STOP SIGN: bisa ditaruh di petak jalan mana pun (ikon, jalur rumah, jalur hotel, jalur kosong).
 *   const r = await placeStopSign({ dom, camera, scene, tiles, signs, mount }).promise;   // { tile } atau null
 *   const sign = await dropStopSign({ scene, tile });             signs.set(tile.idx, sign);
 *   const { path, hit } = truncatePathAtSign(path, signs);        // pemain berhenti paksa di petak bertanda
 *   if (hit) { await playForcedStop({ scene, token, sign: hit, dir }); signs.delete(...); }
 * tiles = [{ idx, x, z }]  (pusat petak dalam koordinat dunia)
 */
let octTex = null;
const stopTex = () => octTex || (octTex = (() => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.lineJoin = 'round';
  g.lineWidth = 10;
  g.strokeStyle = '#a91f20';
  g.fillStyle = '#fff';
  g.font = '900 150px Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.strokeText('STOP', 256, 132);
  g.fillText('STOP', 256, 132);
  const t = new THREE.CanvasTexture(c);
  t._shared = true;
  return t;
})());
function octagon(radius) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 8 + i * Math.PI / 4;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    i ? shape.lineTo(x, y) : shape.moveTo(x, y);
  }
  shape.closePath();
  return shape;
}
/** Octagonal sign with aligned raised rim, lettering, and pole. */
export function createStopSignModel() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.29, 0.09, 16),
    new THREE.MeshLambertMaterial({ color: 0x383e48 })
  );
  base.position.y = 0.045;
  g.add(base);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.075, 1.56, 12),
    new THREE.MeshLambertMaterial({ color: 0xbfc6d0 })
  );
  pole.position.set(0, 0.87, -0.08);
  g.add(pole);

  const board = new THREE.Group();
  board.position.set(0, 1.62, 0);
  const backing = new THREE.Mesh(
    new THREE.ExtrudeGeometry(octagon(0.56), { depth: 0.09, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 2 }),
    new THREE.MeshLambertMaterial({ color: 0xf5f5f2 })
  );
  backing.position.z = -0.045;
  board.add(backing);
  const face = new THREE.Mesh(
    new THREE.ShapeGeometry(octagon(0.49)),
    new THREE.MeshBasicMaterial({ color: 0xe5342c, side: THREE.DoubleSide })
  );
  face.position.z = 0.075;
  board.add(face);
  const lettering = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.39),
    new THREE.MeshBasicMaterial({ map: stopTex(), transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
  lettering.position.set(0, 0, 0.082);
  lettering.renderOrder = 2;
  board.add(lettering);
  g.add(board);
  g.rotation.y = Math.PI / 4;
  g.userData.board = board;
  g.userData.height = 2.3;
  return g;
}
const ringTex = (col) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = col + '33'; g.fillRect(6, 6, 116, 116); g.strokeStyle = col; g.lineWidth = 6; g.lineJoin = 'round'; g.strokeRect(6, 6, 116, 116); g.lineWidth = 10; [[6, 6, 1, 1], [122, 6, -1, 1], [6, 122, 1, -1], [122, 122, -1, -1]].forEach(([x, y, sx, sy]) => { g.beginPath(); g.moveTo(x + sx * 28, y); g.lineTo(x, y); g.lineTo(x, y + sy * 28); g.stroke(); }); return new THREE.CanvasTexture(c); };

export function placeStopSign(o) {
  const { dom, camera, scene, tiles, signs = new Map(), mount = document.body, model = createStopSignModel, say = null, hint = 'Tap a road to place the Stop Sign' } = o;
  const bar = document.createElement('div'); bar.style.cssText = 'position:absolute;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:70;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;background:rgba(20,24,34,.9);color:#fff;font:800 13px system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.35)';
  bar.innerHTML = '<span></span><button aria-label="Cancel" style="border:0;border-radius:50%;width:30px;height:30px;background:#e5342c;color:#fff;font:900 16px system-ui;cursor:pointer;padding:0">✕</button>'; bar.querySelector('span').textContent = hint; mount.appendChild(bar);
  const ghost = model(); ghost.traverse(m => { if (m.material) { m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.62; m.material.depthWrite = false; } }); ghost.visible = false; scene.add(ghost);
  const okT = ringTex('#3be06a'), badT = ringTex('#ff4a3a'), ring = new THREE.Mesh(new THREE.PlaneGeometry(1.96, 1.96), new THREE.MeshBasicMaterial({ map: okT, transparent: true, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.09; ring.visible = false; ring.renderOrder = 12; scene.add(ring);
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.02), ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), pt = new THREE.Vector3(); let cur = null, down = null, locked = false, done = false, raf = 0;
  const pick = e => { const r = dom.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera); if (!ray.ray.intersectPlane(plane, pt)) return null; let best = null, bd = 1e9; tiles.forEach(t => { const d = Math.max(Math.abs(t.x - pt.x), Math.abs(t.z - pt.z)); if (d < bd) { bd = d; best = t; } }); return bd <= 1.05 ? best : null; };
  const show = t => { cur = t; if (!t) { ghost.visible = ring.visible = false; return; } const bad = signs.has(t.idx); ghost.position.set(t.x, 0.02, t.z); ghost.visible = true; ring.position.x = t.x; ring.position.z = t.z; ring.visible = true; ring.material.map = bad ? badT : okT; ring.material.needsUpdate = true; };
  const tick = () => { if (done) return; raf = requestAnimationFrame(tick); if (ghost.visible) ghost.position.y = 0.04 + Math.sin(performance.now() * 0.006) * 0.05; };
  return {
    promise: new Promise(resolve => {
      const finish = v => { if (done) return; done = true; cancelAnimationFrame(raf); dom.removeEventListener('pointermove', mv); dom.removeEventListener('pointerdown', pd); dom.removeEventListener('pointerup', pu); window.removeEventListener('keydown', kd); scene.remove(ghost); scene.remove(ring); ghost.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); }); ring.geometry.dispose(); ring.material.dispose(); okT.dispose(); badT.dispose(); bar.remove(); resolve(v); };
      const mv = e => { if (!locked && e.pointerType === 'mouse' && !down) show(pick(e)); };
      const pd = e => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; if (!locked && e.pointerType !== 'mouse') show(pick(e)); };
      const pu = async e => {
        const d = down; down = null; if (locked || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || Date.now() - d.t > 600) return; const t = pick(e); show(t); if (!t) return;
        if (signs.has(t.idx)) { if (say) say('There is already a Stop Sign here'); return; }
        locked = true; const ok = await confirmDialog({ title: 'Place Stop Sign?', text: 'The first player to pass this spot\nwill be forced to stop.', toolId: 'stop-sign', player: o.player }); locked = false;
        if (ok) finish({ tile: t }); else show(null);
      };
      const kd = e => { if (e.key === 'Escape' && !locked) finish(null); };
      dom.addEventListener('pointermove', mv); dom.addEventListener('pointerdown', pd); dom.addEventListener('pointerup', pu); window.addEventListener('keydown', kd); bar.querySelector('button').onclick = () => finish(null); raf = requestAnimationFrame(tick); o._cancel = () => finish(null);
    }),
    cancel: () => o._cancel && o._cancel()
  };
}

/** Rambu jatuh dari atas lalu menancap (memantul, debu, getaran). Mengembalikan sign (Object3D) yang tetap ada di scene sampai terpicu. */
export function dropStopSign(o) {
  const { scene, tile, model = createStopSignModel } = o, sign = model(), fx = createFx(scene), H = 9, T = 560;
  sign.position.set(tile.x, H, tile.z); scene.add(sign);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.85, 28), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.06; glow.renderOrder = 8; sign.add(glow);
  sign.userData.update = t => { glow.material.opacity = 0.16 + 0.12 * Math.sin(t * 0.004); glow.scale.setScalar(1 + 0.08 * Math.sin(t * 0.004)); };
  let hit = false; fx.add(t => {
    if (t < T) { const k = ease.in(t / T); sign.position.y = H * (1 - k) + 0.02; sign.rotation.y = Math.PI / 4 + (1 - k) * 2.2; }
    else { if (!hit) { hit = true; sign.position.y = 0.02; ringWave(fx, tile.x, tile.z, 0xffffff, 0.9, 520, 0, 0.1); ringWave(fx, tile.x, tile.z, 0xff3b30, 0.7, 640, 80, 0.1); puffs(fx, new THREE.Vector3(tile.x, 0.2, tile.z), 8, { size: 0.9, rise: 0.4, spread: 0.7, life: 700 }); sparks(fx, new THREE.Vector3(tile.x, 0.4, tile.z), [0xffffff, 0xffd23a], 14, { speed: 2.4, up: 2.6, life: 600, size: 0.1 }); }
      const k = (t - T) / 500; sign.rotation.y = Math.PI / 4; sign.scale.set(1 + 0.14 * Math.sin(clamp01(k) * Math.PI) * (1 - k * 0.5), 1 - 0.22 * Math.sin(clamp01(k) * Math.PI), 1 + 0.14 * Math.sin(clamp01(k) * Math.PI)); shake(0.14, t - T, 420); if (t > T + 520) { sign.scale.setScalar(1); return t < T + 900; } }
    return true;
  });
  return fx.run(T + 1500).then(() => sign);
}

/** Pemain menabrak rambu: berhenti paksa dengan rem berdecit, garis kecepatan, tanda STOP!, rambu bergoyang lalu roboh dan hilang. */
export function playForcedStop(o) {
  const { scene, token, sign, dir = new THREE.Vector3(-1, 0, -1), onHit = null } = o, fx = createFx(scene), d = dir.clone().setY(0).normalize(), root = token.root, P = root.position.clone(), base = { y: root.position.y, rx: root.rotation.x, rz: root.rotation.z, s: root.scale.clone() }, END = 2700;
  const side = new THREE.Vector3(-d.z, 0, d.x), up = new THREE.Vector3(0, 1, 0);
  // bekas rem + garis kecepatan
  const marks = [-0.2, 0.2].map(off => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 2.2), new THREE.MeshBasicMaterial({ color: 0x15171b, transparent: true, opacity: 0.6, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(d.x, d.z) + Math.PI; m.position.set(P.x - d.x * 1.1 + side.x * off, 0.045, P.z - d.z * 1.1 + side.z * off); m.renderOrder = 6; fx.root.add(m); return m; });
  const lines = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.05, rnd(1.2, 2.2)), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(d.x, d.z) + Math.PI; const off = rnd(-0.8, 0.8), y = rnd(0.1, 1.3); m.position.set(P.x - d.x * 1.2 + side.x * off, 0.12 + y * 0.0, P.z - d.z * 1.2 + side.z * off); m.userData = { off, d0: rnd(0, 120) }; m.renderOrder = 18; fx.root.add(m); lines.push(m); }
  const stop = burstSprite('STOP!', { fill: '#e5342c', edge: '#ffffff', color: '#ffffff', size: 2.3 }); stop.position.set(P.x, P.y + 2.3, P.z); stop.scale.setScalar(0.001); fx.root.add(stop);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: softMap(), color: 0xff5a4a, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); flash.position.set(P.x, P.y + 1.4, P.z); flash.renderOrder = 40; fx.root.add(flash);
  puffs(fx, new THREE.Vector3(P.x - d.x * 0.3, 0.2, P.z - d.z * 0.3), 9, { size: 0.9, rise: 0.35, spread: 0.7, life: 800 }); ringWave(fx, P.x, P.z, 0xff3b30, 1.1, 600, 0, 0.12); ringWave(fx, P.x, P.z, 0xffffff, 0.8, 500, 100, 0.12);
  if (onHit) { try { onHit(); } catch (e) { } }
  const bd = sign.userData.board || null; let tipped = false;
  fx.add((t, dt) => {
    // bidak: mengerem
    const k = clamp01(t / 700), lunge = Math.sin(k * Math.PI) * 0.32, rock = Math.sin(k * Math.PI * 2.2) * 0.3 * (1 - k);
    root.position.set(P.x + d.x * lunge, base.y, P.z + d.z * lunge); root.rotation.x = base.rx + rock * d.z * -1; root.rotation.z = base.rz + rock * d.x; const sq = Math.sin(clamp01(t / 420) * Math.PI); root.scale.set(base.s.x * (1 + 0.12 * sq), base.s.y * (1 - 0.2 * sq), base.s.z * (1 + 0.12 * sq));
    lines.forEach(m => { const a = clamp01((t - m.userData.d0) / 380); m.material.opacity = 0.75 * Math.sin(a * Math.PI); const adv = ease.out(a) * 2.6; m.position.x = P.x - d.x * 1.2 + d.x * adv + side.x * m.userData.off; m.position.z = P.z - d.z * 1.2 + d.z * adv + side.z * m.userData.off; });
    marks.forEach(m => { m.material.opacity = 0.6 * (1 - clamp01((t - 1600) / 900)); });
    // tulisan STOP!
    const sk = ease.back(t / 300), so = 1 - ease.in((t - 1500) / 450); stop.scale.setScalar(Math.max(0.001, sk * 2.3 * so)); stop.material.rotation = Math.sin(t * 0.03) * 0.1 * (1 - clamp01(t / 700)); stop.position.y = P.y + 2.3 + Math.sin(t * 0.012) * 0.06;
    flash.scale.setScalar(2 + clamp01(t / 300) * 4); flash.material.opacity = 0.5 * (1 - clamp01(t / 300)); shake(0.18, t, 600);
    // rambu: goyang, berdenyut, lalu roboh
    if (t < 1500) { const w = Math.exp(-t / 520); sign.rotation.z = Math.sin(t * 0.03) * 0.34 * w; const pu = 1 + 0.18 * Math.max(0, Math.sin(t * 0.02)) * (t < 900 ? 1 : 0); if (bd) bd.scale.setScalar(pu); sign.userData.update && sign.userData.update(t); }
    else { const f = clamp01((t - 1500) / 520); sign.rotation.z = 1.55 * ease.in(f) + (f >= 1 ? Math.sin((t - 2020) * 0.03) * 0.05 * Math.exp(-(t - 2020) / 160) : 0); if (f >= 1 && !tipped) { tipped = true; puffs(fx, new THREE.Vector3(P.x, 0.2, P.z), 6, { size: 0.8, life: 600 }); shake(0.1, 0); } const out = clamp01((t - 2100) / 450); sign.scale.setScalar(Math.max(0.001, 1 - ease.in(out))); }
    return t < END;
  });
  return fx.run(END + 800).then(() => { root.position.set(P.x, base.y, P.z); root.rotation.x = base.rx; root.rotation.z = base.rz; root.scale.copy(base.s); scene.remove(sign); sign.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material && !(m.material.map && m.material.map._shared)) m.material.dispose && m.material.dispose(); }); });
}

/** Potong jalur langkah pada rambu pertama yang dilewati. path = indeks petak yang akan dilalui (tanpa petak awal); signs = Map(indeks petak -> sign). */
export function truncatePathAtSign(path, signs) {
  for (let i = 0; i < path.length; i++) if (signs.has(path[i])) return { path: path.slice(0, i + 1), hit: signs.get(path[i]), index: path[i], stopped: i + 1 < path.length ? path.length - (i + 1) : 0 };
  return { path: path.slice(), hit: null, index: -1, stopped: 0 };
}
