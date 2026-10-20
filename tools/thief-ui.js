import * as THREE from 'three';
import { createFx, ease, rnd, clamp01, labelSprite, burstSprite, exclaimSprite, puffs, sparks, billMesh, ringWave, shake, screenRight } from './fx-kit.js';
import { confirmThiefDialog } from './confirm-dialog.js';
import { avatarPortraitSVG } from '../ui/avatar-portraits.js';

/*
 * Alat THIEF: ambil 25% uang yang DIBAWA lawan (bukan tabungan).
 *   const r = await pickThiefTarget({ dom, camera, scene, mount, tokens, thiefId, focusTo }).promise;   // token target atau null
 *   await playHeist({ scene, thief, victim, amount, actor, onSnatch });
 * tokens = [{ id, name, type, color, cash, root: Object3D (bidak di papan) }]
 * Uang yang dibawa HANYA tampil di dekat kaki pemain saat kamera difokuskan ke pemain itu (pusat layar), dan tidak tampil pada kamera biasa.
 */
const TH_STYLE = `
.th-root{position:absolute;inset:0;container-type:size;--u:min(1cqh,.6cqw);z-index:70;pointer-events:none;font-family:"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif}
.th-top{position:absolute;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);max-width:92%;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;background:rgba(20,24,34,.9);color:#fff;font:800 13px system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.35);pointer-events:auto;animation:th-in .2s ease-out}
.th-top button{border:0;border-radius:50%;width:30px;height:30px;flex:none;background:#e5342c;color:#fff;font:900 16px system-ui;cursor:pointer;padding:0}
@keyframes th-in{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
.th-tag{position:absolute;left:0;top:0;display:flex;align-items:center;gap:calc(var(--u)*1);padding:calc(var(--u)*.8) calc(var(--u)*2.4) calc(var(--u)*.8) calc(var(--u)*1.2);border-radius:999px;background:rgba(18,64,32,.88);border:calc(var(--u)*.4) solid #7dff9a;color:#fff;font-size:calc(var(--u)*4.4);font-weight:900;font-style:italic;letter-spacing:.03em;white-space:nowrap;box-shadow:0 calc(var(--u)*.6) calc(var(--u)*1.4) rgba(0,0,0,.35);will-change:transform,opacity;visibility:hidden}
.th-tag svg{width:calc(var(--u)*5.4);height:calc(var(--u)*5.4);flex:none}
.th-tag.sel{border-color:#ff5a4a;background:rgba(90,16,12,.9)}
.th-chips{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:10px;pointer-events:auto}
.th-chip{display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:rgba(20,24,34,.82);color:#fff;border-radius:14px;padding:6px 10px 5px;font:800 11px system-ui;cursor:pointer;-webkit-tap-highlight-color:transparent}.th-chip:active{transform:scale(.95)}
.th-chip svg{width:38px;height:38px;display:block}
@media (prefers-reduced-motion:reduce){.th-top{animation:none}}`;
const BILL = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="9" width="30" height="18" rx="3" fill="#3fb561" stroke="#e6ffe9" stroke-width="2"/><circle cx="18" cy="18" r="5" fill="#cfffd8"/><text x="18" y="21.5" font-size="9" font-weight="900" text-anchor="middle" fill="#1f7a3a" font-family="Arial">$</text><rect x="8" y="14" width="30" height="18" rx="3" fill="#4fcf72" stroke="#e6ffe9" stroke-width="2" opacity=".9"/><circle cx="23" cy="23" r="5" fill="#d8ffe0"/><text x="23" y="26.5" font-size="9" font-weight="900" text-anchor="middle" fill="#1f7a3a" font-family="Arial">$</text></svg>`;
let thStyled = false;

export function pickThiefTarget(o) {
  const { dom, camera, scene, tokens, thiefId, mount = document.body, rate = 0.25, focusRadius = 0.17, fadeRadius = 0.3, minZoom = 0, focusTo = null, say = null, hint = 'Move the camera to a rival to see their cash. Tap to rob.' } = o;
  if (!thStyled) { thStyled = true; const st = document.createElement('style'); st.id = 'th-style'; st.textContent = TH_STYLE; document.head.appendChild(st); }
  const enemies = tokens.filter(t => t.id !== thiefId), root = document.createElement('div'); root.className = 'th-root';
  root.innerHTML = `<div class="th-top"><span></span><button aria-label="Cancel">✕</button></div><div class="th-tags"></div>${focusTo ? '<div class="th-chips"></div>' : ''}`; mount.appendChild(root);
  root.querySelector('.th-top span').textContent = hint; const tagsEl = root.querySelector('.th-tags'), tags = new Map();
  enemies.forEach(t => { const e = document.createElement('div'); e.className = 'th-tag'; e.innerHTML = BILL + '<span>$' + t.cash + '</span>'; tagsEl.appendChild(e); tags.set(t.id, e); });
  const chips = root.querySelector('.th-chips'); if (chips) enemies.forEach(t => { const b = document.createElement('button'), name = document.createElement('span'); b.className = 'th-chip'; b.innerHTML = avatarPortraitSVG(t.type || 'princess', t.color || '#888'); name.textContent = t.name; b.appendChild(name); b.onclick = () => focusTo(t); chips.appendChild(b); });
  // penanda target: cincin tanah + siku bidik berputar + panah, dan rona merah pada model
  let sel = null, marker = null, tint = [], done = false, raf = 0, down = null; const tmpV = new THREE.Vector3(), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function mkMarker() {
    const g = new THREE.Group(), mat = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.95, depthTest: false, side: THREE.DoubleSide }); g.renderOrder = 40;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.74, 40), mat(0xff3b30)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.2; g.add(ring);
    const br = new THREE.Group(); for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.09), mat(0xffd23a)); a.position.set(0.95, 0.21, 0); const p = new THREE.Group(); p.rotation.y = i * Math.PI / 2; p.add(a); br.add(p); a.rotation.x = -Math.PI / 2; } g.add(br);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 4), mat(0xff3b30)); arrow.rotation.x = Math.PI; g.add(arrow); const lab = labelSprite('TARGET', { color: '#ff5a4a', stroke: '#fff', size: 0.34 }); g.add(lab);
    g.userData = { ring, br, arrow, lab }; [ring, arrow, ...br.children.map(p => p.children[0])].forEach(m => { m.renderOrder = 40; }); return g;
  }
  function tintOn(root3) { tint = []; root3.traverse(m => { const ms = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : []; ms.forEach(x => { if (x.emissive && !tint.some(r => r.m === x)) tint.push({ m: x, c: x.emissive.clone(), i: x.emissiveIntensity }); }); }); }
  function tintOff() { tint.forEach(r => { r.m.emissive.copy(r.c); r.m.emissiveIntensity = r.i; }); tint = []; }
  function select(t) { deselect(); sel = t; marker = mkMarker(); scene.add(marker); tintOn(t.root); }
  function deselect() { tintOff(); if (marker) { scene.remove(marker); marker.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) { if (m.material.map) m.material.map.dispose(); m.material.dispose(); } }); marker = null; } sel = null; }
  function frame() {
    if (done) return; raf = requestAnimationFrame(frame); const r = dom.getBoundingClientRect(), mn = Math.min(r.width, r.height), cx = r.width / 2, cy = r.height / 2, now = performance.now();
    enemies.forEach(t => {
      const e = tags.get(t.id); t.root.getWorldPosition(tmpV); tmpV.project(camera); const sx = (tmpV.x + 1) / 2 * r.width, sy = (1 - tmpV.y) / 2 * r.height, d = Math.hypot(sx - cx, sy - cy) / mn;
      let vis = clamp01((fadeRadius - d) / (fadeRadius - focusRadius)); if (camera.zoom < minZoom) vis = 0; if (sel === t) vis = 1;
      e.style.visibility = vis > 0.02 ? 'visible' : 'hidden'; e.style.opacity = vis.toFixed(2); e.classList.toggle('sel', sel === t); e.style.transform = `translate(${sx.toFixed(1)}px,${(sy + 8).toFixed(1)}px) translate(-50%,0) scale(${(0.85 + vis * 0.15).toFixed(2)})`;
    });
    if (sel && marker) { sel.root.getWorldPosition(marker.position); const u = marker.userData, k = now * 0.001; u.br.rotation.y = k * 1.6; const p = 1 + 0.1 * Math.sin(k * 6); u.ring.scale.setScalar(p); u.arrow.position.y = 2.15 + Math.sin(k * 5) * 0.12; u.lab.position.y = 2.7; tint.forEach(rr => { rr.m.emissive.setRGB(1, 0.12, 0.1); rr.m.emissiveIntensity = 0.45 + 0.3 * Math.sin(k * 7); }); }
  }
  const owner = new Map(); const rootsList = enemies.map(t => { owner.set(t.root, t); return t.root; });
  const hit = e => { const r = dom.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(rootsList, true)[0]; if (!h) return null; let o3 = h.object; while (o3 && !owner.has(o3)) o3 = o3.parent; return o3 ? owner.get(o3) : null; };
  return {
    promise: new Promise(resolve => {
      const finish = v => { if (done) return; done = true; cancelAnimationFrame(raf); dom.removeEventListener('pointerdown', pd); dom.removeEventListener('pointerup', pu); window.removeEventListener('keydown', kd); deselect(); root.remove(); resolve(v); };
      const pd = e => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; };
      const pu = async e => {
        const d = down; down = null; if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || Date.now() - d.t > 600 || busy) return; const t = hit(e); if (!t) return;
        const amt = Math.floor(t.cash * rate); if (amt <= 0) { if (say) say(t.name + ' carries no cash'); return; }
        busy = true; select(t); const ok = await confirmThiefDialog({ title: t.name, amount: amt, rate, player: tokens.find(token => token.id === thiefId) }); busy = false;
        if (ok) finish({ token: t, amount: amt }); else deselect();
      };
      let busy = false; const kd = e => { if (e.key === 'Escape' && !busy) finish(null); };
      dom.addEventListener('pointerdown', pd); dom.addEventListener('pointerup', pu); window.addEventListener('keydown', kd); root.querySelector('.th-top button').onclick = () => finish(null); raf = requestAnimationFrame(frame); o._cancel = () => finish(null);
    }),
    cancel: () => o._cancel && o._cancel()
  };
}

/* ---------- perampokan ---------- */
function fallbackRobber() {
  const g = new THREE.Group(), L = (c) => new THREE.MeshLambertMaterial({ color: c }), add = (geo, m, x, y, z) => { const s = new THREE.Mesh(geo, m); s.position.set(x, y, z); g.add(s); return s; };
  add(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 12), L(0x34363c), 0, 1.3, 0); add(new THREE.SphereGeometry(0.62, 16, 12), L(0xf0c8a0), 0, 2.6, 0); add(new THREE.BoxGeometry(1.1, 0.26, 0.9), L(0x111111), 0, 2.62, 0.1); add(new THREE.SphereGeometry(0.64, 14, 10, 0, 6.3, 0, 1.2), L(0x2a2a30), 0, 2.72, 0); add(new THREE.SphereGeometry(0.5, 12, 10), L(0xc9a46a), 0.8, 1.2, -0.1); return g;
}
export function playHeist(o) {
  const { scene, thief, victim, amount, onSnatch = null, onGive = null, actorYaw = 0 } = o, fx = createFx(scene), actor = o.actor || fallbackRobber(), as = o.actorScale || (o.actor ? 0.3 : 0.3);
  const vr = victim.root, hr = thief.root, V = vr.position.clone(), H = hr.position.clone(), vBase = { y: vr.position.y, ry: vr.rotation.y, s: vr.scale.clone() }, hBase = { y: hr.position.y, s: hr.scale.clone() };
  const start = V.clone().addScaledVector(screenRight, -9), mid = V.clone().addScaledVector(screenRight, -0.85), hN = H.clone().addScaledVector(screenRight, -0.8), bag = new THREE.Vector3();
  actor.scale.setScalar(as); actor.position.copy(start); actor.visible = true; fx.root.add(actor);
  const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z) + actorYaw;
  const SN = 1050, GIVE = 2650, ARR = 3450, END = 3950; let snatched = false, gave = false, puffT = 0;
  const ex = exclaimSprite(0.9); ex.position.set(V.x, V.y + 2.0, V.z); ex.scale.multiplyScalar(0.001); fx.root.add(ex); const exS = exclaimSprite(0.9).scale.clone();
  const burst = burstSprite('SNATCH!', { size: 2.0 }); burst.position.set(V.x, V.y + 1.7, V.z); burst.scale.setScalar(0.001); burst.visible = false; fx.root.add(burst);
  const minus = labelSprite('-$' + amount, { color: '#ff5a4a', stroke: '#fff', size: 0.7 }), plus = labelSprite('+$' + amount, { color: '#5dff7a', stroke: '#0d3b1a', size: 0.7 }), mS = minus.scale.clone(), pS = plus.scale.clone();
  minus.scale.setScalar(0.001); plus.scale.setScalar(0.001); fx.root.add(minus, plus);
  const n = Math.max(8, Math.min(26, Math.round(6 + amount / 6))), bills = [];
  for (let i = 0; i < n; i++) { const m = billMesh(0.4); m.visible = false; fx.root.add(m); bills.push({ m, v: new THREE.Vector3(), p: new THREE.Vector3(), d: rnd(350, 800), t0: 0, ok: false }); }
  fx.add((t, dt) => {
    // korban kaget
    const hop = t < 900 ? Math.abs(Math.sin(t * 0.012)) * 0.35 * (1 - t / 900) : 0, spin = ease.out((t - SN) / 520) * Math.PI * 2, sq = clamp01((t - SN) / 380);
    vr.position.y = vBase.y + hop; vr.rotation.y = vBase.ry + (t < SN ? Math.sin(t * 0.04) * 0.25 * (t < 800 ? 1 : 0) : spin);
    vr.scale.set(vBase.s.x * (1 + 0.15 * Math.sin(sq * Math.PI)), vBase.s.y * (1 - 0.2 * Math.sin(sq * Math.PI)), vBase.s.z * (1 + 0.15 * Math.sin(sq * Math.PI)));
    ex.scale.copy(exS).multiplyScalar(Math.max(0.001, ease.back(t / 260)) * (1 - ease.in((t - 800) / 250)) ); ex.position.y = V.y + 2.0 + Math.sin(t * 0.02) * 0.05;
    // pencuri berlari
    if (t > 150 && t < GIVE) {
      let a = actor.position;
      if (t < SN - 50) { const k = ease.out((t - 150) / 850); a.lerpVectors(start, mid, k); a.y = V.y + Math.abs(Math.sin(k * Math.PI * 6)) * 0.22 * (1 - k * 0.4); actor.rotation.y = yawTo(start, mid); puffT += dt; if (puffT > 0.1) { puffT = 0; puffs(fx, new THREE.Vector3(a.x, V.y + 0.15, a.z), 2, { size: 0.7, rise: 0.3, spread: 0.3, life: 600 }); } }
      else if (t < SN + 700) { a.copy(mid); a.y = V.y + 0.05; actor.rotation.y = yawTo(mid, V); }
    }
    if (t >= SN && !snatched) {
      snatched = true; burst.visible = true; shake(0.2, 0); ringWave(fx, V.x, V.z, 0xffd23a, 1.5, 600); sparks(fx, new THREE.Vector3(V.x, V.y + 1.2, V.z), [0xffffff, 0xffd23a], 18, { speed: 3, up: 3.2, life: 800 });
      bills.forEach((b, i) => { b.p.set(V.x + rnd(-0.2, 0.2), V.y + 0.8, V.z + rnd(-0.2, 0.2)); b.v.set(rnd(-2.2, 2.2), rnd(2.6, 5.2), rnd(-2.2, 2.2)); b.m.position.copy(b.p); b.m.visible = true; b.t0 = t; }); if (onSnatch) { try { onSnatch(); } catch (e) { } }
    }
    if (snatched) {
      shake(0.2, t - SN, 600); const bk = clamp01((t - SN) / 280), bo = 1 - ease.in((t - SN - 650) / 250); burst.scale.setScalar(Math.max(0.001, ease.back(bk) * 2.0 * bo)); burst.position.y = V.y + 1.7 + (t - SN) * 0.0003; burst.material.rotation = Math.sin(t * 0.01) * 0.12;
      bag.set(actor.position.x, actor.position.y + 0.9 * as / 0.3, actor.position.z);
      bills.forEach(b => { if (!b.m.visible) return; const k = t - b.t0;
        if (k < b.d) { b.v.y -= 12 * dt; b.p.addScaledVector(b.v, dt); if (b.p.y < V.y + 0.1) { b.p.y = V.y + 0.1; b.v.y *= -0.3; b.v.x *= 0.6; b.v.z *= 0.6; } b.m.rotation.x += dt * 9; b.m.rotation.z += dt * 7; b.m.position.copy(b.p); }
        else { const to = bag, d = b.p.distanceTo(to); if (d < 0.3) { b.m.visible = false; puffs(fx, to, 1, { size: 0.35, rise: 0.2, spread: 0.1, life: 350, color: 0xbaffc8 }); } else { b.p.lerp(to, 1 - Math.exp(-dt * (7 + (k - b.d) * 0.012))); b.m.position.copy(b.p); b.m.rotation.y += dt * 12; } } });
      const mk = ease.back((t - SN - 80) / 380); minus.scale.copy(mS).multiplyScalar(Math.max(0.001, mk) * (1 - ease.in((t - 2700) / 400))); minus.position.set(V.x, V.y + 2.2 + ease.out((t - SN) / 1700) * 0.7, V.z);
    }
    // lari ke pemain pencuri
    if (t >= GIVE - 200 && t < ARR) { const k = ease.io((t - (GIVE - 200)) / (ARR - GIVE + 200)); actor.position.lerpVectors(mid, hN, k); actor.position.y = V.y + Math.sin(k * Math.PI) * 1.2; actor.rotation.y = yawTo(mid, hN); puffT += dt; if (puffT > 0.08) { puffT = 0; puffs(fx, new THREE.Vector3(actor.position.x, actor.position.y, actor.position.z), 1, { size: 0.6, rise: 0.2, spread: 0.2, life: 500, color: 0xd8d8e8 }); } }
    if (t >= ARR && !gave) { gave = true; actor.visible = false; puffs(fx, new THREE.Vector3(hN.x, H.y + 0.8, hN.z), 9, { size: 1.3, rise: 0.8, spread: 0.7, color: 0xcfd2e0 }); sparks(fx, new THREE.Vector3(H.x, H.y + 1, H.z), [0xffe14a, 0x5dff7a, 0xffffff], 28, { speed: 3, up: 4.6, life: 1000 }); ringWave(fx, H.x, H.z, 0x5dff7a, 1.4, 650); if (onGive) { try { onGive(); } catch (e) { } } }
    if (gave) { const k = t - ARR; hr.position.y = hBase.y + Math.abs(Math.sin(k * 0.012)) * 0.4 * (1 - clamp01(k / 700)); const pk = ease.back(k / 380); plus.scale.copy(pS).multiplyScalar(Math.max(0.001, pk) * (1 - ease.in((k - 400) / 350))); plus.position.set(H.x, H.y + 2.2 + ease.out(k / 800) * 0.6, H.z); }
    if (actor.userData && actor.userData.update) actor.userData.update(t); return t < END;
  });
  return fx.run(END + 800).then(() => { vr.position.y = vBase.y; vr.rotation.y = vBase.ry; vr.scale.copy(vBase.s); hr.position.y = hBase.y; hr.scale.copy(hBase.s); });
}
