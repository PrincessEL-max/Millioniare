import * as THREE from 'three';
import { setFrameColor, drawLotHD } from '../src/tiles.js';

/*
 * Pilih lahan dengan mengetuk/klik (untuk alat For Rent dan Demolition).
 *   const pk = pickLot({ dom, camera, lots, mount, hint: 'Tap a lot to auction', filter: l => true, onInvalid: l => {} });
 *   const lot = await pk.promise;   // lahan yang dipilih, atau null bila dibatalkan (tombol X / Esc)
 * lots = array state lahan dari game; tiap lahan butuh:  l.pick = [Mesh, ...] (mesh untuk raycast)  dan  l.frame (dari createLotFrame).
 * Lahan di bawah kursor/jari berkedip kuning. Geser untuk menggeser papan tetap berfungsi (hanya ketukan pendek yang memilih).
 */
export function pickLot(o) {
  const { dom, camera, lots, mount = document.body, hint = 'Tap a lot', filter = () => true, onInvalid = null } = o;
  const ray = new THREE.Raycaster(), v = new THREE.Vector2(), meshes = [], owner = new Map();
  lots.forEach(l => (l.pick || []).forEach(m => { meshes.push(m); owner.set(m, l); }));
  const bar = document.createElement('div');
  bar.style.cssText = 'position:absolute;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:70;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;background:rgba(20,24,34,.9);color:#fff;font:800 14px system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.35);animation:lp-in .2s ease-out';
  bar.innerHTML = '<style>@keyframes lp-in{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}</style><span></span><button aria-label="Cancel" style="border:0;border-radius:50%;width:30px;height:30px;background:#e5342c;color:#fff;font:900 16px system-ui;cursor:pointer;line-height:30px;padding:0">✕</button>';
  bar.querySelector('span').textContent = hint; mount.appendChild(bar);
  let hover = null, down = null, done = false, timer = 0, restore = null;
  const hit = e => { const r = dom.getBoundingClientRect(); v.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); camera.updateMatrixWorld(); ray.setFromCamera(v, camera); const h = ray.intersectObjects(meshes, false)[0]; return h ? owner.get(h.object) : null; };
  const paint = (l, flash) => { if (!l || !l.frame) return; if (flash) setFrameColor(l.frame, 0xffe53a, true); else (l.restoreFrame ? l.restoreFrame() : drawLotHD(l)); };
  const setHover = l => { if (l === hover) return; paint(hover, false); hover = l && filter(l) ? l : null; paint(hover, true); };
  const pulse = () => { if (hover) { const on = (Date.now() >> 8) & 1; setFrameColor(hover.frame, on ? 0xffe53a : 0xff9d00, true); } };
  timer = setInterval(pulse, 120);
  return {
    promise: new Promise(resolve => {
      const finish = l => { if (done) return; done = true; clearInterval(timer); paint(hover, false); dom.removeEventListener('pointermove', mv); dom.removeEventListener('pointerdown', pd); dom.removeEventListener('pointerup', pu); window.removeEventListener('keydown', kd); bar.remove(); resolve(l); };
      const mv = e => { if (!down && e.pointerType === 'mouse') setHover(hit(e)); };
      const pd = e => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; if (e.pointerType !== 'mouse') setHover(hit(e)); };
      const pu = e => { const d = down; down = null; if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || Date.now() - d.t > 600) { if (e.pointerType !== 'mouse') setHover(null); return; }
        const l = hit(e); if (l && filter(l)) { finish(l); } else { setHover(null); if (onInvalid) onInvalid(l); } };
      const kd = e => { if (e.key === 'Escape') finish(null); };
      dom.addEventListener('pointermove', mv); dom.addEventListener('pointerdown', pd); dom.addEventListener('pointerup', pu); window.addEventListener('keydown', kd);
      bar.querySelector('button').addEventListener('click', () => finish(null));
      o._cancel = () => finish(null);
    }),
    cancel: () => o._cancel && o._cancel()
  };
}
