import * as THREE from 'three';
import { $, BN, BUILD, HOTEL, RENT, sleep, tween } from './config.js';
import { T, nextPos, sn, tp } from './map.js';
import { cam, panOffset, renderer, scene } from './scene.js';
import { L, drawLot, flashLot, setB } from './world.js';
import { configurePlayers, OFF, P, place, portrait } from './players.js';
import { die, face, rollDie } from './dice.js';
import { G, ask, ban, chooseGameMode, hud, load, onlineLobby, setupGame, shop, showRemotePrompt, showRemoteWithdrawal, thumb, waitingForHost, withdrawDlg } from './ui.js';
import { isGuest, isHost, myPlayerIndex, respondToBankRequest, sendState, setNetworkHandlers, startOnlineGame, waitForGameStart, waitForRemoteRoll } from './multiplayer.js';

// ---------- aturan ----------
const ownedLots=()=>[...new Set(L)].filter(Boolean);
const nw=p=>p.cash+p.bank+ownedLots().reduce((a,l)=>a+(l.o==p.i?l.price+BUILD.slice(0,l.lv+1).reduce((x,y)=>x+y,0):0),0);
const propertyRent=(lot,level=lot.lv)=>Math.round(lot.rent*RENT[level]/RENT[0]);
const complexRent=(target,owner)=>
  ownedLots().reduce((sum,lot)=>sum+(lot.group==target.group&&lot.o==owner?propertyRent(lot):0),0);
function pay(p,a,to){const t=p.cash+p.bank;
  if(t>=a){const c=Math.min(p.cash,a);p.cash-=c;p.bank-=a-c;if(to)to.cash+=a;return true}
  if(to)to.cash+=t;p.cash=p.bank=0;p.alive=false;p.m.visible=false;L.forEach((l,i)=>{if(l.o==p.i){l.o=-1;l.lv=0;drawLot(i);setB(i)}});return false}
async function step(p,n){for(let k=0;k<n;k++){const a=tp(p.pos),nx=nextPos(p.pos,p.prev),b=tp(nx),o=OFF[p.i];
    await tween(260,t=>p.m.position.set(a[0]+(b[0]-a[0])*t+o[0],.02+Math.sin(t*Math.PI)*.6,a[1]+(b[1]-a[1])*t+o[1]));
    p.prev=p.pos;p.pos=nx;$('street').textContent=sn(nx);
    if(T[nx][1]=='bank')await withdrawDlg(p);
  }place(p)}
async function land(p){const t=T[p.pos],l=L[p.pos];
  if(t[1]=='pad'){p.cash+=t[2];hud();await ban(portrait(p),p.css,'COLLECT','$'+t[2]);return}
  if(t[1]=='l'&&t[2]?.t=='pad'){p.cash+=t[2].v;hud();await ban(portrait(p),p.css,'COLLECT','$'+t[2].v)}
  if(t[1]=='bank')return;
  if(t[1]=='bus')await shop(p);
  else if(t[1]=='l'){
    if(l.o>=0&&l.o!=p.i)await flashLot(p.pos);
    if(l.o<0){
      if(p.cash>=l.price){const y=p.h?await ask(thumb(0),t[0],`Cost: ${l.price}<br>Rent: ${propertyRent(l,0)}`,'🔨','✖'):true;
        if(y){p.cash-=l.price;l.o=p.i;drawLot(p.pos);hud();await sleep(300)}}
      else if(p.h)await ban(portrait(p),p.css,t[0],'Uang kurang',1000)}
    else if(l.o==p.i){const nx=l.lv+1;
      if(l.lv<5&&p.cash>=BUILD[nx]){const rent=propertyRent(l,nx),y=p.h?await ask(thumb(nx,l.s==2),l.s==2?HOTEL[nx]:BN[nx],`Cost: ${BUILD[nx]}<br>Rent: ${rent}`,'🔨','✖'):p.cash-BUILD[nx]>=200;
        if(y){p.cash-=BUILD[nx];l.lv=nx;setB(p.pos);hud();await sleep(300)}}}
    else{const o=P[l.o],r=complexRent(l,l.o);await ban(portrait(p),p.css,t[0],'RENT $'+r,1300);
      if(pay(p,r,o)){hud();await ban(portrait(o),o.css,'RECEIVED','$'+r,1000)}else{hud();await ban(portrait(p),p.css,p.n,'BANGKRUT 💥',1400)}}}}
