import * as THREE from 'three';
import { _M, _G, _add, _ext, _star } from './item-utils.js';

/* Bom hitam dengan sumbu tali dan percikan bintang */
export function createItemBomb() {
  const g = new THREE.Group(); g.name = 'ItemBom';
  const blk = _G(0x16161a, { roughness: 0.28, clearcoat: 0.8 }), bomb = new THREE.Group(); bomb.position.y = 1.0; g.add(bomb);
  _add(new THREE.SphereGeometry(1, 48, 32), blk, 0, 0, 0, bomb);
  const cap = new THREE.Group(); cap.position.set(0.25, 0.92, 0); cap.rotation.z = -0.25; bomb.add(cap);
  _add(new THREE.CylinderGeometry(0.34, 0.4, 0.36, 24), _G(0x0d0d10, { roughness: 0.3 }), 0, 0.12, 0, cap); _add(new THREE.TorusGeometry(0.34, 0.04, 8, 24), _G(0x26262c), 0, 0.3, 0, cap).rotation.x = Math.PI / 2;
  const curve = new THREE.CatmullRomCurve3([[0.35, 1.3, 0], [0.6, 1.8, 0], [1.0, 1.75, 0], [1.15, 2.2, 0], [1.1, 2.65, 0]].map(p => new THREE.Vector3(...p))), rope = _M(0xe0cfa8, { roughness: 0.8 }), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 18; i++) { const t = i / 17, p = curve.getPoint(t), b = _add(new THREE.SphereGeometry(0.11, 14, 10), rope, p.x, p.y, p.z, bomb); b.scale.y = 0.7; b.quaternion.setFromUnitVectors(up, curve.getTangent(t)); }
  const star = new THREE.Group(); star.position.set(1.1, 2.9, 0); star.rotation.z = 0.2; bomb.add(star);
  const o = _ext(_star(5, 0.62, 0.3), 0.12, 0.05, _G(0xffa91f)); star.add(o);
  const inner = _ext(_star(5, 0.34, 0.15), 0.1, 0.03, _G(0xffe14a, { emissive: 0xffaa00, emissiveIntensity: 0.4 })); inner.position.z = 0.1; star.add(inner);
  g.userData.update = (ms) => { const t = ms * 0.001; star.scale.setScalar(1 + Math.sin(t * 6) * 0.08); star.rotation.z = 0.2 + Math.sin(t * 3) * 0.12; bomb.rotation.z = Math.sin(t * 1.4) * 0.03; };
  return g;
}
