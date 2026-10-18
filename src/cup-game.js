// Game tebak koin 3D (3 gelas, 1 koin). Butuh Three.js (import map 'three').
// Pakai:
//   const game = createCupGame(el, { reward:250, shuffles:14,
//                  onStart(){}, onWin(reward){}, onLose(){}, onMessage(text){} });
//   game.start();  game.newRound();  game.pickSlot(0|1|2);  game.destroy();  game.setMoney(0);
// Event DOM pada el: 'cup:win' (detail:{reward}), 'cup:lose'.
// Opsi lain: showUI:false (sembunyikan HUD/tombol bawaan, kendalikan lewat start()/newRound()),
//            background:'css background' atau 'transparent'.
import * as THREE from 'three';
import {unlock,ting,sad,thud,whoosh} from './cup-sounds.js';
import { CHARACTERS } from '../ui/menu-data.js';

const CSS=`
.cg-root{position:relative;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,sans-serif;-webkit-user-select:none;user-select:none;background:linear-gradient(#63bbf4,#2f86d8)}
.cg-root canvas{position:absolute;inset:0;z-index:0;display:block;touch-action:none}
.cg-hud{position:absolute;left:0;right:0;top:10px;display:flex;justify-content:space-between;padding:0 14px;pointer-events:none;z-index:2}
.cg-chip{background:rgba(10,40,80,.5);color:#fff;padding:6px 14px;border-radius:18px;font-size:15px;font-weight:700}
.cg-msg{position:absolute;left:0;right:0;bottom:86px;text-align:center;color:#fff;font-weight:800;font-size:clamp(18px,3.4vw,28px);text-shadow:0 2px 6px rgba(0,0,0,.45);padding:0 16px;pointer-events:none;z-index:2}
.cg-btn{position:absolute;left:50%;transform:translateX(-50%);bottom:20px;border:0;border-radius:26px;padding:14px 36px;font-size:18px;font-weight:800;background:#ffc93c;color:#5a3a00;box-shadow:0 4px 0 #c28f00,0 8px 16px rgba(0,0,0,.25);cursor:pointer;z-index:3}
.cg-btn:active{transform:translateX(-50%) translateY(3px);box-shadow:0 1px 0 #c28f00}
.cg-btn[hidden]{display:none}
`;
let styled=false;
const REV=+THREE.REVISION;
const easeIO=p=>.5-.5*Math.cos(Math.PI*p),easeOut=p=>1-(1-p)**3,easeIn=p=>p*p;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const POS=['kiri','tengah','kanan'];

