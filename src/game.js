import * as THREE from 'three';
import { $, BN, BUILD, RENT, sleep, tween } from './config.js';
import { T, nextPos, sn, tp } from './map.js';
import { cam, renderer, scene } from './scene.js';
import { L, drawLot, flashLot, setB } from './world.js';
import { OFF, P, place, portrait } from './players.js';
import { die, face, rollDie } from './dice.js';
import { G, ask, ban, hud, load, shop, thumb, withdrawDlg } from './ui.js';

// ---------- aturan ----------
const ownedLots=()=>[...new Set(L)].filter(Boolean);
const nw=p=>p.cash+p.bank+ownedLots().reduce((a,l)=>a+(l.o==p.i?l.price+BUILD.slice(0,l.lv+1).reduce((x,y)=>x+y,0):0),0);
const rowSpaces=(lot,owner)=>ownedLots().filter(other=>other.o==owner&&other.group==lot.group).reduce((sum,other)=>sum+other.s,0);
const rentFor=(lot,owner,level=lot.lv,includeUnowned=false)=>
  Math.round(lot.rent*(rowSpaces(lot,owner)+(includeUnowned?lot.s:0))*RENT[level]/RENT[0]);
function pay(p,a,to){const t=p.cash+p.bank;
  if(t>=a){const c=Math.min(p.cash,a);p.cash-=c;p.bank-=a-c;if(to)to.cash+=a;return true}
  if(to)to.cash+=t;p.cash=p.bank=0;p.alive=false;p.m.visible=false;L.forEach((l,i)=>{if(l.o==p.i){l.o=-1;l.lv=0;drawLot(i);setB(i)}});return false}
async function step(p,n){for(let k=0;k<n;k++){const a=tp(p.pos),nx=nextPos(p.pos,p.prev),b=tp(nx),o=OFF[p.i];
    await tween(260,t=>p.m.position.set(a[0]+(b[0]-a[0])*t+o[0],.02+Math.sin(t*Math.PI)*.6,a[1]+(b[1]-a[1])*t+o[1]));
    p.prev=p.pos;p.pos=nx;$('street').textContent=sn(nx);
  }place(p)}
async function land(p){const t=T[p.pos],l=L[p.pos];
  if(t[1]=='pad'){p.cash+=t[2];hud();await ban(portrait(p),p.css,'COLLECT','$'+t[2])}
  else if(t[1]=='bus')await shop(p);
  else if(t[1]=='bank')await withdrawDlg(p);
  else if(t[1]=='l'){
    if(l.o!=p.i)await flashLot(p.pos);
    if(l.o<0){
      if(p.cash>=l.price){const y=p.h?await ask(thumb(0),t[0],`Cost: ${l.price}<br>Rent: ${rentFor(l,p.i,0,true)}`,'🔨','✖'):true;
        if(y){p.cash-=l.price;l.o=p.i;drawLot(p.pos);hud();await sleep(300)}}
      else if(p.h)await ban(portrait(p),p.css,t[0],'Uang kurang',1000)}
    else if(l.o==p.i){const nx=l.lv+1;
      if(l.lv<3&&p.cash>=BUILD[nx]){const rent=rentFor(l,p.i,nx),y=p.h?await ask(thumb(nx),BN[nx],`Cost: ${BUILD[nx]}<br>Rent: ${rent}`,'🔨','✖'):p.cash-BUILD[nx]>=200;
        if(y){p.cash-=BUILD[nx];l.lv=nx;setB(p.pos);hud();await sleep(300)}}}
    else{const o=P[l.o],r=rentFor(l,l.o);await ban(portrait(p),p.css,t[0],'RENT $'+r,1300);
      if(pay(p,r,o)){hud();await ban(portrait(o),o.css,'RECEIVED','$'+r,1000)}else{hud();await ban(portrait(p),p.css,p.n,'BANGKRUT 💥',1400)}}}}
function check(){const al=P.filter(p=>p.alive),w=al.length==1?al[0]:0;
  if(w){G.over=true;hud();ask(portrait(w),'🏆 '+w.n+' menang!','Aset $'+nw(w),'🔁',0,24).then(()=>location.reload())}}
const foc=new THREE.Vector3().copy(P[0].m.position),OC=new THREE.Vector3(12,8.5,12);
(function loop(){foc.lerp(P[G.cur].m.position,.07);cam.position.copy(foc).add(OC);cam.lookAt(foc);renderer.render(scene,cam);requestAnimationFrame(loop)})();
async function main(){
  while(!G.over){const p=P[G.cur];hud();
    if(p.alive){$('street').textContent=sn(p.pos);
      await ban(portrait(p),p.css,p.n,'Turn',1000);
      if(p.h){G.idle=true;hud();await new Promise(r=>G.wake=r);G.idle=false;hud()}else await sleep(500);
      const v=await rollDie(p);await ban(face(v),'#9fb0c2',String(v),'GO',900);
      await step(p,v);die.visible=false;await land(p);check()}
    G.cur=(G.cur+1)%P.length}}
(async()=>{let ok=false;try{ok=!!localStorage.getItem('mt3d')}catch(e){}
  if(ok){const resume=await ask(portrait(P[0]),'Game tersimpan','Lanjutkan?','▶','🆕',22);
    if(resume){if(!load())await ban(portrait(P[0]),P[0].css,'Simpanan lama','Mulai permainan baru',1100);
      else foc.copy(P[G.cur].m.position)}
    else localStorage.removeItem('mt3d')}
  main()})();
