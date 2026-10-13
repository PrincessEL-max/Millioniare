import { $, CASH0, cvs, sleep } from './config.js';
import { LINKS, tp } from './map.js';
import { L, drawLot, setB } from './world.js';
import { ITEMS } from './items.js';
import { configurePlayers, getPlayerSettings, P, place, portrait } from './players.js';
import { answerRemote, answerRemoteWithdrawal, askRemote, createRoom, guestCanRoll, isGuest, isHost, isOnline, joinRoom, leaveRoom, myPlayerIndex, requestRemoteWithdrawal, sendRollRequest, transferRemoteBank, waitForGuest } from './multiplayer.js';
import { showBankDialog } from '../Bank/bank-dialog.js';
import { createPropertyCard } from '../ui/property-card.js';
import { propertyPreview } from '../ui/property-preview.js';
import { openShop } from '../ui/shop-ui.js';
import { createToolPreview } from '../ui/tool-preview.js';

const STORE_CATALOG=ITEMS.map(item=>({...item,name:item.n}));
const STREET_SIGN_IDS=['street-sign-front','street-sign-right','street-sign-back','street-sign-left'];
function randomStoreStock(p){
  const available=STORE_CATALOG.filter(item=>!p.inv.some(owned=>owned.id===item.id));
  for(let i=available.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));[available[i],available[j]]=[available[j],available[i]];
  }
  const max=Math.min(11,available.length);
  if(!max)return [];
  const count=max<2?max:2+Math.floor(Math.random()*(max-1));
  return available.slice(0,count);
}

