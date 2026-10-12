import { createClient } from '@supabase/supabase-js';

const EVENTS=['join','room-ready','game-start','state','roll-request','prompt','answer','bank-request','bank-result','bank-withdraw-request','bank-withdraw-result'];
let client,channel,role='offline',roomCode='',peerId='',selfId=crypto.randomUUID();
let handlers={},guestResolver,startResolver,rollResolver,roomReadyResolver,guestConnected=false,guestReady=false,lastGameStart;
const answers=new Map(),bankRequests=new Map(),withdrawRequests=new Map();

export const isOnline=()=>role!=='offline';
export const isHost=()=>role==='host';
export const isGuest=()=>role==='guest';
export const guestCanRoll=()=>guestReady;
export const myPlayerIndex=()=>role==='host'?0:role==='guest'?1:-1;
export const currentRoom=()=>roomCode;
export function setNetworkHandlers(next){handlers=next}
function broadcast(event,payload={}) {
  if(!channel)throw new Error('Belum terhubung ke room online');
  return channel.send({type:'broadcast',event,payload});
}
function setupChannel(code,nextRole){
  const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
  if(!url||!key)throw new Error('Konfigurasi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY belum diisi.');
  client=createClient(url,key);
  role=nextRole;roomCode=code;selfId=crypto.randomUUID();peerId='';
  channel=client.channel(`millionaire-${code}`,{config:{broadcast:{self:false},presence:{key:selfId}}});
  EVENTS.forEach(event=>channel.on('broadcast',{event},({payload})=>handleEvent(event,payload||{})));
  return new Promise((resolve,reject)=>{
    let settled=false;
    const fail=error=>{
      if(settled)return;
      settled=true;clearTimeout(timer);
      const old=channel;channel=null;role='offline';roomCode='';client?.removeAllChannels();client=null;
      if(old)old.unsubscribe();
      reject(error);
    };
    const timer=setTimeout(()=>fail(new Error('Koneksi room timeout. Coba lagi.')),15000);
    channel.subscribe(status=>{
      if(settled)return;
      if(status==='SUBSCRIBED'){settled=true;clearTimeout(timer);channel.track({role:nextRole});resolve()}
      else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
        fail(new Error(`Gagal menyambungkan room (${status}).`))
      }
    })
  });
}
function handleEvent(event,payload){
  if(role==='host'){
    if(event==='join'&&payload.clientId&&payload.clientId!==selfId){
      if(peerId&&peerId!==payload.clientId)return;
      peerId=payload.clientId;guestConnected=true;
      broadcast('room-ready',{clientId:peerId}).catch(error=>handlers.onError?.(error));
      guestResolver?.(true);guestResolver=null;handlers.onGuestJoined?.();
    }else if(payload.clientId===peerId){
      if(event==='roll-request'&&rollResolver&&payload.player===1){const resolve=rollResolver;rollResolver=null;resolve()}
      if(event==='answer'){const resolve=answers.get(payload.id);if(resolve){answers.delete(payload.id);resolve(!!payload.value)}}
      if(event==='bank-request')Promise.resolve(handlers.onBankRequest?.(payload)).catch(error=>handlers.onError?.(error));
      if(event==='bank-withdraw-result'){const resolve=withdrawRequests.get(payload.id);if(resolve){withdrawRequests.delete(payload.id);resolve(payload.amount)}}
    }
  }else if(role==='guest'){
    if(event==='room-ready'&&payload.clientId===selfId){handlers.onRoomReady?.();roomReadyResolver?.();roomReadyResolver=null}
    else if(event==='game-start'){lastGameStart=payload;handlers.onGameStart?.(payload);startResolver?.(payload);startResolver=null}
    else if(event==='state'){guestReady=!!payload.awaitingRoll&&payload.cur===1;handlers.onState?.(payload)}
    else if(event==='prompt')handlers.onPrompt?.(payload);
    else if(event==='bank-result'){const resolve=bankRequests.get(payload.id);if(resolve){bankRequests.delete(payload.id);resolve(!!payload.accepted)}}
    else if(event==='bank-withdraw-request')handlers.onBankWithdraw?.(payload);
  }
}
export async function createRoom(){
  const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');
  await setupChannel(code,'host');
  return code;
}
export async function joinRoom(code){
  const normalized=code.toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!/^[A-Z0-9]{6}$/.test(normalized))throw new Error('Kode room harus terdiri dari 6 karakter.');
  try{
    await setupChannel(normalized,'guest');
    const deadline=Date.now()+12000;
    while(Date.now()<deadline){
      const ready=new Promise(resolve=>{
        const timer=setTimeout(()=>{roomReadyResolver=null;resolve(false)},900);
        roomReadyResolver=()=>{clearTimeout(timer);resolve(true)};
      });
      await broadcast('join',{clientId:selfId});
      if(await ready)return normalized;
    }
  }catch(error){
    await leaveRoom();
    throw error;
  }
  await leaveRoom();
  throw new Error('Room tidak ditemukan atau host belum terhubung.');
}
export function waitForGuest(){
  if(guestConnected)return Promise.resolve(true);
  return new Promise(resolve=>{guestResolver=resolve});
}
export function waitForGameStart(){
  if(lastGameStart)return Promise.resolve(lastGameStart);
  return new Promise(resolve=>{startResolver=resolve});
}
export function startOnlineGame(settings,state){
  return broadcast('game-start',{settings,state});
}
export function sendState(state){
  if(isHost())return broadcast('state',state);
}
export function waitForRemoteRoll(state){
  if(!isHost())return Promise.reject(new Error('Hanya host yang dapat menunggu giliran remote.'));
  if(!peerId)return Promise.reject(new Error('Pemain kedua terputus dari room.'));
  return new Promise((resolve,reject)=>{
    rollResolver=resolve;
    broadcast('state',{...state,awaitingRoll:true}).catch(error=>{rollResolver=null;reject(error)});
  })
}
export function sendRollRequest(){
  if(!isGuest())return Promise.reject(new Error('Tidak ada giliran online yang aktif.'));
  guestReady=false;
  return broadcast('roll-request',{clientId:selfId,player:1})
}
export function askRemote(title,body,yes,no){
  if(!isHost()||!peerId)return Promise.reject(new Error('Pemain kedua terputus dari room.'));
  const id=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    answers.set(id,resolve);
    broadcast('prompt',{id,title,body,yes,no}).catch(error=>{answers.delete(id);reject(error)});
  })
}
export function answerRemote(id,value){
  return broadcast('answer',{clientId:selfId,id,value})
}
export function transferRemoteBank(cash){
  if(!isGuest())return Promise.resolve(false);
  const id=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    bankRequests.set(id,resolve);
    broadcast('bank-request',{clientId:selfId,id,cash}).catch(error=>{bankRequests.delete(id);reject(error)});
  })
}
export function respondToBankRequest(id,accepted){
  return broadcast('bank-result',{clientId:peerId,id,accepted})
}
export function requestRemoteWithdrawal(max,cash){
  if(!isHost()||!peerId)return Promise.reject(new Error('Pemain kedua terputus dari room.'));
  const id=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    withdrawRequests.set(id,resolve);
    broadcast('bank-withdraw-request',{id,max,cash}).catch(error=>{withdrawRequests.delete(id);reject(error)});
  })
}
export function answerRemoteWithdrawal(id,amount){
  return broadcast('bank-withdraw-result',{clientId:selfId,id,amount})
}
export async function leaveRoom(){
  const old=channel;channel=null;role='offline';peerId='';roomCode='';
  guestConnected=false;guestReady=false;lastGameStart=null;roomReadyResolver=null;
  const waitingGuest=guestResolver;guestResolver=null;waitingGuest?.(false);
  answers.clear();bankRequests.clear();withdrawRequests.clear();rollResolver=null;guestResolver=null;startResolver=null;
  if(old)await old.unsubscribe();
  if(client){client.removeAllChannels();client=null}
}
