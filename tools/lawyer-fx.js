import * as THREE from 'three';
import { createFx, ease, rnd, labelSprite, ringWave, sparks, beam, shake, clamp01, softMap } from './fx-kit.js';
import { setFrameColor } from '../src/tiles.js';

/*
 * Visual pengambilalihan lahan oleh LAWYER (±3,9 detik):
 *   tiang cahaya turun -> palu hakim melayang + lembar kontrak berputar naik di sekitar bangunan -> palu menghantam, kilat putih,
 *   cincin kejut dan konfeti berwarna pemilik BARU, bingkai lahan berganti warna, tulisan "TAKEN OVER!", bendera pemilik baru berkibar.
 *   await playLawyerTakeover({ scene, lot: { x, z, w, frame, building }, from: { color: '#ef1717', name: 'Tafa' }, to: { color: '#1d96ff', name: 'Luna' }, prop: createItemJudge(), onSlam })
 * Perubahan pemilik di data game dilakukan setelah ini (atau di onSlam, saat palu menghantam).
 */
let paperTex = null;
const paper = () => paperTex || (paperTex = (() => { const c = document.createElement('canvas'); c.width = 96; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#fffdf4'; g.fillRect(0, 0, 96, 128); g.strokeStyle = '#d8d2bc'; g.lineWidth = 3; g.strokeRect(2, 2, 92, 124); g.fillStyle = '#9a9484'; g.fillRect(12, 16, 40, 6); for (let y = 34; y < 100; y += 12) g.fillRect(12, y, 72 - (y % 24), 4); g.fillStyle = '#d0392c'; g.beginPath(); g.arc(70, 106, 10, 0, 7); g.fill(); const t = new THREE.CanvasTexture(c); t._shared = true; return t; })());
function fallbackGavel() { const g = new THREE.Group(), wood = new THREE.MeshLambertMaterial({ color: 0xa8682c }); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.7, 10), wood); h.rotation.z = Math.PI / 2; h.position.x = 0.5; g.add(h); const head = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 14), new THREE.MeshLambertMaterial({ color: 0xd69a4c })); head.rotation.x = Math.PI / 2; head.position.x = -0.3; g.add(head); g.scale.setScalar(1.4); return g; }

