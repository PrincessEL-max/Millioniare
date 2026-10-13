import * as THREE from 'three';
import { _G, _add, _rrect, _ext } from './item-utils.js';

/* 1. Kerucut jalan */
export function createItemCone() {
  const g = new THREE.Group(); g.name = 'ItemKerucut';
  const orange = _G(0xff7a1a), white = _G(0xf3efe6, { roughness: 0.3 }), deep = _G(0xe8610c);
  const base = _ext(_rrect(2.2, 2.2, 0.32), 0.14, 0.06, orange); base.rotation.x = -Math.PI / 2; base.position.y = 0.14; g.add(base);
  _add(new THREE.CylinderGeometry(0.64, 0.68, 0.08, 40), deep, 0, 0.27, 0, g);
  const R = y => 0.52 - (y - 0.3) * (0.39 / 1.4);
  [[0.3, 0.62, orange, 0], [0.62, 0.9, white, 0.012], [0.9, 1.1, orange, 0], [1.1, 1.36, white, 0.012], [1.36, 1.7, orange, 0]].forEach(([a, b, m, off]) => {
    const l = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(R(a) + off, a), new THREE.Vector2(R(b) + off, b)], 48), m); l.castShadow = true; g.add(l);
  });
  [0.62, 0.9, 1.1, 1.36].forEach(y => _add(new THREE.TorusGeometry(R(y) + 0.008, 0.012, 6, 48), deep, 0, y, 0, g).rotation.x = Math.PI / 2);
  _add(new THREE.CylinderGeometry(0.15, 0.17, 0.1, 24), orange, 0, 1.74, 0, g); _add(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), deep, 0, 1.8, 0, g);
  g.userData.update = () => {};
  return g;
}
