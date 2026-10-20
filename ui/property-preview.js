import * as THREE from 'three';
import { createPropertyModel, disposePropertyModel } from './property-model.js';

const previewCache=new Map();
export function propertyPreview(level,hotel){
  const cacheKey=`${level}:${hotel?1:0}`;
  if(previewCache.has(cacheKey))return previewCache.get(cacheKey);
  const image=renderPropertyPreview(level,hotel);
  if(image)previewCache.set(cacheKey,image);
  return image;
}
function renderPropertyPreview(level,hotel){
  const footprint=hotel?3.8:1.9;
  const model=createPropertyModel(level,hotel,footprint);
  if(!model)return '';
  const canvas=document.createElement('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  renderer.setSize(500,548,false);
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff,.9));
  const key=new THREE.DirectionalLight(0xffffff,1.25);key.position.set(4,8,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0x9dbbff,.4);fill.position.set(-5,4,-4);scene.add(fill);
  scene.add(model);
  model.updateMatrixWorld(true);
  const viewWidth=footprint*Math.SQRT2*490/478;
  const frameHeight=viewWidth*548/500;
  const aspect=500/548;
  const elevation=Math.asin(250/478);
  const targetY=viewWidth*(375/500-.5*548/500)/Math.cos(elevation);
  const halfHeight=frameHeight/2,halfWidth=halfHeight*aspect;
  const camera=new THREE.OrthographicCamera(-halfWidth,halfWidth,halfHeight,-halfHeight,.01,100);
  const target=new THREE.Vector3(0,targetY,0);
  camera.position.set(1,Math.tan(elevation)*Math.SQRT2,1).normalize().multiplyScalar(24).add(target);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  const originalYScale=model.scale.y,originalYPosition=model.position.y;
  const projectedTop=()=>{
    model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model);
    let top=-Infinity;
    for(const x of [bounds.min.x,bounds.max.x])
      for(const y of [bounds.min.y,bounds.max.y])
        for(const z of [bounds.min.z,bounds.max.z])
          top=Math.max(top,new THREE.Vector3(x,y,z).project(camera).y);
    return top;
  };
  if(projectedTop()>.9){
    let low=0,high=1;
    for(let i=0;i<16;i++){
      const factor=(low+high)/2;
      model.scale.y=originalYScale*factor;
      model.position.y=originalYPosition*factor;
      if(projectedTop()<=.9)low=factor;
      else high=factor;
    }
    model.scale.y=originalYScale*low;
    model.position.y=originalYPosition*low;
  }
  renderer.render(scene,camera);
  const image=renderer.domElement.toDataURL('image/png');
  scene.remove(model);disposePropertyModel(model);renderer.dispose();renderer.forceContextLoss();
  return image;
}
