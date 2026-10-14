import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { $, LOT_LARGE, LOT_SMALL, OWN, RENT_LARGE, RENT_SMALL, cvs, hex, mat, rnd } from './config.js';
import { LINKS, MAP, MAP_ID, START, T, TREES, tp } from './map.js';
import { renderer, scene, setWorldBounds } from './scene.js';
import { createPropertyModel, disposePropertyModel } from '../ui/property-model.js';
import monasUrl from '../landmarks-pack/models/monas.glb?url';
import windmillUrl from '../landmarks-pack/models/windmill.glb?url';
import pineTreeUrl from '../landmarks-pack/models/tree_pine.glb?url';
import roundTreeUrl from '../landmarks-pack/models/tree_round.glb?url';
import blossomTreeUrl from '../landmarks-pack/models/tree_blossom.glb?url';
import palmTreeUrl from '../landmarks-pack/models/tree_palm.glb?url';
import borobudurUrl from '../landmarks-pack/models/borobudur.glb?url';
import volcanoUrl from '../landmarks-pack/models/volcano.glb?url';
import prambananUrl from '../landmarks-pack/models/prambanan.glb?url';
import tuguUrl from '../landmarks-pack/models/tugu.glb?url';
import jamGadangUrl from '../landmarks-pack/models/jam_gadang.glb?url';
import gedungSateUrl from '../landmarks-pack/models/gedung_sate.glb?url';

// ---------- jalan & lot ----------
const ICONS={'pad-20':'coin-20.png','pad-50':'coin-50.png','pad-100':'coin-100.png',bus:'bus.png',bank:'bank.png',star:'star.png'};
const iconLoader=new THREE.TextureLoader();
const iconTile=ic=>ic.t=='pad'?[String(ic.v),'pad',ic.v,ic.c]:[ic.t=='bank'?'Tabungan':ic.t=='bus'?'Bus':'Bintang',ic.t];
function canvasTex(c){const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();return tex}
function addIcon(t,x,z){
  const key=t[1]=='pad'?`pad-${t[2]}`:t[1],file=ICONS[key];
  if(!file)return;
  iconLoader.load(`/icons/${file}`,loaded=>{
    const image=loaded.image,c=cvs(image.width,image.height),g=c.getContext('2d');
    g.drawImage(image,0,0);const pixels=g.getImageData(0,0,c.width,c.height),data=pixels.data,queue=new Uint32Array(c.width*c.height);
    // Remove edge-connected white only, keeping white details inside each logo.
    let head=0,tail=0;
    const add=(i)=>{const n=i*4;if(data[n+3]&&data[n]>242&&data[n+1]>242&&data[n+2]>242){data[n+3]=0;queue[tail++]=i}};
    for(let a=0;a<c.width;a++){add(a);add((c.height-1)*c.width+a)}
    for(let a=1;a<c.height-1;a++){add(a*c.width);add(a*c.width+c.width-1)}
    while(head<tail){const i=queue[head++],x0=i%c.width;
      if(x0)add(i-1);if(x0<c.width-1)add(i+1);
      if(i>=c.width)add(i-c.width);if(i<c.width*(c.height-1))add(i+c.width)}
    g.putImageData(pixels,0,0);loaded.dispose();
    const texture=canvasTex(c),material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.02,depthWrite:false,side:THREE.DoubleSide});
    const logo=new THREE.Mesh(new THREE.PlaneGeometry(1.98,1.98),material);
    logo.rotation.x=-Math.PI/2;logo.position.set(x,.105,z);scene.add(logo);
  },undefined,error=>console.error(`Failed to load street icon: ${file}`,error));
}
const roadTextures=new Map();
function roadTex(arms){const key=[...arms].sort().join(''),existing=roadTextures.get(key);if(existing)return existing;
  const c=cvs(512),g=c.getContext('2d');g.scale(4,4);
  g.fillStyle='#8c9097';g.fillRect(0,0,128,128);
  g.strokeStyle='#fff';g.lineWidth=7;g.setLineDash([20,18]);g.lineCap='butt';
  const ends={n:[64,0],e:[128,64],s:[64,128],w:[0,64]},remaining=new Set(arms);
  for(const [a,b] of [['n','s'],['e','w']])if(remaining.has(a)&&remaining.has(b)){
    g.beginPath();g.moveTo(...ends[a]);g.lineTo(...ends[b]);g.stroke();remaining.delete(a);remaining.delete(b)}
  if(remaining.size==2){const [a,b]=[...remaining],vertical=d=>d=='n'||d=='s';
    if(vertical(a)!=vertical(b)){g.beginPath();g.moveTo(...ends[a]);g.quadraticCurveTo(64,64,...ends[b]);g.stroke();remaining.clear()}}
  if(remaining.size>=3){
    const straight=remaining.has('n')&&remaining.has('s')?['n','s']:remaining.has('e')&&remaining.has('w')?['e','w']:[];
    if(straight.length){g.beginPath();g.moveTo(...ends[straight[0]]);g.lineTo(...ends[straight[1]]);g.stroke();straight.forEach(d=>remaining.delete(d))}
  }
  for(const d of remaining){g.beginPath();g.moveTo(...ends[d]);g.lineTo(64,64);g.stroke()}
  const texture=canvasTex(c);roadTextures.set(key,texture);return texture}
