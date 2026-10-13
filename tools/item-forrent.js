import * as THREE from 'three';
import { _M, _add, _rrect, _ext, _canvasTex } from './item-utils.js';

/* Papan "FOR RENT" tergantung di tiang */
export function createItemForRent(opts = {}) {
  const o = Object.assign({ line1: 'FOR', line2: 'RENT', color: '#dc2a2f' }, opts);
  const g = new THREE.Group(); g.name = 'ItemForRent';
  const post = _M(0xd2d5d9, { roughness: 0.6 }), ring = _M(0xf4f4f4);
  _add(new THREE.BoxGeometry(0.32, 4.4, 0.32), post, 0, 2.2, 0, g); const tp = _add(new THREE.ConeGeometry(0.26, 0.4, 4), post, 0, 4.6, 0, g); tp.rotation.y = Math.PI / 4;
  _add(new THREE.BoxGeometry(3.3, 0.28, 0.22), post, 1.8, 4.0, 0, g); const ap = _add(new THREE.ConeGeometry(0.2, 0.4, 4), post, 3.65, 4.0, 0, g); ap.rotation.z = -Math.PI / 2; ap.rotation.x = Math.PI / 4;
  const pv = new THREE.Group(); pv.position.set(1.85, 3.86, 0); g.add(pv);
  [-1, 1].forEach(s => _add(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 8), ring, s * 1.0, -0.05, 0, pv));
  const board = _ext(_rrect(2.8, 1.9, 0.15), 0.1, 0.03, _M(0xdc2a2f, { roughness: 0.4 })); board.position.y = -1.15; pv.add(board);
  const tex = _canvasTex(512, 340, (c, w, h) => { c.fillStyle = o.color; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 7; c.strokeRect(14, 14, w - 28, h - 28); c.fillStyle = '#ffffff'; c.font = 'bold 130px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.line1, w / 2, h * 0.31); c.fillText(o.line2, w / 2, h * 0.7); });
  const fm = new THREE.MeshBasicMaterial({ map: tex });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.8), fm); f.position.set(0, -1.15, 0.09); pv.add(f);
  const bk = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.8), fm); bk.position.set(0, -1.15, -0.09); bk.rotation.y = Math.PI; pv.add(bk);
  g.userData.update = (ms) => { pv.rotation.x = Math.sin(ms * 0.0016) * 0.05; };
  return g;
}
