import * as THREE from 'three';
import { _M, _G, _add, _rrect, _ext, _rod, _canvasTex } from './item-utils.js';

/* Derek bola penghancur meruntuhkan rumah */
export function createItemDemolition() {
  const g = new THREE.Group(); g.name = 'ItemBolaPenghancur';
  const yellow = _M(0xf2b01e, { roughness: 0.5 }), yellow2 = _M(0xdca017, { roughness: 0.5 }), blk = _M(0x1c1c20, { roughness: 0.7 }), steel = _M(0x5c6068, { metalness: 0.5, roughness: 0.4 }), white = _M(0xf3efe6), dark = _M(0x24201e);
  const tileM = _M(0xffffff, { map: _canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c9402a'; c.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, r * 16 + 13, w, 3); for (let k = 0; k < 8; k++) { c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0' : '255,200,150') + ',.1)'; c.fillRect(k * 16 + (r % 2) * 8, r * 16, 16, 16); } } }, 6, 3), roughness: 0.85 });
  const rubble = [0xf3efe6, 0xbdb8ae, 0xc9402a, 0x8a5a38, 0x7c7770];

  /* Rumah */
  const hz = new THREE.Group(); hz.name = 'DemolitionTargetBuilding'; hz.position.set(-2.4, 0, 0); g.add(hz);
  _add(new THREE.BoxGeometry(3.5, 0.3, 2.9), _M(0x8a5a44), 0, 0.15, 0, hz); _add(new THREE.BoxGeometry(3.4, 2.5, 2.8), white, 0, 1.55, 0, hz);
  const rise = 1.5, hs = 1.4 + 0.5, a = Math.atan(rise / hs), L = Math.hypot(hs, rise);
  [1, -1].forEach(s => { _add(new THREE.BoxGeometry(4.1, 0.1, L), tileM, 0, 2.8 + rise / 2, s * hs / 2, hz).rotation.x = s * a; });
  const gp = new THREE.CylinderGeometry(1, 1, 1, 3); gp.rotateX(-Math.PI / 2); gp.rotateY(Math.PI / 2); const gab = new THREE.Mesh(gp, white); gab.scale.set(3.4, rise / 1.5, 2.8 / 1.732); gab.position.set(0, 2.8 + 0.5 * gab.scale.y, 0); hz.add(gab);
  _add(new THREE.BoxGeometry(0.4, 1.1, 0.4), _M(0x6a6a70), -1.2, 4.0, -0.5, hz);
  [[-1.0, 0], [-0.05, 1]].forEach(([x, cr]) => {
    _add(new THREE.BoxGeometry(0.85, 0.95, 0.1), _M(0x4a3a2a), x, 1.75, 1.4, hz); _add(new THREE.BoxGeometry(0.7, 0.8, 0.06), _M(0xa8c4d8, { roughness: 0.2 }), x, 1.75, 1.46, hz);
    if (cr) { _add(new THREE.BoxGeometry(0.03, 0.9, 0.02), dark, x, 1.75, 1.5, hz).rotation.z = 0.5; _add(new THREE.BoxGeometry(0.03, 0.8, 0.02), dark, x + 0.1, 1.7, 1.5, hz).rotation.z = -0.4; }
  });
  _add(new THREE.BoxGeometry(0.75, 1.5, 0.1), _M(0x7a4a2a), 0.95, 1.05, 1.4, hz);
  _add(new THREE.BoxGeometry(0.2, 1.3, 1.5), dark, 1.66, 2.0, 0, hz);
  for (let i = 0; i < 7; i++) { const t = i / 6 * Math.PI * 2, c = _add(new THREE.ConeGeometry(0.16, 0.45, 5), i % 2 ? white : dark, 1.72, 2.0 + Math.sin(t) * 0.75, Math.cos(t) * 0.85, hz); c.rotation.z = -Math.PI / 2; }
  let sd = 7; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 18; i++) { const w = 0.15 + rn() * 0.4, b = _add(new THREE.BoxGeometry(w, 0.08 + rn() * 0.2, w * (0.5 + rn())), _M(rubble[i % 5]), 2.0 + rn() * 1.3, 0.12 + rn() * 0.15, -1.1 + rn() * 2.2, hz); b.rotation.set(rn() * 0.6, rn() * 3, rn() * 0.6); }
  for (let i = 0; i < 3; i++) { const p = _add(new THREE.BoxGeometry(0.1, 0.06, 1.0), _M(0x8a5a38), 1.9 + i * 0.4, 0.32, -0.5 + i * 0.4, hz); p.rotation.set(0.3, i, 0.4); }
  const puffs = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), new THREE.MeshBasicMaterial({ color: 0xd9d4c8, transparent: true, opacity: 0 })); m.position.set(-0.55 + (i % 2) * 0.1, 2.0 + i * 0.25, -0.5 + i * 0.35); g.add(m); return m; });

  /* Derek */
  const cr = new THREE.Group(); cr.position.set(5.6, 0, 0); g.add(cr);
  [-1, 1].forEach(s => {
    const tr = _ext(_rrect(3.6, 0.6, 0.28), 0.5, 0.05, blk); tr.position.set(0, 0.35, s * 1.0); cr.add(tr);
    for (let i = -2; i <= 2; i++) _add(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 14), _M(0x6a6e75), i * 0.7, 0.35, s * 1.3, cr).rotation.x = Math.PI / 2;
  });
  _add(new THREE.BoxGeometry(3.4, 0.5, 2.4), yellow2, 0, 0.9, 0, cr); _add(new THREE.BoxGeometry(1.3, 1.3, 1.6), yellow, -0.9, 1.8, 0, cr); _add(new THREE.BoxGeometry(1.9, 1.2, 1.8), yellow, 0.75, 1.7, 0, cr);
  _add(new THREE.BoxGeometry(0.9, 1.3, 1.5), _M(0xe8c670), 1.75, 1.8, 0, cr);
  const wnd = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), _M(0x9fc4e0, { roughness: 0.2 })); wnd.rotation.y = -Math.PI / 2; wnd.position.set(-1.56, 2.0, 0); cr.add(wnd);
  const A = new THREE.Vector3(-1.4, 2.3, 0), Bp = new THREE.Vector3(-3.7, 7.2, 0), at = (t, z) => new THREE.Vector3().lerpVectors(A, Bp, t).add(new THREE.Vector3(0, 0, z)), N = 8;
  [-0.2, 0.2].forEach(z => _rod(at(0, z), at(1, z), 0.06, yellow, cr));
  for (let i = 0; i < N; i++) { const t0 = i / N, t1 = (i + 1) / N, z = i % 2 ? 0.2 : -0.2; _rod(at(t0, z), at(t1, -z), 0.035, yellow, cr); _rod(at(t0, -0.2), at(t0, 0.2), 0.03, yellow, cr); }
  const Mt = new THREE.Vector3(0.3, 4.6, 0); [-0.4, 0.4].forEach(z => _rod(new THREE.Vector3(-0.3, 2.2, z), Mt, 0.06, yellow, cr)); _rod(Bp, Mt, 0.03, steel, cr);
  const sh = _add(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 20), _M(0xe07a1a), Bp.x, Bp.y, 0, cr); sh.rotation.x = Math.PI / 2;

  /* Bola */
  const sw = new THREE.Group(); sw.position.set(1.9, 7.2, 0); g.add(sw);
  _add(new THREE.CylinderGeometry(0.03, 0.03, 3.6, 8), steel, 0, -1.8, 0, sw);
  for (let i = 0; i < 5; i++) { const l = _add(new THREE.TorusGeometry(0.13, 0.035, 8, 14), steel, 0, -3.8 - i * 0.2, 0, sw); l.rotation.y = i % 2 ? Math.PI / 2 : 0; }
  _add(new THREE.SphereGeometry(0.85, 36, 26), _G(0x2a2a30, { roughness: 0.4, clearcoat: 0.5 }), 0, -5.2, 0, sw); _add(new THREE.TorusGeometry(0.18, 0.05, 8, 16), steel, 0, -4.3, 0, sw);
  g.userData.update = (ms) => {
    const t = ms * 0.001, ph = t * 1.6;
    sw.rotation.z = -(-0.1 + 0.45 * Math.sin(ph));
    const tt = ((((ph - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / 1.6;
    hz.position.x = -2.4 + (tt < 0.25 ? Math.sin(tt * 60) * 0.05 * (1 - tt / 0.25) : 0);
    puffs.forEach((p, i) => { const k = tt < 0.9 ? tt / 0.9 : 1; p.material.opacity = tt < 0.9 ? 0.55 * (1 - k) : 0; p.scale.setScalar(0.4 + k * (1.6 + i * 0.3)); p.position.y = 2.0 + i * 0.25 + k * 0.6; });
  };
  return g;
}
