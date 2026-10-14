import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { $, BN, BUILD, HOTEL, RENT, sleep, tween } from './config.js';
import { directedNeighbor, LINKS, MAP, MAP_ID, T, nextPos, sn, tp } from './map.js';
import { cameraOffset, cam, constrainWorldView, panOffset, renderer, scene } from './scene.js';
import { HOSPITAL_POSITION, L, LOT_TARGET_MESHES, drawLot, flashLot, mergeStaticMeshes, setB, updateWorldDecorations } from './world.js';
import { configurePlayers, laneOffset, P, place, portrait } from './players.js';
import { die, face, rollDie } from './dice.js';
import { G, acceptBoardTarget, ask, ban, buyPropertyDlg, chooseAuctionBid, chooseDieValue, chooseGameMode, chooseOne, chooseBoardTarget, hud, load, onlineLobby, previewBoardTarget, setItemUseHandler, setupGame, shop, showRemotePrompt, showRemoteWithdrawal, thumb, waitingForHost, withdrawDlg } from './ui.js';
import { getPeerCharacterId, isGuest, isHost, isOnline, myPlayerIndex, requestRemoteItemUse, respondToBankRequest, sendDiceRoll, sendProgress, sendState, setNetworkHandlers, startOnlineGame, waitForGameStart, waitForRemoteRoll } from './multiplayer.js';
import { createItemArrow } from '../tools/item-arrow.js';
import { createItemBomb } from '../tools/item-bomb.js';
import { createItemCone } from '../tools/item-cone.js';
import { createItemBroom } from '../tools/item-broom.js';
import { createItemComputer } from '../tools/item-computer.js';
import { createItemDemolition } from '../tools/item-demolition.js';
import { createItemForRent } from '../tools/item-forrent.js';
import { createItemHelmet } from '../tools/item-helmet.js';
import { createItemJudge } from '../tools/item-judge.js';
import { createItemRemote } from '../tools/item-remote.js';
import { createItemThief } from '../tools/item-thief.js';
import { showBankDialog } from '../Bank/bank-dialog.js';
import { playEffect, playPetArrival, playPlayerLose, playPlayerTurn, playPlayerWin, startGameMusic, stopGameMusic } from './audio.js';
import babyUrl from '../pets-pack/models/baby.glb?url';
import catBlackUrl from '../pets-pack/models/cat_black.glb?url';
import catWhiteUrl from '../pets-pack/models/cat_white.glb?url';
import santaUrl from '../pets-pack/models/santa.glb?url';
import hospitalUrl from '../landmarks-pack/models/hospital.glb?url';

// ---------- aturan ----------
const ownedLots=()=>[...new Set(L)].filter(Boolean);
const nw=p=>p.cash+p.bank+ownedLots().reduce((a,l)=>a+(l.o==p.i?l.price+BUILD.slice(0,l.lv+1).reduce((x,y)=>x+y,0):0),0);
const propertyRent=(lot,level=lot.lv)=>Math.round(lot.rent*RENT[level]/RENT[0]);
const PET_KINDS=['baby','cat-black','cat-white','santa'];
const PET_MODELS={
  baby:{url:babyUrl,name:'Bayi',animation:'Idle'},
  'cat-black':{url:catBlackUrl,name:'Kucing hitam',animation:'Idle'},
  'cat-white':{url:catWhiteUrl,name:'Kucing putih',animation:'Idle'},
  santa:{url:santaUrl,name:'Santa',animation:'Idle'}
};
let petAssets=null,petAssetsReady=null;
function ensurePetAssets(){
  if(!petAssetsReady)petAssetsReady=Promise.all(Object.entries(PET_MODELS).map(async([kind,info])=>{
    const gltf=await new GLTFLoader().loadAsync(info.url);
    const clip=gltf.animations.find(animation=>animation.name===info.animation);
    if(!clip)throw new Error(`Animasi ${info.animation} tidak ditemukan pada model ${info.name}.`);
    return [kind,{scene:gltf.scene,clip}];
  })).then(entries=>{
    petAssets=new Map(entries);return petAssets;
  });
  return petAssetsReady;
}
const petTiles=new Map(),petVisuals=new Map();
let hasAppliedNetworkSnapshot=false;
let turnsUntilPetSpawn=3+Math.floor(Math.random()*8);
const complexRent=(target,owner)=>
  ownedLots().reduce((sum,lot)=>sum+(lot.group==target.group&&lot.o==owner?propertyRent(lot):0),0);
