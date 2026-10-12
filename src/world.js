import * as THREE from 'three';
import { $, LOT_LARGE, LOT_SMALL, OWN, RENT_LARGE, RENT_SMALL, cvs, hex, mat, rnd } from './config.js';
import { LINKS, MAP, START, T, TREES, tp } from './map.js';
import { renderer, scene } from './scene.js';
import { createHouse1 } from '../house/house1.js';
import { createHouse2 } from '../house/house2.js';
import { createHouse3 } from '../house/house3.js';
import { createHouse4 } from '../house/house4.js';
import { createHouse5 } from '../house/house5.js';
import { createHotel } from '../hotel/hotel.js';
import { createHotel2 } from '../hotel/hotel2.js';
import { createHotel3 } from '../hotel/hotel3.js';
import { createHotel4 } from '../hotel/hotel4.js';
import { createHotel5 } from '../hotel/hotel5.js';

// ---------- jalan & lot ----------
const ICONS={'pad-20':'coin-20.png','pad-50':'coin-50.png','pad-100':'coin-100.png',bus:'bus.png',bank:'bank.png',star:'star.png'};
const iconLoader=new THREE.TextureLoader();
const iconTile=ic=>ic.t=='pad'?[String(ic.v),'pad',ic.v,ic.c]:[ic.t=='bank'?'Tabungan':ic.t=='bus'?'Bus':'Bintang',ic.t];
function canvasTex(c){const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();return tex}
function addIcon(t,x,z){
  const key=t[1]=='pad'?`pad-${t[2]}`:t[1],file=ICONS[key];
  if(!file)return;
  iconLoader.load(`/icons/${file}`,loaded=>{
    const image=loaded.image,c=cvs(image.width,image.height),g=c.getContext('2d');
    g.drawImage(image,0,0);const pixels=g.getImageData(0,0,c.width,c.height),data=pixels.data,queue=new Uint32Array(c.width*c.height);
    // Remove edge-connected white only, keeping white details inside each logo.
    let head=0,tail=0;
    const add=(i)=>{const n=i*4;if(data[n+3]&&data[n]>242&&data[n+1]>242&&data[n+2]>242){data[n+3]=0;queue[tail++]=i}};
    for(let a=0;a<c.width;a++){add(a);add((c.height-1)*c.width+a)}
    for(let a=1;a<c.height-1;a++){add(a*c.width);add(a*c.width+c.width-1)}
    while(head<tail){const i=queue[head++],x0=i%c.width;
      if(x0)add(i-1);if(x0<c.width-1)add(i+1);
      if(i>=c.width)add(i-c.width);if(i<c.width*(c.height-1))add(i+c.width)}
    g.putImageData(pixels,0,0);loaded.dispose();
    const texture=canvasTex(c),material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.02,depthWrite:false,side:THREE.DoubleSide});
    const logo=new THREE.Mesh(new THREE.PlaneGeometry(1.98,1.98),material);
    logo.rotation.x=-Math.PI/2;logo.position.set(x,.105,z);scene.add(logo);
  },undefined,error=>console.error(`Failed to load street icon: ${file}`,error));
}
function roadTex(arms){const c=cvs(512),g=c.getContext('2d');g.scale(4,4);g.fillStyle='#8c9097';g.fillRect(0,0,128,128);
  g.strokeStyle='#fff';g.lineWidth=7;g.setLineDash([20,18]);g.lineCap='butt';
  const ends={n:[64,0],e:[128,64],s:[64,128],w:[0,64]},remaining=new Set(arms);
  for(const [a,b] of [['n','s'],['e','w']])if(remaining.has(a)&&remaining.has(b)){
    g.beginPath();g.moveTo(...ends[a]);g.lineTo(...ends[b]);g.stroke();remaining.delete(a);remaining.delete(b)}
  if(remaining.size==2){const [a,b]=[...remaining],vertical=d=>d=='n'||d=='s';
    if(vertical(a)!=vertical(b)){g.beginPath();g.moveTo(...ends[a]);g.quadraticCurveTo(64,64,...ends[b]);g.stroke();remaining.clear()}}
  if(remaining.size>=3){
    const straight=remaining.has('n')&&remaining.has('s')?['n','s']:remaining.has('e')&&remaining.has('w')?['e','w']:[];
    if(straight.length){g.beginPath();g.moveTo(...ends[straight[0]]);g.lineTo(...ends[straight[1]]);g.stroke();straight.forEach(d=>remaining.delete(d))}
  }
  for(const d of remaining){g.beginPath();g.moveTo(...ends[d]);g.lineTo(64,64);g.stroke()}
  return canvasTex(c)}
export const L=[];
const lotStates=new Map();
const frontageByLot=new Map();
for(const tile of MAP)if(tile.lot){
  const id=tile.lot.id;
  const frontage=frontageByLot.get(id)||{x:0,z:0,count:0};
  frontage.x+=tile.p[0];frontage.z+=tile.p[1];frontage.count++;
  frontageByLot.set(id,frontage);
}
const lotFacing=(lot)=>{
  const frontage=frontageByLot.get(lot.id);
  if(!frontage)return 0;
  const dx=frontage.x/frontage.count-lot.x,dz=frontage.z/frontage.count-lot.z;
  return Math.atan2(dx,dz);
};
function lotFrame(w,lx,lz){const g=new THREE.Group(),thick=.1,edge=w/2-thick/2,material=new THREE.MeshBasicMaterial({color:0xf7dea0});
  const strip=(x,z,sx,sz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(sx,.015,sz),material);m.position.set(x,.1675,z);g.add(m)};
  strip(0,-edge,w,thick);strip(0,edge,w,thick);
  strip(-edge,0,thick,w);strip(edge,0,thick,w);
  g.position.set(lx,0,lz);scene.add(g);return {group:g,material}}
