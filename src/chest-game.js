// Minigame "The Deal of The Chest" (ala Deal or No Deal) - 3D (Three.js) + overlay HTML.
// Pakai:
//   const game = createChestGame(el, { onFinish(r){ /* r.type 'deal'|'nodeal', r.winnings, r.chestValue */ } });
//   game.newGame();  game.pickChest(i);  game.openChest(i);  game.accept();  game.reject();  game.destroy();
// Opsi: values, formatMoney, openPerRound:[3,3], offerFactors:[.8,.92], shuffle:true, showUI:true, background, text:{...},
//       onFinish, onOffer, onMessage.  Event DOM di el: 'chest:offer', 'chest:finish'.
import * as THREE from 'three';
import {unlock,creak,thud,ting,bad,ring,ching,sad} from './chest-sounds.js';

const U=n=>`calc(var(--u)*${n})`;
const CSS=`
.cg2-root{container-type:size;position:relative;overflow:hidden;font-family:'Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif;-webkit-user-select:none;user-select:none;background:radial-gradient(ellipse at 50% 40%,#7d2f08 0%,#4b1b05 48%,#170803 100%)}
.cg2-root canvas{position:absolute;inset:0;z-index:0;display:block;touch-action:none}
.cg2-ui{position:absolute;inset:0;z-index:2;--u:calc(min(100cqw/1286,100cqh/964));pointer-events:none;color:#fff}
.cg2-ui>*{position:absolute}
.cg2-bar{left:0;right:0;top:0;height:${U(62)};background:#000;font-family:Arial,Helvetica,sans-serif;font-size:${U(36)};line-height:${U(62)};padding-left:${U(6)};white-space:nowrap;overflow:hidden}
.cg2-title{left:${U(40)};top:${U(72)};font-size:${U(84)};font-style:italic;font-weight:900;letter-spacing:.02em;color:#f0b030;text-shadow:${U(3)} ${U(5)} 0 #3a1a00,0 0 ${U(2)} #5a2c00;white-space:nowrap}
.cg2-title::after{content:'';display:block;height:${U(8)};margin-top:${U(2)};width:${U(980)};border-radius:${U(4)};background:linear-gradient(90deg,#f6b83a,#b86a08)}
.cg2-banker{right:${U(10)};top:${U(66)};width:${U(150)};height:${U(150)}}
.cg2-banker svg{width:100%;height:100%;display:block;animation:cg2bob 3s ease-in-out infinite}
.cg2-banker.talk svg{animation-duration:.5s}
@keyframes cg2bob{50%{transform:translateY(${U(-6)}) rotate(-2deg)}}
.cg2-list{right:${U(18)};top:${U(222)};display:flex;flex-direction:column;gap:${U(8)};align-items:flex-end;font-size:${U(46)};font-style:italic;font-weight:900;text-shadow:${U(3)} ${U(3)} 0 rgba(0,0,0,.55)}
.cg2-list div.out{color:#ff1a1a}
.cg2-bank{left:${U(66)};bottom:${U(40)};font-size:${U(84)};font-weight:900;font-style:italic;letter-spacing:.07em;text-shadow:${U(4)} ${U(5)} 0 rgba(0,0,0,.6);white-space:nowrap;opacity:0;transition:opacity .25s}
.cg2-bank.on{opacity:1}
.cg2-thumbs{left:50%;top:${U(300)};transform:translateX(-50%);display:none;gap:${U(110)}}
.cg2-thumbs.on{display:flex}
.cg2-thumb{pointer-events:auto;position:relative;width:${U(200)};height:${U(200)};padding:0;border-radius:50%;border:${U(10)} solid transparent;cursor:pointer;
 background:radial-gradient(circle at 50% 30%,#ffb43a,#c06a08 70%,#7a3c00) padding-box,linear-gradient(135deg,#f4f4f4,#8a8a8a 45%,#d8d8d8 60%,#6a6a6a) border-box;
 box-shadow:0 ${U(8)} ${U(18)} rgba(0,0,0,.5);animation:cg2pulse 1.2s ease-in-out infinite}
.cg2-thumb::after{content:'';position:absolute;left:12%;right:12%;top:6%;height:34%;border-radius:50%;background:linear-gradient(rgba(255,255,255,.4),rgba(255,255,255,0))}
.cg2-thumb svg{position:relative;z-index:1;width:68%;height:68%;display:block;margin:auto}
.cg2-thumb:active{animation:none;transform:scale(.93)}
@keyframes cg2pulse{50%{transform:scale(1.06)}}
.cg2-btn{pointer-events:auto;left:50%;bottom:${U(160)};transform:translateX(-50%);border:0;border-radius:${U(40)};padding:${U(18)} ${U(56)};font-size:${U(40)};font-weight:800;background:#ffc93c;color:#5a3a00;box-shadow:0 ${U(6)} 0 #c28f00,0 ${U(12)} ${U(22)} rgba(0,0,0,.35);cursor:pointer;font-family:inherit}
.cg2-btn:active{transform:translateX(-50%) translateY(${U(4)})}
.cg2-btn[hidden]{display:none}
.cg2-val,.cg2-num{left:0;top:0;white-space:nowrap;will-change:transform;pointer-events:none}
.cg2-val{display:none;font-size:${U(56)};font-style:italic;font-weight:900;text-shadow:${U(3)} ${U(3)} 0 rgba(0,0,0,.6)}
.cg2-val.big{color:#ffe066}
.cg2-num{font-size:${U(30)};font-weight:800;opacity:.8;text-shadow:${U(2)} ${U(2)} 0 rgba(0,0,0,.6)}
`;
let styled=false;
const REV=+THREE.REVISION;
const easeIO=p=>.5-.5*Math.cos(Math.PI*p),easeOut=p=>1-(1-p)**3;
const easeBack=p=>{const c1=1.1,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shuffleArr=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};