export const L=[];
export const LOT_TARGET_MESHES=[];
const lotStates=new Map();
const frontageByLot=new Map();
const decorationLoader=new GLTFLoader();
const decorationAnisotropy=renderer.capabilities.getMaxAnisotropy();
let windmillRotor=null;
const landmarkMixers=[];
const templeEffects=[];
const templeSparkleGeometry=new THREE.SphereGeometry(.11,8,8);
const templeSparkleMaterial=new THREE.MeshBasicMaterial({
  color:0xffd36b,transparent:true,opacity:.82,depthWrite:false
});
export const HOSPITAL_POSITION=Object.freeze({x:-4,z:29});
const mapSixLandmarks=[
  {id:'borobudur',url:borobudurUrl,x0:5,x1:8,z0:9,z1:12,height:6.75,footprintX:8,footprintZ:8,clearanceX:12.3,clearanceZ:12.3,trees:true,effect:true},
  {id:'volcano',url:volcanoUrl,x0:5,x1:8,z0:17,z1:20,height:6.75,clearanceX:8,clearanceZ:8,trees:true,animation:'Erupt'},
  {id:'prambanan',url:prambananUrl,x0:5,x1:8,z0:25,z1:28,height:6.75,footprintX:8,footprintZ:8,clearanceX:11,clearanceZ:8.3,trees:true,effect:true},
  {id:'tugu',url:tuguUrl,x0:-2,x1:0,z0:-3,z1:-1,height:6.5,clearanceX:3.6,clearanceZ:4},
  {id:'jamGadang',url:jamGadangUrl,x0:-2,x1:-1,z0:5,z1:8,height:6.5,clearanceX:3,clearanceZ:3,yaw:Math.PI/2,animation:'Clock'},
  {id:'gedungSate',url:gedungSateUrl,x0:-3,x1:-1,z0:21,z1:24,height:6.5,footprintX:6,footprintZ:7.2,clearanceX:7,clearanceZ:8,yaw:Math.PI/2}
].map(landmark=>({
  ...landmark,
  centerX:(landmark.x0+landmark.x1)*1,
  centerZ:(landmark.z0+landmark.z1)*1,
  minX:landmark.x0*2-1,
  maxX:landmark.x1*2+1,
  minZ:landmark.z0*2-1,
  maxZ:landmark.z1*2+1
}));
const landmarkIdsByMap={
  2:['tugu','jamGadang','borobudur'],
  3:['tugu','jamGadang','borobudur','volcano','gedungSate'],
  4:['tugu','jamGadang','borobudur'],
  5:['tugu','jamGadang','borobudur','volcano','gedungSate','prambanan']
};
const activeLandmarks=MAP_ID===6?mapSixLandmarks:mapSixLandmarks.filter(landmark=>
  landmarkIdsByMap[MAP_ID]?.includes(landmark.id)
);
export function mergeStaticMeshes(model,animations=[]){
  const animatedNames=new Set();
  animations.forEach(clip=>clip.tracks.forEach(track=>
    animatedNames.add(THREE.PropertyBinding.parseTrackName(track.name).nodeName)
  ));
  const animatedObjects=new Set();
  model.traverse(object=>{
    if(animatedNames.has(object.name))animatedObjects.add(object);
  });
  model.updateMatrixWorld(true);
  const rootInverse=new THREE.Matrix4().copy(model.matrixWorld).invert();
  const batches=new Map(),sourceMeshes=[];
  model.traverse(object=>{
    for(let parent=object;parent&&parent!==model.parent;parent=parent.parent)
      if(animatedObjects.has(parent))return;
    if(!object.isMesh||object.isSkinnedMesh||object.isInstancedMesh||
      Array.isArray(object.material)||Object.keys(object.geometry.morphAttributes).length)return;
    const geometry=object.geometry.clone();
    geometry.applyMatrix4(rootInverse.clone().multiply(object.matrixWorld));
    const signature=[
      Object.keys(geometry.attributes).sort().join(','),
      geometry.index?'indexed':'unindexed'
    ].join('|');
    let materialBatches=batches.get(object.material);
    if(!materialBatches){materialBatches=new Map();batches.set(object.material,materialBatches)}
    if(!materialBatches.has(signature))materialBatches.set(signature,[]);
    materialBatches.get(signature).push(geometry);
    sourceMeshes.push(object);
  });
  const mergedMeshes=[];
  batches.forEach((materialBatches,material)=>{
    materialBatches.forEach(geometries=>{
      const geometry=geometries.length===1?geometries[0]:
        BufferGeometryUtils.mergeBufferGeometries(geometries);
      if(!geometry)throw new Error(`Gagal menggabungkan geometri statis pada ${model.name||'dekorasi'}.`);
      mergedMeshes.push(new THREE.Mesh(geometry,material));
    });
  });
  sourceMeshes.forEach(mesh=>mesh.parent.remove(mesh));
  const retainedGeometries=new Set();
  model.traverse(object=>{if(object.isMesh)retainedGeometries.add(object.geometry)});
  new Set(sourceMeshes.map(mesh=>mesh.geometry)).forEach(geometry=>{
    if(!retainedGeometries.has(geometry))geometry.dispose();
  });
  mergedMeshes.forEach(mesh=>model.add(mesh));
}
function addTreeInstances(model,placements){
  if(!placements.length)return;
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  if(size.y<=0)throw new Error('Model pohon tidak memiliki tinggi yang valid.');
  const center=bounds.getCenter(new THREE.Vector3()),position=new THREE.Vector3();
  const rotation=new THREE.Quaternion(),scaleVector=new THREE.Vector3(),matrix=new THREE.Matrix4();
  const meshes=[];
  model.traverse(object=>{if(object.isMesh)meshes.push(object)});
  meshes.forEach(mesh=>{
    const instances=new THREE.InstancedMesh(mesh.geometry,mesh.material,placements.length);
    instances.frustumCulled=false;
    placements.forEach(({x,z,height},index)=>{
      const scale=height/size.y;
      position.set(x-center.x*scale,-bounds.min.y*scale,z-center.z*scale);
      scaleVector.setScalar(scale);
      matrix.compose(position,rotation,scaleVector);
      instances.setMatrixAt(index,matrix);
    });
    instances.instanceMatrix.needsUpdate=true;
    scene.add(instances);
  });
}
const fitDecoration=(model,height,x,z,baseY=0,yaw=0,footprint=null)=>{
  model.rotation.y=yaw;
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  if(size.y<=0)throw new Error('Model dekorasi tidak memiliki tinggi yang valid.');
  const scale=height/size.y;
  let scaleX=scale,scaleZ=scale;
  if(footprint){
    const rotated=Math.abs(Math.sin(yaw))>.5;
    const width=rotated?size.z:size.x,depth=rotated?size.x:size.z;
    const fitX=Math.min(1,footprint.x/(width*scale));
    const fitZ=Math.min(1,footprint.z/(depth*scale));
    scaleX=scale*(rotated?fitZ:fitX);
    scaleZ=scale*(rotated?fitX:fitZ);
  }
  model.scale.set(scaleX,scale,scaleZ);
  model.updateMatrixWorld(true);
  const fittedBounds=new THREE.Box3().setFromObject(model);
  const center=fittedBounds.getCenter(new THREE.Vector3());
  model.position.set(x-center.x,baseY-fittedBounds.min.y,z-center.z);
  model.traverse(object=>{
    if(!object.isMesh)return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{
      [material.map,material.normalMap,material.roughnessMap,material.metalnessMap]
        .filter(Boolean).forEach(texture=>{
          texture.anisotropy=decorationAnisotropy;
          texture.needsUpdate=true;
        });
    });
  });
  scene.add(model);
};
function addCeramicStartPlaza(x,z){
  const layers=[
    {width:6,depth:6.4,height:.08,y:.04,color:0xd8d6cd},
    {width:5.8,depth:6.2,height:.06,y:.11,color:0xf0e8d2},
    {width:5.6,depth:6,height:.04,y:.16,color:0xfaf4e4}
  ];
  layers.forEach(({width,depth,height,y,color})=>{
    const slab=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),
      new THREE.MeshStandardMaterial({color,roughness:.72}));
    slab.position.set(x,y,z);scene.add(slab);
  });
  const columns=8,rows=9,tileSize=.66,spacing=.7;
  const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(tileSize,.025,tileSize),
    new THREE.MeshStandardMaterial({color:0xffffff,roughness:.48}),columns*rows);
  const palette=[0xf9f3e5,0xf1e6cf,0xfff9eb,0xf5ecd9];
  const transform=new THREE.Object3D();
  for(let row=0,index=0;row<rows;row++)for(let column=0;column<columns;column++,index++){
    transform.position.set(x+(column-(columns-1)/2)*spacing,.1925,z+(row-(rows-1)/2)*spacing);
    transform.updateMatrix();tiles.setMatrixAt(index,transform.matrix);
    tiles.setColorAt(index,new THREE.Color(palette[(row+column*3)%palette.length]));
  }
  tiles.instanceMatrix.needsUpdate=true;
  if(tiles.instanceColor)tiles.instanceColor.needsUpdate=true;
  scene.add(tiles);
}
async function addMapDecorations(treeLocations){
  const [monas,windmill,pine,round,blossom,palm,...landmarkAssets]=await Promise.all([
    monasUrl,windmillUrl,pineTreeUrl,roundTreeUrl,blossomTreeUrl,palmTreeUrl,
    ...activeLandmarks.map(landmark=>landmark.url)
  ].map(url=>decorationLoader.loadAsync(url)));
  const monasX=4,monasZ=-9.5,plazaTop=.18;
  const plazaZ=-8.1;
  addCeramicStartPlaza(monasX,plazaZ);
  mergeStaticMeshes(monas.scene);
  fitDecoration(monas.scene,6.5,monasX,monasZ,plazaTop);
  mergeStaticMeshes(windmill.scene,windmill.animations);
  fitDecoration(windmill.scene,6.75,13,5);
  windmillRotor=windmill.scene.getObjectByName('Blades');
  const treeModels=[pine.scene,round.scene,blossom.scene,palm.scene];
  treeModels.forEach(model=>mergeStaticMeshes(model));
  treeModels.forEach((model,modelIndex)=>addTreeInstances(model,
    treeLocations.reduce((placements,[x,z],index)=>{
      if(index%treeModels.length===modelIndex)
        placements.push({x,z,height:1.8+(index%3)*.25});
      return placements;
    },[])
  ));
  activeLandmarks.forEach((landmark,index)=>{
    const asset=landmarkAssets[index],model=asset?.scene;
    if(!model)throw new Error(`Model landmark tidak ditemukan: ${landmark.url}`);
    mergeStaticMeshes(model,asset.animations);
    const x=landmark.centerX,z=landmark.centerZ;
    fitDecoration(model,landmark.height,x,z,.04,landmark.yaw||0,
      landmark.footprintX?{x:landmark.footprintX,z:landmark.footprintZ}:null);
    if(landmark.animation){
      const clip=asset.animations.find(animation=>animation.name===landmark.animation);
      if(!clip)throw new Error(`Animasi ${landmark.animation} tidak ditemukan pada landmark.`);
      const mixer=new THREE.AnimationMixer(model);
      mixer.clipAction(clip).setLoop(THREE.LoopRepeat,Infinity)
        .setEffectiveTimeScale(landmark.animation==='Erupt'?.7:1).play();
      landmarkMixers.push(mixer);
    }
    if(landmark.effect)addTempleEffects(x,z,landmark.height,landmark.footprintX,landmark.footprintZ);
  });
}
function addTempleEffects(x,z,height,width,depth){
  const group=new THREE.Group();
  group.position.set(x,0,z);
  const particles=Array.from({length:10},(_,index)=>{
    const angle=index*Math.PI*2/10,radius=.27+index%3*.07;
    const particle=new THREE.Mesh(templeSparkleGeometry,templeSparkleMaterial);
    particle.position.set(Math.cos(angle)*width*radius/2,height*(.28+(index%4)*.12),
      Math.sin(angle)*depth*radius/2);
    particle.userData.phase=index*Math.PI/5;
    particle.userData.baseY=particle.position.y;
    group.add(particle);
    return particle;
  });
  scene.add(group);
  templeEffects.push({group,particles});
}
export function updateWorldDecorations(delta){
  if(windmillRotor)windmillRotor.rotation.z+=delta*.8;
  landmarkMixers.forEach(mixer=>mixer.update(delta));
  const time=performance.now()*.001;
  templeEffects.forEach(({group,particles})=>{
    group.rotation.y+=delta*.18;
    particles.forEach(particle=>{
      particle.position.y=particle.userData.baseY+Math.sin(time*1.5+particle.userData.phase)*.18;
      const pulse=.68+Math.sin(time*2+particle.userData.phase)*.2;
      particle.scale.setScalar(pulse);
    });
  });
}
const mapBounds=MAP.reduce((bounds,tile)=>{
  const x=tile.p[0]*2,z=tile.p[1]*2;
  bounds.minX=Math.min(bounds.minX,x-1);bounds.maxX=Math.max(bounds.maxX,x+1);
  bounds.minZ=Math.min(bounds.minZ,z-1);bounds.maxZ=Math.max(bounds.maxZ,z+1);
  if(tile.lot){
    const halfSize=tile.lot.s;
    const lotX=tile.lot.x*2,lotZ=tile.lot.z*2;
    bounds.minX=Math.min(bounds.minX,lotX-halfSize);bounds.maxX=Math.max(bounds.maxX,lotX+halfSize);
    bounds.minZ=Math.min(bounds.minZ,lotZ-halfSize);bounds.maxZ=Math.max(bounds.maxZ,lotZ+halfSize);
  }
  return bounds;
},{minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity});
const treeLocations=[];
const clearOfRoadsAndLots=(x,z)=>{
  for(let index=0;index<MAP.length;index++){
    const tile=MAP[index];
    if(T[index][1]==='l'){
      const half=tile.lot.s;
      if(Math.abs(x-tile.lot.x*2)<half+1.1&&Math.abs(z-tile.lot.z*2)<half+1.1)return false;
    }else if(Math.abs(x-tile.p[0]*2)<2.1&&Math.abs(z-tile.p[1]*2)<2.1)return false;
  }
  return true;
};
const clearOfStructures=(x,z)=>{
  if(Math.abs(x-HOSPITAL_POSITION.x)<3.5&&Math.abs(z-HOSPITAL_POSITION.z)<4.5)return false;
  return activeLandmarks.every(landmark=>
    Math.abs(x-landmark.centerX)>=landmark.clearanceX/2+.55||
    Math.abs(z-landmark.centerZ)>=landmark.clearanceZ/2+.55
  );
};
const clearForTree=(x,z)=>clearOfRoadsAndLots(x,z)&&clearOfStructures(x,z);
const addTreeLocation=(x,z)=>{
  const nearMonasPlaza=Math.abs(x-4)<4.5&&Math.abs(z+8.1)<5;
  const nearMonas=Math.abs(x-4)<3.5&&Math.abs(z+9.5)<3.5;
  if(nearMonasPlaza||nearMonas||!clearForTree(x,z))return;
  if(!treeLocations.some(([treeX,treeZ])=>Math.hypot(treeX-x,treeZ-z)<1.25))
    treeLocations.push([x,z]);
};
const addTreePerimeter=(bounds,offset,spacing,stagger=0)=>{
  const minX=bounds.minX-offset,maxX=bounds.maxX+offset;
  const minZ=bounds.minZ-offset,maxZ=bounds.maxZ+offset;
  for(let x=minX+stagger;x<=maxX;x+=spacing){
    addTreeLocation(x,minZ);addTreeLocation(x,maxZ);
  }
  for(let z=minZ+spacing/2;z<maxZ;z+=spacing){
    addTreeLocation(minX,z);addTreeLocation(maxX,z);
  }
};
addTreePerimeter(mapBounds,1,2);
addTreePerimeter(mapBounds,2.7,2.4,1.2);
for(const [dx,dz] of [[-2.5,-2.5],[2.5,-2.5],[-2.5,2.5],[2.5,2.5]]){
  const x=13+dx,z=5+dz;
  addTreeLocation(x,z);
}
activeLandmarks.filter(landmark=>landmark.trees).forEach(landmark=>{
  const dx=landmark.clearanceX/2+1.2,dz=landmark.clearanceZ/2+1.2;
  for(const [offsetX,offsetZ] of [[-dx,-dz],[dx,-dz],[-dx,dz],[dx,dz]])
    addTreeLocation(landmark.centerX+offsetX,landmark.centerZ+offsetZ);
});
const worldBounds={...mapBounds};
worldBounds.minX=Math.min(worldBounds.minX,4-3);
worldBounds.maxX=Math.max(worldBounds.maxX,4+3);
worldBounds.minZ=Math.min(worldBounds.minZ,-8.1-3.2,-9.5-2.5);
worldBounds.maxZ=Math.max(worldBounds.maxZ,-8.1+3.2,-9.5+2.5);
worldBounds.minX=Math.min(worldBounds.minX,13-3.5);
worldBounds.maxX=Math.max(worldBounds.maxX,13+3.5);
worldBounds.minZ=Math.min(worldBounds.minZ,5-3.5);
worldBounds.maxZ=Math.max(worldBounds.maxZ,5+3.5);
activeLandmarks.forEach(landmark=>{
  worldBounds.minX=Math.min(worldBounds.minX,landmark.centerX-landmark.clearanceX/2);
  worldBounds.maxX=Math.max(worldBounds.maxX,landmark.centerX+landmark.clearanceX/2);
  worldBounds.minZ=Math.min(worldBounds.minZ,landmark.centerZ-landmark.clearanceZ/2);
  worldBounds.maxZ=Math.max(worldBounds.maxZ,landmark.centerZ+landmark.clearanceZ/2);
});
worldBounds.minX=Math.min(worldBounds.minX,HOSPITAL_POSITION.x-3.5);
worldBounds.maxX=Math.max(worldBounds.maxX,HOSPITAL_POSITION.x+3.5);
worldBounds.minZ=Math.min(worldBounds.minZ,HOSPITAL_POSITION.z-4.5);
worldBounds.maxZ=Math.max(worldBounds.maxZ,HOSPITAL_POSITION.z+4.5);
worldBounds.minX-=1.5;worldBounds.maxX+=1.5;
worldBounds.minZ-=1.5;worldBounds.maxZ+=1.5;
const environmentBounds=treeLocations.reduce((bounds,[x,z])=>({
  minX:Math.min(bounds.minX,x-1.5),maxX:Math.max(bounds.maxX,x+1.5),
  minZ:Math.min(bounds.minZ,z-1.5),maxZ:Math.max(bounds.maxZ,z+1.5)
}),{
  minX:Math.min(worldBounds.minX,13-3.5,4-3),
  maxX:Math.max(worldBounds.maxX,13+3.5,4+3),
  minZ:Math.min(worldBounds.minZ,5-3.5,-8.1-3.2,-9.5-2.5),
  maxZ:Math.max(worldBounds.maxZ,5+3.5,-8.1+3.2,-9.5+2.5)
});
const panMargin=2.4;
const panBounds={
  minX:environmentBounds.minX-panMargin,maxX:environmentBounds.maxX+panMargin,
  minZ:environmentBounds.minZ-panMargin,maxZ:environmentBounds.maxZ+panMargin
};
panBounds.minZ-=4;
const ground=new THREE.Mesh(
  new THREE.PlaneGeometry(panBounds.maxX-panBounds.minX,panBounds.maxZ-panBounds.minZ),
  mat(0x6cc644)
);
ground.rotation.x=-Math.PI/2;
ground.position.set((panBounds.minX+panBounds.maxX)/2,-.02,(panBounds.minZ+panBounds.maxZ)/2);
scene.add(ground);
setWorldBounds(worldBounds,panBounds);
addMapDecorations(treeLocations).catch(error=>console.error('Failed to load map decorations:',error));
for(const tile of MAP)if(tile.lot){
  const id=tile.lot.id;
  const frontage=frontageByLot.get(id)||{x:0,z:0,count:0};
  frontage.x+=tile.p[0];frontage.z+=tile.p[1];frontage.count++;
  frontageByLot.set(id,frontage);
}
const lotFacing=(lot)=>{
  const frontage=frontageByLot.get(lot.id);
  if(!frontage)return 0;
  const dx=frontage.x/frontage.count-lot.x,dz=frontage.z/frontage.count-lot.z;
  return Math.atan2(dx,dz);
};
function lotFrame(w,lx,lz){const g=new THREE.Group(),thick=.1,edge=w/2-thick/2,material=new THREE.MeshBasicMaterial({color:0xf7dea0});
  const strip=(x,z,sx,sz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(sx,.015,sz),material);m.position.set(x,.1675,z);g.add(m)};
  strip(0,-edge,w,thick);strip(0,edge,w,thick);
  strip(-edge,0,thick,w);strip(edge,0,thick,w);
  g.position.set(lx,0,lz);scene.add(g);return {group:g,material}}
