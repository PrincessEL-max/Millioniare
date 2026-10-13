import * as THREE from 'three';
import { _M, _add, _canvasTex } from './item-utils.js';

/* Sapu ijuk */
export function createItemBroom() {
  const g = new THREE.Group(); g.name = 'ItemSapu';
  const pv = new THREE.Group(); pv.rotation.z = 0.12; g.add(pv);
  const straw = _M(0xffffff, { map: _canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#d9a93a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '120,80,10' : '255,225,120') + ',' + (0.12 + Math.random() * 0.25) + ')'; c.fillRect(Math.random() * w, 0, 1 + Math.random() * 2.5, h); } }, 6, 1), roughness: 0.9, side: THREE.DoubleSide });
  const prof = [[0.58, 1.5], [0.78, 1.0], [1.0, 0.5], [1.15, 0.0]].map(p => new THREE.Vector2(p[0], p[1]));
  const bod = new THREE.Mesh(new THREE.LatheGeometry(prof, 56), straw); bod.scale.z = 0.7; bod.castShadow = true; pv.add(bod);
  const pos = [], rr = y => 1.15 - 0.38 * y;
  for (let i = 0; i < 520; i++) { const a = Math.random() * Math.PI * 2, y0 = 0.15 + Math.random() * 1.1, ye = -Math.random() * 0.12, r0 = rr(y0) + 0.01, r1 = r0 + (y0 - ye) * 0.38 * (1 + Math.random() * 0.12); pos.push(Math.cos(a) * r0, y0, Math.sin(a) * r0 * 0.7, Math.cos(a) * r1, ye, Math.sin(a) * r1 * 0.7); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pv.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xe8bd58 })));
  const gold = _M(0xd2b24a, { metalness: 0.5, roughness: 0.35 });
  _add(new THREE.CylinderGeometry(0.24, 0.58, 0.5, 36), gold, 0, 1.75, 0, pv);
  _add(new THREE.TorusGeometry(0.58, 0.05, 10, 40), _M(0x6d5f7a, { metalness: 0.3 }), 0, 1.5, 0, pv).rotation.x = Math.PI / 2;
  _add(new THREE.CylinderGeometry(0.27, 0.27, 0.42, 12), _M(0x6a5a58, { flatShading: true }), 0, 2.2, 0, pv);
  [2.05, 2.37].forEach(y => _add(new THREE.TorusGeometry(0.275, 0.025, 8, 24), _M(0xd9a22a, { metalness: 0.4 }), 0, y, 0, pv).rotation.x = Math.PI / 2);
  _add(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12), _M(0x7a6a68), 0, 2.45, 0, pv);
  _add(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 14), _M(0xe8a22a, { roughness: 0.5 }), 0, 3.45, 0, pv);
  g.userData.update = (ms) => { pv.rotation.z = 0.12 + Math.sin(ms * 0.0013) * 0.03; };
  return g;
}
