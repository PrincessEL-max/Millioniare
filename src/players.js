import * as THREE from 'three';
import { CASH0, cvs, hex, mat } from './config.js';
import { tp } from './map.js';
import { scene } from './scene.js';
import { L, drawLot } from './world.js';

export const OFF=[[-.75,-.5],[0,-.5],[.75,-.5],[-.75,.5],[0,.5],[.75,.5]];
// ---------- pemain ----------
const STYLES=[
  {c:0xe53935,sk:0xf1d4b8,hr:0x5a3a22,af:1},
  {c:0x43a047,sk:0xa8744f,hr:0x4e342e,bd:1},
  {c:0x1e88e5,sk:0xc68642,hr:0x151515,bob:1},
  {c:0xff9800,sk:0xffd7b5,hr:0x4e342e,af:1,bob:1},
  {c:0x9c27b0,sk:0xf1c7a5,hr:0x402020,bd:1},
  {c:0x00acc1,sk:0xd9a27f,hr:0x151515,af:1}
];
export let P=[];
let settings={humanCount:1,computerCount:2,cash:CASH0,bank:CASH0};
export function getPlayerSettings(){return {...settings}}
export function configurePlayers(next){
  const total=next.humanCount+next.computerCount;
  if(!Number.isInteger(next.humanCount)||next.humanCount<1||
    !Number.isInteger(next.computerCount)||next.computerCount<0||
    total<2||total>STYLES.length||
    !Number.isSafeInteger(next.cash)||next.cash<0||
    !Number.isSafeInteger(next.bank)||next.bank<0)
    throw new RangeError('Pengaturan permainan tidak valid');
  P.forEach(p=>{if(p.m)scene.remove(p.m)});
  settings={...next};
  P=STYLES.slice(0,total).map((style,i)=>{
    const p={...style,n:`Player ${i+1}`,i,h:i<settings.humanCount,
      css:hex(style.c),skc:hex(style.sk),hrc:hex(style.hr),pos:-1,prev:null,
      cash:settings.cash,bank:settings.bank,alive:true,inv:[]};
    p.m=mk(p,total>3?.78:1.15);scene.add(p.m);place(p);return p;
  });
}
export function portrait(p){const c=cvs(96),g=c.getContext('2d'),e=(x,y,a,b,f)=>{g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);g.fillStyle=f;g.fill()};
  g.fillStyle=p.css;g.fillRect(0,0,96,96);
  if(p.af)e(48,40,36,36,p.hrc);if(p.bob)e(48,56,36,42,p.hrc);e(48,56,26,32,p.skc);
  g.fillStyle=p.hrc;g.beginPath();g.ellipse(48,34,28,16,0,Math.PI,0);g.fill();
  [38,58].forEach(x=>{e(x,54,6,5,'#fff');e(x,55,2.8,2.8,'#2b1a10')});
  g.strokeStyle=p.hrc;g.lineWidth=3;g.beginPath();g.moveTo(30,46);g.lineTo(44,48);g.moveTo(66,46);g.lineTo(52,48);g.stroke();
  if(p.bd){g.fillStyle=p.hrc;g.beginPath();g.ellipse(48,72,23,16,0,0,Math.PI);g.fill()}
  g.strokeStyle='#d98a74';g.lineWidth=3;g.beginPath();g.moveTo(41,76);g.lineTo(55,76);g.stroke();
  c.style.cssText='width:62px;height:62px;border-radius:12px;display:block';return c}
function mk(p,scale=1.15){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(.5,.55,.35),mat(p.c));b.position.y=.65;
  const lg=[-.12,.12].map(x=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.4,.2),mat(0x2a3f8a));m.position.set(x,.22,0);return m});
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.4,32,24),mat(p.sk));hd.position.y=1.3;
  const hr=new THREE.Mesh(new THREE.SphereGeometry(p.af?.52:.43,32,20,0,7,0,1.6),mat(p.hr));hr.position.y=p.af?1.38:1.34;
  const ey=[-.15,.15].map(x=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.05,16,12),mat(0x111111));m.position.set(x,1.25,.37);return m});
  g.add(b,...lg,hd,hr,...ey);g.rotation.y=Math.PI/4;g.scale.setScalar(scale);return g}
export const place=p=>{const [x,z]=tp(p.pos),offset=OFF[p.i];p.m.position.set(x+offset[0],.02,z+offset[1])};
configurePlayers(settings);
L.forEach((l,i)=>drawLot(i));