// ---------- UI ----------
const ov=$('ov');
export const G={cur:0,over:false,idle:false,wake:null};
const clr=()=>{ov.innerHTML=''};
let itemUseHandler=null,boardTargetRequest=null;
function card(...n){const d=document.createElement('div');d.className='card';d.append(...n);ov.innerHTML='';ov.append(d)}
function txt(a,b,s1=26,s2=30){const d=document.createElement('div');d.className='tx';d.innerHTML=`<div style="font-size:${s1}px">${a}</div><div style="font-size:${s2}px">${b||''}</div>`;return d}
function ray(img,col){const d=document.createElement('div');d.className='ray';d.style.background=`repeating-conic-gradient(${col} 0 8deg,rgba(255,255,255,.35) 8deg 16deg)`;img.style.cssText='width:84px;height:84px;display:block';d.append(img);return d}
export async function ban(img,col,a,b,ms=1200){card(ray(img,col),txt(a,b));await sleep(ms);clr()}
function btns(list){const b=document.createElement('div');b.style.cssText='display:flex;flex-direction:column;gap:8px';list.forEach(x=>b.append(x));return b}
const ib=(t,f)=>{const e=document.createElement('button');e.className='ib';e.textContent=t;e.onclick=f;return e};
const wide=(t,f)=>{const e=ib(t,f);e.classList.add('wide-choice');return e};
export function setItemUseHandler(handler){itemUseHandler=handler}
export async function selectInventoryItem(p){
  if(!p.inv.length){ban(portrait(p),p.css,'Alat','Belum ada alat di inventaris',1000);return}
  const shell=document.createElement('div');shell.className='shop-shell';ov.replaceChildren(shell);
  const preview=createToolPreview();
  try{
    const result=await openShop({
      mode:'inventory',
      mount:shell,
      width:'min(96vw, 1180px)',
      items:p.inv.map((item,index)=>{
        const catalogItem=ITEMS.find(entry=>entry.id===item.id);
        return {id:item.id,name:item.n,price:catalogItem?.price??0,desc:catalogItem?.description??'',index};
      }),
      thumbs:Object.fromEntries(p.inv.map(item=>[item.id,preview.thumbnail(item.id)]))
    });
    if(result.selected&&Number.isInteger(result.selected.index))
      await itemUseHandler?.(p,result.selected.index);
  }finally{
    preview.destroy();clr();
  }
}
export function chooseBoardTarget(message,validate=()=>true,{onPreview=()=>{},onFinish=()=>{}}={}){
  return new Promise(resolve=>{
    const prompt=txt('Pilih Petak',message,22,16);prompt.classList.add('target-message');
    const cancel=wide('Batal',()=>{const request=boardTargetRequest;boardTargetRequest=null;request?.onPreview(null);request?.onFinish();clr();resolve(null)});
    const wrapper=document.createElement('div');wrapper.className='target-card';wrapper.append(prompt,cancel);
    ov.replaceChildren(wrapper);boardTargetRequest={validate,resolve,onPreview,onFinish};
  });
}
export function previewBoardTarget(index){
  if(!boardTargetRequest)return;
  boardTargetRequest.onPreview(boardTargetRequest.validate(index)?index:null);
}
export function acceptBoardTarget(index){
  if(!boardTargetRequest)return false;
  if(!boardTargetRequest.validate(index))return false;
  const {resolve,onFinish}=boardTargetRequest;boardTargetRequest=null;onFinish();clr();resolve(index);return true;
}
export function chooseOne(title,options){
  return new Promise(resolve=>{
    const choices=options.map(({label,value})=>wide(label,()=>{clr();resolve(value)}));
    choices.push(wide('Batal',()=>{clr();resolve(null)}));
    card(txt(title,'',22),btns(choices));
  });
}
export function chooseAmount(title,max,initial=Math.min(100,max)){
  if(max<=0)return Promise.resolve(0);
  return new Promise(resolve=>{
    const heading=txt(title,`Maksimal $${max}`,22,16);
    const input=document.createElement('input');input.type='number';input.min='1';input.max=String(max);input.step='1';input.value=String(initial);input.setAttribute('aria-label','Jumlah uang');
    const confirm=wide('Ambil',()=>{const value=input.valueAsNumber;if(Number.isSafeInteger(value)&&value>0&&value<=max){clr();resolve(value)}});
    const cancel=wide('Batal',()=>{clr();resolve(null)});
    card(heading,input,btns([confirm,cancel]));
  });
}
function dieFace(value){
  const positions={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[28,24],[72,24],[28,50],[72,50],[28,76],[72,76]]}[value];
  return `<svg viewBox="0 0 100 100" width="116" height="116" aria-label="Dadu ${value}"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#263238" stroke-width="7"/>${positions.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#263238"/>`).join('')}</svg>`;
}
export function chooseDieValue(){
  return new Promise(resolve=>{
    let value=1;
    const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:12px';
    const dieButton=document.createElement('button');dieButton.type='button';dieButton.setAttribute('aria-label','Ganti angka dadu');
    dieButton.style.cssText='padding:0;border:0;background:transparent;cursor:pointer;line-height:0';
    const update=()=>{dieButton.innerHTML=dieFace(value);dieButton.setAttribute('aria-label',`Angka dadu ${value}; klik untuk mengganti`)};
    dieButton.onclick=()=>{value=value%6+1;update()};
    const go=wide('Go',()=>{clr();resolve(value)});go.setAttribute('aria-label','Jalankan angka dadu pilihan');
    const cancel=wide('Batal',()=>{clr();resolve(null)});
    update();row.append(dieButton,btns([go,cancel]));
    card(txt('Remote Control','Klik dadu untuk memilih angka, lalu tekan Go.',22,16),row);
  });
}
export function chooseAuctionBid(p,property,bid,minBid){
  const body=`Tawaran tertinggi: $${bid}<br>Tawaran minimum: $${minBid}`;
  if(isHost()&&p.i!==myPlayerIndex())return askRemote(`Lelang ${property}`,body,`Bid $${minBid}`,'Pass');
  if(!p.h)return Promise.resolve(false);
  return new Promise(resolve=>{
    const heading=txt(`Lelang ${property}`,body,22,16);
    const input=document.createElement('input');input.type='number';input.min=String(minBid);input.max=String(p.cash);input.step='100';input.value=String(minBid);input.setAttribute('aria-label','Tawaran lelang');
    const bidButton=wide('Tawar',()=>{const value=input.valueAsNumber;if(Number.isSafeInteger(value)&&value>=minBid&&value<=p.cash&&(value-minBid)%100===0){clr();resolve(value)}});
    const passButton=wide('Pass',()=>{clr();resolve(false)});
    card(heading,input,btns([bidButton,passButton]));
  });
}
export function ask(img,a,b,y,n,s2=22){
  if(isHost()&&G.cur!==myPlayerIndex())return askRemote(a,b,y,n);
  return new Promise(r=>{img.style.cssText='width:84px;height:84px;border-radius:12px;display:block';
    card(img,txt(a,b,24,s2),btns([ib(y,()=>{clr();r(true)}),n&&ib(n,()=>{clr();r(false)})].filter(Boolean)))})
}
export function chooseGameMode(){return new Promise(resolve=>{
  const title=txt('Millionaire Tycoon 3D','Pilih mode permainan',24,18);
  card(title,btns([wide('Satu perangkat',()=>{clr();resolve('local')}),wide('Online - beda perangkat',()=>{clr();resolve('online')})]))
})}
export function onlineLobby(){return new Promise(resolve=>{
  const title=document.createElement('h2');title.textContent='Room online';
  const form=document.createElement('div');form.className='online-lobby';
  const code=document.createElement('input');code.className='room-code';code.maxLength=6;code.placeholder='KODE ROOM';code.autocomplete='off';code.setAttribute('aria-label','Kode room');
  const status=document.createElement('div');status.className='setup-error';status.setAttribute('role','status');
  const create=wide('Buat room',async()=>{
    create.disabled=true;join.disabled=true;code.disabled=true;
    try{
      const room=await createRoom();status.className='room-status';status.innerHTML=`Bagikan kode ini ke teman:<strong>${room}</strong><span>Menunggu pemain kedua bergabung...</span>`;
      if(await waitForGuest()){clr();resolve({role:'host',room})}
      else resolve({role:'back'});
    }catch(error){status.className='setup-error';status.textContent=error.message;create.disabled=false;join.disabled=false;code.disabled=false}
  });
  const join=wide('Gabung room',async()=>{
    join.disabled=true;create.disabled=true;cancel.disabled=true;
    try{const room=await joinRoom(code.value);clr();resolve({role:'guest',room})}
    catch(error){status.className='setup-error';status.textContent=error.message;join.disabled=false;create.disabled=false;cancel.disabled=false}
  });
  const cancel=wide('Kembali',async()=>{await leaveRoom();clr();resolve({role:'back'})});
  form.append(title,code,status,btns([create,join,cancel]));card(form);
})}
export function waitingForHost(code){
  const message=txt('Terhubung ke room',`Kode ${code}<br>Menunggu host memulai permainan...`,24,18);
  card(message);
}
export function setupGame({online=false}={}){return new Promise(resolve=>{
  const form=document.createElement('form');form.className='setup-form';
  const title=document.createElement('h2');title.textContent=online?'Pengaturan permainan online':'Pengaturan permainan';form.append(title);
  const fields=[
    ...(!online?[['humanCount','Pemain manusia',1,6,1]]:[]),
    ['computerCount','Komputer',0,online?4:5,online?0:2],
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
  note.textContent=online?'Ada 2 pemain manusia di perangkat berbeda. Maksimal 4 komputer.':'Minimal 2 peserta dan maksimal 6 peserta.';
  const error=document.createElement('div');error.className='setup-error';error.setAttribute('role','alert');
  const start=document.createElement('button');start.className='setup-start';start.type='submit';start.textContent='Mulai permainan';
  form.append(note,error,start);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const values=Object.fromEntries(fields.map(([key])=>[key,inputs[key].valueAsNumber]));
    if(online)values.humanCount=2;
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
export function showRemotePrompt({id,title,body,yes,no,property}){
  if(property){
    const shell=document.createElement('div');shell.style.cssText='width:min(92vw,760px);pointer-events:auto';
    ov.replaceChildren(shell);
    createPropertyCard(shell,{
      ...property,
      preview:property.level>0?propertyPreview(property.level,property.hotel):'',
      onClose:()=>{clr();answerRemote(id,false).catch(showRemoteError)},
      onStrike:()=>{clr();answerRemote(id,true).catch(showRemoteError)}
    });
    return;
  }
  const message=txt(title,body,24,20);
  const choices=[ib(yes,()=>{clr();answerRemote(id,true).catch(showRemoteError)})];
  if(no)choices.push(ib(no,()=>{clr();answerRemote(id,false).catch(showRemoteError)}));
  card(message,btns(choices));
}
export async function showRemoteWithdrawal({id,max,cash}){
  const result=await showBankDialog({cash,bank:max,mount:ov});
  if(result.confirmed)
    answerRemoteWithdrawal(id,result.cash-cash).catch(showRemoteError);
}
function showRemoteError(error){
  const message=document.createElement('div');message.className='setup-error';message.textContent=error.message||String(error);
  card(message,btns([ib('Tutup',clr)]));
}
export function thumb(lv,hotel=false){const c=cvs(96),g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,0,96,96);
  if(!lv){g.fillStyle='#ebc16d';g.strokeStyle='#d9ab52';g.lineWidth=5;g.beginPath();g.moveTo(48,24);g.lineTo(88,48);g.lineTo(48,72);g.lineTo(8,48);g.closePath();g.fill();g.stroke()}
  else{g.font='64px sans-serif';g.textAlign='center';g.fillText(hotel?['','🏨','🏨','🏨','🏨','🏨'][lv]:['','🏚️','🏠','🏡','🏘️','🏰'][lv],48,70)}return c}
export function buyPropertyDlg(p,name,cost,rent,{level=0,hotel=false}={}){
  const property={name,cost,rent,level,hotel};
  if(isHost()&&G.cur!==myPlayerIndex())
    return askRemote(name,`Cost: ${cost}<br>Rent: ${rent}`,'🔨','✖',property);
  return new Promise(resolve=>{
    const shell=document.createElement('div');shell.style.cssText='width:min(92vw,760px);pointer-events:auto';
    ov.replaceChildren(shell);
    createPropertyCard(shell,{...property,preview:level>0?propertyPreview(level,hotel):'',onClose:()=>{clr();resolve(false)},onStrike:()=>{clr();resolve(true)}});
  });
}
async function bankDlg(p){
  const result=await showBankDialog({cash:p.cash,bank:p.bank,mount:ov});
  if(!result.confirmed)return;
  if(isGuest()){
    try{
      if(!await transferRemoteBank(result.cash)){
        showRemoteError(new Error('Transfer bank ditolak.'));
        return;
      }
    }catch(error){showRemoteError(error);return}
  }else{p.cash=result.cash;p.bank=result.bank;hud()}
}
export async function withdrawDlg(p){
  if(isHost()&&G.cur!==myPlayerIndex()){
    const amount=await requestRemoteWithdrawal(p.bank,p.cash);
    if(Number.isSafeInteger(amount)&&amount>=0&&amount<=p.bank){p.cash+=amount;p.bank-=amount;hud()}
    return;
  }
  if(!p.h){const amount=p.bank;p.cash+=amount;p.bank=0;hud();return}
  const result=await showBankDialog({cash:p.cash,bank:p.bank,mount:ov});
  if(result.confirmed){p.cash=result.cash;p.bank=result.bank;hud()}
}
const canAct=()=>G.idle||(isGuest()&&guestCanRoll());
export function hud(){const p=P[G.cur];$('cash').textContent=p.cash;$('bank').textContent=p.bank;$('pt').innerHTML='';$('pt').append(portrait(p));
  $('pt').firstChild.style.border='3px solid '+p.css;$('dice').disabled=!canAct()}
$('dice').onclick=()=>{if(isGuest()&&guestCanRoll()&&!ov.firstChild){sendRollRequest().catch(showRemoteError);$('dice').disabled=true;return}if(G.idle&&G.wake&&!ov.firstChild){const w=G.wake;G.wake=null;w()}};
$('hud').onclick=()=>{if(canAct()&&!ov.firstChild)bankDlg(P[G.cur])};
$('ch').onclick=()=>{if(!canAct()||ov.firstChild)return;selectInventoryItem(P[G.cur]).catch(showRemoteError)};
$('bc').onclick=()=>{if(!canAct()&&!isOnline()||ov.firstChild)return;const actions=isOnline()?[ib('🚪',async()=>{await leaveRoom();location.reload()}),ib('✖',clr)]:[ib('💾',()=>{save();clr()}),ib('🚪',()=>{location.reload()}),ib('✖',clr)];card(txt('Menu','',24),btns(actions))};
function save(){try{localStorage.setItem('mt3d',JSON.stringify({mapVersion:10,settings:getPlayerSettings(),cur:G.cur,P:P.map(p=>({pos:p.pos,prev:p.prev,nextMove:p.nextMove,cash:p.cash,bank:p.bank,alive:p.alive,inv:p.inv,pet:p.pet})),L:L.map(l=>l&&{o:l.o,lv:l.lv}),extra:G.saveExtra?.()}))}catch(e){}}
export function load(){try{const q=JSON.parse(localStorage.getItem('mt3d'));if(!q)return false;
  if(q.mapVersion!==10||!q.settings||!Array.isArray(q.P)||!Array.isArray(q.L)||q.L.length!==L.length||q.L.some((a,i)=>a&&!L[i])){
    localStorage.removeItem('mt3d');return false}
  configurePlayers(q.settings);
  if(q.P.length!==P.length){localStorage.removeItem('mt3d');return false}
  G.cur=q.cur;q.P.forEach((a,i)=>{
    Object.assign(P[i],a);P[i].m.visible=a.alive;place(P[i]);
    const move=P[i].nextMove;
    if(move&&move.from===P[i].pos&&move.prev===P[i].prev&&(LINKS[P[i].pos]||[]).includes(move.to)){
      const from=tp(move.from),to=tp(move.to);P[i].m.rotation.y=Math.atan2(to[0]-from[0],to[1]-from[1]);
    }else if(Number.isInteger(P[i].prev)&&P[i].prev>=0&&P[i].pos>=0){
      const from=tp(P[i].prev),to=tp(P[i].pos);P[i].m.rotation.y=Math.atan2(to[0]-from[0],to[1]-from[1]);
    }
  });
  q.L.forEach((a,i)=>{if(a){L[i].o=a.o;L[i].lv=a.lv;drawLot(i);setB(i)}});G.loadExtra?.(q.extra);return true}catch(e){return false}}

async function remoteShop(p,stock){
  for(const item of stock){
    if(p.cash<item.price)continue;
    const buy=await askRemote('Toko Bus',`${item.name}<br>${item.description}<br>Harga: ${item.price}`,'Beli','Lewati');
    if(buy){p.cash-=item.price;p.inv.push({id:item.id,n:item.name,icon:item.icon});hud()}
  }
}
function aiShop(p){
  const rivals=P.filter(player=>player.alive&&player.i!==p.i);
  const hasOwned=id=>p.inv.some(item=>item.id===id);
  const rivalLand=L.some(lot=>lot&&lot.o>=0&&lot.o!==p.i);
  const rivalBuilding=L.some(lot=>lot&&lot.o>=0&&lot.o!==p.i&&lot.lv>0);
  const ownUpgrade=L.some(lot=>lot&&lot.o===p.i&&lot.lv<5);
  const richestRival=rivals.some(player=>player.cash>=100);
  const streetSign=STREET_SIGN_IDS.find(id=>!hasOwned(id));
  const wanted=[
    p.cash<400&&p.bank>0?'computer':null,
    G.hasObstacle?.()&&p.cash>=300?'broom':null,
    rivalBuilding&&p.cash>=1500?'demolition':null,
    rivalLand&&p.cash>=1500?'lawyer':null,
    ownUpgrade&&p.cash>=1000?'toolkit':null,
    richestRival&&p.cash>=800?'thief':null,
    p.cash>=1800?'for-rent':null,
    p.cash>=1000?'remote-control':null,
    p.cash>=800?'stop-sign':null,
    streetSign&&p.cash>=600?streetSign:null,
    p.cash>=500?'bomb':null
  ].find(id=>id&&!hasOwned(id));
  const item=STORE_CATALOG.find(entry=>entry.id===wanted);
  if(!item||p.cash<item.price+(wanted==='computer'?0:250))return;
  p.cash-=item.price;p.inv.push({id:item.id,n:item.name,icon:item.icon});hud();
}
export async function shop(p){
  if(!p.h){aiShop(p);return}
  if(!STORE_CATALOG.length){await ban(portrait(p),p.css,'Toko Bus','Barang belum diisi',1200);return}
  const stock=randomStoreStock(p);
  if(!stock.length){await ban(portrait(p),p.css,'Toko Bus','Tidak ada alat tersedia',1200);return}
  if(isHost()&&G.cur!==myPlayerIndex()){await remoteShop(p,stock);return}
  const shell=document.createElement('div');shell.className='shop-shell';ov.replaceChildren(shell);
  const preview=createToolPreview();
  try{
    await openShop({
      cash:p.cash,
      mount:shell,
      width:'min(96vw, 1180px)',
      items:stock.map(item=>({...item,desc:item.description})),
      thumbs:Object.fromEntries(stock.map(item=>[item.id,preview.thumbnail(item.id)])),
      onBuy:item=>{
        const catalogItem=ITEMS.find(entry=>entry.id===item.id);
        if(p.cash<item.price||p.inv.some(owned=>owned.id===item.id)||!catalogItem)return false;
        p.cash-=item.price;p.inv.push({id:item.id,n:item.name,icon:catalogItem.icon});hud();return true;
      }
    });
  }finally{
    preview.destroy();clr();
  }
}
