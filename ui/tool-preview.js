import * as THREE from 'three';
import {
  createItemArrow,
  createItemBomb,
  createItemBroom,
  createItemComputer,
  createItemCone,
  createItemDemolition,
  createItemForRent,
  createItemHelmet,
  createItemJudge,
  createItemRemote,
  createItemThief
} from '../tools/item-index.js';
import { createStopSignModel } from '../tools/stopsign.js';

const FACTORIES={
  'street-sign-front':()=>createItemArrow({dir:'front'}),
  'street-sign-right':()=>createItemArrow({dir:'right'}),
  'street-sign-back':()=>createItemArrow({dir:'back'}),
  'street-sign-left':()=>createItemArrow({dir:'left'}),
  bomb:createItemBomb,
  broom:createItemBroom,
  computer:createItemComputer,
  'stop-sign':createStopSignModel,
  demolition:createItemDemolition,
  'for-rent':createItemForRent,
  'remote-control':createItemRemote,
  lawyer:createItemJudge,
  toolkit:createItemHelmet,
  thief:createItemThief
};

function dispose(model){
  model.traverse(object=>{
    if(!object.isMesh)return;
    object.geometry?.dispose();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{if(!material?.map?._shared)material?.map?.dispose();material?.dispose()});
  });
}

function createStage(canvas,pixelRatio){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(pixelRatio);
  renderer.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff,.65));
  const key=new THREE.DirectionalLight(0xffffff,1);key.position.set(4,7,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0x9dbbff,.3);fill.position.set(-5,3,-4);scene.add(fill);
  const camera=new THREE.PerspectiveCamera(34,1,.01,100);
  return {renderer,scene,camera};
}

function loadModel({scene,camera},id){
  const factory=FACTORIES[id];if(!factory)return null;
  const model=factory();model.rotation.y=-.45;scene.add(model);
  const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),sphere=bounds.getBoundingSphere(new THREE.Sphere());
  model.position.sub(center);
  const radius=Math.max(sphere.radius,.1),distance=radius/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*.9;
  camera.position.set(.8,.48,1).normalize().multiplyScalar(distance);camera.lookAt(0,0,0);
  camera.near=Math.max(.01,distance-radius*1.5);camera.far=distance+radius*2;camera.updateProjectionMatrix();
  return model;
}

let thumbnailCache=null;
function buildThumbnails(){
  if(thumbnailCache)return thumbnailCache;
  const canvas=document.createElement('canvas');
  const stage=createStage(canvas,Math.min(devicePixelRatio||1,2));
  stage.renderer.setSize(160,160,false);
  const result={};
  try{
    for(const id of Object.keys(FACTORIES)){
      const model=loadModel(stage,id);
      if(!model){result[id]='';continue}
      model.userData.update?.(0);
      stage.renderer.render(stage.scene,stage.camera);
      result[id]=canvas.toDataURL('image/png');
      stage.scene.remove(model);dispose(model);
    }
  }finally{
    stage.renderer.dispose();stage.renderer.forceContextLoss();
  }
  thumbnailCache=result;
  return result;
}

export function createToolPreview(){
  let stage=null,canvas=null,observer=null,model=null,container=null,raf=0,destroyed=false;

  function resize(){
    if(!stage||!container)return;
    const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);
    stage.renderer.setSize(width,height,false);
    stage.camera.aspect=width/height;stage.camera.updateProjectionMatrix();
  }
  function ensureStage(){
    if(stage)return stage;
    canvas=document.createElement('canvas');
    canvas.className='sp-tool-preview';
    canvas.setAttribute('aria-label','Pratinjau alat 3D');
    stage=createStage(canvas,Math.min(devicePixelRatio||1,1.5));
    stage.renderer.setSize(160,160,false);
    observer=new ResizeObserver(resize);
    return stage;
  }
  function stopLoop(){if(raf){cancelAnimationFrame(raf);raf=0}}
  function frame(now){
    if(destroyed||!model){raf=0;return}
    raf=requestAnimationFrame(frame);
    model.rotation.y=-.45+Math.sin(now*.00055)*.16;model.userData.update?.(now);
    stage.renderer.render(stage.scene,stage.camera);
  }
  function show(id,target){
    if(destroyed)return;
    const current=ensureStage();
    if(target&&target!==container){
      if(container)observer.unobserve(container);
      container=target;container.replaceChildren(canvas);observer.observe(container);
    }
    stopLoop();
    if(model){current.scene.remove(model);dispose(model);model=null}
    model=loadModel(current,id);
    if(!model)return;
    resize();
    raf=requestAnimationFrame(frame);
  }

  return {
    show,
    thumbnail:id=>buildThumbnails()[id]||'',
    destroy(){
      destroyed=true;stopLoop();observer?.disconnect();
      if(model){dispose(model);model=null}
      if(stage){stage.renderer.dispose();stage.renderer.forceContextLoss();stage=null}
      container?.replaceChildren();
    }
  };
}
