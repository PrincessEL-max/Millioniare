import * as THREE from 'three';
import { createHouse1 } from '../house/house1.js';
import { buildHouseV2 } from './building-kit-v2.js';
import { buildHotel } from './building-kit.js';

const HOUSE_MODELS=Array.from({length:5},(_,index)=>()=>buildHouseV2(index+1));
const HOTEL_MODELS=Array.from({length:5},(_,index)=>()=>buildHotel(index+1));
const REFERENCE_MODELS={house:()=>createHouse1({props:false}),hotel:()=>buildHotel(1)};
const HEIGHT_MULTIPLIERS={
  house:[1.1,1.3,1.4,1.5,1.7],
  hotel:[1.5,1.8,2.1,2.4,2.7]
};
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
  const model=factory();
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model);
  const result={size:bounds.getSize(new THREE.Vector3()),minY:bounds.min.y,center:bounds.getCenter(new THREE.Vector3())};
  dispose(model);
  return result;
}

function isolateMaterials(model){
  const clones=new Map();
  model.traverse(object=>{
    if(!object.isMesh)return;
    const clone=material=>{
      if(!material)return material;
      if(!clones.has(material))clones.set(material,material.clone());
      return clones.get(material);
    };
    object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
  });
}

export function createPropertyModel(level,hotel,targetFootprint){
  const models=hotel?HOTEL_MODELS:HOUSE_MODELS,factory=models[level-1];
  if(!factory||!Number.isFinite(targetFootprint)||targetFootprint<=0)return null;
  const model=factory({props:false}),bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3()),scaleXZ=targetFootprint/Math.max(size.x,size.z);
  const key=hotel?'hotel':'house';
  let baseHeight=baseHeights.get(key);
  if(!baseHeight){
    const reference=dimensions(REFERENCE_MODELS[key]);
    baseHeight=reference.size.y*targetFootprint/Math.max(reference.size.x,reference.size.z);
    baseHeights.set(key,baseHeight);
  }
  const height=baseHeight*HEIGHT_MULTIPLIERS[key][level-1],scaleY=height/size.y;
  if(!hotel)isolateMaterials(model);
  model.scale.set(scaleXZ,scaleY,scaleXZ);
  model.position.set(-bounds.getCenter(new THREE.Vector3()).x*scaleXZ,-bounds.min.y*scaleY,-bounds.getCenter(new THREE.Vector3()).z*scaleXZ);
  model.updateMatrixWorld(true);
  return model;
}

export function disposePropertyModel(model){if(model)dispose(model)}