// Tawaran bank: rata-rata nilai yang tersisa x faktor, tidak pernah melebihi nilai tertinggi yang tersisa
export function bankOffer(remaining,factor=.8){
  if(!remaining.length)return 0;
  const mn=Math.min(...remaining),mx=Math.max(...remaining),mean=remaining.reduce((a,b)=>a+b,0)/remaining.length;
  return Math.max(mn,Math.min(mx,Math.round(mean*factor)));
}

const BANKER=`<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="36" cy="124" rx="24" ry="40" fill="#111"/><ellipse cx="164" cy="124" rx="24" ry="40" fill="#111"/>
<path d="M30 92Q30 20 100 18Q170 20 170 92L170 132Q170 192 100 192Q30 192 30 132Z" fill="#111"/>
<ellipse cx="100" cy="114" rx="64" ry="70" fill="#fbd9bd"/>
<path d="M36 102Q40 42 100 36Q160 42 164 102Q140 64 100 72Q60 64 36 102Z" fill="#111"/>
<g><ellipse cx="72" cy="114" rx="19" ry="20" fill="#fff" stroke="#222" stroke-width="3"/><circle cx="72" cy="116" r="12" fill="#9a9a9a"/><circle cx="72" cy="116" r="6" fill="#111"/><circle cx="68" cy="111" r="3" fill="#fff"/>
<ellipse cx="128" cy="114" rx="19" ry="20" fill="#fff" stroke="#222" stroke-width="3"/><circle cx="128" cy="116" r="12" fill="#9a9a9a"/><circle cx="128" cy="116" r="6" fill="#111"/><circle cx="124" cy="111" r="3" fill="#fff"/>
<path d="M50 104Q72 90 94 104M106 104Q128 90 150 104" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/></g>
<path d="M58 88Q74 80 90 88M110 88Q126 80 142 88" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>
<path d="M97 126Q100 132 103 126" fill="none" stroke="#c98a6a" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="13" ry="7" fill="#d8323a"/><path d="M88 152Q100 148 112 152" fill="none" stroke="#8a1018" stroke-width="2"/>
<ellipse cx="58" cy="140" rx="12" ry="7" fill="#f4a0a0" opacity=".55"/><ellipse cx="142" cy="140" rx="12" ry="7" fill="#f4a0a0" opacity=".55"/></svg>`;
const THUMB=`<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#0a0a0a"><rect x="6" y="46" width="20" height="46" rx="4"/>
<path d="M30 50L44 50C51 40 54 30 54 20C54 11 61 7 67 12C73 17 71 31 66 44L88 44C95 44 99 50 97 57L93 80C91 88 85 93 77 93L30 93Z"/></g>
<g stroke="#e8a030" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M62 62H92M62 72H90M62 82H86"/></g></svg>`;

