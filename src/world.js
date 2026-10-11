import * as THREE from 'three';
import { $, LOT_LARGE, LOT_SMALL, OWN, RENT_LARGE, RENT_SMALL, cvs, hex, mat, rnd } from './config.js';
import { LINKS, MAP, START, T, TREES, tp } from './map.js';
import { renderer, scene } from './scene.js';

// ---------- jalan & lot ----------
function canvasTex(c){const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();return tex}
function roadTex(d){const c=cvs(512),g=c.getContext('2d');g.scale(4,4);g.fillStyle='#8c9097';g.fillRect(0,0,128,128);g.fillStyle='#d5d8dc';
  if(d=='h'){g.fillRect(0,0,128,10);g.fillRect(0,118,128,10);g.fillStyle='#fff';for(let x=8;x<128;x+=64)g.fillRect(x,61,36,7)}
  if(d=='v'){g.fillRect(0,0,10,128);g.fillRect(118,0,10,128);g.fillStyle='#fff';for(let y=8;y<128;y+=64)g.fillRect(61,y,7,36)}
  return canvasTex(c)}
const RT={h:roadTex('h'),v:roadTex('v'),c:roadTex('c')};
function badge(t){const c=cvs(512),g=c.getContext('2d');g.scale(4,4);
  const color=t[1]=='bus'?0xe6d810:t[1]=='bank'?0x27ae60:t[1]=='star'?0xf5a623:t[3];
  const rgb=`#${color.toString(16).padStart(6,'0')}`;
  const gradient=g.createLinearGradient(0,8,0,120);gradient.addColorStop(0,'#fff');gradient.addColorStop(.12,rgb);gradient.addColorStop(.72,rgb);gradient.addColorStop(1,'#554b46');
  g.shadowColor='#0008';g.shadowBlur=10;g.shadowOffsetY=5;g.fillStyle=gradient;g.beginPath();g.ellipse(64,64,59,53,0,0,Math.PI*2);g.fill();
  g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  g.strokeStyle='#fff9';g.lineWidth=4;g.beginPath();g.ellipse(64,61,49,42,0,0,Math.PI*2);g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.shadowColor='#17304a';g.shadowBlur=2;g.shadowOffsetY=3;
  if(t[1]=='bus'){
    g.fillStyle='#fff';g.strokeStyle='#27404c';g.lineWidth=3;g.beginPath();g.roundRect(31,39,66,43,7);g.fill();g.stroke();
    g.fillStyle='#4c9fc0';g.fillRect(37,45,15,16);g.fillRect(56,45,15,16);g.fillRect(75,45,15,16);
    g.fillStyle='#f5c841';g.fillRect(36,66,57,9);g.fillStyle='#fff';g.beginPath();g.arc(43,84,6,0,Math.PI*2);g.arc(84,84,6,0,Math.PI*2);g.fill();
  }else{
    g.font=`bold ${t[1]=='star'?78:String(t[2]||t[0]).length>2?45:66}px system-ui,sans-serif`;
    g.lineWidth=4;g.strokeStyle='#1c3650';g.strokeText(t[1]=='bank'?'$':t[1]=='star'?'★':String(t[2]),64,64);
    g.fillStyle='#fff';g.fillText(t[1]=='bank'?'$':t[1]=='star'?'★':String(t[2]),64,64);
  }
  return canvasTex(c)}
export const L=[];
const lotStates=new Map();
export function drawLot(i){const l=L[i],g=l.c.getContext('2d');g.setTransform(4,0,0,4,0,0);g.fillStyle='#ebc16d';g.fillRect(0,0,128,128);g.strokeStyle='#d9ab52';g.lineWidth=3;
  g.beginPath();g.moveTo(64,0);g.lineTo(64,128);g.moveTo(0,64);g.lineTo(128,64);g.stroke();
  g.strokeStyle=l.o<0?'#f7dea0':OWN[l.o];g.lineWidth=12;g.strokeRect(6,6,116,116);l.tex.needsUpdate=true}
T.forEach((t,i)=>{const [x,z]=tp(i),M=MAP[i],q=M.p,neighbors=LINKS[i].map(j=>MAP[j]).filter(Boolean);
  const horizontal=neighbors.some(m=>m.p[1]==q[1]),vertical=neighbors.some(m=>m.p[0]==q[0]);
  const d=horizontal&&!vertical?'h':vertical&&!horizontal?'v':'c';
  const r=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:RT[d]}));r.rotation.x=-Math.PI/2;r.position.set(x,.02,z);scene.add(r);
  if(t[1]=='l'){const lt=M.lot,existing=lotStates.get(lt.id);
    if(existing){L[i]=existing;return}
    const w=lt.s==2?4:2,lx=lt.x*2,lz=lt.z*2,c=cvs(512),tex=canvasTex(c);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w),new THREE.MeshBasicMaterial({map:tex}));m.rotation.x=-Math.PI/2;m.position.set(lx,.03,lz);scene.add(m);
    const state={o:-1,lv:0,c,tex,lx,lz,sz:lt.s==2?1.7:1,b:null,s:lt.s,group:lt.group,mesh:m,
      price:lt.s==2?LOT_LARGE:LOT_SMALL,rent:lt.s==2?RENT_LARGE:RENT_SMALL,id:lt.id};
    lotStates.set(lt.id,state);L[i]=state}
  else if(t[1]!='r'){const color=t[1]=='bus'?0xe6d810:t[1]=='bank'?0x27ae60:t[1]=='star'?0xf5a623:t[3];
    const side=new THREE.MeshStandardMaterial({color:color,roughness:.38,metalness:.16});
    const top=new THREE.MeshStandardMaterial({map:badge(t),roughness:.42,metalness:.08});
    const m=new THREE.Mesh(new THREE.CylinderGeometry(.78,.72,.24,48),[side,top,side]);m.position.set(x,.14,z);scene.add(m)}});
export async function flashLot(i){const lot=L[i];if(!lot?.mesh)return;
  const material=lot.mesh.material,colors=[0xffee58,0xff695e,0xffffff,0x5ee6ff];
  for(let round=0;round<3;round++)for(const color of colors){material.color.setHex(color);await new Promise(resolve=>setTimeout(resolve,75))}
  material.color.setHex(0xffffff)}
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
function winTex(col,rep){const c=cvs(128),g=c.getContext('2d');g.scale(4,4);g.fillStyle=hex(col);g.fillRect(0,0,32,32);g.fillStyle='rgba(255,255,255,.6)';
  for(let y=4;y<32;y+=16)for(let x=4;x<32;x+=16)g.fillRect(x,y,8,8);
  const t=canvasTex(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,rep);return new THREE.MeshLambertMaterial({map:t})}
const tower=(w,h,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),winTex(c,Math.max(1,Math.round(h*1.4))));m.position.y=h/2;return m};
export function setB(i){const l=L[i];if(l.b){scene.remove(l.b);l.b=null}if(!l.lv)return;const g=new THREE.Group();
  if(l.lv==1){const b=new THREE.Mesh(new THREE.BoxGeometry(1,.6,.85),mat(0xf2d3a0));b.position.y=.3;
    const r=new THREE.Mesh(new THREE.ConeGeometry(.85,.55,4),mat(0xd32f2f));r.rotation.y=Math.PI/4;r.position.y=.87;g.add(b,r)}
  else g.add(l.lv==2?tower(1,1.8,0xec407a):tower(.9,3.4,0x42a5f5));
  g.scale.setScalar(l.sz);g.position.set(l.lx,.03,l.lz);scene.add(g);l.b=g}
