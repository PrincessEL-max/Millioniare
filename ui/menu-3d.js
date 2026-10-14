import * as THREE from 'three';

/* Latar 3D halaman depan: pulau-pulau melayang berisi rumah dan hotel, bergerak pelan dan ikut gerak jari/mouse (parallax). */
export function createSkyline(canvas, makers) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); r.setClearColor(0x000000, 0); r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene(); scene.add(new THREE.AmbientLight(0xffffff, 0.88)); const sun = new THREE.DirectionalLight(0xfff2e0, 0.8); sun.position.set(4, 9, 7); scene.add(sun);
  const FOV = 38, CAMZ = 14, cam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100); cam.position.set(0, 0, CAMZ);
  const grass = new THREE.MeshLambertMaterial({ color: 0x7ccb5a }), rock = new THREE.MeshLambertMaterial({ color: 0x8d6444 });
  // nx, ny = posisi relatif di layar (-1..1), z = kedalaman, s = ukuran pulau, mk = urutan model. Dua susunan: layar lebar dan layar tegak.
  const SPEC_L = [{ nx: -0.88, ny: 0.2, z: -2, s: 1.0, mk: 0, ph: 0 }, { nx: 0.88, ny: 0.24, z: -3, s: 1.05, mk: 2, ph: 2.1 }, { nx: -0.9, ny: -0.58, z: 0, s: 0.7, mk: 1, ph: 1.3 }, { nx: 0.9, ny: -0.52, z: -1, s: 0.75, mk: 3, ph: 0.7 }];
  const SPEC_P = [{ nx: -0.6, ny: 0.2, z: -1, s: 1.0, mk: 0, ph: 0 }, { nx: 0.62, ny: 0.06, z: -2, s: 1.05, mk: 2, ph: 2.1 }, { nx: -0.88, ny: 0.88, z: -4, s: 0.8, mk: 3, ph: 1.3 }, { nx: 0.9, ny: 0.8, z: -5, s: 0.8, mk: 1, ph: 0.7 }];
  const items = [];
  const SPEC = [...SPEC_L, ...SPEC_P.map(p => Object.assign({ p: 1 }, p))];
  SPEC.forEach(sp => {
    const mk = makers[sp.mk % makers.length]; if (!mk) return;
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    body.add(new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.55, 0.28, 28), grass));
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.55, 1.8, 20), rock); cone.rotation.x = Math.PI; cone.position.y = -1.04; body.add(cone);
    const b = mk(); b.updateMatrixWorld(true); const bx = new THREE.Box3().setFromObject(b), sz = bx.getSize(new THREE.Vector3()), c = bx.getCenter(new THREE.Vector3()), k = Math.min(1.9 / Math.max(sz.x, sz.z), 3.2 / sz.y);
    b.scale.setScalar(k); b.position.set(-c.x * k, 0.14 - bx.min.y * k, -c.z * k); body.add(b);
    for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshLambertMaterial({ color: 0x4fa84a })); const a = i * 1.7 + sp.ph; t.position.set(Math.cos(a) * 1.35, 0.26, Math.sin(a) * 1.35); body.add(t); }
    g.scale.setScalar(sp.s); g.visible = false; scene.add(g); items.push({ g, body, sp, b });
  });
  let px = 0, py = 0, raf = 0, running = false, W = 1, H = 1;
  const place = () => { const portrait = W / H < 0.9, fit = portrait ? Math.max(0.42, (W / H) / 1.05) : 1; items.forEach(it => { const on = !!it.sp.p === portrait; it.g.visible = on; if (!on) return; const d = CAMZ - it.sp.z, hh = Math.tan(FOV * Math.PI / 360) * d, hw = hh * (W / H); it.base = new THREE.Vector3(it.sp.nx * hw, it.sp.ny * hh, it.sp.z); it.g.position.copy(it.base); it.g.scale.setScalar(it.sp.s * (portrait ? fit : Math.min(1, (W / H) / 1.9))); }); };
  function resize() { W = canvas.clientWidth || 1; H = canvas.clientHeight || 1; r.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); place(); }
  function frame(t) {
    if (!running) return; raf = requestAnimationFrame(frame);
    cam.position.x += (px * 1.1 - cam.position.x) * 0.05; cam.position.y += (-py * 0.6 - cam.position.y) * 0.05; cam.lookAt(0, 0, 0);
    items.forEach(it => { if (!it.g.visible) return; const p = it.sp.ph; it.g.position.y = it.base.y + Math.sin(t * 0.0009 + p) * 0.2; it.body.rotation.y = t * 0.00022 + p; it.body.rotation.z = Math.sin(t * 0.0007 + p) * 0.03; if (it.b.userData.update) it.b.userData.update(t); });
    r.render(scene, cam);
  }
  return {
    resize, setParallax(x, y) { px = x; py = y; },
    start() { if (running) return; running = true; resize(); raf = requestAnimationFrame(frame); }, stop() { running = false; cancelAnimationFrame(raf); },
    dispose() { running = false; cancelAnimationFrame(raf); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); r.dispose(); try { r.forceContextLoss(); } catch (e) {} }
  };
}

/* Panggung karakter 3D: model berputar pelan, bisa diputar dengan geser jari/mouse. */
export function createCharacterStage(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); r.setClearColor(0x000000, 0); r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d6ee, 0.9)); const key = new THREE.DirectionalLight(0xfff4e8, 0.8); key.position.set(3, 6, 5); scene.add(key); const rim = new THREE.DirectionalLight(0xbfdcff, 0.4); rim.position.set(-4, 3, -5); scene.add(rim);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60); cam.position.set(0, 2.05, 9.2); cam.lookAt(0, 1.85, 0);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.12, 40), new THREE.MeshLambertMaterial({ color: 0xffffff })); disc.position.y = -0.06; scene.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffc83a })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.01; scene.add(ring);
  let cur = null, rot = 0.5, drag = null, raf = 0, running = false;
  function show(make) {
    if (cur) { scene.remove(cur); cur.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    cur = make(); cur.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(cur), h = b.getSize(new THREE.Vector3()).y, k = 3.6 / h;
    cur.scale.setScalar(k); cur.position.y = -b.min.y * k + 0.02; cur.rotation.y = rot; scene.add(cur); if (cur.userData.update) cur.userData.update(0);
  }
  function resize() { const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = 9.2 * Math.max(1, 0.78 / (w / h)); cam.updateProjectionMatrix(); }
  function frame(t) { if (!running) return; raf = requestAnimationFrame(frame); if (!drag) rot += 0.006; if (cur) { cur.rotation.y = rot; if (cur.userData.update) cur.userData.update(t); } ring.rotation.z = t * 0.0004; r.render(scene, cam); }
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX }; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} });
  canvas.addEventListener('pointermove', e => { if (!drag) return; rot += (e.clientX - drag.x) * 0.012; drag.x = e.clientX; });
  ['pointerup', 'pointercancel'].forEach(t => canvas.addEventListener(t, () => { drag = null; }));
  return { show, resize, start() { if (running) return; running = true; resize(); raf = requestAnimationFrame(frame); }, stop() { running = false; cancelAnimationFrame(raf); }, dispose() { running = false; cancelAnimationFrame(raf); r.dispose(); try { r.forceContextLoss(); } catch (e) {} } };
}
