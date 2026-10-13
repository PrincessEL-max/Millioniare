import * as THREE from 'three';
import { _M, _add, _canvasTex } from './item-utils.js';

/* Pencuri berlari membawa karung uang */
export function createItemThief() {
  const g = new THREE.Group(); g.name = 'ItemPencuri';
  const skin = _M(0xf4c3a0, { roughness: 0.5 }), black = _M(0x14141a, { roughness: 0.8 }), shoe = _M(0x0e0e12);
  const rib = _M(0xffffff, { map: _canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#34343f'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.4)'; for (let y = 0; y < h; y += 8) c.fillRect(0, y, w, 3); }, 1, 5), roughness: 0.9 });
  const ribV = _M(0xffffff, { map: _canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#3b3b48'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.4)'; for (let x = 0; x < w; x += 8) c.fillRect(x, 0, 3, h); }, 12, 1), roughness: 0.9, side: THREE.DoubleSide });
  const body = new THREE.Group(); body.position.y = 1.15; body.rotation.x = 0.12; g.add(body);
  _add(new THREE.CylinderGeometry(0.36, 0.3, 0.78, 20), rib, 0, 0.41, 0, body); _add(new THREE.TorusGeometry(0.27, 0.1, 10, 20), rib, 0, 0.83, 0, body).rotation.x = Math.PI / 2; _add(new THREE.CylinderGeometry(0.31, 0.31, 0.08, 20), black, 0, 0.05, 0, body);
  const legs = [], arms = [];
  [-1, 1].forEach(s => {
    const hip = new THREE.Group(); hip.position.set(s * 0.15, 1.15, 0); g.add(hip);
    _add(new THREE.CylinderGeometry(0.13, 0.11, 0.52, 14), black, 0, -0.26, 0, hip);
    const kn = new THREE.Group(); kn.position.y = -0.52; hip.add(kn);
    _add(new THREE.SphereGeometry(0.11, 12, 10), black, 0, 0, 0, kn); _add(new THREE.CylinderGeometry(0.11, 0.1, 0.5, 14), black, 0, -0.25, 0, kn);
    _add(new THREE.SphereGeometry(0.16, 16, 12), shoe, 0, -0.52, 0.07, kn).scale.set(0.95, 0.6, 1.5); legs.push({ hip, kn, s });
  });
  let bag = null;
  [-1, 1].forEach(s => {
    const sh = new THREE.Group(); sh.position.set(s * 0.44, 0.66, 0); body.add(sh);
    _add(new THREE.SphereGeometry(0.12, 12, 10), rib, 0, 0, 0, sh); _add(new THREE.CylinderGeometry(0.1, 0.09, 0.4, 14), rib, 0, -0.2, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.4; sh.add(el);
    _add(new THREE.SphereGeometry(0.09, 12, 10), rib, 0, 0, 0, el); _add(new THREE.CylinderGeometry(0.09, 0.085, 0.38, 14), rib, 0, -0.19, 0, el); _add(new THREE.SphereGeometry(0.11, 14, 10), skin, 0, -0.42, 0, el);
    if (s === 1) {
      bag = new THREE.Group(); bag.position.y = -0.4; el.add(bag); const sack = _M(0x9aa5b4, { roughness: 0.7 });
      _add(new THREE.SphereGeometry(0.4, 20, 16), sack, 0, -0.5, 0, bag).scale.set(1, 1.1, 1); _add(new THREE.ConeGeometry(0.2, 0.34, 12), sack, 0, -0.05, 0, bag); _add(new THREE.TorusGeometry(0.12, 0.03, 8, 14), _M(0x6a7080), 0, -0.12, 0, bag).rotation.x = Math.PI / 2;
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ transparent: true, map: _canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#2b3140'; c.font = 'bold 56px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', w / 2, h / 2 + 3); }) })); d.position.set(0, -0.5, 0.41); bag.add(d);
    }
    arms.push({ sh, el, s });
  });
  const head = new THREE.Group(); head.position.y = 0.85; body.add(head); const hc = new THREE.Group(); hc.position.y = 0.75; head.add(hc);
  _add(new THREE.SphereGeometry(0.8, 40, 28), skin, 0, 0, 0, hc);
  _add(new THREE.SphereGeometry(0.815, 40, 16, Math.PI / 2 - 1.45, 2.9, 0.98, 0.62), new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 0.5, side: THREE.DoubleSide }), 0, 0, 0, hc);
  [-1, 1].forEach(s => {
    const e = _add(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }), s * 0.3, 0.2, 0.78, hc); e.scale.set(0.2, 0.1, 0.04); e.rotation.z = s * 0.35;
    _add(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshBasicMaterial({ color: 0x0a0a10 }), s * 0.32, 0.2, 0.8, hc).scale.set(0.06, 0.07, 0.03);
    _add(new THREE.SphereGeometry(0.12, 12, 10), skin, s * 0.82, 0, 0, hc).scale.x = 0.55;
    _add(new THREE.CircleGeometry(0.2, 18), new THREE.MeshBasicMaterial({ color: 0xd9b08c, transparent: true, opacity: 0.6 }), s * 0.3, -0.33, 0.66, hc).rotation.y = s * 0.45;
  });
  _add(new THREE.SphereGeometry(0.1, 12, 10), skin, 0, -0.12, 0.8, hc);
  _add(new THREE.BoxGeometry(0.4, 0.2, 0.03), new THREE.MeshBasicMaterial({ color: 0x2a1a1a }), 0, -0.42, 0.7, hc); _add(new THREE.BoxGeometry(0.34, 0.12, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, -0.42, 0.72, hc);
  [-0.08, 0.08].forEach(x => _add(new THREE.BoxGeometry(0.012, 0.12, 0.03), new THREE.MeshBasicMaterial({ color: 0x2a1a1a }), x, -0.42, 0.73, hc));
  _add(new THREE.SphereGeometry(0.88, 40, 24, 0, Math.PI * 2, 0, 1.15), ribV, 0, 0.02, 0, hc);
  _add(new THREE.CylinderGeometry(0.88, 0.88, 0.3, 40, 1, true), _M(0x4a4a5a, { side: THREE.DoubleSide, roughness: 0.9 }), 0, 0.34, 0, hc);
  g.userData.update = (ms) => {
    const t = ms * 0.001, ph = t * 9;
    body.position.y = 1.15 + Math.abs(Math.sin(ph)) * 0.07; head.rotation.z = Math.sin(ph) * 0.05;
    legs.forEach(({ hip, kn, s }) => { const p = ph + (s < 0 ? Math.PI : 0); hip.rotation.x = -Math.sin(p) * 0.85; kn.rotation.x = Math.max(0, -Math.cos(p)) * 1.1; });
    arms.forEach(({ sh, el, s }) => { const p = ph + (s < 0 ? 0 : Math.PI); sh.rotation.x = -Math.sin(p) * 0.8; el.rotation.x = -1.2; });
    if (bag) bag.rotation.x = Math.sin(ph * 1.0 + 1) * 0.25;
  };
  return g;
}