const clean=x=>Object.fromEntries(Object.entries(x||{}).filter(([,v])=>v!==undefined));
export function createChestGame(container,opts={}){
  if(!styled){styled=true;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s)}
  const o=Object.assign({values:[1,2,5,10,20,50,200,500],formatMoney:v=>'$'+v,openPerRound:[3,3],offerFactors:[.8,.92],shuffle:true,showUI:true,background:null,
    onFinish:null,onOffer:null,onMessage:null},clean(opts));
  const T=Object.assign({title:'The Deal of The Chest',offer:'Take the offer?',bank:'Bank Offers You:',pick:'Pilih satu peti sebagai milikmu',
    chosen:(n,k)=>`Peti #${n} jadi milikmu. Buka ${k} peti lain`,openMore:k=>`Buka ${k} peti lagi`,rejected:k=>`Ditolak! Buka ${k} peti lagi`,
    accepted:m=>`Kamu terima ${m}!`,own:m=>`Peti kamu berisi ${m}`,good:'Keputusan yang bagus!',pity:'Sayang, peti kamu lebih besar...',luck:'Berani! Peti kamu lebih besar!',
    miss:'Yah, tawaran bank tadi lebih besar...',win:m=>`Kamu menang: ${m}`,again:'Main lagi'},clean(opts.text));
  const N=o.values.length,cols=Math.ceil(N/2),SP=1.9,CHS=1.3,PH=1.0;

  container.classList.add('cg2-root');
  if(o.background)container.style.background=o.background==='transparent'?'none':o.background;
  if(container.clientHeight<100&&!container.style.height)container.style.aspectRatio='1286/964';

  // ---------- renderer / scene ----------
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true});
  if('useLegacyLights' in R)R.useLegacyLights=true;
  const K=REV>=165?Math.PI:1;
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  container.appendChild(R.domElement);
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(28,1,.1,120);
  S.add(new THREE.HemisphereLight(0xffe2b0,0x5a2a10,1.0*K));
  const sun=new THREE.DirectionalLight(0xffffff,.9*K);sun.position.set(3,9,7);S.add(sun);
  const warm=new THREE.PointLight(0xff9a30,.9*K,22);warm.position.set(0,2,3);S.add(warm);
  const ownX=(cols-1)/2*SP+2.6,CX=(ownX-(cols-1)/2*SP)/2;
  function layout(){
    const w=container.clientWidth||800,h=container.clientHeight||600;R.setSize(w,h);C.aspect=w/h;C.updateProjectionMatrix();
    const tn=Math.tan(C.fov*Math.PI/360),spanX=cols*SP+3.8;
    const d=Math.max(spanX/2/(C.aspect*tn),spanX*.5/(tn*1.9),11),p=.84;
    C.position.set(CX,.8+d*Math.sin(p),.2+d*Math.cos(p));C.lookAt(CX,.8,.2);
  }
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(layout):null;
  if(ro)ro.observe(container);else addEventListener('resize',layout);
  layout();

  const cTex=(w,h,draw)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);
    const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t};
  const glowTex=cTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,4,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,170,40,.85)');r.addColorStop(1,'rgba(255,120,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h)});
  const M=(c,x={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.3,emissive:0x4a3000,emissiveIntensity:.5},x));
  const gold=M(0xe0a41c),goldD=M(0xb27a12),goldL=M(0xf8d460,{emissive:0x6a4a00}),inner=M(0x8a5a10,{metalness:0,emissive:0x3a2000}),dark=new THREE.MeshBasicMaterial({color:0x140800});
  const pedSide=M(0xd8851a,{metalness:0,roughness:.7,emissive:0x6a3200,emissiveIntensity:.7}),pedTop=M(0xf7bc3a,{metalness:0,roughness:.6,emissive:0x8a5200,emissiveIntensity:.8});
  const omat=new THREE.MeshBasicMaterial({color:0x120800,side:THREE.BackSide});

  function outline(m,t=.022){
    const bb=new THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position),s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
    const ol=new THREE.Mesh(m.geometry,omat),sx=1+2*t/Math.max(s.x,.05),sy=1+2*t/Math.max(s.y,.05),sz=1+2*t/Math.max(s.z,.05);
    ol.scale.set(sx,sy,sz);ol.position.set(c.x*(1-sx),c.y*(1-sy),c.z*(1-sz));m.add(ol);
  }
  function halfCyl(r,len){                                  // setengah silinder (tutup peti), sumbu sepanjang x
    const sh=new THREE.Shape();sh.absarc(0,0,r,0,Math.PI,false);sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false,curveSegments:20});
    g.rotateY(Math.PI/2);g.translate(-len/2,0,r);return g;
  }
  function buildChest(){
    const g=new THREE.Group();
    const add=(geo,mat,x,y,z,ol=true)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);if(ol)outline(m);return m};
    add(new THREE.BoxGeometry(.98,.08,.68),goldD,0,.04,0,false);
    add(new THREE.BoxGeometry(.9,.02,.58),inner,0,.1,0,false);
    add(new THREE.BoxGeometry(1,.5,.06),gold,0,.33,.31);add(new THREE.BoxGeometry(1,.5,.06),gold,0,.33,-.31);
    add(new THREE.BoxGeometry(.06,.5,.56),gold,-.47,.33,0);add(new THREE.BoxGeometry(.06,.5,.56),gold,.47,.33,0);
    for(let i=0;i<7;i++)add(new THREE.BoxGeometry(.012,.46,.01),goldD,-.4+i*.133,.33,.342,false);
    for(const x of[-.34,.34])add(new THREE.BoxGeometry(.1,.52,.72),goldL,x,.33,0);
    add(new THREE.BoxGeometry(1.04,.07,.72),goldL,0,.075,0);
    add(new THREE.BoxGeometry(.18,.24,.04),goldL,0,.42,.37);
    add(new THREE.SphereGeometry(.026,10,8),dark,0,.4,.395,false);
    const lid=new THREE.Group();lid.position.set(0,.58,-.36);g.add(lid);
    const lm=new THREE.Mesh(halfCyl(.36,1.0),gold);lid.add(lm);outline(lm);
    for(const x of[-.34,.34]){const sm=new THREE.Mesh(halfCyl(.38,.1),goldL);sm.position.set(x,-.0,-.0);lid.add(sm)}
    const tab=new THREE.Mesh(new THREE.BoxGeometry(.16,.1,.04),goldL);tab.position.set(0,.04,.725);lid.add(tab);
    g.userData.lid=lid;return g;
  }
  const slot=[],chests=[],pedestals=[];
  const mkPedestal=(x,z)=>{
    const p=new THREE.Mesh(new THREE.BoxGeometry(1.75,PH,1.75),[pedSide,pedSide,pedTop,pedSide,pedSide,pedSide]);p.position.set(x,PH/2,z);S.add(p);
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    gl.rotation.x=-Math.PI/2;gl.position.set(x,.02,z);S.add(gl);return p;
  };
  for(let i=0;i<N;i++){
    const c=i%cols,r=Math.floor(i/cols),x=(c-(cols-1)/2)*SP,z=(r-.5)*2.75;
    slot.push({x,z});pedestals.push(mkPedestal(x,z));
    const ch=buildChest();ch.scale.setScalar(CHS);ch.rotation.y=-.55;ch.position.set(x,PH,z);ch.userData.chest=i;S.add(ch);chests.push(ch);
  }
  const ownPos={x:ownX,z:0};mkPedestal(ownPos.x,ownPos.z);

  // ---------- UI overlay ----------
  const ui=document.createElement('div');ui.className='cg2-ui';container.appendChild(ui);
  const mk=(cls,html='')=>{const d=document.createElement('div');d.className=cls;d.innerHTML=html;ui.appendChild(d);return d};
  let barEl=null,bankEl=null,thumbsEl=null,btn=null,bankerEl=null,upBtn=null,downBtn=null;
  const sorted=o.values.slice().sort((a,b)=>a-b),listEls=[];
  const valEls=[],numEls=[];
  if(o.showUI){
    barEl=mk('cg2-bar');mk('cg2-title',T.title);bankerEl=mk('cg2-banker',BANKER);
    const list=mk('cg2-list');sorted.forEach(v=>{const d=document.createElement('div');d.textContent=o.formatMoney(v);list.appendChild(d);listEls.push(d)});
    bankEl=mk('cg2-bank');
    thumbsEl=mk('cg2-thumbs');
    upBtn=document.createElement('button');upBtn.className='cg2-thumb';upBtn.type='button';upBtn.setAttribute('aria-label','Terima tawaran');upBtn.innerHTML=THUMB;
    downBtn=document.createElement('button');downBtn.className='cg2-thumb';downBtn.type='button';downBtn.setAttribute('aria-label','Tolak tawaran');downBtn.innerHTML=THUMB.replace('<svg ','<svg style="transform:rotate(180deg)" ');
    thumbsEl.append(upBtn,downBtn);
    btn=document.createElement('button');btn.className='cg2-btn';btn.type='button';btn.textContent=T.again;btn.hidden=true;ui.appendChild(btn);
  }
  for(let i=0;i<N;i++){valEls.push(mk('cg2-val'));numEls.push(mk('cg2-num',String(i+1)))}

  // ---------- animasi ----------
  const tweens=new Set(),parts=[];
  const tween=(ms,fn,ease=p=>p)=>new Promise(res=>tweens.add({ms,fn,ease,t0:performance.now(),res}));
  const coinMat=M(0xf4c030,{metalness:.5});
  function burst(x,y,z){
    for(let i=0;i<16;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.03,14),coinMat);m.position.set(x,y,z);
      parts.push({m,v:new THREE.Vector3((Math.random()-.5)*4,3.5+Math.random()*2.5,(Math.random()-.2)*2.5),t:0});S.add(m)}
  }
  const openLid=(i,sound=true)=>{const lid=chests[i].userData.lid;if(sound)creak();
    return tween(600,p=>{lid.rotation.x=-1.95*p},easeBack).then(()=>{lid.rotation.x=-1.95;if(sound)thud()})};

  // ---------- logika permainan ----------
  let values=[],own=-1,opened=new Set(),round=0,toOpen=0,state='pick',offer=0,money=0,destroyed=false,hover=-1;
  const fmt=o.formatMoney;
  const emit=(n,d)=>container.dispatchEvent(new CustomEvent(n,{detail:d}));
  const setMsg=t=>{if(barEl)barEl.textContent=t;o.onMessage&&o.onMessage(t)};
  const remaining=()=>values.filter((_,i)=>!opened.has(i));
  const markOut=v=>{const k=sorted.findIndex((x,j)=>x===v&&listEls[j]&&!listEls[j].classList.contains('out'));if(k>=0)listEls[k].classList.add('out')};
  const showVal=(i,v)=>{const e=valEls[i];e.textContent=fmt(v);e.classList.toggle('big',v>=sorted[sorted.length-2]);e.style.display='block'};

  function resetBoard(){
    values=o.shuffle?shuffleArr(o.values):o.values.slice();
    own=-1;opened.clear();round=0;toOpen=0;offer=0;
    tweens.clear();parts.splice(0).forEach(p=>S.remove(p.m));
    chests.forEach((c,i)=>{c.position.set(slot[i].x,PH,slot[i].z);c.userData.lid.rotation.x=0;c.scale.setScalar(CHS);valEls[i].style.display='none'});
    listEls.forEach(e=>e.classList.remove('out'));
    if(bankEl){bankEl.classList.remove('on');bankEl.textContent=''}
    if(thumbsEl)thumbsEl.classList.remove('on');if(btn)btn.hidden=true;if(bankerEl)bankerEl.classList.remove('talk');
  }
  function newGame(){resetBoard();state='pick';setMsg(T.pick)}

  async function pickChest(i){
    if(state!=='pick'||!(i>=0&&i<N))return false;
    state='busy';own=i;unlock();setMsg(T.chosen(i+1,o.openPerRound[0]));
    const c=chests[i],from=c.position.clone(),to=new THREE.Vector3(ownPos.x,PH,ownPos.z);
    await tween(750,p=>{c.position.lerpVectors(from,to,p);c.position.y=PH+Math.sin(Math.PI*p)*1.5},easeIO);
    c.position.copy(to);thud();
    round=0;toOpen=o.openPerRound[0];state='open';setMsg(T.openMore(toOpen));return true;
  }
  async function openChest(i){
    if(state!=='open'||i===own||opened.has(i)||!(i>=0&&i<N))return false;
    state='busy';unlock();opened.add(i);
    await openLid(i);
    const v=values[i];showVal(i,v);markOut(v);v>=sorted[sorted.length-2]?bad():ting();
    toOpen--;
    if(toOpen>0){state='open';setMsg(T.openMore(toOpen))}
    else{await wait(650);makeOffer()}
    return true;
  }
  function makeOffer(){
    const rem=remaining(),f=o.offerFactors[Math.min(round,o.offerFactors.length-1)];
    offer=bankOffer(rem,f);state='offer';ring();
    if(bankEl){bankEl.textContent=T.bank+' '+fmt(offer);bankEl.classList.add('on')}
    if(thumbsEl)thumbsEl.classList.add('on');if(bankerEl)bankerEl.classList.add('talk');
    setMsg(T.offer);
    const d={offer,round:round+1,remaining:rem.slice()};o.onOffer&&o.onOffer(d);emit('chest:offer',d);
  }
  const endOffer=()=>{if(thumbsEl)thumbsEl.classList.remove('on');if(bankerEl)bankerEl.classList.remove('talk')};
  async function revealOwn(){
    await openLid(own);showVal(own,values[own]);setMsg(T.own(fmt(values[own])));
  }
  async function revealRest(){
    const rest=[];for(let i=0;i<N;i++)if(i!==own&&!opened.has(i))rest.push(i);
    for(const i of rest){opened.add(i);openLid(i,false);showVal(i,values[i]);await wait(160)}
  }
  function finish(type,winnings){
    state='end';money+=winnings;
    if(bankEl){bankEl.textContent=T.win(fmt(winnings));bankEl.classList.add('on')}
    if(btn)btn.hidden=false;
    const res={type,winnings,offer,chestValue:values[own],round:round+1,values:values.slice(),money};
    o.onFinish&&o.onFinish(res);emit('chest:finish',res);
  }
  async function accept(){
    if(state!=='offer')return false;
    state='busy';endOffer();ching();setMsg(T.accepted(fmt(offer)));
    await wait(1000);await revealOwn();
    const better=values[own]>offer;
    if(better){sad();setMsg(T.own(fmt(values[own]))+' - '+T.pity)}else{ting();setMsg(T.own(fmt(values[own]))+' - '+T.good)}
    await wait(500);await revealRest();finish('deal',offer);return true;
  }
  async function reject(){
    if(state!=='offer')return false;
    endOffer();round++;
    if(round<o.openPerRound.length){toOpen=o.openPerRound[round];state='open';setMsg(T.rejected(toOpen));return true}
    state='busy';setMsg(T.own('...'));await wait(900);await revealOwn();
    const v=values[own],better=v>=offer;
    if(better){ching();burst(ownPos.x,PH+1,ownPos.z);setMsg(T.own(fmt(v))+' - '+T.luck)}else{sad();setMsg(T.own(fmt(v))+' - '+T.miss)}
    await wait(500);await revealRest();finish('nodeal',v);return true;
  }
  if(upBtn)upBtn.onclick=()=>accept();if(downBtn)downBtn.onclick=()=>reject();if(btn)btn.onclick=()=>newGame();

  // ---------- input ----------
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),cv=R.domElement;
  function pick(e){
    const r=cv.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ptr,C);
    const h=ray.intersectObjects(chests,true)[0];if(!h)return -1;
    let ob=h.object;while(ob&&ob.userData.chest===undefined)ob=ob.parent;return ob?ob.userData.chest:-1;
  }
  const eligible=i=>i>=0&&((state==='pick')||(state==='open'&&i!==own&&!opened.has(i)));
  cv.addEventListener('pointerdown',e=>{const i=pick(e);if(!eligible(i))return;state==='pick'?pickChest(i):openChest(i)});
  cv.addEventListener('pointermove',e=>{const i=pick(e);hover=eligible(i)?i:-1;cv.style.cursor=hover>=0?'pointer':'default'});
  cv.addEventListener('pointerleave',()=>{hover=-1});

  // ---------- loop ----------
  const clk=new THREE.Clock(),tmp=new THREE.Vector3();let raf=0;
  function place(el,x,y,z,show){
    if(!show){el.style.visibility='hidden';return}
    tmp.set(x,y,z).project(C);const w=container.clientWidth,h=container.clientHeight;
    el.style.visibility='visible';el.style.transform=`translate(${(tmp.x*.5+.5)*w}px,${(-tmp.y*.5+.5)*h}px) translate(-50%,-50%)`;
  }
  function loop(now){
    if(destroyed)return;raf=requestAnimationFrame(loop);
    for(const tw of tweens){const p=Math.min(1,Math.max(0,(now-tw.t0)/tw.ms));tw.fn(tw.ease(p));if(p>=1){tweens.delete(tw);tw.res()}}
    const dt=Math.min(clk.getDelta(),.05);
    chests.forEach((c,i)=>{const s=CHS*(1+(hover===i?.07:0));c.scale.setScalar(c.scale.x+(s-c.scale.x)*Math.min(1,dt*12))});
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.v.y-=10*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=dt*8;
      if(p.m.position.y<PH&&p.v.y<0){p.m.position.y=PH;p.v.multiplyScalar(0)}if(p.t>1.8){S.remove(p.m);parts.splice(i,1)}}
    R.render(S,C);
    for(let i=0;i<N;i++){
      const c=chests[i];
      place(valEls[i],c.position.x,c.position.y+2.5,c.position.z,valEls[i].style.display==='block');
      place(numEls[i],slot[i].x,.45,slot[i].z+1.0,own!==i&&!opened.has(i)&&state!=='end');
    }
  }
  raf=requestAnimationFrame(loop);
  newGame();

  return {
    el:container,newGame,pickChest,openChest,accept,reject,
    get state(){return state},get offer(){return offer},get money(){return money},get values(){return values.slice()},get ownIndex(){return own},
    three:{scene:S,camera:C,renderer:R},
    destroy(){destroyed=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else removeEventListener('resize',layout);R.dispose();cv.remove();ui.remove();container.classList.remove('cg2-root')}
  };
}
