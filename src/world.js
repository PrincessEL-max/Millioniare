import * as THREE from 'three';
import { $, LOT_LARGE, LOT_SMALL, OWN, RENT_LARGE, RENT_SMALL, cvs, hex, mat, rnd } from './config.js';
import { LINKS, MAP, START, T, TREES, tp } from './map.js';
import { scene } from './scene.js';

// ---------- jalan & lot ----------
function roadTex(d){const c=cvs(128),g=c.getContext('2d');g.fillStyle='#8c9097';g.fillRect(0,0,128,128);g.fillStyle='#d5d8dc';
  if(d=='h'){g.fillRect(0,0,128,10);g.fillRect(0,118,128,10);g.fillStyle='#fff';for(let x=8;x<128;x+=64)g.fillRect(x,61,36,7)}
  if(d=='v'){g.fillRect(0,0,10,128);g.fillRect(118,0,10,128);g.fillStyle='#fff';for(let y=8;y<128;y+=64)g.fillRect(61,y,7,36)}
  return new THREE.CanvasTexture(c)}
const RT={h:roadTex('h'),v:roadTex('v'),c:roadTex('c')};
function badge(t){const c=cvs(128),g=c.getContext('2d');
  const color=t[1]=='bus'?0xe6d810:t[1]=='bank'?0x27ae60:t[1]=='star'?0xf5a623:t[3];
  g.fillStyle=hex(color);g.fillRect(0,0,128,128);
  g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
  g.font=`bold ${String(t[2]||t[0]).length>2?42:64}px sans-serif`;
  g.fillText(t[1]=='bus'?'B':t[1]=='bank'?'$':t[1]=='star'?'★':t[2],64,70);
  return new THREE.CanvasTexture(c)}
export const L=[];
const lotStates=new Map();
export function drawLot(i){const l=L[i],g=l.c.getContext('2d');g.fillStyle='#ebc16d';g.fillRect(0,0,128,128);g.strokeStyle='#d9ab52';g.lineWidth=3;
  g.beginPath();g.moveTo(64,0);g.lineTo(64,128);g.moveTo(0,64);g.lineTo(128,64);g.stroke();
  g.strokeStyle=l.o<0?'#f7dea0':OWN[l.o];g.lineWidth=12;g.strokeRect(6,6,116,116);l.tex.needsUpdate=true}
T.forEach((t,i)=>{const [x,z]=tp(i),M=MAP[i],q=M.p,neighbors=LINKS[i].map(j=>MAP[j]).filter(Boolean);
  const horizontal=neighbors.some(m=>m.p[1]==q[1]),vertical=neighbors.some(m=>m.p[0]==q[0]);
  const d=horizontal&&!vertical?'h':vertical&&!horizontal?'v':'c';
  const r=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:RT[d]}));r.rotation.x=-Math.PI/2;r.position.set(x,.02,z);scene.add(r);
  if(t[1]=='l'){const lt=M.lot,existing=lotStates.get(lt.id);
    if(existing){L[i]=existing;return}
    const w=lt.s==2?3.6:1.8,lx=lt.x*2,lz=lt.z*2,c=cvs(128),tex=new THREE.CanvasTexture(c);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w),new THREE.MeshBasicMaterial({map:tex}));m.rotation.x=-Math.PI/2;m.position.set(lx,.03,lz);scene.add(m);
    const state={o:-1,lv:0,c,tex,lx,lz,sz:lt.s==2?1.7:1,b:null,s:lt.s,group:lt.group,
      price:lt.s==2?LOT_LARGE:LOT_SMALL,rent:lt.s==2?RENT_LARGE:RENT_SMALL,id:lt.id};
    lotStates.set(lt.id,state);L[i]=state}
  else if(t[1]!='r'){const m=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,.18,28),[mat(0xffffff),new THREE.MeshBasicMaterial({map:badge(t)}),mat(0xffffff)]);m.position.set(x,.11,z);scene.add(m)}});
function tree(x,z){const g=new THREE.Group(),c=[0xf3b127,0xc45ad1,0x66cc33][rnd(0,2)];
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,.7,6),mat(0x7a4a24));tr.position.y=.35;g.add(tr);
  [[0,1.1,0,.55],[.4,.9,.1,.4],[-.35,.85,-.1,.4],[.05,1.45,.1,.38]].forEach(([a,b,d,r])=>{const s=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat(c));s.position.set(a,b,d);g.add(s)});
  g.position.set(x,0,z);scene.add(g)}
const free=(x,z)=>MAP.every(m=>Math.hypot(m.p[0]*2-x,m.p[1]*2-z)>2.2&&(!m.lot||Math.hypot(m.lot.x*2-x,m.lot.z*2-z)>(m.lot.s==2?3.3:2.2)));
const marker=new THREE.Mesh(new THREE.CircleGeometry(.2,20),new THREE.MeshBasicMaterial({color:0x171717}));
marker.rotation.x=-Math.PI/2;marker.position.set(START[0]*2,.08,START[1]*2);scene.add(marker);
const label=cvs(256,64),ctx=label.getContext('2d');ctx.fillStyle='#171717';ctx.font='bold 42px sans-serif';ctx.fillText('START',4,46);
const startLabel=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(label),transparent:true}));
startLabel.position.set(START[0]*2+1.5,.35,START[1]*2);startLabel.scale.set(2, .5, 1);scene.add(startLabel);
TREES.fixed.forEach(([x,z])=>tree(x*2,z*2));
for(let k=0,n=0;n<TREES.random.n&&k<800;k++){const [a,b,c,d]=TREES.random.box,x=(a+Math.random()*(c-a))*2,z=(b+Math.random()*(d-b))*2;if(free(x,z)&&Math.hypot(x-START[0]*2,z-START[1]*2)>2.2){tree(x,z);n++}}
// ---------- bangunan ----------
function winTex(col,rep){const c=cvs(32),g=c.getContext('2d');g.fillStyle=hex(col);g.fillRect(0,0,32,32);g.fillStyle='rgba(255,255,255,.6)';
  for(let y=4;y<32;y+=16)for(let x=4;x<32;x+=16)g.fillRect(x,y,8,8);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,rep);return new THREE.MeshLambertMaterial({map:t})}
const tower=(w,h,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),winTex(c,Math.max(1,Math.round(h*1.4))));m.position.y=h/2;return m};
export function setB(i){const l=L[i];if(l.b){scene.remove(l.b);l.b=null}if(!l.lv)return;const g=new THREE.Group();
  if(l.lv==1){const b=new THREE.Mesh(new THREE.BoxGeometry(1,.6,.85),mat(0xf2d3a0));b.position.y=.3;
    const r=new THREE.Mesh(new THREE.ConeGeometry(.85,.55,4),mat(0xd32f2f));r.rotation.y=Math.PI/4;r.position.y=.87;g.add(b,r)}
  else g.add(l.lv==2?tower(1,1.8,0xec407a):tower(.9,3.4,0x42a5f5));
  g.scale.setScalar(l.sz);g.position.set(l.lx,.03,l.lz);scene.add(g);l.b=g}
