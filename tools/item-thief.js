import * as THREE from 'three';
import { _M, _add, _canvasTex } from './item-utils.js';

export function createItemThief() {
  const g = new THREE.Group();
  g.name = 'ItemPencuri';

  const skin = _M(0xe9b894, { roughness: 0.55 });
  const dark = _M(0x20232c, { roughness: 0.8 });
  const trim = _M(0x343b48, { roughness: 0.75 });
  const shoe = _M(0x101217, { roughness: 0.7 });
  const stripeMap = _canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = '#354052';
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 18) {
      c.fillStyle = y % 36 ? '#18202b' : '#202a38';
      c.fillRect(0, y, w, 8);
    }
  });
  const shirt = _M(0xffffff, { map: stripeMap, roughness: 0.85 });
  const legs = [], arms = [];

  const torso = new THREE.Group();
  torso.position.set(0, 1.52, 0);
  g.add(torso);
  const coat = _add(new THREE.CylinderGeometry(0.39, 0.3, 0.88, 24), shirt, 0, 0.45, 0, torso);
  coat.scale.z = 0.78;
  _add(new THREE.TorusGeometry(0.3, 0.065, 10, 24), dark, 0, 0.02, 0, torso);
  _add(new THREE.BoxGeometry(0.12, 0.72, 0.045), trim, 0, 0.48, 0.31, torso);
  _add(new THREE.SphereGeometry(0.11, 16, 12), _M(0xe3b84f, { metalness: 0.35 }), 0, 0.48, 0.36, torso);

  [-1, 1].forEach(side => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.17, 1.1, 0);
    g.add(hip);
    _add(new THREE.CylinderGeometry(0.14, 0.12, 0.5, 16), dark, 0, -0.25, 0, hip);
    const knee = new THREE.Group();
    knee.position.y = -0.5;
    hip.add(knee);
    _add(new THREE.SphereGeometry(0.12, 12, 10), trim, 0, 0, 0, knee);
    _add(new THREE.CylinderGeometry(0.11, 0.1, 0.43, 14), dark, 0, -0.22, 0, knee);
    _add(new THREE.BoxGeometry(0.25, 0.13, 0.4), shoe, 0, -0.46, 0.09, knee);
    legs.push({ hip, knee, side });

    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.4, 0.73, 0);
    torso.add(shoulder);
    _add(new THREE.SphereGeometry(0.14, 14, 12), shirt, 0, 0, 0, shoulder);
    _add(new THREE.CylinderGeometry(0.105, 0.09, 0.43, 14), shirt, 0, -0.24, 0, shoulder);
    const elbow = new THREE.Group();
    elbow.position.y = -0.45;
    shoulder.add(elbow);
    _add(new THREE.SphereGeometry(0.1, 12, 10), trim, 0, 0, 0, elbow);
    _add(new THREE.CylinderGeometry(0.085, 0.075, 0.32, 12), dark, 0, -0.17, 0, elbow);
    _add(new THREE.SphereGeometry(0.1, 12, 10), skin, 0, -0.36, 0.015, elbow);
    arms.push({ shoulder, elbow, side });
  });

  const head = new THREE.Group();
  head.position.set(0, 2.82, 0);
  g.add(head);
  _add(new THREE.SphereGeometry(0.5, 32, 24), dark, 0, 0, 0, head);
  _add(new THREE.SphereGeometry(0.43, 28, 20), skin, 0, -0.03, 0.1, head);
  const eyeBand = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.24, 0.07),
    _M(0xe9c69d, { roughness: 0.7 })
  );
  eyeBand.position.set(0, -0.02, 0.45);
  head.add(eyeBand);
  [-1, 1].forEach(side => {
    _add(new THREE.SphereGeometry(0.095, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf7f3e9 }), side * 0.16, 0.015, 0.49, head).scale.set(1, .68, .45);
    _add(new THREE.SphereGeometry(0.037, 12, 10), new THREE.MeshBasicMaterial({ color: 0x17191e }), side * 0.16, 0.015, 0.525, head);
  });
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.022, 8, 20, Math.PI),
    _M(0xe9c69d, { roughness: 0.7 })
  );
  smile.position.set(0, -0.28, 0.41);
  smile.rotation.z = Math.PI;
  head.add(smile);

  const bag = new THREE.Group();
  bag.position.set(0.49, 0.02, -0.16);
  torso.add(bag);
  const sack = _M(0xb8894e, { roughness: 0.88 });
  const sackBody = _add(new THREE.SphereGeometry(0.38, 24, 18), sack, 0, -0.14, 0, bag);
  sackBody.scale.set(1, 1.12, 0.82);
  _add(new THREE.ConeGeometry(0.16, 0.26, 14), sack, 0, 0.23, 0, bag);
  const knot = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 16), trim);
  knot.rotation.x = Math.PI / 2;
  knot.position.y = 0.12;
  bag.add(knot);
  const dollar = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.32),
    new THREE.MeshBasicMaterial({ map: _canvasTex(128, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#f4dc9a';
      c.font = '900 104px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('$', w / 2, h / 2 + 4);
    }), transparent: true, side: THREE.DoubleSide })
  );
  dollar.position.set(0, -0.15, 0.315);
  bag.add(dollar);

  g.userData.update = ms => {
    const phase = ms * 0.009;
    torso.position.y = 1.52 + Math.abs(Math.sin(phase)) * 0.06;
    head.rotation.z = Math.sin(phase) * 0.045;
    legs.forEach(({ hip, knee, side }) => {
      const stride = phase + (side < 0 ? Math.PI : 0);
      hip.rotation.x = -Math.sin(stride) * 0.75;
      knee.rotation.x = Math.max(0, -Math.cos(stride)) * 0.8;
    });
    arms.forEach(({ shoulder, elbow, side }) => {
      const stride = phase + (side < 0 ? 0 : Math.PI);
      shoulder.rotation.x = -Math.sin(stride) * 0.55;
      elbow.rotation.x = -0.7;
    });
    bag.rotation.x = Math.sin(phase + 0.7) * 0.16;
  };
  return g;
}
