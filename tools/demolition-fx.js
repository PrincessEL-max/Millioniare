import * as THREE from 'three';

/*
 * Alat DEMOLITION: dialog konfirmasi + animasi penghancuran langsung di lahan (alat berat, bola penghancur, puing, debu, getaran).
 *   if (await confirmDemolition({ mount, kind: 'hotel' })) await playDemolition({ scene, lot: { x, z, w }, building, parts, mode: 'building' | 'lot' });
 *   mode 'building' : rumah/hotel runtuh, lahan tetap ada.
 *   mode 'lot'      : lahan kosong dihancurkan: lantainya pecah berkeping-keping dan tersisa gundukan puing (rubble).
 * Tambahkan demolitionShake ke posisi kamera di loop render agar layar bergetar:  cam.position.add(demolitionShake)
 */
export const demolitionShake = new THREE.Vector3();

/* ---------- suara (WebAudio, dibuat sendiri; tanpa berkas) ---------- */
let AC = null; const actx = () => { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; } return AC; };
function sfxCrash(big) {
  const a = actx(); if (!a) return; const t = a.currentTime, len = Math.floor(a.sampleRate * 1.3), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
  const n = a.createBufferSource(); n.buffer = buf; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(160, t + 1);
  const g = a.createGain(); g.gain.setValueAtTime(big ? 0.9 : 0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.2); n.connect(lp); lp.connect(g); g.connect(a.destination); n.start(t);
  const o = a.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.4); const g2 = a.createGain(); g2.gain.setValueAtTime(0.9, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.55); o.connect(g2); g2.connect(a.destination); o.start(t); o.stop(t + 0.6);
}
function sfxClank() { const a = actx(); if (!a) return; const t = a.currentTime; [520, 790].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18 + i * 0.05); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.3); }); }
function sfxEngine(ms) { const a = actx(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t); o.frequency.linearRampToValueAtTime(64, t + ms / 1000); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.15); g.gain.linearRampToValueAtTime(0.0001, t + ms / 1000); const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; o.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t); o.stop(t + ms / 1000 + 0.05); }

/* ---------- derek + bola penghancur ---------- */
const L = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
function makeCrane() {
  const root = new THREE.Group(), yel = L(0xf2b01e), dk = L(0x34373d), gr = L(0x6a6f78), M = (g, m, x, y, z, p = root) => { const s = new THREE.Mesh(g, m); s.position.set(x, y, z); p.add(s); return s; };
  [-0.42, 0.42].forEach(z => { M(new THREE.BoxGeometry(2, 0.3, 0.42), dk, 0, 0.15, z); M(new THREE.CylinderGeometry(0.15, 0.15, 0.44, 12), gr, -0.8, 0.15, z).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.15, 0.15, 0.44, 12), gr, 0.8, 0.15, z).rotation.x = Math.PI / 2; });
  M(new THREE.BoxGeometry(1.5, 0.22, 1.1), dk, 0, 0.42, 0); M(new THREE.BoxGeometry(1.2, 0.7, 0.95), yel, -0.1, 0.88, 0); M(new THREE.BoxGeometry(0.5, 0.42, 0.7), L(0x7ac0f0), 0.5, 1.0, 0).scale.set(1, 1, 1); M(new THREE.BoxGeometry(0.55, 0.5, 0.95), dk, -0.85, 0.82, 0);
  const boom = new THREE.Group(); boom.position.set(0.15, 1.15, 0); boom.rotation.z = 0.66; root.add(boom); const bl = 3.7;
  [-0.14, 0.14].forEach(z => M(new THREE.BoxGeometry(bl, 0.1, 0.07), yel, bl / 2, 0, z, boom)); for (let i = 0; i < 9; i++) { const b = M(new THREE.BoxGeometry(0.5, 0.05, 0.05), dk, 0.25 + i * 0.4, 0, 0, boom); b.rotation.x = (i % 2 ? 1 : -1) * 0.9; b.scale.set(1, 1, 1); b.position.z = 0; }
  const tip = new THREE.Group(); tip.position.set(0.15 + Math.cos(0.66) * bl, 1.15 + Math.sin(0.66) * bl, 0); root.add(tip);
  M(new THREE.SphereGeometry(0.1, 10, 8), gr, 0, 0, 0, tip);
  const pend = new THREE.Group(); tip.add(pend); const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), L(0x22242a)); pend.add(chain);
  const ball = new THREE.Group(); pend.add(ball); M(new THREE.SphereGeometry(0.42, 22, 16), new THREE.MeshStandardMaterial({ color: 0x2c2f35, roughness: 0.35, metalness: 0.7 }), 0, 0, 0, ball); M(new THREE.SphereGeometry(0.09, 8, 6), L(0xdfe3ea), 0.18, 0.2, 0.28, ball); M(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8), gr, 0, 0.46, 0, ball);
  const setLen = len => { chain.scale.y = len; chain.position.y = -len / 2; ball.position.y = -len - 0.38; };
  setLen(2.4); return { root, pend, ball, setLen, tipX: tip.position.x, tipY: tip.position.y };
}
let DUST = null; const dustTex = () => DUST || (DUST = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(0.5, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })());
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3), rnd = (a, b) => a + Math.random() * (b - a);