const snapshot=(awaitingRoll=false)=>({cur:G.cur,awaitingRoll,players:P.map(p=>({pos:p.pos,prev:p.prev,cash:p.cash,bank:p.bank,alive:p.alive,inv:p.inv})),lots:L.map(l=>l&&({o:l.o,lv:l.lv}))});
function applySnapshot(state){
  if(!state||!Array.isArray(state.players)||state.players.length!==P.length||!Array.isArray(state.lots)||state.lots.length!==L.length)
    throw new Error('Data permainan online tidak valid.');
  G.cur=((state.cur%P.length)+P.length)%P.length;
  state.players.forEach((data,i)=>{Object.assign(P[i],data);P[i].m.visible=data.alive;place(P[i])});
  state.lots.forEach((data,i)=>{if(data&&L[i]){L[i].o=data.o;L[i].lv=data.lv;drawLot(i);setB(i)}});
  hud();$('street').textContent=sn(P[G.cur].pos);
}
function check(){const al=P.filter(p=>p.alive),w=al.length==1?al[0]:0;
  if(w){G.over=true;hud();ask(portrait(w),'🏆 '+w.n+' menang!','Aset $'+nw(w),'🔁',0,24).then(()=>location.reload())}}
const foc=new THREE.Vector3().copy(P[0].m.position),OC=new THREE.Vector3(12,8.5,12),target=new THREE.Vector3();
(function loop(){foc.lerp(P[G.cur].m.position,.07);target.copy(foc).add(panOffset);cam.position.copy(target).add(OC);cam.lookAt(target);L.forEach(l=>l?.b?.userData.update?.(performance.now()));renderer.render(scene,cam);requestAnimationFrame(loop)})();
setNetworkHandlers({
  onState:state=>{try{applySnapshot(state)}catch(error){console.error(error)}},
  onPrompt:showRemotePrompt,
  onBankWithdraw:showRemoteWithdrawal,
  onBankRequest:async request=>{
    const p=P[1],total=p.cash+p.bank,cash=request.cash;
    const accepted=G.cur===1&&Number.isSafeInteger(cash)&&cash>=0&&cash<=total;
    if(accepted){p.cash=cash;p.bank=total-cash;hud();await sendState(snapshot(true))}
    await respondToBankRequest(request.id,accepted);
  },
  onError:error=>console.error('Online game error:',error)
});
async function main(){
  while(!G.over){const p=P[G.cur];hud();
    if(isHost())await sendState(snapshot());
    if(p.alive){$('street').textContent=sn(p.pos);
      await ban(portrait(p),p.css,p.n,'Turn',1000);
      if(p.h){
        if(isHost()&&p.i!==myPlayerIndex())await waitForRemoteRoll(snapshot());
        else{G.idle=true;hud();await new Promise(r=>G.wake=r);G.idle=false;hud()}
      }else await sleep(500);
      const v=await rollDie(p);await ban(face(v),'#9fb0c2',String(v),'GO',900);
      await step(p,v);die.visible=false;await land(p);check()}
    G.cur=(G.cur+1)%P.length}}
(async()=>{
  let mode=await chooseGameMode(),resumed=false;
  let room;
  while(mode==='online'){
    room=await onlineLobby();
    if(room.role!=='back')break;
    mode=await chooseGameMode();
  }
  if(mode==='local'){
    let ok=false;
    try{ok=!!localStorage.getItem('mt3d')}catch(e){}
    if(ok){
      const resume=await ask(portrait(P[0]),'Game tersimpan','Lanjutkan?','▶','🆕',22);
      if(resume){
        resumed=load();
        if(!resumed)await ban(portrait(P[0]),P[0].css,'Simpanan lama','Mulai permainan baru',1100);
        else foc.copy(P[G.cur].m.position);
      }else localStorage.removeItem('mt3d');
    }
    if(!resumed){
      const settings=await setupGame();
      configurePlayers(settings);
      try{localStorage.removeItem('mt3d')}catch(e){}
    }
    main();
  }else if(isHost()){
    const settings=await setupGame({online:true});
    configurePlayers(settings);
    await startOnlineGame(settings,snapshot());
    main();
  }else if(isGuest()){
    waitingForHost(room.room);
    const game=await waitForGameStart();
    $('ov').innerHTML='';
    configurePlayers(game.settings);
    applySnapshot(game.state);
  }
})();
