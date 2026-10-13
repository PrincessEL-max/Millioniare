import * as THREE from 'three';
import { _M, _G, _add, _ext } from './item-utils.js';

/* 3. Helm proyek + kunci inggris */
function _wrench() {
  const mat = _M(0xcfd2d8, { metalness: 0.5, roughness: 0.3, side: THREE.DoubleSide }), w = new THREE.Group();
  const bar = new THREE.Shape(); bar.moveTo(-1.7, -0.22); bar.lineTo(1.7, -0.22); bar.lineTo(1.7, 0.22); bar.lineTo(-1.7, 0.22); bar.closePath();
  const slot = new THREE.Path(); slot.moveTo(-1.0, -0.09); slot.lineTo(1.0, -0.09); slot.absarc(1.0, 0, 0.09, -Math.PI / 2, Math.PI / 2, false); slot.lineTo(-1.0, 0.09); slot.absarc(-1.0, 0, 0.09, Math.PI / 2, Math.PI * 1.5, false); bar.holes.push(slot);
  w.add(_ext(bar, 0.12, 0.03, mat));
  const a0 = Math.asin(0.2 / 0.55), hs = new THREE.Shape(); hs.moveTo(0.05, 0.2); hs.lineTo(0.55 * Math.cos(a0), 0.55 * Math.sin(a0)); hs.absarc(0, 0, 0.55, a0, Math.PI * 2 - a0, false); hs.lineTo(0.05, -0.2); hs.closePath();
  [1, -1].forEach(sg => { const h = new THREE.Group(); h.position.x = sg * 1.7; h.scale.x = sg; h.rotation.z = 0.28; h.add(_ext(hs, 0.12, 0.03, mat)); w.add(h); });
  return w;
}
export function createItemHelmet() {
  const g = new THREE.Group(); g.name = 'ItemHelm';
  const yellow = _G(0xf7b43a, { roughness: 0.5, clearcoat: 0.4 }), deep = _G(0xf3a62a, { roughness: 0.5, clearcoat: 0.4 });
  const dome = _add(new THREE.SphereGeometry(1.15, 48, 28, 0, Math.PI * 2, 0, Math.PI / 2), yellow, 0, 0, 0, g); dome.scale.set(1, 0.82, 1.15);
  const pts = []; for (let i = -10; i <= 10; i++) { const f = i / 10 * 1.35; pts.push(new THREE.Vector3(0, 0.943 * 1.05 * Math.cos(f), 1.32 * 1.04 * Math.sin(f))); }
  _add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.13, 12), deep, 0, 0, 0, g).scale.x = 1.5;
  const lip = _add(new THREE.TorusGeometry(1.16, 0.15, 16, 56), deep, 0, 0.02, 0.0, g); lip.rotation.x = Math.PI / 2; lip.scale.set(1, 1.15, 0.7);
  _add(new THREE.SphereGeometry(0.9, 32, 16), deep, 0, 0.06, 1.2, g).scale.set(1.15, 0.12, 0.7);
  const wr = _wrench(); wr.rotation.x = -Math.PI / 2; wr.rotation.z = 0.12; wr.position.set(0.1, 0.1, 2.3); wr.scale.setScalar(0.75); g.add(wr);
  g.userData.update = () => {};
  return g;
}
