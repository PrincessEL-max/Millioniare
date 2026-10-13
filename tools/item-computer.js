import * as THREE from 'three';
import { _M, _G, _add, _rrect, _ext, _canvasTex } from './item-utils.js';

/* Komputer CRT, keyboard, dan mouse ungu */
export function createItemComputer() {
  const g = new THREE.Group(); g.name = 'ItemKomputer';
  const lav = _G(0xd9d1f7, { roughness: 0.5, clearcoat: 0.3 }), lav2 = _G(0xbfb2f0, { roughness: 0.5, clearcoat: 0.3 }), keyM = _G(0xefeafc, { roughness: 0.5, clearcoat: 0.3 }), cable = _M(0x9d8ee6, { roughness: 0.6 });
  const bez = _ext(_rrect(2.5, 2.1, 0.28), 0.5, 0.08, lav); bez.position.set(0, 1.75, 0.2); g.add(bez);
  const back = _ext(_rrect(2.0, 1.7, 0.35), 1.0, 0.1, lav2); back.position.set(0, 1.7, -0.75); g.add(back);
  _add(new THREE.CylinderGeometry(0.62, 0.7, 0.14, 32), lav2, 0, 0.09, -0.2, g); _add(new THREE.BoxGeometry(0.8, 0.45, 0.6), lav2, 0, 0.4, -0.3, g);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.6), new THREE.MeshBasicMaterial({ map: _canvasTex(256, 205, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8a73d6'); gr.addColorStop(1, '#4a3a9a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.55)'; [[20, 26, 120], [20, 50, 170], [20, 74, 90], [20, 98, 140]].forEach(([x, y, l]) => c.fillRect(x, y, l, 7)); }) }));
  scr.position.set(0, 1.78, 0.535); g.add(scr);
  _add(new THREE.BoxGeometry(0.35, 0.04, 0.02), _M(0x2a2250), 0.8, 0.88, 0.54, g);
  const cur = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.01), new THREE.MeshBasicMaterial({ color: 0xffffff })); cur.position.set(-0.78, 1.45, 0.54); g.add(cur);
  const kb = new THREE.Group(); kb.position.set(0, 0, 2.5); kb.rotation.x = 0.08; g.add(kb);
  const kbase = _ext(_rrect(3.5, 1.4, 0.14), 0.14, 0.03, lav2); kbase.rotation.x = -Math.PI / 2; kbase.position.y = 0.12; kb.add(kbase);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { if (r === 4 && c > 2 && c < 10) continue; _add(new THREE.BoxGeometry(0.2, 0.08, 0.18), r === 4 ? lav : keyM, -1.5 + c * 0.25, 0.25, -0.5 + r * 0.25, kb); }
  _add(new THREE.BoxGeometry(1.7, 0.08, 0.18), keyM, 0, 0.25, 0.5, kb);
  _add(new THREE.SphereGeometry(0.3, 24, 16), lav, 2.5, 0.16, 2.6, g).scale.set(0.9, 0.5, 1.35); _add(new THREE.BoxGeometry(0.02, 0.02, 0.4), _M(0x8d7ee0), 2.5, 0.31, 2.45, g);
  const tube = (pts) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 30, 0.03, 6), cable);
  g.add(tube([[2.5, 0.12, 2.2], [2.3, 0.06, 1.2], [1.5, 0.06, 0.6], [0.8, 0.1, 0.0]])); g.add(tube([[0, 0.14, 1.9], [0, 0.06, 1.2], [0.1, 0.06, 0.5], [0, 0.2, 0.0]]));
  g.userData.update = (ms) => { cur.visible = (ms % 1000) < 550; };
  return g;
}