export function drawLot(i){const l=L[i],g=l.c.getContext('2d');g.setTransform(4,0,0,4,0,0);const fill=g.createLinearGradient(8,8,120,120);fill.addColorStop(0,'#f4cb68');fill.addColorStop(1,'#e5ad45');g.fillStyle=fill;g.fillRect(0,0,128,128);g.strokeStyle='#c89438';g.lineWidth=3;
  g.beginPath();g.moveTo(64,6);g.lineTo(64,122);g.moveTo(6,64);g.lineTo(122,64);g.stroke();
  const ownerColors=['#e53935','#43a047','#1e88e5','#ff9800','#9c27b0','#00acc1'];
  l.tex.needsUpdate=true;l.frame.material.color.set(l.o<0?'#f7dea0':ownerColors[l.o])}
const roadGroups=new Map();
T.forEach((_,i)=>{
  const q=MAP[i].p,arms=LINKS[i].map(j=>{
    const neighbor=MAP[j],dx=neighbor.p[0]-q[0],dz=neighbor.p[1]-q[1];
    return dx<0?'w':dx>0?'e':dz<0?'n':'s';
  }),key=[...arms].sort().join('');
  let group=roadGroups.get(key);
  if(!group){group={arms,positions:[]};roadGroups.set(key,group)}
  group.positions.push(tp(i));
});
const roadTransform=new THREE.Object3D();
const roadTiles=new Set(T.flatMap((tile,index)=>tile[1]==='l'?[]:[index]));
const roadCoordinates=new Set([...roadTiles].map(index=>MAP[index].p.join(',')));
const perimeterRoads=[...roadTiles].filter(index=>MAP[index].p[1]>=0);
const roadBounds=perimeterRoads.reduce((bounds,index)=>{
  const [x,z]=MAP[index].p;
  return {minX:Math.min(bounds.minX,x),maxX:Math.max(bounds.maxX,x),
    minZ:Math.min(bounds.minZ,z),maxZ:Math.max(bounds.maxZ,z)};
},{minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity});
const roadBorders=[];
for(const index of roadTiles){
  const [x,z]=MAP[index].p,[worldX,worldZ]=tp(index);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const atOuterEdge=dx===-1&&x===roadBounds.minX||
      dx===1&&x===roadBounds.maxX||
      dz===-1&&z===roadBounds.minZ||
      dz===1&&z===roadBounds.maxZ;
    const startSpurEdge=x===2&&(z===-2||z===-1)&&
      (dx!==0||(z===-2&&dz===-1));
    if(!(atOuterEdge||startSpurEdge)||roadCoordinates.has(`${x+dx},${z+dz}`))continue;
    const horizontal=dx!==0;
    roadBorders.push({
      x:worldX+dx*1.06,z:worldZ+dz*1.06,
      width:horizontal?.12:2,height:horizontal?2:.12
    });
  }
}
if(roadBorders.length){
  const borders=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0xffffff}),roadBorders.length);
  roadBorders.forEach(({x,z,width,height},index)=>{
    roadTransform.position.set(x,.032,z);roadTransform.scale.set(width,.025,height);
    roadTransform.updateMatrix();borders.setMatrixAt(index,roadTransform.matrix);
  });
  borders.instanceMatrix.needsUpdate=true;scene.add(borders);
}
roadGroups.forEach(({arms,positions})=>{
  const roads=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2),
    new THREE.MeshBasicMaterial({map:roadTex(arms)}),positions.length);
  positions.forEach(([x,z],i)=>{
    roadTransform.position.set(x,.02,z);roadTransform.rotation.set(-Math.PI/2,0,0);
    roadTransform.scale.set(1,1,1);
    roadTransform.updateMatrix();roads.setMatrixAt(i,roadTransform.matrix);
  });
  roads.instanceMatrix.needsUpdate=true;scene.add(roads);
});
T.forEach((t,i)=>{const [x,z]=tp(i),M=MAP[i];
  if(t[1]=='l'){const lt=M.lot,existing=lotStates.get(lt.id);
    if(existing){L[i]=existing;return}
    const w=lt.s==2?4:2,lx=lt.x*2,lz=lt.z*2,c=cvs(512),tex=canvasTex(c);
    const side=new THREE.MeshBasicMaterial({color:0xf2d99c});
    const floorSide=new THREE.MeshBasicMaterial({color:0xb98f4e}),floorTop=new THREE.MeshBasicMaterial({map:tex});
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.10,w),side);m.position.set(lx,.05,lz);scene.add(m);
    const inset=w-.32,rim=.16,rail=(x,z,sx,sz)=>{
      const edge=new THREE.Mesh(new THREE.BoxGeometry(sx,.06,sz),side);edge.position.set(lx+x,.13,lz+z);scene.add(edge)};
    rail(0,-w/2+rim/2,w,rim);rail(0,w/2-rim/2,w,rim);
    rail(-w/2+rim/2,0,rim,w);rail(w/2-rim/2,0,rim,w);
    const plot=new THREE.Mesh(new THREE.BoxGeometry(inset,.01,inset),[floorSide,floorSide,floorTop,floorSide,floorSide,floorSide]);
    plot.position.set(lx,.105,lz);plot.userData.targetTile=i;scene.add(plot);LOT_TARGET_MESHES.push(plot);
    const target=new THREE.Mesh(new THREE.PlaneGeometry(w-.12,w-.12),new THREE.MeshBasicMaterial({
      colorWrite:false,depthWrite:false,side:THREE.DoubleSide
    }));
    target.rotation.x=-Math.PI/2;target.position.set(lx,.19,lz);target.userData.targetTile=i;scene.add(target);LOT_TARGET_MESHES.push(target);
    const state={o:-1,lv:0,c,tex,lx,lz,sz:lt.s==2?1.7:1,b:null,s:lt.s,frontYaw:lotFacing(lt),group:lt.group,mesh:m,frame:lotFrame(w,lx,lz),
      price:lt.s==2?LOT_LARGE:LOT_SMALL,rent:lt.s==2?RENT_LARGE:RENT_SMALL,id:lt.id};
    lotStates.set(lt.id,state);L[i]=state;
    if(M.ic)addIcon(iconTile(M.ic),x,z)}
  else if(t[1]!='r')addIcon(t,x,z)});