export function playDemolition(o) {
  const { scene, lot, building = null, parts = [], mode = building ? 'building' : 'lot', sound = true, rubble = true, floorY = 0.16, onImpact = null } = o;
  const cx = lot.x, cz = lot.z, w = lot.w || 2, big = mode === 'building' && building && w >= 4, crane = makeCrane(), dir = new THREE.Vector3(1, 0, -1).normalize(), spawned = [], pieces = [], dust = [], tmp = new THREE.Vector3();
  const root = new THREE.Group(); scene.add(root); root.add(crane.root); crane.root.rotation.y = Math.PI / 4;
  const hb = building ? (() => { const b = new THREE.Box3().setFromObject(building); return Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2; })() : w / 2 * 0.8;
  // posisi derek: bola menumbuk sisi bangunan (mode building) atau jatuh tepat di tengah lahan (mode lot)
  const L0 = 2.5, PHI = 0.7, impactX = crane.tipX + Math.sin(PHI) * L0, rootDist = mode === 'lot' ? crane.tipX : impactX + hb - 0.15;
  const final = new THREE.Vector3(cx, 0.02, cz).addScaledVector(dir, -rootDist), start = final.clone().addScaledVector(dir, -9);
  crane.root.position.copy(start); crane.setLen(L0);
  const T = mode === 'lot' ? { enter: 700, wind: 1250, hit: 1560 } : { enter: 700, wind: 1300, hit: 1620 }, END = T.hit + 2300;
  let impacted = false, t0 = performance.now(), soundEngine = false; const shardMat = c => new THREE.MeshLambertMaterial({ color: c });
  function addPiece(mesh, v, wv, life) { pieces.push({ m: mesh, v, w: wv, rest: 0, bounces: 0, r: mesh.userData.r || 0.15, life }); }
  function puff(x, y, z, size, delay) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex(), color: 0xe6dfd0, transparent: true, opacity: 0, depthWrite: false })); s.position.set(x, y, z); s.scale.setScalar(0.1); root.add(s); dust.push({ s, x, y, z, size, delay, vy: rnd(0.5, 1.1), vx: rnd(-0.6, 0.6), vz: rnd(-0.6, 0.6) }); }
  const impactPt = new THREE.Vector3(cx, floorY + 0.8, cz);
  function explodeBuilding() {
    building.updateMatrixWorld(true); const ms = [], colors = [], bb = new THREE.Box3().setFromObject(building); building.traverse(m => { if (m.isMesh) { ms.push(m); const c = m.material && m.material.color; if (c) colors.push(c.getHex()); } });
    ms.forEach(m => {
      m.geometry.computeBoundingSphere(); const c = m.localToWorld(m.geometry.boundingSphere.center.clone()), sc = new THREE.Vector3(); m.getWorldScale(sc); const r = m.geometry.boundingSphere.radius * Math.max(sc.x, sc.y, sc.z);
      scene.attach(m); m.userData.r = r; const away = tmp.set(c.x - cx, 0, c.z - cz); const hor = away.length() < 0.01 ? new THREE.Vector3(rnd(-1, 1), 0, rnd(-1, 1)) : away.clone().normalize(), sp = rnd(0.8, 3.2) / (1 + r * 1.2) * (big ? 1.2 : 1);
      addPiece(m, new THREE.Vector3(hor.x * sp + dir.x * 1.4 + rnd(-0.6, 0.6), rnd(1.5, 5) * (0.6 + (c.y - bb.min.y) / Math.max(1, bb.max.y - bb.min.y)), hor.z * sp + dir.z * 1.4 + rnd(-0.6, 0.6)), new THREE.Vector3(rnd(-4, 4), rnd(-3, 3), rnd(-4, 4)) , END - T.hit);
    });
    scene.remove(building); const pal = colors.length ? colors : [0xd8d2c4, 0x9a9488, 0xb4553a];
    for (let i = 0; i < (big ? 56 : 36); i++) { const s = rnd(0.07, 0.26), m = new THREE.Mesh(new THREE.BoxGeometry(s, s * rnd(0.5, 1.2), s * rnd(0.6, 1.4)), shardMat(Math.random() < 0.3 ? 0xd8d2c4 : pal[Math.floor(Math.random() * pal.length)])); m.position.set(cx + rnd(-hb, hb), floorY + rnd(0.1, Math.max(0.6, bb.max.y - bb.min.y) * 0.7), cz + rnd(-hb, hb)); m.userData.r = s * 0.7; scene.add(m); spawned.push(m); addPiece(m, new THREE.Vector3(rnd(-3, 3) + dir.x * 1.2, rnd(1, 5), rnd(-3, 3) + dir.z * 1.2), new THREE.Vector3(rnd(-8, 8), rnd(-8, 8), rnd(-8, 8)), END - T.hit); }
    for (let i = 0; i < (big ? 16 : 11); i++) puff(cx + rnd(-hb, hb), floorY + rnd(0.05, 0.7), cz + rnd(-hb, hb), rnd(1.4, big ? 3.6 : 2.8), rnd(0, 380));
  }
  function shatterLot() {
    parts.forEach(p => { if (p) p.visible = false; }); const n = w >= 4 ? 9 : 6, cell = w / n, golds = [0xf7b52e, 0xe89d1c, 0xffd25a, 0xf2a21f];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = cx - w / 2 + (i + 0.5) * cell, z = cz - w / 2 + (j + 0.5) * cell, edge = i === 0 || j === 0 || i === n - 1 || j === n - 1, m = new THREE.Mesh(new THREE.BoxGeometry(cell * 0.92, 0.07, cell * 0.92), shardMat(edge ? 0xf2d99c : golds[(i * 3 + j) % 4]));
      m.position.set(x, floorY - 0.02, z); m.userData.r = cell * 0.4; scene.add(m); spawned.push(m); const d = tmp.set(x - cx, 0, z - cz), dl = d.length() + 0.001, sp = 2.2 + 2.6 / (1 + dl);
      addPiece(m, new THREE.Vector3(d.x / dl * sp + rnd(-0.5, 0.5), rnd(3, 7.5) / (1 + dl * 0.35), d.z / dl * sp + rnd(-0.5, 0.5)), new THREE.Vector3(rnd(-7, 7), rnd(-5, 5), rnd(-7, 7)), END - T.hit);
    }
    for (let i = 0; i < 12; i++) puff(cx + rnd(-w / 2, w / 2), floorY + rnd(0.05, 0.3), cz + rnd(-w / 2, w / 2), rnd(1.2, 2.6), rnd(0, 300));
  }
  let ring = null;
  function impact() {
    impacted = true; if (sound) { sfxClank(); sfxCrash(mode === 'building'); }
    if (mode === 'building') explodeBuilding(); else shatterLot();
    ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.34, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, floorY + 0.04, cz); root.add(ring);
    if (onImpact) { try { onImpact(); } catch (e) { } }
  }
  return new Promise(resolve => {
    const FLOOR = floorY;
    function frame(now) {
      const t = now - t0, dt = Math.min(0.033, (now - (frame.last || now)) / 1000 || 0.016); frame.last = now;
      // derek masuk dan keluar
      const inK = ease(t / T.enter), outK = ease((t - (T.hit + 900)) / 800); crane.root.position.lerpVectors(start, final, inK).addScaledVector(dir, -9 * outK);
      if (sound && !soundEngine && t > 30) { soundEngine = true; sfxEngine(T.hit + 300); }
      // ayunan bola
      if (mode === 'building') {
        let phi = 0; if (t < T.enter) phi = 0.02; else if (t < T.wind) phi = -0.55 * ease((t - T.enter) / (T.wind - T.enter));
        else if (t < T.hit) { const k = (t - T.wind) / (T.hit - T.wind); phi = -0.55 + (PHI + 0.55) * k * k; }
        else { const k = (t - T.hit) / 700; phi = PHI - (PHI + 0.2) * ease(k) + Math.sin(k * 9) * 0.08 * (1 - Math.min(1, k)); }
        crane.pend.rotation.z = phi; crane.setLen(L0);
      } else {
        let len = L0; if (t < T.enter) len = 1.1; else if (t < T.wind) len = 1.1 - 0.35 * ease((t - T.enter) / (T.wind - T.enter)); else if (t < T.hit) { const k = (t - T.wind) / (T.hit - T.wind); len = 0.75 + (crane.tipY - FLOOR - 0.38 - 0.75) * k * k; } else len = crane.tipY - FLOOR - 0.38 - 0.5 * ease((t - T.hit) / 600);
        crane.pend.rotation.z = 0; crane.setLen(len);
      }
      if (!impacted && t >= T.hit) impact();
      // fisika puing
      pieces.forEach(p => {
        if (p.rest) { return; } const m = p.m; p.v.y -= 18 * dt; m.position.addScaledVector(p.v, dt); m.rotation.x += p.w.x * dt; m.rotation.y += p.w.y * dt; m.rotation.z += p.w.z * dt;
        const low = FLOOR + Math.min(p.r * 0.45, 0.25); if (m.position.y < low && p.v.y < 0) { m.position.y = low; if (p.bounces < 2) { p.v.y *= -0.28; p.v.x *= 0.6; p.v.z *= 0.6; p.w.multiplyScalar(0.5); p.bounces++; } else { p.v.set(0, 0, 0); p.w.set(0, 0, 0); p.rest = 1; } }
        const k = (t - T.hit) / (END - T.hit); if (k > 0.78) { const s = Math.max(0.001, 1 - (k - 0.78) / 0.22); m.scale.setScalar(Math.max(0.001, s * (p.s0 || (p.s0 = m.scale.x)))); }
      });
      dust.forEach(d => { const k = (t - T.hit - d.delay) / 1500; if (k < 0) return; const e = Math.min(1, k); d.s.material.opacity = Math.max(0, 0.7 * (1 - e) * Math.min(1, k * 8)); d.s.scale.setScalar(0.3 + d.size * ease(e)); d.s.position.set(d.x + d.vx * e, d.y + d.vy * e, d.z + d.vz * e); });
      if (ring) { const k = (t - T.hit) / 600; ring.scale.setScalar(1 + k * (w * 3.2)); ring.material.opacity = Math.max(0, 0.8 * (1 - k)); if (k >= 1) { root.remove(ring); ring.geometry.dispose(); ring.material.dispose(); ring = null; } }
      // getaran layar
      if (impacted) { const k = (t - T.hit) / 1000, a = Math.max(0, 1 - k) * (mode === 'building' ? 0.26 : 0.18); demolitionShake.set(Math.sin(t * 0.09) * a, Math.cos(t * 0.11) * a * 0.7, Math.sin(t * 0.07 + 1) * a); } else demolitionShake.set(0, 0, 0);
      if (t < END) { requestAnimationFrame(frame); return; }
      // selesai
      demolitionShake.set(0, 0, 0); scene.remove(root); root.traverse(x => { if (x.geometry) x.geometry.dispose(); }); let rb = null;
      pieces.forEach(p => { scene.remove(p.m); if (p.m.userData.r && spawned.includes(p.m)) { p.m.geometry.dispose(); p.m.material.dispose(); } }); 
      if (mode === 'lot' && rubble) rb = makeRubble(scene, cx, cz, w, floorY);
      resolve({ mode, rubble: rb });
    }
    requestAnimationFrame(frame);
  });
}
/** Gundukan puing sisa lahan yang dihancurkan (tanah gelap + batu kecil). Dikembalikan agar game bisa menyimpannya. */
export function makeRubble(scene, cx, cz, w, floorY = 0.16) {
  const g = new THREE.Group(); g.name = 'Rubble'; const soil = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.5, w * 0.53, 0.07, 14), L(0x7a6650)); soil.position.set(0, floorY - 0.04, 0); soil.rotation.y = Math.random() * 6; g.add(soil);
  const mats = [L(0x8a8780), L(0x6f6c66), L(0xb4553a), L(0xd8d2c4), L(0xf2b52e)];
  for (let i = 0; i < (w >= 4 ? 26 : 14); i++) { const r = rnd(0.07, 0.2), m = new THREE.Mesh(i % 4 === 3 ? new THREE.BoxGeometry(r * 1.6, r * 0.5, r * 1.2) : new THREE.DodecahedronGeometry(r, 0), mats[i % mats.length]); const a = Math.random() * 6.28, d = Math.random() * (w * 0.42); m.position.set(Math.cos(a) * d, floorY + r * 0.3, Math.sin(a) * d); m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); g.add(m); }
  g.position.set(cx, 0, cz); scene.add(g); return g;
}

