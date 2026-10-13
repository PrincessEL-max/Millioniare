import * as THREE from 'three';
import { createPropertyModel, disposePropertyModel } from './property-model.js';

export function propertyPreview(level,hotel){
  const footprint=hotel?3.8:1.9;
  const model=createPropertyModel(level,hotel,footprint);
  if(!model)return '';
  const canvas=document.createElement('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  renderer.setSize(500,400,false);
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff,.9));
  const key=new THREE.DirectionalLight(0xffffff,1.25);key.position.set(4,8,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0x9dbbff,.4);fill.position.set(-5,4,-4);scene.add(fill);
  scene.add(model);
  const bounds=new THREE.Box3().setFromObject(model);
  model.rotation.y=-.45;
  const size=bounds.getSize(new THREE.Vector3());
  const frameHeight=Math.max(footprint,size.y/(1+.2*(level-1))*1.8)*1.3;
  const aspect=500/400,halfHeight=frameHeight/2,halfWidth=halfHeight*aspect;
  const camera=new THREE.OrthographicCamera(-halfWidth,halfWidth,halfHeight,-halfHeight,.01,100);
  const focusY=size.y/2;
  camera.position.set(.8,.8,1).normalize().multiplyScalar(24).add(new THREE.Vector3(0,focusY,0));
  camera.lookAt(0,focusY,0);
  renderer.render(scene,camera);
  const image=renderer.domElement.toDataURL('image/png');
  scene.remove(model);disposePropertyModel(model);renderer.dispose();renderer.forceContextLoss();
  return image;
}
