import * as THREE from 'three';
import { CASH0, cvs, hex, mat } from './config.js';
import { tp } from './map.js';
import { scene } from './scene.js';
import { L, drawLot } from './world.js';

export const OFF=[[-.4,-.4],[.4,.4],[-.4,.4]];
// ---------- pemain ----------
export const P=[{n:'Player 1',c:0xe53935,sk:0xf1d4b8,hr:0x5a3a22,af:1,bd:0,h:1},{n:'Player 2',c:0x43a047,sk:0xa8744f,hr:0x4e342e,af:0,bd:1},{n:'Player 3',c:0x1e88e5,sk:0xc68642,hr:0x151515,af:0,bd:0,bob:1}]
  .map((p,i)=>({...p,i,css:hex(p.c),skc:hex(p.sk),hrc:hex(p.hr),pos:-1,prev:null,cash:CASH0,bank:CASH0,alive:true,inv:[]}));
export function portrait(p){const c=cvs(96),g=c.getContext('2d'),e=(x,y,a,b,f)=>{g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);g.fillStyle=f;g.fill()};
  g.fillStyle=p.css;g.fillRect(0,0,96,96);
  if(p.af)e(48,40,36,36,p.hrc);if(p.bob)e(48,56,36,42,p.hrc);e(48,56,26,32,p.skc);
  g.fillStyle=p.hrc;g.beginPath();g.ellipse(48,34,28,16,0,Math.PI,0);g.fill();
  [38,58].forEach(x=>{e(x,54,6,5,'#fff');e(x,55,2.8,2.8,'#2b1a10')});
  g.strokeStyle=p.hrc;g.lineWidth=3;g.beginPath();g.moveTo(30,46);g.lineTo(44,48);g.moveTo(66,46);g.lineTo(52,48);g.stroke();
  if(p.bd){g.fillStyle=p.hrc;g.beginPath();g.ellipse(48,72,23,16,0,0,Math.PI);g.fill()}
  g.strokeStyle='#d98a74';g.lineWidth=3;g.beginPath();g.moveTo(41,76);g.lineTo(55,76);g.stroke();
  c.style.cssText='width:62px;height:62px;border-radius:12px;display:block';return c}
function mk(p){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(.5,.55,.35),mat(p.c));b.position.y=.65;
  const lg=[-.12,.12].map(x=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.4,.2),mat(0x2a3f8a));m.position.set(x,.22,0);return m});
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.4,32,24),mat(p.sk));hd.position.y=1.3;
  const hr=new THREE.Mesh(new THREE.SphereGeometry(p.af?.52:.43,32,20,0,7,0,1.6),mat(p.hr));hr.position.y=p.af?1.38:1.34;
  const ey=[-.15,.15].map(x=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.05,16,12),mat(0x111111));m.position.set(x,1.25,.37);return m});
  g.add(b,...lg,hd,hr,...ey);g.rotation.y=Math.PI/4;g.scale.setScalar(1.15);return g}
export const place=p=>{const [x,z]=tp(p.pos);p.m.position.set(x+OFF[p.i][0],.02,z+OFF[p.i][1])};
P.forEach(p=>{p.m=mk(p);scene.add(p.m);place(p)});
L.forEach((l,i)=>drawLot(i));
