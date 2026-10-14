import { showMainMenu } from '../ui/main-menu.js';

const app=document.getElementById('app');
let menu;
document.body.classList.add('menu-active');

async function launch(options){
  try{
    if(Number.isInteger(options.mapId))localStorage.setItem('mt3d-map',String(options.mapId));
    sessionStorage.setItem('mt3d-start-options',JSON.stringify(options));
    menu.destroy();
    document.body.classList.remove('menu-active');
    await import('./game.js');
  }catch(error){
    document.body.classList.add('menu-active');
    sessionStorage.removeItem('mt3d-start-options');
    const message=document.createElement('section');
    message.style.cssText='position:absolute;inset:10%;z-index:20;display:grid;place-content:center;gap:12px;padding:24px;border-radius:18px;background:#263238;color:#fff;text-align:center;font:600 16px system-ui';
    const title=document.createElement('strong');title.textContent='Game gagal dimulai';
    const detail=document.createElement('span');detail.textContent=error.message||String(error);
    const retry=document.createElement('button');retry.textContent='Muat ulang';retry.onclick=()=>location.reload();
    message.append(title,detail,retry);app.append(message);
    console.error('Failed to start game:',error);
  }
}

menu=showMainMenu({
  mount:app,
  hasSave:()=>Boolean(localStorage.getItem('mt3d')),
  onLoad:()=>launch({
    mode:'local',
    load:true,
    mapId:Number(localStorage.getItem('mt3d-map')||6)
  }),
  onStart:result=>launch({
    mode:result.mode==='offline'?'local':'online',
    mapId:result.map.id,
    cash:result.map.cash,
    bank:result.map.bank,
    playerIds:[result.character.id,...result.computers.map(character=>character.id)]
  })
});
