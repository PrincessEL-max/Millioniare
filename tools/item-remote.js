import * as THREE from 'three';
import { _M, _G, _add, _ext, _rod } from './item-utils.js';

/* 2. Remote tombol merah + antena */
export function createItemRemote() {
  const g = new THREE.Group(); g.name = 'ItemRemote';
  const blk = _M(0x1b1b1f, { roughness: 0.35 }), chrome = _M(0xdfe2e8, { metalness: 0.7, roughness: 0.25 }), grey = _M(0xbfc3c9, { metalness: 0.5, roughness: 0.3 });
  const red = _G(0xe8212b, { emissive: 0x7a0508, emissiveIntensity: 0.5 });
  const s = new THREE.Shape(); s.moveTo(-1.3, -0.95); s.lineTo(1.3, -0.95); s.lineTo(0.55, 1.05); s.lineTo(-0.55, 1.05); s.closePath();
  const body = _ext(s, 0.34, 0.05, blk); body.rotation.x = -Math.PI / 2; body.position.y = 0.22; g.add(body);
  _add(new THREE.CylinderGeometry(0.64, 0.66, 0.12, 48), chrome, 0, 0.49, 0.2, g);
  _add(new THREE.TorusGeometry(0.6, 0.05, 10, 48), chrome, 0, 0.55, 0.2, g).rotation.x = Math.PI / 2;
  const btn = _add(new THREE.SphereGeometry(0.46, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), red, 0, 0.55, 0.2, g); btn.scale.y = 0.6;
  const al = 0.45, dir = new THREE.Vector3(0, Math.sin(al), -Math.cos(al)), o0 = new THREE.Vector3(0, 0.5, -0.92);
  _add(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16), grey, 0, 0.48, -0.92, g);
  const p1 = o0.clone().addScaledVector(dir, 0.75), p2 = p1.clone().addScaledVector(dir, 0.85);
  _rod(o0, p1, 0.075, grey, g); _rod(p1, p2, 0.045, grey, g);
  const ballM = _G(0xff2a2a, { emissive: 0xff0000, emissiveIntensity: 0.6 }), ball = _add(new THREE.SphereGeometry(0.17, 24, 16), ballM, p2.x, p2.y, p2.z, g); ball.scale.set(1.15, 0.9, 1);
  g.userData.update = (ms) => {
    const t = ms * 0.001, k = (t % 2.6) < 0.25 ? 1 : 0;
    btn.position.y = 0.55 - 0.07 * k; red.emissiveIntensity = 0.5 + 0.5 * k; ballM.emissiveIntensity = 0.45 + 0.35 * Math.sin(t * 4);
  };
  return g;
}
