import { CASH0, hex } from './config.js';
import { tp } from './map.js';
import { scene } from './scene.js';
import { L, drawLot } from './world.js';
import { createAvatar } from '../Character/avatar-kit.js';
import { avatarPortraitSVG } from '../ui/avatar-portraits.js';
import { CHARACTERS } from '../ui/menu-data.js';
import { ITEMS } from './items.js';

export const OFF=[-.03,-.018,-.006,.006,.018,.03];
const START_PLAZA_OFFSETS=[[-1.05,-.7],[0,-.7],[1.05,-.7],[-1.05,0],[0,0],[1.05,0]];
export function laneOffset(index,from,to){
  const dx=to[0]-from[0],dz=to[1]-from[1],length=Math.hypot(dx,dz);
  if(!length)return [0,0];
  return [-dz/length*OFF[index],dx/length*OFF[index]];
}
// ---------- pemain ----------
const STYLES=[
  {c:0xe53935,sk:0xf1d4b8,hr:0x5a3a22,af:1},
  {c:0x43a047,sk:0xa8744f,hr:0x4e342e,bd:1},
  {c:0x1e88e5,sk:0xc68642,hr:0x151515,bob:1},
  {c:0xff9800,sk:0xffd7b5,hr:0x4e342e,af:1,bob:1},
  {c:0x9c27b0,sk:0xf1c7a5,hr:0x402020,bd:1},
  {c:0x00acc1,sk:0xd9a27f,hr:0x151515,af:1}
];
const DEFAULT_AVATARS=['princess','witch','pilot','fairy','prince','builder'];
export let P=[];
let settings={humanCount:1,computerCount:2,cash:CASH0,bank:CASH0};
export function getPlayerSettings(){return {...settings}}
export function configurePlayers(next){
  const total=next.humanCount+next.computerCount;
  const playerIds=Array.isArray(next.playerIds)?next.playerIds.slice(0,total):[];
  if(!Number.isInteger(next.humanCount)||next.humanCount<1||
    !Number.isInteger(next.computerCount)||next.computerCount<0||
    total<2||total>STYLES.length||
    !Number.isSafeInteger(next.cash)||next.cash<0||
    !Number.isSafeInteger(next.bank)||next.bank<0||
    playerIds.some(id=>!CHARACTERS.some(character=>character.id===id)))
    throw new RangeError('Pengaturan permainan tidak valid');
  P.forEach(p=>{if(p.m)scene.remove(p.m)});
  settings={...next,playerIds};
  P=STYLES.slice(0,total).map((style,i)=>{
    const profile=CHARACTERS.find(character=>character.id===playerIds[i]);
    const avatarType=profile?.avatarType||DEFAULT_AVATARS[i];
    const p={...style,n:profile?.name||`Player ${i+1}`,characterId:profile?.id||null,avatarType,i,h:i<settings.humanCount,
      css:hex(style.c),skc:hex(style.sk),hrc:hex(style.hr),pos:-1,prev:null,
      cash:settings.cash,bank:settings.bank,alive:true,
      inv:(profile?.items||[]).map(id=>{const item=ITEMS.find(entry=>entry.id===id);return item?{id:item.id,n:item.n,icon:item.icon}:null}).filter(Boolean),
      hospitalTurns:0,nextRoll:null,nextMove:null,pet:null};
    const scale=total>3?.38:.42;
    p.m=profile?profile.make():createAvatar(avatarType,{wave:false});
    p.m.scale.setScalar(scale);scene.add(p.m);place(p);return p;
  });
}
export function portrait(p,mood='neutral'){
  const image=document.createElement('img');
  image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarPortraitSVG(p.avatarType,p.css,{mood}))}`;
  image.alt=p.n||'Player';image.style.cssText='width:62px;height:62px;border-radius:12px;display:block';
  return image;
}
export const place=p=>{
  const [x,z]=tp(p.pos);
  if(p.pos<0){
    const [offsetX,offsetZ]=START_PLAZA_OFFSETS[p.i]||[0,0];
    p.m.position.set(x+offsetX,.21,z+offsetZ);
    return;
  }
  const from=Number.isInteger(p.prev)&&p.prev>=0?tp(p.prev):[x,z-2],offset=laneOffset(p.i,from,[x,z]);
  p.m.position.set(x+offset[0],.02,z+offset[1]);
};
configurePlayers(settings);
L.forEach((l,i)=>drawLot(i));