export async function flashLot(i){const target=L[i];if(!target?.frame||target.o<0)return;
  const lots=[...new Set(L)].filter(l=>l&&l.group==target.group&&l.o==target.o&&l.frame);
  const colors=[0xffee58,0xff695e,0xffffff,0x5ee6ff];
  for(let round=0;round<3;round++)for(const color of colors){lots.forEach(l=>l.frame.material.color.setHex(color));await new Promise(resolve=>setTimeout(resolve,75))}
  const ownerColors=['#e53935','#43a047','#1e88e5','#ff9800','#9c27b0','#00acc1'];
  lots.forEach(l=>l.frame.material.color.set(l.o<0?'#f7dea0':ownerColors[l.o]))}
function tree(x,z){const g=new THREE.Group(),c=[0xf3b127,0xc45ad1,0x66cc33][rnd(0,2)];
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,.7,6),mat(0x7a4a24));tr.position.y=.35;g.add(tr);
  [[0,1.1,0,.55],[.4,.9,.1,.4],[-.35,.85,-.1,.4],[.05,1.45,.1,.38]].forEach(([a,b,d,r])=>{const s=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat(c));s.position.set(a,b,d);g.add(s)});
  g.position.set(x,0,z);scene.add(g)}
const free=(x,z)=>MAP.every(m=>Math.hypot(m.p[0]*2-x,m.p[1]*2-z)>2.2&&(!m.lot||Math.hypot(m.lot.x*2-x,m.lot.z*2-z)>(m.lot.s==2?3.3:2.2)));
const marker=new THREE.Mesh(new THREE.CircleGeometry(.2,20),new THREE.MeshBasicMaterial({color:0x171717}));
marker.rotation.x=-Math.PI/2;marker.position.set(START[0]*2,.08,START[1]*2);scene.add(marker);
const label=cvs(256,64),ctx=label.getContext('2d');ctx.fillStyle='#171717';ctx.font='bold 42px sans-serif';ctx.fillText('START',4,46);
const startLabel=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(label),transparent:true}));
startLabel.position.set(START[0]*2+1.5,.35,START[1]*2);startLabel.scale.set(2, .5, 1);scene.add(startLabel);
TREES.fixed.forEach(([x,z])=>tree(x*2,z*2));
for(let k=0,n=0;n<TREES.random.n&&k<800;k++){const [a,b,c,d]=TREES.random.box,x=(a+Math.random()*(c-a))*2,z=(b+Math.random()*(d-b))*2;if(free(x,z)&&Math.hypot(x-START[0]*2,z-START[1]*2)>2.2){tree(x,z);n++}}
// ---------- bangunan ----------
function winTex(col,rep){const c=cvs(128),g=c.getContext('2d');g.scale(4,4);g.fillStyle=hex(col);g.fillRect(0,0,32,32);g.fillStyle='rgba(255,255,255,.6)';
  for(let y=4;y<32;y+=16)for(let x=4;x<32;x+=16)g.fillRect(x,y,8,8);
  const t=canvasTex(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,rep);return new THREE.MeshLambertMaterial({map:t})}
const tower=(w,h,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),winTex(c,Math.max(1,Math.round(h*1.4))));m.position.y=h/2;return m};
export function setB(i){
  const l=L[i];
  if(l.b){scene.remove(l.b);disposePropertyModel(l.b);l.b=null}
  if(!l.lv)return;
  const large=l.s==2,building=createPropertyModel(l.lv,large,large?3.8:1.9);
  if(!building)return;
  building.rotation.y=l.frontYaw;
  building.position.x+=l.lx;building.position.y+=.16;building.position.z+=l.lz;
  scene.add(building);l.b=building;
}