const obstacles=new Map(),mapIndex=new Map(MAP.map((tile,index)=>[tile.p.join(','),index]));
let focusOverride=null;
const STREET_SIGN_DIRS={
  'street-sign-front':'back','street-sign-right':'right',
  'street-sign-back':'front','street-sign-left':'left','street-sign':'back'
};
const isStreetSign=id=>Object.prototype.hasOwnProperty.call(STREET_SIGN_DIRS,id);
function createPetVisual(kind,height){
  const asset=petAssets?.get(kind);
  if(!asset)throw new Error(`Model hewan ${kind} belum siap dimuat.`);
  const model=SkeletonUtils.clone(asset.scene),bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3()),scale=height/Math.max(size.y,.001);
  model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;
  const mixer=new THREE.AnimationMixer(model);mixer.clipAction(asset.clip).play();
  return {model,mixer};
}
function removePetVisual(key){
  const visual=petVisuals.get(key);if(!visual)return;
  visual.group.parent?.remove(visual.group);
  visual.mixer.stopAllAction();visual.mixer.uncacheRoot(visual.model);
  petVisuals.delete(key);
}
function clearMapPet(tile){
  const pet=petTiles.get(tile);if(!pet)return false;
  removePetVisual(`tile:${tile}`);petTiles.delete(tile);return true;
}
function setPlayerPet(p,pet){
  removePetVisual(`player:${p.i}`);
  p.pet=validPet(pet)?{kind:pet.kind,turns:pet.turns,justCollected:pet.justCollected===true}:null;
  if(!p.pet)return;
  const {model,mixer}=createPetVisual(p.pet.kind,.95),group=new THREE.Group();
  group.position.set(0,3.35,0);group.add(model);p.m.add(group);
  petVisuals.set(`player:${p.i}`,{group,model,mixer});
}
function setMapPet(tile,kind){
  if(!Number.isInteger(tile)||tile<0||tile>=MAP.length||!PET_KINDS.includes(kind)||
    T[tile][1]!=='r'||petTiles.has(tile))return false;
  const {model,mixer}=createPetVisual(kind,1.15),group=new THREE.Group(),[x,z]=tp(tile);
  group.position.set(x,.035,z);group.add(model);scene.add(group);
  petTiles.set(tile,{kind});petVisuals.set(`tile:${tile}`,{group,model,mixer});
  return true;
}
function spawnRandomPet(){
  if(petTiles.size>=3)return false;
  const candidates=MAP.map((_,tile)=>tile).filter(tile=>
    T[tile][1]==='r'&&!petTiles.has(tile)&&!obstacles.has(tile)&&
    !P.some(p=>p.alive&&p.pos===tile)
  );
  if(!candidates.length)return false;
  const tile=candidates[Math.floor(Math.random()*candidates.length)];
  const kind=PET_KINDS[Math.floor(Math.random()*PET_KINDS.length)];
  if(!setMapPet(tile,kind))return false;
  announcePet(tile,kind);
  return true;
}
function advancePetSpawner(){
  if(turnsUntilPetSpawn>0)turnsUntilPetSpawn--;
  if(turnsUntilPetSpawn===0&&spawnRandomPet())
    turnsUntilPetSpawn=3+Math.floor(Math.random()*8);
}
function finishPetTurn(p){
  if(!p.pet)return;
  if(p.pet.justCollected){p.pet.justCollected=false;return}
  p.pet.turns--;
  if(p.pet.turns<=0)setPlayerPet(p,null);
}
function petCost(p,amount,upgrade=false){
  if(p.pet?.kind==='santa'&&upgrade)return 0;
  const multiplier=p.pet?.kind==='cat-black'?2:p.pet?.kind==='cat-white' ? .5 : 1;
  return Math.round(amount*multiplier);
}
async function collectPet(p,tile){
  const found=petTiles.get(tile);if(!found)return;
  clearMapPet(tile);
  setPlayerPet(p,{kind:found.kind,turns:5,justCollected:true});
  if(p.h)await ban(portrait(p),p.css,PET_MODELS[found.kind].name,
    'Efek aktif selama 5 giliranmu.',1100);
}
const hospitalPosition=new THREE.Vector3(HOSPITAL_POSITION.x,0,HOSPITAL_POSITION.z);
const hospitalExitTile=MAP.reduce((best,tile,index)=>{
  if(T[index][1]==='l'||T[index][1]==='bus'||T[index][1]==='bank')return best;
  const distance=Math.hypot(tile.p[0]*2-hospitalPosition.x,tile.p[1]*2-hospitalPosition.z);
  return distance<best.distance?{tile:index,distance}:best;
},{tile:-1,distance:Infinity}).tile;
const hospitalExitPrevious=(LINKS[hospitalExitTile]||[]).find(index=>
  MAP[index].p[0]===MAP[hospitalExitTile].p[0]&&MAP[index].p[1]===MAP[hospitalExitTile].p[1]-1
)??(LINKS[hospitalExitTile]||[])[0];
let hospitalMixer=null;
new GLTFLoader().load(hospitalUrl,({scene:hospital,animations})=>{
  mergeStaticMeshes(hospital,animations);
  hospital.rotation.y=Math.PI/2;
  hospital.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(hospital),size=bounds.getSize(new THREE.Vector3());
  if(size.y<=0)throw new Error('Model rumah sakit tidak memiliki tinggi yang valid.');
  const scale=6.5/size.y;
  const fitX=Math.min(1,6/(size.x*scale));
  const fitZ=Math.min(1,8/(size.z*scale));
  const scaleX=scale*fitZ,scaleZ=scale*fitX;
  hospital.scale.set(scaleX,scale,scaleZ);
  hospital.updateMatrixWorld(true);
  const fittedBounds=new THREE.Box3().setFromObject(hospital);
  const center=fittedBounds.getCenter(new THREE.Vector3());
  hospital.position.set(
    hospitalPosition.x-center.x,
    -fittedBounds.min.y,
    hospitalPosition.z-center.z
  );
  scene.add(hospital);
  const idle=animations.find(animation=>animation.name==='Idle');
  if(!idle)throw new Error('Animasi Idle tidak ditemukan pada model rumah sakit.');
  hospitalMixer=new THREE.AnimationMixer(hospital);
  hospitalMixer.clipAction(idle).setLoop(THREE.LoopRepeat,Infinity).play();
},undefined,error=>console.error('Failed to load hospital model:',error));
function burnCharacter(p,burned){
  if(burned&&!p.burnedMaterials){
    p.burnedMaterials=[];
    p.m.traverse(object=>{
      if(!object.isMesh||!object.material)return;
      const original=object.material,originals=Array.isArray(original)?original:[original];
      const charred=originals.map(material=>{
        const copy=material.clone();if(copy.color)copy.color.set(0x302c2b);if(copy.emissive)copy.emissive.set(0x120b08);
        return copy;
      });
      const material=Array.isArray(original)?charred:charred[0];
      p.burnedMaterials.push({object,original,material});
      object.material=material;
    });
  }else if(!burned&&p.burnedMaterials){
    p.burnedMaterials.forEach(({object,original,material})=>{
      object.material=original;
      (Array.isArray(material)?material:[material]).forEach(copy=>copy.dispose());
    });p.burnedMaterials=null;
  }
}
function placeAtHospital(p){
  p.m.position.set(hospitalPosition.x-1.15+(p.i%3)*.7,.02,hospitalPosition.z+1.45+Math.floor(p.i/3)*.7);
  p.m.rotation.y=Math.PI;
}
function disposeObject(object){
  object.traverse(child=>{if(!child.isMesh)return;child.geometry?.dispose();const materials=Array.isArray(child.material)?child.material:[child.material];
    materials.forEach(material=>{material?.map?.dispose();material?.dispose()})});
}
const itemModels={
  broom:[createItemBroom,.25],computer:[createItemComputer,.19],demolition:[createItemDemolition,.16],
  'for-rent':[createItemForRent,.2],toolkit:[createItemHelmet,.28],lawyer:[createItemJudge,.23],
  'remote-control':[createItemRemote,.4],thief:[createItemThief,.25]
};
async function showToolModel(id,p,{near=p,scaleOverride=null}={}){
  const entry=itemModels[id];if(!entry)return;
  const [create,defaultScale]=entry,model=create(),[x,z]=tp(near.pos),started=performance.now();
  model.scale.setScalar(scaleOverride??defaultScale);model.position.set(x+1.1,.02,z);scene.add(model);
  const previousFocus=focusOverride;
  if(near!==p)focusOverride=near.m.position.clone();
  try{
    await new Promise(resolve=>{
      const update=now=>{
        model.userData.update?.(now-started);
        if(now-started>=850){scene.remove(model);disposeObject(model);resolve()}
        else requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    });
  }finally{focusOverride=previousFocus}
}
function obstacleModel(data,{preview=false}={}){
  const model=data.id==='bomb'?createItemBomb():data.id==='street-sign'?createItemArrow({dir:data.dir||'front'}):createItemCone();
  model.scale.setScalar(data.id==='bomb'?.38:data.id==='street-sign'?.3:.55);
  if(preview)model.traverse(object=>{
    if(!object.isMesh)return;
    const clone=material=>{
      const copy=material.clone();copy.transparent=true;copy.opacity=.48;copy.depthWrite=false;return copy;
    };
    object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
  });
  const [x,z]=tp(data.tile);model.position.set(x,.02,z);scene.add(model);return model;
}
function createPlacementPreview(id,dir){
  let model=null,highlight=null;
  if(id==='broom'){
    highlight=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide}));
    highlight.rotation.x=-Math.PI/2;highlight.position.y=.045;scene.add(highlight);
  }
  return {
    show(tile){
      if(tile===null||tile===undefined){if(model)model.visible=false;if(highlight)highlight.visible=false;return}
      if(highlight){const [x,z]=tp(tile);highlight.position.set(x,.045,z);highlight.visible=true;return}
      if(!model)model=obstacleModel({id:isStreetSign(id)?'street-sign':id,dir,tile},{preview:true});
      const [x,z]=tp(tile);model.position.set(x,.04,z);model.visible=true;
    },
    dispose(){if(model){scene.remove(model);disposeObject(model);model=null}if(highlight){scene.remove(highlight);highlight.geometry.dispose();highlight.material.dispose();highlight=null}}
  };
}
function setObstacle(tile,data){
  const old=obstacles.get(tile);if(old){scene.remove(old.model);disposeObject(old.model);obstacles.delete(tile)}
  if(data){const obstacle={...data,tile,model:obstacleModel({...data,tile})};obstacles.set(tile,obstacle)}
}
function clearObstacle(tile){const obstacle=obstacles.get(tile);if(!obstacle)return false;
  scene.remove(obstacle.model);disposeObject(obstacle.model);obstacles.delete(tile);return true}