export function playLawyerTakeover(o) {
  const { scene, lot, from, to, prop = null, onSlam = null } = o, fx = createFx(scene), cx = lot.x, cz = lot.z, w = lot.w || 2, SLAM = 1500, END = 3900;
  const cFrom = new THREE.Color(from.color), cTo = new THREE.Color(to.color), white = new THREE.Color(0xffffff), tmp = new THREE.Color(), css = c => '#' + c.getHexString();
  const bld = lot.building || null, bScale = bld ? bld.scale.clone() : null;
  beam(fx, cx, cz, 0xfff0b0, 7.5, w * 0.5, 450, 1100, 700);
  // palu hakim
  const gav = prop || fallbackGavel(), base = prop ? 0.24 : 1; gav.position.set(cx, 3.5, cz); gav.scale.setScalar(0.001); fx.root.add(gav);
  fx.add(t => {
    const k = (t - 300) / 450, pop = base * Math.max(0.001, ease.back(k)); let y = 3.5 + Math.sin(t * 0.004) * 0.12, tilt = 0;
    if (t > SLAM - 180 && t < SLAM + 500) { const a = (t - (SLAM - 180)) / 180; y = a < 1 ? 3.5 - 1.7 * ease.in(a) : 1.8 + 1.7 * ease.out((t - SLAM) / 500); tilt = a < 1 ? -0.5 * a : -0.5 * (1 - clamp01((t - SLAM) / 400)); }
    const out = clamp01((t - 3300) / 500); gav.scale.setScalar(Math.max(0.001, pop * (1 - ease.in(out)))); gav.position.y = y; gav.rotation.y += 0.02; gav.rotation.z = tilt; if (gav.userData.update) gav.userData.update(t); return t < END - 100;
  });
  // lembar kontrak berputar naik, lalu terhempas
  const sheets = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.6), new THREE.MeshBasicMaterial({ map: paper(), side: THREE.DoubleSide, transparent: true })); m.visible = false; fx.root.add(m);
    sheets.push({ m, a0: Math.random() * 6.283 + i, r0: 2.3 + Math.random() * 0.8 + (w >= 4 ? 0.9 : 0), h0: 0.3 + i / 18 * 2.4, v: null, p: new THREE.Vector3() });
  }
  fx.add((t, dt) => {
    sheets.forEach((s, i) => {
      if (t < 200) return; const m = s.m;
      if (t < SLAM) { const k = clamp01((t - 200) / 1300), a = s.a0 + (t - 200) * 0.0042, r = s.r0 + (1.2 - s.r0) * ease.in(k) * (w >= 4 ? 0.5 : 1); s.p.set(cx + Math.cos(a) * r, s.h0 + (t - 200) * 0.0016 + Math.sin(i) * 0.1, cz + Math.sin(a) * r); m.visible = true; m.position.copy(s.p); m.rotation.set(Math.sin(t * 0.006 + i) * 0.6, -a, 0.2 * Math.sin(i)); m.scale.setScalar(Math.min(1, (t - 200) / 300)); }
      else { if (!s.v) s.v = new THREE.Vector3(s.p.x - cx, 0, s.p.z - cz).normalize().multiplyScalar(2 + Math.random() * 2.2).setY(2 + Math.random() * 3); s.v.y -= 8 * dt; s.p.addScaledVector(s.v, dt); m.position.copy(s.p); m.rotation.x += dt * 6; m.rotation.z += dt * 4; const f = clamp01((t - SLAM - 700) / 700); m.scale.setScalar(Math.max(0.001, 1 - f)); if (f >= 1) m.visible = false; }
    }); return t < END - 100;
  });
  // label
  const title = labelSprite('TAKEN OVER!', { color: '#ffe14a', stroke: '#5a2a00', size: 0.85 }), owner = labelSprite(to.name, { color: '#fff', stroke: '#' + cTo.getHexString(), size: 0.5 }), tS = title.scale.clone(), oS = owner.scale.clone();
  [title, owner].forEach(s => { s.position.set(cx, 2.5, cz); s.scale.multiplyScalar(0.001); fx.root.add(s); });
  fx.add(t => {
    const a = Math.max(0.001, ease.back((t - SLAM) / 380)), b = Math.max(0.001, ease.back((t - SLAM - 220) / 380)), up = ease.out((t - 2600) / 900) * 0.6, fade = 1 - clamp01((t - 3300) / 500);
    title.scale.copy(tS).multiplyScalar(a); owner.scale.copy(oS).multiplyScalar(b); title.position.y = 2.5 + up; owner.position.y = 1.9 + up; title.material.opacity = owner.material.opacity = fade; return t < END - 100;
  });
  // bendera pemilik baru
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1, 8), new THREE.MeshLambertMaterial({ color: 0xe8e8ee })), fg = new THREE.PlaneGeometry(0.9, 0.55, 10, 1), flag = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: cTo, side: THREE.DoubleSide }));
  const fxp = cx + w / 2 - 0.35, fzp = cz - w / 2 + 0.35; pole.position.set(fxp, 0, fzp); flag.position.set(fxp + 0.45, 0, fzp); fx.root.add(pole, flag); const fpos = fg.attributes.position, f0 = Array.from({ length: fpos.count }, (_, i) => fpos.getX(i));
  fx.add(t => {
    const up = ease.out((t - SLAM) / 600) * (1 - ease.in((t - 3300) / 500)), h = 2.1 * Math.max(0.001, up); pole.scale.y = h; pole.position.y = 0.16 + h / 2; flag.position.y = 0.16 + h - 0.3; flag.visible = up > 0.02;
    for (let i = 0; i < fpos.count; i++) fpos.setZ(i, Math.sin((f0[i] + 0.45) * 6 - t * 0.012) * 0.09 * (f0[i] + 0.45)); fpos.needsUpdate = true; return t < END - 100;
  });
  // kilat, kejut, konfeti, bingkai, bangunan
  let slammed = false; const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: softMap(), color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); flash.renderOrder = 60; flash.position.set(cx, 1.3, cz); fx.root.add(flash);
  fx.add(t => {
    if (t < SLAM) { tmp.copy(cFrom).lerp(white, 0.5 + 0.5 * Math.sin(t * 0.02)); setFrameColor(lot.frame, css(tmp), true); }
    else { if (!slammed) { slammed = true; ringWave(fx, cx, cz, cTo, w * 0.9, 750); ringWave(fx, cx, cz, 0xffffff, w * 0.6, 600, 120); sparks(fx, new THREE.Vector3(cx, 1.4, cz), [cTo.getHex(), 0xffffff, 0xffd23a, cTo.getHex()], 52, { speed: 4.2, up: 5.4, life: 1400, size: 0.17 }); if (onSlam) { try { onSlam(); } catch (e) { } } }
      const k = clamp01((t - SLAM) / 700); tmp.copy(white).lerp(cTo, ease.out(k)); setFrameColor(lot.frame, css(tmp), true); shake(0.22, t - SLAM, 650);
      const fl = clamp01((t - SLAM) / 260); flash.material.opacity = 0.85 * (1 - fl); flash.scale.setScalar(2 + fl * 9);
      if (bld && bScale) { const b = clamp01((t - SLAM) / 380); bld.scale.set(bScale.x * (1 + 0.05 * Math.sin(b * Math.PI)), bScale.y * (1 + 0.09 * Math.sin(b * Math.PI)), bScale.z * (1 + 0.05 * Math.sin(b * Math.PI))); } }
    return t < END - 100;
  });
  fx.add(t => t < END);
  return fx.run(END + 600).then(() => { setFrameColor(lot.frame, css(cTo), true); if (bld && bScale) bld.scale.copy(bScale); });
}