export function drawLot(i){const l=L[i],g=l.c.getContext('2d');g.setTransform(4,0,0,4,0,0);const fill=g.createLinearGradient(8,8,120,120);fill.addColorStop(0,'#f4cb68');fill.addColorStop(1,'#e5ad45');g.fillStyle=fill;g.fillRect(0,0,128,128);g.strokeStyle='#c89438';g.lineWidth=3;
  g.beginPath();g.moveTo(64,6);g.lineTo(64,122);g.moveTo(6,64);g.lineTo(122,64);g.stroke();
  const ownerColors=['#e53935','#43a047','#1e88e5','#ff9800','#9c27b0','#00acc1'];
  l.tex.needsUpdate=true;l.frame.material.color.set(l.o<0?'#f7dea0':ownerColors[l.o])}
T.forEach((t,i)=>{const [x,z]=tp(i),M=MAP[i],q=M.p,neighbors=LINKS[i].map(j=>MAP[j]).filter(Boolean);
  const arms=[];for(const n of neighbors){const dx=n.p[0]-q[0],dz=n.p[1]-q[1];arms.push(dx<0?'w':dx>0?'e':dz<0?'n':'s')}
  const r=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:roadTex(arms)}));r.rotation.x=-Math.PI/2;r.position.set(x,.02,z);scene.add(r);
  if(t[1]=='l'){const lt=M.lot,existing=lotStates.get(lt.id);
    if(existing){L[i]=existing;return}
    const w=lt.s==2?4:2,lx=lt.x*2,lz=lt.z*2,c=cvs(512),tex=canvasTex(c);
    const side=new THREE.MeshBasicMaterial({color:0xf2d99c});
    const floorSide=new THREE.MeshBasicMaterial({color:0xb98f4e}),floorTop=new THREE.MeshBasicMaterial({map:tex});
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.10,w),side);m.position.set(lx,.05,lz);scene.add(m);
    const inset=w-.32,rim=.16,rail=(x,z,sx,sz)=>{
      const edge=new THREE.Mesh(new THREE.BoxGeometry(sx,.06,sz),side);edge.position.set(lx+x,.13,lz+z);scene.add(edge)};
    rail(0,-w/2+rim/2,w,rim);rail(0,w/2-rim/2,w,rim);
    rail(-w/2+rim/2,0,rim,w);rail(w/2-rim/2,0,rim,w);
    const plot=new THREE.Mesh(new THREE.BoxGeometry(inset,.01,inset),[floorSide,floorSide,floorTop,floorSide,floorSide,floorSide]);
    plot.position.set(lx,.105,lz);scene.add(plot);
    const state={o:-1,lv:0,c,tex,lx,lz,sz:lt.s==2?1.7:1,b:null,s:lt.s,frontYaw:lotFacing(lt),group:lt.group,mesh:m,frame:lotFrame(w,lx,lz),
      price:lt.s==2?LOT_LARGE:LOT_SMALL,rent:lt.s==2?RENT_LARGE:RENT_SMALL,id:lt.id};
    lotStates.set(lt.id,state);L[i]=state;
    if(M.ic)addIcon(iconTile(M.ic),x,z)}
  else if(t[1]!='r')addIcon(t,x,z)});
export async function flashLot(i){const target=L[i];if(!target?.frame||target.o<0)return;
  const lots=[...new Set(L)].filter(l=>l&&l.group==target.group&&l.o==target.o&&l.frame);
  const colors=[0xffee58,0xff695e,0xffffff,0x5ee6ff];
  for(let round=0;round<3;round++)for(const color of colors){lots.forEach(l=>l.frame.material.color.setHex(color));await new Promise(resolve=>setTimeout(resolve,75))}
  const ownerColors=['#e53935','#43a047','#1e88e5','#ff9800','#9c27b0','#00acc1'];
  lots.forEach(l=>l.frame.material.color.set(l.o<0?'#f7dea0':ownerColors[l.o]))}
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
const HOUSE_MODELS=[createHouse1,createHouse2,createHouse3,createHouse4,createHouse5];
const HOTEL_MODELS=[createHotel,createHotel2,createHotel3,createHotel4,createHotel5];
function visibleBounds(root){
  const bounds=new THREE.Box3(),box=new THREE.Box3();
  root.updateMatrixWorld(true);
  root.traverse(object=>{
    if(!object.isMesh)return;
    for(let parent=object;parent&&parent!==root;parent=parent.parent)if(!parent.visible)return;
    box.setFromObject(object);bounds.union(box);
  });
  return bounds;
}
function disposeBuilding(root){
  root.traverse(object=>{
    if(!object.isMesh)return;
    object.geometry.dispose();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{
      Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose()});
      material.dispose();
    });
  });
}
export function setB(i){
  const l=L[i];
  if(l.b){scene.remove(l.b);disposeBuilding(l.b);l.b=null}
  if(!l.lv)return;
  const large=l.s==2,create=large?HOTEL_MODELS[l.lv-1]:HOUSE_MODELS[l.lv-1];
  const building=create({props:false}),bounds=visibleBounds(building),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const scale=(large?3.55:1.55)/Math.max(size.x,size.z);
  building.scale.setScalar(scale);
  building.rotation.y=l.frontYaw;
  const centerOffset=new THREE.Vector3(center.x*scale,0,center.z*scale).applyAxisAngle(new THREE.Vector3(0,1,0),l.frontYaw);
  building.position.set(l.lx-centerOffset.x,.16-bounds.min.y*scale,l.lz-centerOffset.z);
  scene.add(building);l.b=building;
}