/* ---------- konfirmasi ---------- */
const DM_STYLE = `
.dm-veil{position:absolute;inset:0;z-index:80;background:rgba(30,36,48,.5);display:flex;align-items:center;justify-content:center;animation:dm-fade .15s;font-family:"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif;-webkit-user-select:none;user-select:none}
@keyframes dm-fade{from{opacity:0}to{opacity:1}}
.dm-card{width:min(88vw,560px);box-sizing:border-box;padding:clamp(18px,3.4vmin,30px) clamp(18px,3.6vmin,34px) clamp(16px,3vmin,26px);border-radius:clamp(22px,4vmin,36px);background:linear-gradient(#aab4bf,#c9d0d8);box-shadow:inset 0 3px 0 rgba(255,255,255,.5),0 14px 30px rgba(0,0,0,.4);text-align:center;color:#fff;animation:dm-pop .2s ease-out}
@keyframes dm-pop{from{transform:scale(.94);opacity:0}to{transform:none;opacity:1}}
.dm-ico{width:clamp(72px,16vmin,112px);height:clamp(72px,16vmin,112px);margin:0 auto 6px;display:block;filter:drop-shadow(0 4px 3px rgba(0,0,0,.25))}
.dm-t{margin:0 0 6px;font-size:clamp(26px,6vmin,44px);line-height:1.1;font-style:italic;font-weight:900;letter-spacing:.03em;-webkit-text-stroke:2px #6b7380;paint-order:stroke fill;text-shadow:0 3px 0 rgba(60,68,80,.6)}
.dm-p{margin:0;font-size:clamp(15px,3.4vmin,22px);line-height:1.3;font-weight:700;font-style:italic;text-shadow:0 2px 0 rgba(80,88,100,.8)}
.dm-b{display:flex;gap:clamp(26px,7vmin,60px);justify-content:center;margin-top:clamp(12px,2.6vmin,22px)}
.dm-b button{width:clamp(64px,14vmin,96px);height:clamp(64px,14vmin,96px);border:0;background:none;padding:0;cursor:pointer;transition:transform .1s;-webkit-tap-highlight-color:transparent}.dm-b button:hover{transform:scale(1.07)}.dm-b button:active{transform:scale(.92)}.dm-b button:focus-visible{outline:3px solid #fff;border-radius:50%}.dm-b svg{display:block;width:100%;height:100%}
@media (prefers-reduced-motion:reduce){.dm-veil,.dm-card{animation:none}}`;
const DM_ICON = `<svg class="dm-ico" viewBox="0 0 120 120" aria-hidden="true"><rect x="10" y="96" width="62" height="14" rx="6" fill="#34373d"/><rect x="16" y="68" width="38" height="30" rx="4" fill="#f2b01e" stroke="#8a5a00" stroke-width="3"/><rect x="38" y="74" width="12" height="12" fill="#7ac0f0"/><path d="M40 66 L92 14" stroke="#f2b01e" stroke-width="9" stroke-linecap="round"/><path d="M40 66 L92 14" stroke="#8a5a00" stroke-width="2" stroke-dasharray="6 6"/><path d="M92 14 V70" stroke="#22242a" stroke-width="4"/><circle cx="92" cy="82" r="17" fill="#2c2f35" stroke="#111" stroke-width="3"/><circle cx="86" cy="76" r="5" fill="#dfe3ea" opacity=".8"/></svg>`;
const DM_OK = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="dmBk" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#1f6fd8"/></radialGradient></defs><circle cx="50" cy="55" r="42" fill="#0e3f8a" opacity=".35"/><circle cx="50" cy="50" r="42" fill="url(#dmBk)" stroke="#0e3f8a" stroke-width="5"/><ellipse cx="50" cy="31" rx="29" ry="14" fill="#fff" opacity=".35"/><path d="M30 52 L45 66 L72 36" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const DM_NO = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="dmRd" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#ff9a92"/><stop offset="1" stop-color="#d8342c"/></radialGradient></defs><circle cx="50" cy="55" r="42" fill="#7a1410" opacity=".35"/><circle cx="50" cy="50" r="42" fill="url(#dmRd)" stroke="#7a1410" stroke-width="5"/><ellipse cx="50" cy="31" rx="29" ry="14" fill="#fff" opacity=".35"/><path d="M34 34 L66 66 M66 34 L34 66" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/></svg>`;
let dmStyled = false;
/** Konfirmasi sebelum menghancurkan. kind: 'house' | 'hotel' | 'lot'. Mengembalikan true bila pemain menyetujui. */
export function confirmDemolition(o = {}) {
  const { mount = document.body, kind = 'house', owner = '', title = 'Demolish?', texts = {} } = o;
  const TX = Object.assign({ house: 'This house will be destroyed. You cannot undo this.', hotel: 'This hotel will be destroyed. You cannot undo this.', lot: 'This empty lot will be destroyed for good. You cannot undo this.' }, texts);
  if (!dmStyled) { dmStyled = true; const st = document.createElement('style'); st.id = 'dm-style'; st.textContent = DM_STYLE; document.head.appendChild(st); }
  const v = document.createElement('div'); v.className = 'dm-veil'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  v.innerHTML = `<div class="dm-card">${DM_ICON}<h2 class="dm-t">${esc(title)}</h2><p class="dm-p">${esc(TX[kind] || TX.house)}${owner ? `<br>Owner: ${esc(owner)}` : ''}</p><div class="dm-b"><button data-r="1" aria-label="Demolish">${DM_OK}</button><button data-r="0" aria-label="Cancel">${DM_NO}</button></div></div>`;
  mount.appendChild(v); v.querySelector('button').focus();
  return new Promise(resolve => {
    const end = r => { window.removeEventListener('keydown', kd); v.remove(); resolve(r); }, kd = e => { if (e.key === 'Escape') end(false); else if (e.key === 'Enter') end(true); };
    window.addEventListener('keydown', kd); v.querySelectorAll('button').forEach(b => b.addEventListener('click', () => end(b.dataset.r === '1'))); v.addEventListener('pointerdown', e => { if (e.target === v) end(false); });
  });
}
