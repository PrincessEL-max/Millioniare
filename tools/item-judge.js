import * as THREE from 'three';
import { _M, _add, _rrect, _ext, _rod } from './item-utils.js';

/* 4. Hakim + timbangan keadilan + palu + buku */
export function createItemJudge() {
  const g = new THREE.Group(); g.name = 'ItemHakim';
  const navy = _M(0x2c4a7a), blue = _M(0x5b7aa6, { metalness: 0.2 }), gold = _M(0xf0b43a, { metalness: 0.5, roughness: 0.35 }), white = _M(0xf4f5f7, { roughness: 0.5 }), wood = _M(0x6b3f22, { roughness: 0.55 }), skin = _M(0xf4c3a0, { roughness: 0.5 }), gray = _M(0xb9bdc6), blk = new THREE.MeshBasicMaterial({ color: 0x1a1a22 });
  const bd = _add(new THREE.CylinderGeometry(2.0, 2.0, 0.05, 48), _M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.25 }), -0.5, 2.2, -1.4, g); bd.rotation.x = Math.PI / 2;

  /* Timbangan */
  const sx = -1.6, sz = -0.9;
  _add(new THREE.CylinderGeometry(0.05, 0.05, 3.0, 12), blue, sx, 1.5, sz, g);
  const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.1 : 0.24, a = i * Math.PI / 5 + Math.PI / 2; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } st.closePath();
  const star = _ext(st, 0.06, 0.02, gold); star.position.set(sx, 3.2, sz); g.add(star); _add(new THREE.SphereGeometry(0.07, 12, 10), gold, sx, 2.75, sz, g);
  const beam = new THREE.Group(); beam.position.set(sx, 2.75, sz); g.add(beam);
  _add(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 10), blue, 0, 0, 0, beam).rotation.z = Math.PI / 2;
  const pans = [-1, 1].map(s => {
    const p = new THREE.Group(); p.position.set(s * 1.15, 0, 0); beam.add(p); _add(new THREE.SphereGeometry(0.06, 10, 8), gold, 0, 0, 0, p);
    [-1, 1].forEach(e => _rod(new THREE.Vector3(0, 0, 0), new THREE.Vector3(e * 0.55, -1.0, 0), 0.014, blue, p));
    _add(new THREE.CylinderGeometry(0.62, 0.5, 0.07, 24), blue, 0, -1.03, 0, p); return p;
  });

  /* Hakim */
  const j = new THREE.Group(); j.position.set(0.8, 0, -0.2); g.add(j);
  _add(new THREE.CylinderGeometry(0.55, 1.0, 1.3, 28), navy, 0, 0.7, 0, j); _add(new THREE.SphereGeometry(0.6, 24, 14), navy, 0, 1.3, 0, j).scale.set(1.35, 0.55, 0.9);
  _add(new THREE.BoxGeometry(0.34, 0.75, 0.05), white, 0, 1.05, 0.5, j);
  [-1, 1].forEach(s => { _add(new THREE.BoxGeometry(0.2, 0.75, 0.05), _M(0x24406b), s * 0.2, 1.0, 0.52, j).rotation.z = s * 0.3; });
  _add(new THREE.SphereGeometry(0.06, 10, 8), _M(0x4aa0d8), 0, 1.38, 0.54, j); _add(new THREE.ConeGeometry(0.07, 0.5, 4), _M(0x4aa0d8), 0, 1.1, 0.54, j).rotation.x = Math.PI;
  const head = new THREE.Group(); head.position.y = 1.95; head.rotation.y = 0.25; j.add(head);
  _add(new THREE.SphereGeometry(0.6, 32, 24), skin, 0, 0, 0, head).scale.set(1, 1.05, 0.95); _add(new THREE.CylinderGeometry(0.18, 0.2, 0.3, 14), skin, 0, -0.6, 0, head);
  _add(new THREE.SphereGeometry(0.66, 32, 20, 0, Math.PI * 2, 0, 1.15), gray, 0, 0.02, -0.02, head);
  [-1, 1].forEach(s => { _add(new THREE.SphereGeometry(0.2, 14, 10), gray, s * 0.52, 0.12, -0.05, head); _add(new THREE.SphereGeometry(0.11, 12, 10), skin, s * 0.6, -0.05, 0, head).scale.x = 0.55; });
  _add(new THREE.SphereGeometry(0.3, 16, 12), _M(0xc8ccd4), -0.15, 0.62, 0.28, head).scale.set(1.2, 0.5, 0.9);
  const eyes = [];
  [-1, 1].forEach(s => {
    const e = _add(new THREE.SphereGeometry(0.06, 12, 10), blk, s * 0.22, 0.02, 0.55, head); e.scale.set(0.8, 1.3, 0.5); eyes.push(e);
    _add(new THREE.TorusGeometry(0.2, 0.026, 8, 28), blk, s * 0.22, 0.02, 0.56, head);
    const b = _add(new THREE.BoxGeometry(0.2, 0.04, 0.03), blk, s * 0.22, 0.28, 0.56, head); b.rotation.z = -s * 0.18;
  });
  _add(new THREE.BoxGeometry(0.08, 0.025, 0.03), blk, 0, 0.04, 0.6, head); _add(new THREE.SphereGeometry(0.05, 10, 8), _M(0xe8a98a), 0, -0.12, 0.6, head);
  _add(new THREE.TorusGeometry(0.1, 0.014, 6, 12, Math.PI), blk, 0, -0.26, 0.55, head).rotation.z = Math.PI;

  /* Buku */
  [[0, 0.17, 0], [0.04, 0.51, 0.02]].forEach(([dx, y, dz], i) => {
    const b = _ext(_rrect(1.9, 1.3, 0.1), 0.3, 0.04, white); b.rotation.x = -Math.PI / 2; b.rotation.z = i * 0.05; b.position.set(1.0 + dx, y, 1.1 + dz); g.add(b);
    _add(new THREE.TorusGeometry(0.12, 0.03, 10, 24), gold, 1.55 + dx, y, 1.78 + dz, g);
  });

  /* Palu + alas */
  _add(new THREE.BoxGeometry(1.7, 0.14, 0.9), wood, -0.8, 0.07, 1.5, g); _add(new THREE.BoxGeometry(1.4, 0.12, 0.7), _M(0x7a4a2a), -0.8, 0.2, 1.5, g);
  const gv = new THREE.Group(); gv.position.set(-0.5, 0.8, 1.5); gv.rotation.y = 0.5; g.add(gv);
  const hd = _add(new THREE.CylinderGeometry(0.24, 0.24, 0.75, 24), wood, 0, 0, 0, gv); hd.rotation.x = Math.PI / 2;
  const gb = _add(new THREE.CylinderGeometry(0.265, 0.265, 0.2, 24), gold, 0, 0, 0, gv); gb.rotation.x = Math.PI / 2;
  [-1, 1].forEach(s => { const c = _add(new THREE.CylinderGeometry(0.27, 0.27, 0.06, 24), _M(0x4a2a14), 0, 0, s * 0.37, gv); c.rotation.x = Math.PI / 2; });
  const hv = new THREE.Vector3(-1, -0.28, 0).normalize(); _rod(new THREE.Vector3(0, 0, 0), hv.clone().multiplyScalar(1.7), 0.07, wood, gv);

  g.userData.update = (ms) => {
    const t = ms * 0.001, sw = Math.sin(t * 1.1) * 0.07; beam.rotation.z = sw; pans.forEach(p => { p.rotation.z = -sw; });
    gv.position.y = 0.8 + 0.2 * Math.max(0, Math.sin(t * 2.4)) ** 3; head.rotation.y = 0.25 + Math.sin(t * 0.7) * 0.1;
    const bl = (t % 3.7) < 0.12 ? 0.1 : 1.3; eyes.forEach(e => { e.scale.y = bl; });
  };
  return g;
}
