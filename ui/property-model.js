import * as THREE from 'three';
import { createHouse1 } from '../house/house1.js';
import { createHouse2 } from '../house/house2.js';
import { createHouse3 } from '../house/house3.js';
import { createHouse4 } from '../house/house4.js';
import { createHouse5 } from '../house/house5.js';
import { createHotel } from '../hotel/hotel.js';
import { createHotel2 } from '../hotel/hotel2.js';
import { createHotel3 } from '../hotel/hotel3.js';
import { createHotel4 } from '../hotel/hotel4.js';
import { createHotel5 } from '../hotel/hotel5.js';

const HOUSE_MODELS=[createHouse1,createHouse2,createHouse3,createHouse4,createHouse5];
const HOTEL_MODELS=[createHotel,createHotel2,createHotel3,createHotel4,createHotel5];
const baseHeights=new Map();

function dispose(model){
  model.traverse(object=>{
    if(!object.isMesh)return;
    object.geometry?.dispose();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{
      Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose()});
      material?.dispose();
    });
  });
}

function dimensions(factory){
  const model=factory({props:false});
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model);
  const result={size:bounds.getSize(new THREE.Vector3()),minY:bounds.min.y,center:bounds.getCenter(new THREE.Vector3())};
  dispose(model);
  return result;
}

export function createPropertyModel(level,hotel,targetFootprint){
  const models=hotel?HOTEL_MODELS:HOUSE_MODELS,factory=models[level-1];
  if(!factory||!Number.isFinite(targetFootprint)||targetFootprint<=0)return null;
  const model=factory({props:false}),bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3()),scaleXZ=targetFootprint/Math.max(size.x,size.z);
  const key=hotel?'hotel':'house';
  let baseHeight=baseHeights.get(key);
  if(!baseHeight){
    const reference=dimensions(models[0]);
    baseHeight=reference.size.y*targetFootprint/Math.max(reference.size.x,reference.size.z);
    baseHeights.set(key,baseHeight);
  }
  const height=baseHeight*(1+.2*(level-1)),scaleY=height/size.y;
  model.scale.set(scaleXZ,scaleY,scaleXZ);
  model.position.set(-bounds.getCenter(new THREE.Vector3()).x*scaleXZ,-bounds.min.y*scaleY,-bounds.getCenter(new THREE.Vector3()).z*scaleXZ);
  model.updateMatrixWorld(true);
  return model;
}

export function disposePropertyModel(model){if(model)dispose(model)}
