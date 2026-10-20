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

export function createToolPreview(){
  const canvas=document.createElement('canvas');
  canvas.className='sp-tool-preview';
  canvas.setAttribute('aria-label','Pratinjau alat 3D');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff,.65));
  const key=new THREE.DirectionalLight(0xffffff,1);key.position.set(4,7,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0x9dbbff,.3);fill.position.set(-5,3,-4);scene.add(fill);
  const camera=new THREE.PerspectiveCamera(34,1,.01,100);
  let model=null,container=null,active=true,raf=0;
  renderer.setSize(160,160,false);

  function resize(){
    if(!container)return;
    const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();
  }
  function loadModel(id){
    const factory=FACTORIES[id];if(!factory)return false;
    model=factory();model.rotation.y=-.45;scene.add(model);
    const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),sphere=bounds.getBoundingSphere(new THREE.Sphere());
    model.position.sub(center);
    const radius=Math.max(sphere.radius,.1),distance=radius/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*.9;
    camera.position.set(.8,.48,1).normalize().multiplyScalar(distance);camera.lookAt(0,0,0);
    camera.near=Math.max(.01,distance-radius*1.5);camera.far=distance+radius*2;camera.updateProjectionMatrix();
    return true;
  }
  function thumbnail(id){
    if(model){scene.remove(model);dispose(model);model=null}
    if(!loadModel(id))return '';
    model.userData.update?.(0);renderer.render(scene,camera);
    const image=renderer.domElement.toDataURL('image/png');
    scene.remove(model);dispose(model);model=null;
    return image;
  }
  const thumbnails=Object.fromEntries(Object.keys(FACTORIES).map(id=>[id,thumbnail(id)]));

  function show(id,target){
    if(target&&target!==container){
      if(container)observer.unobserve(container);
      container=target;container.replaceChildren(canvas);observer.observe(container);
    }
    if(model){scene.remove(model);dispose(model);model=null}
    if(!loadModel(id))return;
    resize();
  }
  function render(now){
    if(!active)return;
    if(model){model.rotation.y=-.45+Math.sin(now*.00055)*.16;model.userData.update?.(now)}
    renderer.render(scene,camera);raf=requestAnimationFrame(render);
  }
  const observer=new ResizeObserver(resize);
  raf=requestAnimationFrame(render);

  return {
    show,
    thumbnail:id=>thumbnails[id]||'',
    destroy(){
      active=false;cancelAnimationFrame(raf);observer.disconnect();
      if(model)dispose(model);
      renderer.dispose();renderer.forceContextLoss();container?.replaceChildren();
    }
  };
}
