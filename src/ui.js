import { $, CASH0, cvs, rnd, sleep } from './config.js';
import { L, drawLot, setB } from './world.js';
import { configurePlayers, getPlayerSettings, P, place, portrait } from './players.js';
import { ITEMS } from './items.js';

// ---------- UI ----------
const ov=$('ov');
export const G={cur:0,over:false,idle:false,wake:null};
const clr=()=>{ov.innerHTML=''};
function card(...n){const d=document.createElement('div');d.className='card';d.append(...n);ov.innerHTML='';ov.append(d)}
function txt(a,b,s1=26,s2=30){const d=document.createElement('div');d.className='tx';d.innerHTML=`<div style="font-size:${s1}px">${a}</div><div style="font-size:${s2}px">${b||''}</div>`;return d}
function ray(img,col){const d=document.createElement('div');d.className='ray';d.style.background=`repeating-conic-gradient(${col} 0 8deg,rgba(255,255,255,.35) 8deg 16deg)`;img.style.cssText='width:84px;height:84px;display:block';d.append(img);return d}
export async function ban(img,col,a,b,ms=1200){card(ray(img,col),txt(a,b));await sleep(ms);clr()}
function btns(list){const b=document.createElement('div');b.style.cssText='display:flex;flex-direction:column;gap:8px';list.forEach(x=>b.append(x));return b}
const ib=(t,f)=>{const e=document.createElement('button');e.className='ib';e.textContent=t;e.onclick=f;return e};
export function ask(img,a,b,y,n,s2=22){return new Promise(r=>{img.style.cssText='width:84px;height:84px;border-radius:12px;display:block';
  card(img,txt(a,b,24,s2),btns([ib(y,()=>{clr();r(true)}),n&&ib(n,()=>{clr();r(false)})].filter(Boolean)))})}
export function setupGame(){return new Promise(resolve=>{
  const form=document.createElement('form');form.className='setup-form';
  const title=document.createElement('h2');title.textContent='Pengaturan permainan';form.append(title);
  const fields=[
    ['humanCount','Pemain manusia',1,6,1],
    ['computerCount','Komputer',0,5,2],
    ['cash','Uang awal',0,1000000,CASH0],
    ['bank','Tabungan awal',0,1000000,CASH0]
  ];
  const inputs={};
  for(const [key,label,min,max,value] of fields){
    const wrap=document.createElement('label');wrap.className='setup-field';
    const caption=document.createElement('span');caption.textContent=label;
    const input=document.createElement('input');input.type='number';input.name=key;
    input.min=String(min);input.max=String(max);input.step='1';input.value=String(value);
    input.required=true;inputs[key]=input;wrap.append(caption,input);form.append(wrap);
  }
  const note=document.createElement('div');note.className='setup-note';
  note.textContent='Minimal 2 peserta dan maksimal 6 peserta.';
  const error=document.createElement('div');error.className='setup-error';error.setAttribute('role','alert');
  const start=document.createElement('button');start.className='setup-start';start.type='submit';start.textContent='Mulai permainan';
  form.append(note,error,start);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const values=Object.fromEntries(fields.map(([key])=>[key,inputs[key].valueAsNumber]));
    const total=values.humanCount+values.computerCount;
    const valid=fields.every(([key,,min,max])=>Number.isSafeInteger(values[key])&&values[key]>=min&&values[key]<=max);
    if(!valid||total<2||total>6){
      error.textContent='Isi angka yang valid. Minimal 2 dan maksimal 6 peserta.';
      return;
    }
    clr();resolve(values);
  });
  card(form);
})}
export function thumb(lv,hotel=false){const c=cvs(96),g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,0,96,96);
  if(!lv){g.fillStyle='#ebc16d';g.strokeStyle='#d9ab52';g.lineWidth=5;g.beginPath();g.moveTo(48,24);g.lineTo(88,48);g.lineTo(48,72);g.lineTo(8,48);g.closePath();g.fill();g.stroke()}
  else{g.font='64px sans-serif';g.textAlign='center';g.fillText(hotel?['','🏨','🏨','🏨','🏨','🏨'][lv]:['','🏚️','🏠','🏡','🏘️','🏰'][lv],48,70)}return c}
function bankDlg(p){return new Promise(r=>{const tot=p.cash+p.bank,s=document.createElement('input');s.type='range';s.min=0;s.max=tot;s.step=10;s.value=p.cash;
  const l=document.createElement('div');l.className='tx';l.style.cssText='background:#222;border-radius:14px;padding:8px 14px;font-size:22px';
  const up=()=>{l.innerHTML=`Cash: $${s.value}<br>Bank: $${tot-s.value}`};s.oninput=up;up();
  const w=document.createElement('div');w.style.cssText='display:flex;flex-direction:column;gap:8px;min-width:190px';w.append(l,'🐖 ⇄ 💵',s);w.style.color='#fff';
  card(w,btns([ib('✔',()=>{p.cash=+s.value;p.bank=tot-p.cash;hud();clr();r()}),ib('✖',()=>{clr();r()})]))})}