function isPathTile(tile){return Number.isInteger(tile)&&tile>=0&&tile<T.length}
function nextMoveFor(p){
  const direction=p.forcedDirection||(obstacles.get(p.pos)?.id==='street-sign'
    ?obstacles.get(p.pos).dir:null);
  const directed=direction?directedNeighbor(p.pos,direction):null;
  if(Number.isInteger(directed))return {from:p.pos,prev:p.prev,to:directed,forced:!!p.forcedDirection};
  if(p.forcedDirection)p.forcedDirection=null;
  const to=nextPos(p.pos,p.prev);
  return Number.isInteger(to)?{from:p.pos,prev:p.prev,to}:null;
}
function moveYaw(from,to){
  const a=tp(from),b=tp(to);
  return Math.atan2(b[0]-a[0],b[1]-a[1]);
}
function shortestTurn(from,to){
  return ((to-from+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
}
function validNextMove(move,p){
  return move&&move.from===p.pos&&move.prev===p.prev&&Number.isInteger(move.to)&&
    (LINKS[p.pos]||[]).includes(move.to);
}
function pay(p,a,to){const t=p.cash+p.bank;
  if(t>=a){const c=Math.min(p.cash,a);p.cash-=c;p.bank-=a-c;if(to)to.cash+=a;return true}
  if(to)to.cash+=t;p.cash=p.bank=0;p.alive=false;p.m.visible=false;L.forEach((l,i)=>{if(l.o==p.i){l.o=-1;l.lv=0;drawLot(i);setB(i)}});return false}
async function chooseToolTarget(p,id,message){
  if(p.h){
    const preview=['bomb','stop-sign','broom'].includes(id)||isStreetSign(id)
      ?createPlacementPreview(id,STREET_SIGN_DIRS[id]||'front'):null;
    return chooseBoardTarget(message,tile=>allowedTargetFor(tile,id,p),{
      onPreview:tile=>preview?.show(tile),
      onFinish:()=>preview?.dispose()
    });
  }
  const candidates=MAP.map((_,tile)=>tile).filter(tile=>allowedTargetFor(tile,id,p));
  if(id==='broom')return candidates.filter(tile=>obstacles.has(tile)).sort((a,b)=>Math.abs(a-p.pos)-Math.abs(b-p.pos))[0]??null;
  if(id==='demolition')return candidates.filter(tile=>L[tile].o>=0&&L[tile].o!==p.i).sort((a,b)=>(L[b].lv-L[a].lv))[0]??null;
  if(id==='for-rent')return candidates.sort((a,b)=>(L[b].rent-L[a].rent))[0]??null;
  if(id==='bomb'||isStreetSign(id)||id==='stop-sign')return candidates[Math.floor(Math.random()*candidates.length)]??null;
  return candidates[0]??null;
}
function allowedTargetFor(tile,id,p){
  const lot=L[tile];
  if(id==='broom')return isPathTile(tile);
  if(id==='demolition')return !!lot;
  if(id==='for-rent')return !!lot;
  if(id==='lawyer')return tile===p.pos&&!!lot&&lot.o>=0&&lot.o!==p.i;
  return isPathTile(tile);
}
function aiBidLimit(p,lot){
  const rent=propertyRent(lot),groupBonus=ownedLots().some(item=>item.group===lot.group&&item.o===p.i)?rent*4:0;
  const value=lot.price+BUILD.slice(1,lot.lv+1).reduce((sum,cost)=>sum+cost,0);
  return Math.min(p.cash,Math.max(value,Math.floor((value+rent*5+groupBonus)/100)*100));
}
async function runAuction(p,tile){
  const lot=L[tile];if(!lot)return false;
  const active=new Set(P.filter(player=>player.alive).map(player=>player.i));
  const startingBid=lot.price+BUILD.slice(1,lot.lv+1).reduce((sum,cost)=>sum+cost,0);
  let leader=-1,bid=startingBid-100;
  while(active.size>(leader<0?0:1)){
    let raised=false;
    for(const index of [...active]){
      if(index===leader)continue;
      const player=P[index],minimum=bid+100;
      if(player.cash<minimum){active.delete(index);continue}
      let offer;
      if(player.h)offer=await chooseAuctionBid(player,lot.id,bid,minimum);
      else offer=minimum<=aiBidLimit(player,lot)?minimum:false;
      if(offer===true)offer=minimum;
      if(offer!==false&&Number.isSafeInteger(offer)&&offer>=minimum&&offer<=player.cash){
        bid=offer;leader=index;raised=true;
      }else active.delete(index);
    }
    if(!raised)break;
  }
  if(leader<0)return false;
  const oldOwner=lot.o,winner=P[leader];winner.cash-=bid;lot.o=leader;drawLot(tile);setB(tile);hud();
  await ban(portrait(winner),winner.css,'MENANG LELANG',`${lot.id} — $${bid}`,1300);
  if(oldOwner>=0&&oldOwner!==leader)await ban(portrait(P[oldOwner]),P[oldOwner].css,'LAHAN TERLELANG',lot.id,1000);
  return true;
}
function canUseToolkit(p){
  const lot=L[p.pos];
  return p.pet?.kind!=='baby'&&lot?.o===p.i&&lot.lv<5?lot:null;
}
async function confirmToolkit(p,lot){
  const level=lot.lv+1,rent=propertyRent(lot,level),hotel=lot.s===2;
  return p.h
    ?buyPropertyDlg(p,hotel?HOTEL[level]:BN[level],0,rent,{level,hotel})
    :true;
}
async function confirmDemolition(p,lot){
  return p.h
    ?ask(thumb(lot.lv,lot.s===2),`Hancurkan ${lot.id}?`,lot.lv>0?'Bangunan di lahan ini akan diruntuhkan.':'Lahan ini kosong, tidak ada bangunan untuk diruntuhkan.','✓','✕')
    :true;
}
async function confirmToolTarget(p,title,description){
  return p.h?ask(portrait(p),title,description,'✓','✕'):true;
}
async function showDemolitionModel(lot){
  const model=createItemDemolition(),started=performance.now();
  const targetSize=lot.b
    ?new THREE.Box3().setFromObject(lot.b).getSize(new THREE.Vector3())
    :new THREE.Vector3(lot.s===2?3.55:1.55,1,lot.s===2?3.55:1.55);
  const subject=model.getObjectByName('DemolitionTargetBuilding');
  if(!subject)throw new Error('Model demolition tidak memiliki bagian bangunan.');
  const subjectBounds=new THREE.Box3().setFromObject(subject),subjectSize=subjectBounds.getSize(new THREE.Vector3());
  const subjectCenter=subjectBounds.getCenter(new THREE.Vector3());
  const scale=Math.max(targetSize.x,targetSize.z)/Math.max(subjectSize.x,subjectSize.z);
  model.scale.setScalar(scale);
  model.position.set(lot.lx+(lot.s===2?2.5:1.5)-subjectCenter.x*scale,.02-subjectCenter.y*scale,lot.lz+1.1-subjectCenter.z*scale);
  scene.add(model);
  const previousFocus=focusOverride;focusOverride=new THREE.Vector3(lot.lx,0,lot.lz);
  try{
    await new Promise(resolve=>{
      const update=now=>{
        model.userData.update?.(now-started);
        if(now-started>=1000){scene.remove(model);disposeObject(model);resolve()}
        else requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    });
  }finally{focusOverride=previousFocus}
}
async function collectGuestAction(p,item){
  if(item.id==='computer'){
    if(p.bank<=0)return null;
    const result=await showBankDialog({cash:0,bank:p.bank,mount:document.getElementById('ov'),labels:{cash:'Diambil:',bank:'Sisa bank:'}});
    return result.confirmed&&result.cash>0?{amount:result.cash}:null;
  }
  if(item.id==='remote-control'){
    const roll=await chooseDieValue();
    return roll===null?null:{roll};
  }
  if(item.id==='thief'){
    const targets=P.filter(target=>target.alive&&target.i!==p.i&&target.cash>0);
    if(!targets.length)return null;
    const targetIndex=await chooseOne('Pilih target pencurian',targets.map(target=>({label:`${target.n} — $${target.cash}`,value:target.i})));
    return targetIndex===null?null:{targetIndex};
  }
  if(item.id==='toolkit'){
    const lot=canUseToolkit(p);if(!lot)return null;
    return await confirmToolkit(p,lot)?{confirm:true}:null;
  }
  if(item.id==='lawyer'){
    return allowedTargetFor(p.pos,item.id,p)?{tile:p.pos}:null;
  }
  const messages={
    bomb:'Klik petak jalan tempat bom akan dipasang.',
    'street-sign-front':'Klik petak jalan tempat rambu ↑ atas akan dipasang.',
    'street-sign-right':'Klik petak jalan tempat rambu kanan akan dipasang.',
    'street-sign-back':'Klik petak jalan tempat rambu ↓ bawah akan dipasang.',
    'street-sign-left':'Klik petak jalan tempat rambu kiri akan dipasang.',
    'street-sign':'Klik petak jalan tempat rambu akan dipasang.',
    'stop-sign':'Klik petak jalan tempat pemain akan dipaksa berhenti.',
    broom:'Arahkan ke petak jalan yang akan disapu.',
    demolition:'Klik lahan mana pun yang akan dihancurkan.',
    'for-rent':'Klik petak lahan mana pun untuk memulai lelang.',
    lawyer:'Klik lahan lawan tempat pionmu sedang berdiri.',
  };
  const tile=await chooseToolTarget(p,item.id,messages[item.id]||'Pilih petak sasaran.');
  if(tile===null||tile===undefined)return null;
  if(item.id==='demolition'){
    const lot=L[tile];if(!lot||!await confirmDemolition(p,lot))return null;
    return {tile,confirm:true};
  }
  if(item.id==='for-rent'){
    const lot=L[tile];
    if(!lot)return null;
    const startingBid=lot.price+BUILD.slice(1,lot.lv+1).reduce((sum,cost)=>sum+cost,0);
    if(!await confirmToolTarget(p,'Lelang '+lot.id,`Harga awal: $${startingBid}<br>Kenaikan tawaran: $100`))return null;
    return {tile,confirm:true};
  }
  if(item.id==='broom'){
    if(!await confirmToolTarget(p,'Sapu petak ini?','Rintangan di petak jalan yang dipilih akan dibersihkan.'))return null;
    return {tile,confirm:true};
  }
  return {tile};
}
async function useItem(p,index,action){
  const item=p.inv[index];if(!item)return false;
  if(isGuest()&&action===undefined){
    const remoteAction=await collectGuestAction(p,item);if(!remoteAction)return false;
    return requestRemoteItemUse(index,remoteAction);
  }
  let used=false;
  if(item.id==='computer'){
    if(p.bank<=0){await ban(portrait(p),p.css,'Computer','Tabungan bank kosong',900);return false}
    if(!p.h&&p.cash>=500)return false;
    let amount=action?.amount;
    if(amount===undefined){
      const result=await showBankDialog({cash:0,bank:p.bank,mount:document.getElementById('ov'),labels:{cash:'Diambil:',bank:'Sisa bank:'}});
      if(!result.confirmed)return false;
      amount=result.cash;
    }
    if(amount===null)return false;
    if(!Number.isSafeInteger(amount)||amount<1||amount>p.bank)return false;
    p.bank-=amount;p.cash+=amount;used=true;playEffect('bank');
    await ban(portrait(p),p.css,'COMPUTER',`Ambil $${amount} dari tabungan`,1000);
  }else if(item.id==='remote-control'){
    const result=action?.roll??(p.h?await chooseDieValue():6);
    if(result===null)return false;
    if(!Number.isSafeInteger(result)||result<1||result>6)return false;
    p.nextRoll=result;used=true;await showToolModel(item.id,p,{scaleOverride:.52});
    await ban(portrait(p),p.css,'REMOTE CONTROL',`Dadu berikutnya: ${result}`,900);
  }else if(item.id==='lawyer'){
    const tile=p.pos,lot=L[tile];
    if(!allowedTargetFor(tile,item.id,p)){if(p.h)await ban(portrait(p),p.css,'LAWYER','Kamu harus berhenti di lahan milik lawan.',1000);return false}
    const former=P[lot.o];lot.o=p.i;drawLot(tile);used=true;playPlayerWin(p);playPlayerLose(former);
    await showToolModel(item.id,p,{scaleOverride:.4});
    await ban(portrait(p),p.css,'LAWYER',`${lot.id} sekarang milikmu`,1100);
    await ban(portrait(former),former.css,'LAHAN DIAMBIL ALIH',lot.id,950);
  }else if(item.id==='thief'){
    const targets=P.filter(target=>target.alive&&target.i!==p.i&&target.cash>0);
    if(!targets.length)return false;
    const targetIndex=action?.targetIndex??(p.h
      ?await chooseOne('Pilih target pencurian',targets.map(target=>({label:`${target.n} — $${target.cash}`,value:target.i})))
      :targets.sort((a,b)=>b.cash-a.cash)[0].i);
    if(!targets.some(target=>target.i===targetIndex))return false;
    if(targetIndex===null)return false;
    const target=P[targetIndex],stolen=Math.floor(target.cash*.25);
    if(!stolen)return false;
    target.cash-=stolen;p.cash+=stolen;used=true;playPlayerWin(p);await showToolModel(item.id,p,{near:target,scaleOverride:.48});
    await ban(portrait(p),p.css,'THIEF',`Mencuri $${stolen} dari ${target.n}`,1100);
  }else if(item.id==='toolkit'){
    const lot=canUseToolkit(p);
    if(!lot){if(p.h)await ban(portrait(p),p.css,'TOOLKIT',p.pet?.kind==='baby'
      ?'Bayi membuatmu tidak bisa meningkatkan bangunan.'
      :'Berhenti di lahan milikmu yang masih bisa ditingkatkan.',1100);return false}
    const confirmed=action?.confirm??await confirmToolkit(p,lot);
    if(confirmed!==true)return false;
    const level=lot.lv+1;used=true;await showToolModel(item.id,p);
    lot.lv=level;setB(p.pos);drawLot(p.pos);hud();
    await ban(portrait(p),p.css,'TOOLKIT','Bangunan ditingkatkan gratis',950);
  }else{
    const messages={
      bomb:'Klik petak jalan tempat bom akan dipasang.',
      'street-sign-front':'Klik petak jalan tempat rambu ↑ atas akan dipasang.',
      'street-sign-right':'Klik petak jalan tempat rambu kanan akan dipasang.',
      'street-sign-back':'Klik petak jalan tempat rambu ↓ bawah akan dipasang.',
      'street-sign-left':'Klik petak jalan tempat rambu kiri akan dipasang.',
      'street-sign':'Klik petak jalan tempat rambu akan dipasang.',
      'stop-sign':'Klik petak jalan tempat pemain akan dipaksa berhenti.',
      broom:'Klik petak berisi rintangan yang ingin dibersihkan.',
      demolition:'Klik lahan mana pun yang akan dihancurkan.',
      'for-rent':'Klik petak lahan mana pun untuk memulai lelang.',
      lawyer:'Klik lahan lawan tempat pionmu sedang berdiri.'
    };
    const tile=action?.tile??await chooseToolTarget(p,item.id,messages[item.id]||'Pilih petak sasaran.');
    if(tile===null||tile===undefined)return false;
    if(!allowedTargetFor(tile,item.id,p))return false;
    if(item.id==='bomb'||item.id==='stop-sign'||isStreetSign(item.id)){
      const dir=isStreetSign(item.id)?STREET_SIGN_DIRS[item.id]:'front';
      setObstacle(tile,{id:isStreetSign(item.id)?'street-sign':item.id,dir});used=true;
      await ban(portrait(p),p.css,item.n,'Rintangan dipasang di '+sn(tile),950);
    }else if(item.id==='broom'){
      if(action?.confirm!==true)return false;
      if(!clearObstacle(tile)){if(p.h)await ban(portrait(p),p.css,'BROOM','Tidak ada rintangan di petak ini.',950);return false}
      used=true;await showToolModel(item.id,p);
      await ban(portrait(p),p.css,'BROOM','Rintangan berhasil dibersihkan',950);
    }else if(item.id==='demolition'){
      const lot=L[tile];if(!lot)return false;
      const confirmed=action?.confirm??await confirmDemolition(p,lot);
      if(confirmed!==true)return false;
      used=true;
      if(lot.lv>0){
        const animation=showDemolitionModel(lot);playEffect('bomb');lot.lv=0;setB(tile);drawLot(tile);
        await animation;
        await ban(portrait(p),p.css,'DEMOLITION','Bangunan dihancurkan!',1100);
      }else await ban(portrait(p),p.css,'DEMOLITION','Lahan kosong, tidak ada bangunan.',1000);
    }else if(item.id==='for-rent'){
      if(action?.confirm!==true)return false;
      const lot=L[tile];if(!lot)return false;
      used=true;await showToolModel(item.id,p);await runAuction(p,tile);
    }
  }
  if(used){p.inv.splice(index,1);hud()}
  return used;
}
setItemUseHandler(useItem);
G.hasObstacle=()=>obstacles.size>0;
let targetPointer=null;
const canvas=renderer.domElement,ground=new THREE.Plane(new THREE.Vector3(0,1,0),-.02),raycaster=new THREE.Raycaster();
function tileAtPointer(event){
  const bounds=canvas.getBoundingClientRect();
  const ndc=new THREE.Vector2((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
  cam.updateMatrixWorld();raycaster.setFromCamera(ndc,cam);
  const lotHit=raycaster.intersectObjects(LOT_TARGET_MESHES,false)[0];
  if(lotHit)return lotHit.object.userData.targetTile;
  const point=raycaster.ray.intersectPlane(ground,new THREE.Vector3());if(!point)return undefined;
  return mapIndex.get(`${Math.round(point.x/2)},${Math.round(point.z/2)}`);
}
canvas.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  if(event.pointerType==='touch'&&!event.isPrimary){targetPointer=null;return}
  targetPointer={id:event.pointerId,x:event.clientX,y:event.clientY};
  previewBoardTarget(tileAtPointer(event));
});
canvas.addEventListener('pointermove',event=>{
  if(targetPointer&&targetPointer.id===event.pointerId&&Math.hypot(event.clientX-targetPointer.x,event.clientY-targetPointer.y)>8)targetPointer=null;
  previewBoardTarget(tileAtPointer(event));
});
canvas.addEventListener('pointerup',event=>{
  if(!targetPointer||targetPointer.id!==event.pointerId)return;
  const click=targetPointer;targetPointer=null;
  if(Math.hypot(event.clientX-click.x,event.clientY-click.y)>8)return;
  const tile=tileAtPointer(event);
  if(tile!==undefined&&!acceptBoardTarget(tile))$('street').textContent='Petak ini tidak sesuai sasaran alat';
});
canvas.addEventListener('pointercancel',()=>{targetPointer=null});
async function step(p,n){for(let k=0;k<n;k++){
    if(obstacles.get(p.pos)?.id==='street-sign'){
      const sign=obstacles.get(p.pos);
      p.forcedDirection=sign.dir;
      clearObstacle(p.pos);p.nextMove=nextMoveFor(p);
    }
    const move=validNextMove(p.nextMove,p)?p.nextMove:nextMoveFor(p);
    const nx=move?.to;
    if(move?.forced)p.forcedDirection=null;
    p.nextMove=null;
    if(!Number.isInteger(nx))break;
    const a=tp(p.pos);
    const b=tp(nx),offset=laneOffset(p.i,a,b);
    const yaw=moveYaw(p.pos,nx),startYaw=p.m.rotation.y;
    const turn=shortestTurn(startYaw,yaw);
    const start=p.m.position.clone(),targetX=a[0]+offset[0],targetZ=a[1]+offset[1];
    if(Math.abs(turn)>.08||Math.hypot(start.x-targetX,start.z-targetZ)>.01){
      await tween(150,t=>{
        p.m.position.x=start.x+(targetX-start.x)*t;
        p.m.position.z=start.z+(targetZ-start.z)*t;
        p.m.rotation.y=startYaw+turn*t;
        syncMovement(p);
      });
    }else{
      p.m.position.x=targetX;p.m.position.z=targetZ;p.m.rotation.y=yaw;
    }
    p.networkWalking=true;p.m.userData.setWalking(true);syncMovement(p,true);
    await tween(380,t=>{
      p.m.position.set(targetX+(b[0]-a[0])*t,.02,targetZ+(b[1]-a[1])*t);
      syncMovement(p);
    });
    p.networkWalking=false;p.m.userData.setWalking(false);syncMovement(p,true);
    const obstacle=obstacles.get(nx);
    p.prev=p.pos;p.pos=nx;$('street').textContent=sn(nx);
    if(obstacle?.id==='street-sign'){
      p.forcedDirection=obstacle.dir;
      clearObstacle(nx);
      p.nextMove=nextMoveFor(p);
    }else if(obstacle?.id==='stop-sign'){
      clearObstacle(nx);
      if(p.h)await ban(portrait(p),p.css,'STOP','Tanda berhenti mengakhiri langkahmu',900);
      break;
    }
    if(T[nx][1]=='bank')await withdrawDlg(p);
  }
  place(p);
  if(!validNextMove(p.nextMove,p))p.nextMove=nextMoveFor(p);
  if(p.nextMove){
    const yaw=moveYaw(p.nextMove.from,p.nextMove.to),startYaw=p.m.rotation.y,turn=shortestTurn(startYaw,yaw);
    if(Math.abs(turn)>.08)await tween(140,t=>{p.m.rotation.y=startYaw+turn*t});
    else p.m.rotation.y=yaw;
  }
}
async function land(p){const t=T[p.pos],l=L[p.pos];
  if(obstacles.get(p.pos)?.id==='bomb'){
    playEffect('bomb');
    clearObstacle(p.pos);p.hospitalTurns=3;p.pos=hospitalExitTile;p.prev=hospitalExitPrevious;p.nextMove=null;
    p.m.visible=true;burnCharacter(p,true);placeAtHospital(p);
    await ban(portrait(p),p.css,'BOM MELEDAK','Dibawa ke rumah sakit. Kamu melewatkan 3 giliran.',1500);return;
  }
  if(t[1]=='pad'){p.cash+=t[2];playEffect('coins');playPlayerWin(p);hud();await ban(portrait(p),p.css,'COLLECT','$'+t[2]);return}
  if(t[1]=='l'&&t[2]?.t=='pad'){p.cash+=t[2].v;playEffect('coins');playPlayerWin(p);hud();await ban(portrait(p),p.css,'COLLECT','$'+t[2].v)}
  if(t[1]=='bank')return;
  if(t[1]=='bus')await shop(p);
  else if(t[1]=='l'){
    if(l.o>=0&&l.o!=p.i)await flashLot(p.pos);
    if(l.o<0){
      if(p.pet?.kind==='baby'){
        playPetArrival(p.pet.kind);
        if(p.h)await ban(portrait(p),p.css,'BAYI','Kamu belum bisa membeli lahan.',950);
      }else{
        if(p.pet)playPetArrival(p.pet.kind);
        const cost=petCost(p,l.price);
        if(p.cash>=cost){const y=p.h?await buyPropertyDlg(p,t[0],cost,propertyRent(l,0)):true;
          if(y){p.cash-=cost;l.o=p.i;drawLot(p.pos);hud();await sleep(300)}}
        else if(p.h)await ban(portrait(p),p.css,t[0],'Uang kurang',1000);
      }
    }
    else if(l.o==p.i){
      if(p.pet?.kind==='baby'){
        playPetArrival(p.pet.kind);
        if(p.h)await ban(portrait(p),p.css,'BAYI','Kamu belum bisa meningkatkan bangunan.',950);
      }else{
        if(p.pet)playPetArrival(p.pet.kind);
        const nx=l.lv+1,cost=petCost(p,BUILD[nx],true);
        if(l.lv<5&&p.cash>=cost){const rent=propertyRent(l,nx),y=p.h?await buyPropertyDlg(p,l.s==2?HOTEL[nx]:BN[nx],cost,rent,{level:nx,hotel:l.s===2}):p.cash-cost>=200;
          if(y){p.cash-=cost;l.lv=nx;setB(p.pos);hud();await sleep(300)}}
      }
    }else{
      const o=P[l.o],r=petCost(p,complexRent(l,l.o));
      if(p.pet?.kind==='cat-black'||p.pet?.kind==='cat-white')playPetArrival(p.pet.kind);
      await ban(portrait(p),p.css,t[0],'RENT $'+r,1300);
      playPlayerLose(p);
      if(pay(p,r,o)){playPlayerWin(o);hud();await ban(portrait(o),o.css,'RECEIVED','$'+r,1000)}else{hud();await ban(portrait(p),p.css,p.n,'BANGKRUT 💥',1400)}
    }
  }
}
const snapshot=(awaitingRoll=false)=>({
  cur:G.cur,awaitingRoll,
  players:P.map(p=>({pos:p.pos,prev:p.prev,nextMove:p.nextMove,cash:p.cash,bank:p.bank,alive:p.alive,
    inv:p.inv,hospitalTurns:p.hospitalTurns||0,nextRoll:p.nextRoll||null,pet:p.pet?{...p.pet}:null})),
  lots:L.map(l=>l&&({o:l.o,lv:l.lv})),
  obstacles:[...obstacles.values()].map(({tile,id,dir})=>({tile,id,dir})),
  pets:[...petTiles].map(([tile,{kind}])=>({tile,kind})),petSpawnCountdown:turnsUntilPetSpawn
});
G.saveExtra=()=>({
  obstacles:[...obstacles.values()].map(({tile,id,dir})=>({tile,id,dir})),
  pets:[...petTiles].map(([tile,{kind}])=>({tile,kind})),petSpawnCountdown:turnsUntilPetSpawn,
  players:P.map(p=>({hospitalTurns:p.hospitalTurns||0,nextRoll:p.nextRoll||null}))
});
G.loadExtra=data=>{
  [...obstacles.keys()].forEach(clearObstacle);
  [...petTiles.keys()].forEach(clearMapPet);
  P.forEach(p=>setPlayerPet(p,validPet(p.pet)?{...p.pet}:null));
  if(!data||!Array.isArray(data.obstacles)||!Array.isArray(data.players)||data.players.length!==P.length){
    turnsUntilPetSpawn=3+Math.floor(Math.random()*8);return;
  }
  data.obstacles.forEach(({tile,id,dir})=>{if(Number.isInteger(tile)&&tile>=0&&tile<MAP.length&&['bomb','street-sign','stop-sign'].includes(id))setObstacle(tile,{id,dir})});
  if(Array.isArray(data.pets))data.pets.slice(0,3).forEach(({tile,kind})=>setMapPet(tile,kind));
  turnsUntilPetSpawn=Number.isInteger(data.petSpawnCountdown)?Math.max(0,Math.min(10,data.petSpawnCountdown)):3+Math.floor(Math.random()*8);
  data.players.forEach((state,index)=>{
    P[index].hospitalTurns=Number.isInteger(state.hospitalTurns)?Math.max(0,state.hospitalTurns):0;
    P[index].nextRoll=Number.isInteger(state.nextRoll)&&state.nextRoll>=1&&state.nextRoll<=6?state.nextRoll:null;
    if(P[index].hospitalTurns>0){P[index].pos=hospitalExitTile;P[index].prev=hospitalExitPrevious;P[index].nextMove=null}
    burnCharacter(P[index],P[index].hospitalTurns>0);P[index].m.visible=P[index].alive;
    if(P[index].hospitalTurns>0)placeAtHospital(P[index]);
  });
};
function validPet(pet){
  return !!pet&&PET_KINDS.includes(pet.kind)&&Number.isInteger(pet.turns)&&pet.turns>=1&&pet.turns<=5;
}
function applySnapshot(state){
  if(!state||!Array.isArray(state.players)||state.players.length!==P.length||!Array.isArray(state.lots)||state.lots.length!==L.length||!Array.isArray(state.obstacles))
    throw new Error('Data permainan online tidak valid.');
  const previousTurn=G.cur,previousPets=new Map(petTiles);
  G.cur=((state.cur%P.length)+P.length)%P.length;
  state.players.forEach((data,i)=>{
    Object.assign(P[i],data);P[i].hospitalTurns=data.hospitalTurns||0;
    setPlayerPet(P[i],validPet(data.pet)?{...data.pet}:null);
    P[i].networkTarget=null;P[i].networkWalking=false;P[i].m.userData.setWalking(false);
    burnCharacter(P[i],P[i].hospitalTurns>0);
    P[i].m.visible=data.alive;
    if(P[i].hospitalTurns>0)placeAtHospital(P[i]);else place(P[i]);
    const move=P[i].nextMove;
    if(validNextMove(move,P[i]))P[i].m.rotation.y=moveYaw(move.from,move.to);
    else if(Number.isInteger(data.prev)&&data.prev>=0&&Number.isInteger(data.pos)&&data.pos>=0)
      P[i].m.rotation.y=moveYaw(data.prev,data.pos);
  });
  if(G.cur!==previousTurn&&P[G.cur].h&&P[G.cur].i===myPlayerIndex())waveForTurn(P[G.cur]);
  state.lots.forEach((data,i)=>{if(data&&L[i]){L[i].o=data.o;L[i].lv=data.lv;drawLot(i);setB(i)}});
  [...obstacles.keys()].forEach(clearObstacle);
  state.obstacles.forEach(({tile,id,dir})=>{if(Number.isInteger(tile)&&tile>=0&&tile<MAP.length&&['bomb','street-sign','stop-sign'].includes(id))setObstacle(tile,{id,dir})});
  [...petTiles.keys()].forEach(clearMapPet);
  if(Array.isArray(state.pets))state.pets.slice(0,3).forEach(({tile,kind})=>setMapPet(tile,kind));
  if(hasAppliedNetworkSnapshot){
    petTiles.forEach(({kind},tile)=>{
      if(previousPets.get(tile)?.kind!==kind)announcePet(tile,kind);
    });
  }
  hasAppliedNetworkSnapshot=true;
  turnsUntilPetSpawn=Number.isInteger(state.petSpawnCountdown)?Math.max(0,Math.min(10,state.petSpawnCountdown)):3+Math.floor(Math.random()*8);
  hud();$('street').textContent=sn(P[G.cur].pos);
}
function waveForTurn(p){
  if(!p.h)return;
  clearTimeout(p.waveTimer);
  p.m.userData.setWaving(true);
  p.waveTimer=setTimeout(()=>{p.m.userData.setWaving(false);p.waveTimer=null},1000);
}
function check(){const al=P.filter(p=>p.alive),w=al.length==1?al[0]:0;
  if(w){G.over=true;stopGameMusic();hud();ask(portrait(w),'🏆 '+w.n+' menang!','Aset $'+nw(w),'🔁',0,24).then(()=>location.reload())}}
const foc=new THREE.Vector3().copy(P[0].m.position),target=new THREE.Vector3();
const petFocusTarget=new THREE.Vector3();
let petFocusUntil=0;
function announcePet(tile,kind){
  playPetArrival(kind);
  const [x,z]=tp(tile);
  petFocusTarget.set(x,0,z);
  petFocusUntil=performance.now()+2200;
}
let lastProgressAt=0;
let lastPetFrame=performance.now();
function syncMovement(p,force=false){
  if(!isHost())return;
  const now=performance.now();
  if(!force&&now-lastProgressAt<120)return;
  lastProgressAt=now;
  sendProgress({player:p.i,x:p.m.position.x,y:p.m.position.y,z:p.m.position.z,rotation:p.m.rotation.y,walking:!!p.networkWalking})
    ?.catch(error=>console.error('Online movement sync error:',error));
}
(function loop(){const now=performance.now(),delta=Math.min((now-lastPetFrame)/1000,.1);lastPetFrame=now;if(isGuest())P.forEach(p=>{if(p.networkTarget){p.m.position.lerp(p.networkTarget,.32);const turn=Math.atan2(Math.sin(p.networkRotation-p.m.rotation.y),Math.cos(p.networkRotation-p.m.rotation.y));p.m.rotation.y+=turn*.32}});foc.lerp(focusOverride||(now<petFocusUntil?petFocusTarget:P[G.cur].m.position),.07);target.copy(foc).add(panOffset);constrainWorldView(target,foc);cam.position.copy(target).add(cameraOffset);cam.lookAt(target);P.forEach(p=>p.m.userData.update?.(now));L.forEach(l=>l?.b?.userData.update?.(now));obstacles.forEach(item=>item.model.userData.update?.(now));petVisuals.forEach(visual=>visual.mixer.update(delta));hospitalMixer?.update(delta);updateWorldDecorations(delta);renderer.render(scene,cam);requestAnimationFrame(loop)})();
setNetworkHandlers({
  onState:state=>{try{applySnapshot(state)}catch(error){console.error(error)}},
  onProgress:progress=>{
    if(!Number.isInteger(progress.player)||!P[progress.player]||
      ![progress.x,progress.y,progress.z,progress.rotation].every(Number.isFinite))return;
    const player=P[progress.player];
    player.networkTarget??=new THREE.Vector3();
    player.networkTarget.set(progress.x,progress.y,progress.z);player.networkRotation=progress.rotation;
    player.networkWalking=!!progress.walking;player.m.userData.setWalking(player.networkWalking);
  },
  onDiceRoll:async({player,value})=>{
    if(!Number.isInteger(player)||!P[player]||!Number.isInteger(value)||value<1||value>6)return;
    playEffect('dice');playPlayerTurn(P[player]);
    const previousFocus=focusOverride;focusOverride=P[player].m.position.clone();
    try{await rollDie(P[player],value);await sleep(1200);die.visible=false}
    finally{focusOverride=previousFocus}
  },
  onPrompt:showRemotePrompt,
  onBankWithdraw:showRemoteWithdrawal,
  onBankRequest:async request=>{
    const p=P[1],total=p.cash+p.bank,cash=request.cash;
    const accepted=G.cur===1&&Number.isSafeInteger(cash)&&cash>=0&&cash<=total;
    if(accepted){p.cash=cash;p.bank=total-cash;hud();await sendState(snapshot(true))}
    await respondToBankRequest(request.id,accepted);
  },
  onItemUseRequest:async request=>{
    const p=P[1],itemIndex=request.itemIndex,action=request.action;
    if(G.cur!==1||!p?.alive||!Number.isInteger(itemIndex)||itemIndex<0||itemIndex>=p.inv.length||!action||typeof action!=='object')
      return false;
    const id=p.inv[itemIndex].id;
    if(id==='computer'&&!Number.isSafeInteger(action.amount))return false;
    if(id==='remote-control'&&(!Number.isSafeInteger(action.roll)||action.roll<1||action.roll>6))return false;
    if(id==='thief'&&!Number.isInteger(action.targetIndex))return false;
    if(id==='toolkit'&&action.confirm!==true)return false;
    if(['demolition','for-rent','broom'].includes(id)&&(!Number.isInteger(action.tile)||action.confirm!==true))return false;
    if(id==='lawyer'&&action.tile!==p.pos)return false;
    if(!['computer','remote-control','thief','toolkit','demolition'].includes(id)&&!Number.isInteger(action.tile))return false;
    if(isStreetSign(id)&&action.dir!==undefined)return false;
    const accepted=await useItem(p,itemIndex,action);
    if(accepted)await sendState(snapshot(true));
    return accepted;
  },
  onError:error=>console.error('Online game error:',error)
});
async function main(){
  startGameMusic();
  while(!G.over){const p=P[G.cur];hud();
    if(isHost())await sendState(snapshot());
    if(p.alive&&p.hospitalTurns>0){
      p.hospitalTurns--;
      if(p.h)await ban(portrait(p),p.css,'RUMAH SAKIT',`Melewatkan giliran. Sisa: ${p.hospitalTurns}`,1100);
      else await sleep(450);
      if(p.hospitalTurns===0){burnCharacter(p,false);p.m.visible=true;place(p);if(p.h)await ban(portrait(p),p.css,'KELUAR RS','Kamu kembali ke papan',900)}
    }else if(p.alive){$('street').textContent=sn(p.pos);
      if(p.h&&(!isOnline()||p.i===myPlayerIndex()))waveForTurn(p);
      const petStatus=p.pet?`${PET_MODELS[p.pet.kind].name}: ${p.pet.turns} giliran tersisa`:'Turn';
      await ban(portrait(p),p.css,p.n,petStatus,1000);
      if(p.h){
        if(isHost()&&p.i!==myPlayerIndex())await waitForRemoteRoll(snapshot());
        else{G.idle=true;hud();await new Promise(r=>G.wake=r);G.idle=false;hud()}
      }else await sleep(500);
      if(!p.h){
        for(let index=p.inv.length-1;index>=0;index--)
          if(['computer','remote-control','thief','lawyer','toolkit','broom','demolition','for-rent','bomb','stop-sign'].includes(p.inv[index].id)||isStreetSign(p.inv[index].id))
            await useItem(p,index);
      }
      const fixed=p.nextRoll;p.nextRoll=null;
      playEffect('dice');playPlayerTurn(p);
      const v=await rollDie(p,fixed,value=>{
        sendDiceRoll(p.i,value)?.catch(error=>console.error('Online dice sync error:',error));
      });await ban(face(v),'#9fb0c2',String(v),'GO',900);
      await step(p,v);die.visible=false;await collectPet(p,p.pos);await land(p);check()}
    finishPetTurn(p);
    advancePetSpawner();
    if(isHost())await sendState(snapshot());
    G.cur=(G.cur+1)%P.length}}
(async()=>{
  const startupOptions=JSON.parse(sessionStorage.getItem('mt3d-start-options')||'null');
  sessionStorage.removeItem('mt3d-start-options');
  let mode=startupOptions?.mode||await chooseGameMode(),resumed=false;
  try{await ensurePetAssets()}
  catch(error){
    console.error('Failed to load pet models:',error);
    await ban(portrait(P[0]),P[0].css,'Model hewan gagal dimuat','Periksa aset hewan lalu muat ulang permainan.',1800);
    return;
  }
  let room;
  while(mode==='online'){
    room=await onlineLobby(startupOptions?.playerIds?.[0]||'');
    if(room.role!=='back')break;
    mode=await chooseGameMode();
  }
  if(mode==='local'){
    let ok=false;
    try{ok=!!localStorage.getItem('mt3d')}catch(e){}
    if(ok&&(!startupOptions||startupOptions.load)){
      const resume=await ask(portrait(P[0]),'Game tersimpan','Lanjutkan?','▶','🆕',22);
      if(resume){
        resumed=load();
        if(!resumed)await ban(portrait(P[0]),P[0].css,'Simpanan lama','Mulai permainan baru',1100);
        else foc.copy(P[G.cur].m.position);
      }else localStorage.removeItem('mt3d');
    }
    if(!resumed){
      const settings=startupOptions&&!startupOptions.load
        ?{humanCount:1,computerCount:startupOptions.playerIds.length-1,cash:startupOptions.cash,bank:startupOptions.bank,playerIds:startupOptions.playerIds}
        :await setupGame();
      configurePlayers(settings);
      try{localStorage.removeItem('mt3d')}catch(e){}
    }
    main();
  }else if(isHost()){
    const settings=await setupGame({online:true,cash:startupOptions?.cash??CASH0,bank:startupOptions?.bank??CASH0});
    if(startupOptions){
      const playerIds=startupOptions.playerIds;
      playerIds[1]=getPeerCharacterId()||playerIds[1];
      settings.playerIds=playerIds;
    }
    configurePlayers(settings);
    await startOnlineGame(settings,snapshot(),MAP_ID);
    main();
  }else if(isGuest()){
    waitingForHost(room.room);
    const game=await waitForGameStart();
    $('ov').innerHTML='';
    if(game.mapId!==MAP_ID){
      await ban(portrait(P[0]),P[0].css,'Map tidak cocok',
        `Pilih Map ${game.mapId} seperti host, lalu gabung kembali ke room.`,1800);
      return;
    }
    configurePlayers(game.settings);
    applySnapshot(game.state);
    startGameMusic();
  }
})();