export function createCupGame(container,opts={}){
  if(!styled){styled=true;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s)}
  const o=Object.assign({reward:250,shuffles:14,showUI:true,background:null,onStart:null,onWin:null,onLose:null,onMessage:null},opts);
  container.classList.add('cg-root');
  if(o.background)container.style.background=o.background==='transparent'?'none':o.background;
  if(container.clientHeight<100)container.style.minHeight='480px';

  // ---------- renderer / scene ----------
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true});
  if('useLegacyLights' in R)R.useLegacyLights=true;           // samakan tampilan di Three.js baru
  const K=REV>=165?Math.PI:1;
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  container.appendChild(R.domElement);
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(38,1,.1,80);
  S.add(new THREE.HemisphereLight(0xffffff,0x9bb7d6,.95*K));
  const sun=new THREE.DirectionalLight(0xffffff,.9*K);sun.position.set(3,8,6);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-8,right:8,top:6,bottom:-6,near:1,far:25});S.add(sun);
  function layout(){
    const w=container.clientWidth||640,h=container.clientHeight||480;R.setSize(w,h);C.aspect=w/h;C.updateProjectionMatrix();
    const half=Math.tan(C.fov*Math.PI/360),d=Math.max(8.2,4.9/(C.aspect*half)),p=.34;
    C.position.set(0,1+d*Math.sin(p),d*Math.cos(p));C.lookAt(0,1,0);
  }
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(layout):null;
  if(ro)ro.observe(container);else addEventListener('resize',layout);
  layout();

  const cTex=(w,h,draw)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);
    const t=new THREE.CanvasTexture(cv);t.anisotropy=4;t.encoding=THREE.sRGBEncoding;return t};
  // meja kayu
  const woodTex=cTex(1024,512,(g,w,h)=>{
    g.fillStyle='#e8c78c';g.fillRect(0,0,w,h);
    for(let i=0;i<6;i++){g.fillStyle=i%2?'rgba(190,150,90,.14)':'rgba(255,240,200,.12)';g.fillRect(0,i*h/6,w,h/6)}
    for(let i=0;i<260;i++){g.strokeStyle=`rgba(150,105,50,${Math.random()*.18})`;g.lineWidth=Math.random()*2+.5;const y=Math.random()*h;g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=64)g.lineTo(x,y+Math.sin(x*.01+i)*3);g.stroke()}
    g.strokeStyle='rgba(120,80,35,.55)';g.lineWidth=3;for(let i=1;i<6;i++){g.beginPath();g.moveTo(0,i*h/6);g.lineTo(w,i*h/6);g.stroke()}
  });
  const side=new THREE.MeshStandardMaterial({color:0xcfa062,roughness:.8});
  const table=new THREE.Mesh(new THREE.BoxGeometry(12,.6,5.4),[side,side,new THREE.MeshStandardMaterial({map:woodTex,roughness:.7}),side,side,side]);
  table.position.set(0,-.3,.3);table.receiveShadow=true;S.add(table);

  const dikaProfile=CHARACTERS.find(character=>character.id==='tafa');
  if(!dikaProfile)throw new Error('Karakter Dika tidak ditemukan untuk mini-game.');
  const dika=dikaProfile.make();dika.position.set(0,0,-2.7);dika.scale.setScalar(1.05);S.add(dika);

  // gelas
  const X=[-2.3,0,2.3];
  const cupGeo=new THREE.LatheGeometry([[.64,0],[.66,.03],[.64,.07],[.62,.1],[.6,.3],[.57,.6],[.53,.9],[.5,1.1],[.46,1.19],[.38,1.23],[.2,1.25],[.001,1.25]].map(p=>new THREE.Vector2(p[0],p[1])),44);
  const rimGeo=new THREE.TorusGeometry(.65,.035,12,44);
  const cups=[0,1,2].map(i=>{
    const g=new THREE.Group(),m=new THREE.MeshPhysicalMaterial({color:0x8e0f1a,roughness:.28,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:1,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(cupGeo,m);mesh.castShadow=true;g.add(mesh);
    const rim=new THREE.Mesh(rimGeo,new THREE.MeshStandardMaterial({color:0xb4212e,roughness:.3}));rim.rotation.x=Math.PI/2;rim.position.y=.04;g.add(rim);
    g.position.x=X[i];g.userData={cup:i,mat:m};S.add(g);return g;
  });
  const slot=[0,1,2];                                  // slot[gelas] = 0 kiri, 1 tengah, 2 kanan
  const cupAt=s=>slot.findIndex(v=>v===s);
  const setY=(c,y)=>{c.position.y=y;c.userData.mat.opacity=1-.42*Math.min(1,Math.max(0,y)/1.8)};

  // koin
  const coinTex=cTex(256,256,(g,w,h)=>{
    const r=g.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);r.addColorStop(0,'#ffe888');r.addColorStop(.7,'#f3c23c');r.addColorStop(1,'#b8860b');
    g.fillStyle=r;g.fillRect(0,0,w,h);g.strokeStyle='#a6740a';g.lineWidth=8;g.beginPath();g.arc(w/2,h/2,w/2-14,0,7);g.stroke();
    g.lineWidth=3;g.beginPath();g.arc(w/2,h/2,w/2-30,0,7);g.stroke();
    const txt=String(o.reward);g.font=`900 ${txt.length>3?78:104}px Arial Black,Arial,sans-serif`;g.textAlign='center';g.textBaseline='middle';
    g.lineWidth=10;g.strokeStyle='#8a5a00';g.strokeText(txt,w/2,h/2+4);g.fillStyle='#ffe05a';g.fillText(txt,w/2,h/2+4);
  });
  const gold=new THREE.MeshStandardMaterial({color:0xe0a820,metalness:.35,roughness:.35,emissive:0x5a3c00,emissiveIntensity:.35});
  const coinG=new THREE.Group();
  const coin=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.08,48),[gold,new THREE.MeshStandardMaterial({map:coinTex,metalness:.25,roughness:.4,emissive:0x5a3c00,emissiveIntensity:.3}),gold]);
  coin.rotation.y=Math.PI/2;coin.castShadow=true;coinG.add(coin);coinG.position.y=.05;S.add(coinG);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.78,48),new THREE.MeshBasicMaterial({color:0xffe066,transparent:true,opacity:.9,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.02;ring.visible=false;S.add(ring);
  let coinCup=1;

  // ---------- animasi ----------
  const tweens=new Set(),parts=[];
  const tween=(ms,fn,ease=p=>p)=>new Promise(res=>tweens.add({ms,fn,ease,t0:performance.now(),res}));
  const lift=(c,y=1.9,ms=450)=>{const y0=c.position.y;return tween(ms,p=>setY(c,y0+(y-y0)*p),easeOut)};
  const lower=async(c,ms=380)=>{const y0=c.position.y;await tween(ms,p=>setY(c,y0*(1-p)),easeIn);setY(c,0);thud()};
  async function swapRandom(ms){
    const a=Math.floor(Math.random()*3),b=(a+1+Math.floor(Math.random()*2))%3;
    const ca=cupAt(a),cb=cupAt(b),dir=Math.random()<.5?1:-1;whoosh(ms);
    await tween(ms,p=>{
      cups[ca].position.x=X[a]+(X[b]-X[a])*p;cups[cb].position.x=X[b]+(X[a]-X[b])*p;
      const z=Math.sin(Math.PI*p)*1.05*dir;cups[ca].position.z=z;cups[cb].position.z=-z;
    },easeIO);
    slot[ca]=b;slot[cb]=a;
  }
  async function cycle(ms){
    const dir=Math.random()<.5?1:2,order=[0,1,2].map(s=>cupAt(s));whoosh(ms);
    await tween(ms,p=>order.forEach((ci,s)=>{
      const to=(s+dir)%3,far=Math.abs(to-s)===2;
      cups[ci].position.x=X[s]+(X[to]-X[s])*p;cups[ci].position.z=(far?1:-.3)*Math.sin(Math.PI*p)*1.05;
    }),easeIO);
    order.forEach((ci,s)=>slot[ci]=(s+dir)%3);
  }
  function burst(){
    for(let i=0;i<16;i++){
      const m=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.03,16),gold);m.position.copy(coinG.position);
      parts.push({m,v:new THREE.Vector3((Math.random()-.5)*3.2,3+Math.random()*2.5,(Math.random()-.2)*2.2),t:0});S.add(m);
    }
  }

  // ---------- UI ----------
  let ui=null,msgEl=null,btn=null,scoreEl=null,money=0,state='intro',destroyed=false;
  if(o.showUI){
    ui=document.createElement('div');
    ui.innerHTML=`<div class="cg-hud"><div class="cg-chip cg-score">Koin: 0</div><div class="cg-chip">Hadiah: ${o.reward}</div></div><div class="cg-msg"></div><button class="cg-btn" type="button">Mulai</button>`;
    container.appendChild(ui);
    msgEl=ui.querySelector('.cg-msg');btn=ui.querySelector('.cg-btn');scoreEl=ui.querySelector('.cg-score');
    btn.onclick=()=>{if(state==='intro')start();else if(state==='done')newRound()};
  }
  const setMsg=t=>{if(msgEl)msgEl.textContent=t;o.onMessage&&o.onMessage(t)};
  const setBtn=(text,show)=>{if(btn){if(text)btn.textContent=text;btn.hidden=!show}};
  const showCoinSpot=()=>{ring.position.x=coinG.position.x;ring.position.z=coinG.position.z;ring.visible=true};
  const setMoney=v=>{money=v;if(scoreEl)scoreEl.textContent='Koin: '+money};

  // ---------- alur permainan ----------
  async function start(){
    if(state!=='intro'||destroyed)return;
    unlock();state='busy';setBtn(null,false);o.onStart&&o.onStart();setMsg('Perhatikan koinnya…');
    await wait(1000);await lower(cups[cupAt(1)]);await wait(350);setMsg('Gelas diputar…');
    const N=o.shuffles;
    for(let k=0;k<N&&!destroyed;k++){const p=k/Math.max(1,N-1),ms=Math.max(55,850*Math.pow(190/850,p)*(1-(2/3)*p*p));if(k%4===3)await cycle(ms*1.15);else await swapRandom(ms)}
    await wait(250);state='pick';setMsg('Tebak! Ketuk gelas yang menutupi koin');
  }
  async function guess(i){
    state='busy';await lift(cups[i]);
    if(i===coinCup){
      ting();burst();setMoney(money+o.reward);showCoinSpot();setMsg(`BENAR! +${o.reward} 🎉`);
      const y0=coinG.position.y;tween(700,p=>{coinG.position.y=y0+Math.sin(Math.PI*p)*.9;coinG.rotation.y=p*Math.PI*4},easeOut);
      o.onWin&&o.onWin(o.reward);container.dispatchEvent(new CustomEvent('cup:win',{detail:{reward:o.reward}}));
    }else{
      sad();setMsg('Yah, salah… 😢');o.onLose&&o.onLose();container.dispatchEvent(new CustomEvent('cup:lose'));
      await wait(900);await lift(cups[coinCup]);showCoinSpot();setMsg(`Koin ada di gelas ${POS[slot[coinCup]]}`);
    }
    await wait(600);state='done';setBtn(null,false);o.onComplete?.(i===coinCup);
  }
  async function newRound(){
    if(state!=='done'||destroyed)return;
    state='busy';setBtn(null,false);ring.visible=false;coinCup=-1;
    parts.splice(0).forEach(p=>S.remove(p.m));coinG.rotation.y=0;
    await Promise.all(cups.map(c=>c.position.y<1?lift(c,1.9,350):0));
    const x0=coinG.position.x,z0=coinG.position.z;
    await tween(500,p=>{coinG.position.x=x0*(1-p);coinG.position.z=z0*(1-p);coinG.position.y=.05+Math.sin(Math.PI*p)*.5},easeIO);
    coinCup=cupAt(1);
    await Promise.all([0,2].map(s=>lower(cups[cupAt(s)])));
    state='intro';setMsg(`Koin ${o.reward} ada di bawah gelas tengah. Siap?`);setBtn('Mulai',true);
  }

  // ---------- input ----------
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),cv=R.domElement;
  function pick(e){
    const r=cv.getBoundingClientRect();
    ptr.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ptr,C);
    const h=ray.intersectObjects(cups,true)[0];if(!h)return -1;
    let ob=h.object;while(ob&&ob.userData.cup===undefined)ob=ob.parent;return ob?ob.userData.cup:-1;
  }
  cv.addEventListener('pointerdown',e=>{if(state!=='pick')return;const i=pick(e);if(i>=0)guess(i)});
  cv.addEventListener('pointermove',e=>{cv.style.cursor=state==='pick'&&pick(e)>=0?'pointer':'default'});

  // ---------- loop ----------
  const clk=new THREE.Clock();let raf=0;
  function loop(now){
    if(destroyed)return;raf=requestAnimationFrame(loop);
    for(const tw of tweens){const p=Math.min(1,Math.max(0,(now-tw.t0)/tw.ms));tw.fn(tw.ease(p));if(p>=1){tweens.delete(tw);tw.res()}}
    const dt=Math.min(clk.getDelta(),.05);
    if(coinCup>=0){coinG.position.x=cups[coinCup].position.x;coinG.position.z=cups[coinCup].position.z}
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.v.y-=9*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=dt*8;p.m.rotation.z+=dt*6;
      if(p.m.position.y<.05&&p.v.y<0){p.m.position.y=.05;p.v.multiplyScalar(0)}
      if(p.t>1.6){S.remove(p.m);parts.splice(i,1)}}
    if(ring.visible){const s=1+Math.sin(performance.now()/180)*.12;ring.scale.set(s,s,s)}
    dika.userData.update?.(now);
    R.render(S,C);
  }
  raf=requestAnimationFrame(loop);

  // kondisi awal: gelas tengah terangkat, koin terlihat di tengah
  setY(cups[1],1.9);setMsg(`Koin ${o.reward} ada di bawah gelas tengah. Siap?`);

  return {
    el:container,start,newRound,setMoney,
    pickSlot(s){if(state==='pick')return guess(cupAt(s))},   // tebak lewat kode: 0 kiri, 1 tengah, 2 kanan
    get state(){return state},get money(){return money},
    destroy(){destroyed=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else removeEventListener('resize',layout);
      const geometries=new Set(),materials=new Set(),textures=new Set();
      S.traverse(object=>{
        if(object.geometry)geometries.add(object.geometry);
        for(const material of Array.isArray(object.material)?object.material:[object.material]){
          if(!material)continue;
          materials.add(material);
          Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value)});
        }
      });
      geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());
      textures.forEach(texture=>texture.dispose());
      R.dispose();cv.remove();if(ui)ui.remove();container.classList.remove('cg-root')}
  };
}