export async function withdrawDlg(p){
  if(!p.h){const amount=p.bank;p.cash+=amount;p.bank=0;hud();return}
  return new Promise(resolve=>{
    const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max=String(Math.max(1,p.bank));slider.step='1';slider.value=String(Math.floor(p.bank/2));slider.disabled=p.bank<=0;
    const cash=document.createElement('div');cash.className='bank-balance bank-cash tx';
    const bank=document.createElement('div');bank.className='bank-balance bank-account tx';
    const update=()=>{const amount=+slider.value;cash.textContent=`Cash: $${p.cash+amount}`;bank.textContent=`Bank: $${p.bank-amount}`};
    slider.addEventListener('input',update);update();
    const transfer=document.createElement('div');transfer.className='bank-transfer-row';
    const pig=document.createElement('span');pig.className='bank-icon';pig.textContent='🐷';pig.setAttribute('aria-hidden','true');
    const notes=document.createElement('span');notes.className='bank-icon';notes.textContent='💵';notes.setAttribute('aria-hidden','true');
    transfer.append(pig,slider,notes);
    const actions=document.createElement('div');actions.className='bank-actions';
    const confirm=ib('✔',()=>{const amount=+slider.value;p.cash+=amount;p.bank-=amount;hud();clr();resolve()});
    const cancel=ib('✖',()=>{clr();resolve()});
    confirm.classList.add('bank-confirm');cancel.classList.add('bank-cancel');actions.append(confirm,cancel);
    const panel=document.createElement('div');panel.className='bank-panel';panel.append(cash,transfer,bank,actions);card(panel);
  })
}
export function hud(){const p=P[G.cur];$('cash').textContent=p.cash;$('bank').textContent=p.bank;$('pt').innerHTML='';$('pt').append(portrait(p));
  $('pt').firstChild.style.border='3px solid '+p.css;$('dice').disabled=!G.idle}
$('dice').onclick=()=>{if(G.idle&&G.wake&&!ov.firstChild){const w=G.wake;G.wake=null;w()}};
$('hud').onclick=()=>{if(G.idle&&!ov.firstChild)bankDlg(P[G.cur])};
$('ch').onclick=()=>{if(!G.idle||ov.firstChild)return;const p=P[G.cur],m=p.inv.map(x=>x.icon+' '+x.n).join('<br>')||'Belum ada alat';ask(portrait(p),'Alat',m,'✖',0,17)};
$('bc').onclick=()=>{if(!G.idle||ov.firstChild)return;card(txt('Menu','',24),btns([ib('💾',()=>{save();clr()}),ib('🚪',()=>{location.reload()}),ib('✖',clr)]))};
function save(){try{localStorage.setItem('mt3d',JSON.stringify({mapVersion:9,settings:getPlayerSettings(),cur:G.cur,P:P.map(p=>({pos:p.pos,prev:p.prev,cash:p.cash,bank:p.bank,alive:p.alive,inv:p.inv})),L:L.map(l=>l&&{o:l.o,lv:l.lv})}))}catch(e){}}
export function load(){try{const q=JSON.parse(localStorage.getItem('mt3d'));if(!q)return false;
  if(q.mapVersion!==9||!q.settings||!Array.isArray(q.P)||!Array.isArray(q.L)||q.L.length!==L.length||q.L.some((a,i)=>a&&!L[i])){
    localStorage.removeItem('mt3d');return false}
  configurePlayers(q.settings);
  if(q.P.length!==P.length){localStorage.removeItem('mt3d');return false}
  G.cur=q.cur;q.P.forEach((a,i)=>{Object.assign(P[i],a);P[i].m.visible=a.alive;place(P[i])});
  q.L.forEach((a,i)=>{if(a){L[i].o=a.o;L[i].lv=a.lv;drawLot(i);setB(i)}});return true}catch(e){return false}}
const iconThumb=e=>{const c=cvs(96),g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,0,96,96);g.font='64px sans-serif';g.textAlign='center';g.fillText(e,48,70);return c};
export async function shop(p){const it=ITEMS.length?ITEMS[rnd(0,ITEMS.length-1)]:0;
  if(!it){await ban(portrait(p),p.css,'Toko Bus','Barang belum diisi',1200);return}
  if(!p.h)return;
  if(p.cash<it.price){await ban(portrait(p),p.css,it.n,'Uang kurang',1000);return}
  if(await ask(iconThumb(it.icon),it.n,`Harga: ${it.price}`,'🔨','✖')){p.cash-=it.price;p.inv.push(it);hud()}}
