import * as THREE from 'three';
import { createPropertyModel, disposePropertyModel } from './property-model.js';

export function propertyPreview(level,hotel){
  const model=createPropertyModel(level,hotel,hotel?3.6:1.55);
  if(!model)return '';
  const canvas=document.createElement('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  renderer.setSize(320,280,false);
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff,.8));
  const key=new THREE.DirectionalLight(0xffffff,1.1);key.position.set(4,8,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0x9dbbff,.35);fill.position.set(-5,4,-4);scene.add(fill);
  const camera=new THREE.PerspectiveCamera(35,320/280,.01,100);
  scene.add(model);
  const bounds=new THREE.Box3().setFromObject(model);
  const sphere=bounds.getBoundingSphere(new THREE.Sphere());
  model.rotation.y=-.45;
  const distance=Math.max(sphere.radius,.1)/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*.95;
  camera.position.set(.8,.55,1).normalize().multiplyScalar(distance);
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
  const image=renderer.domElement.toDataURL('image/png');
  scene.remove(model);disposePropertyModel(model);renderer.dispose();renderer.forceContextLoss();
  return image;
}
