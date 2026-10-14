import * as THREE from 'three';
import { $ } from './config.js';

// ---------- scene ----------
export const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fd6ff);
export const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,powerPreference:'high-performance'});
const mobileScreen=matchMedia('(max-width: 1000px) and (pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio,mobileScreen?2:2.5));
renderer.outputEncoding=THREE.sRGBEncoding;
export const cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,150);
export const panOffset=new THREE.Vector3();
export const cameraOffset=new THREE.Vector3(12,8.5,12);
let worldBounds=null;
const MIN_CAMERA_PITCH=.4;
const cameraDistance=cameraOffset.length();
let cameraYaw=Math.atan2(cameraOffset.x,cameraOffset.z);
let cameraPitch=Math.asin(cameraOffset.y/cameraDistance);
let panBounds=null;
export function orbitCamera(dx,dy){
  cameraYaw+=dx*.008;
  cameraPitch=Math.max(MIN_CAMERA_PITCH,Math.min(1.4,cameraPitch-dy*.006));
  const horizontal=cameraDistance*Math.cos(cameraPitch);
  cameraOffset.set(Math.sin(cameraYaw)*horizontal,cameraDistance*Math.sin(cameraPitch),Math.cos(cameraYaw)*horizontal);
  setZoom(cam.zoom);
}
function rs(){const w=$('app').clientWidth,h=$('app').clientHeight,a=w/h,hh=Math.max(5.2,6.5/a);renderer.setSize(w,h,false);
  cam.left=-hh*a;cam.right=hh*a;cam.top=hh;cam.bottom=-hh;cam.updateProjectionMatrix()}
addEventListener('resize',rs);addEventListener('orientationchange',rs);window.visualViewport?.addEventListener('resize',rs);rs();
const MIN_ZOOM=.65,MAX_ZOOM=2.8;
function minimumWorldZoom(){
  if(!worldBounds)return MIN_ZOOM;
  const position=cam.position.clone(),rotation=cam.quaternion.clone();
  cam.position.copy(cameraOffset);cam.lookAt(0,0,0);cam.updateMatrixWorld();
  const right=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0);
  const up=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
  const direction=cam.getWorldDirection(new THREE.Vector3());
  const groundUp=up.addScaledVector(direction,-up.y/direction.y);
  const reachX=cam.right*Math.abs(right.x)+cam.top*Math.abs(groundUp.x);
  const reachZ=cam.right*Math.abs(right.z)+cam.top*Math.abs(groundUp.z);
  cam.position.copy(position);cam.quaternion.copy(rotation);cam.updateMatrixWorld();
  return Math.max(MIN_ZOOM,2*reachX/(worldBounds.maxX-worldBounds.minX),
    2*reachZ/(worldBounds.maxZ-worldBounds.minZ));
}
function setZoom(value){
  cam.zoom=Math.max(minimumWorldZoom(),Math.min(MAX_ZOOM,value));
  cam.updateProjectionMatrix();
}
export const zoomBy=factor=>setZoom(cam.zoom*factor);
export const zoomIn=()=>setZoom(cam.zoom*1.2);
export const zoomOut=()=>setZoom(cam.zoom/1.2);
export const resetZoom=()=>setZoom(1);
export function setWorldBounds(bounds,expandedBounds=bounds){
  worldBounds=bounds;
  panBounds=expandedBounds;
  setZoom(cam.zoom);
}
export function constrainWorldView(target,focus){
  if(!panBounds)return;
  cam.position.copy(target).add(cameraOffset);
  cam.lookAt(target);
  cam.updateMatrixWorld();
  const right=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0);
  const up=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
  const direction=cam.getWorldDirection(new THREE.Vector3());
  const groundUp=up.addScaledVector(direction,-up.y/direction.y);
  const halfWidth=cam.right/cam.zoom,halfHeight=cam.top/cam.zoom;
  const reachX=halfWidth*Math.abs(right.x)+halfHeight*Math.abs(groundUp.x);
  const reachZ=halfWidth*Math.abs(right.z)+halfHeight*Math.abs(groundUp.z);
  const clamp=(value,min,max)=>min>max?(min+max)/2:Math.max(min,Math.min(max,value));
  target.x=clamp(target.x,panBounds.minX+reachX,panBounds.maxX-reachX);
  target.z=clamp(target.z,panBounds.minZ+reachZ,panBounds.maxZ-reachZ);
  panOffset.copy(target).sub(focus);
}
$('zoomIn').addEventListener('click',zoomIn);
$('zoomOut').addEventListener('click',zoomOut);
$('zoomReset').addEventListener('click',resetZoom);
const canvas=$('c');
let drag=null,mouseOrbit=null,touchOrbit=null;
const touches=new Map();
canvas.style.cursor='grab';
canvas.style.touchAction='none';
function startPan(id,x,y){
  cam.updateMatrixWorld();
  const right=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0);
  const up=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
  const direction=cam.getWorldDirection(new THREE.Vector3());
  const groundUp=up.addScaledVector(direction,-up.y/direction.y);
  drag={id,x,y,offset:panOffset.clone(),right,groundUp,
    scale:(cam.top-cam.bottom)/(cam.zoom*canvas.clientHeight)};
}
function beginTouchOrbit(){
  const ids=[...touches.keys()].slice(0,2),[a,b]=ids.map(id=>touches.get(id));
  touchOrbit={ids,x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};
}
canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'){
    e.preventDefault();
    touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    canvas.setPointerCapture(e.pointerId);
    if(touches.size>=2){drag=null;beginTouchOrbit();canvas.style.cursor='grabbing'}
    else startPan(e.pointerId,e.clientX,e.clientY);
    return;
  }
  if(e.button===2){
    e.preventDefault();mouseOrbit={id:e.pointerId,x:e.clientX,y:e.clientY};
    canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';return;
  }
  if(e.button!==0)return;
  e.preventDefault();startPan(e.pointerId,e.clientX,e.clientY);
  canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
});
canvas.addEventListener('pointermove',e=>{
  if(touches.has(e.pointerId)){
    touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size>=2){
      if(!touchOrbit)beginTouchOrbit();
      const [a,b]=touchOrbit.ids.map(id=>touches.get(id));
      if(!a||!b)return;
      const x=(a.x+b.x)/2,y=(a.y+b.y)/2,distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
      orbitCamera(x-touchOrbit.x,y-touchOrbit.y);
      zoomBy(distance/touchOrbit.distance);
      touchOrbit={...touchOrbit,x,y,distance};
      return;
    }
  }
  if(mouseOrbit?.id===e.pointerId){
    orbitCamera(e.clientX-mouseOrbit.x,e.clientY-mouseOrbit.y);
    mouseOrbit.x=e.clientX;mouseOrbit.y=e.clientY;return;
  }
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  panOffset.copy(drag.offset).addScaledVector(drag.right,-dx*drag.scale).addScaledVector(drag.groundUp,dy*drag.scale);
});
const endDrag=e=>{
  if(touches.has(e.pointerId)){
    touches.delete(e.pointerId);touchOrbit=null;drag=null;
    if(touches.size===1){
      const [id,point]=touches.entries().next().value;
      startPan(id,point.x,point.y);canvas.style.cursor='grabbing';
    }else canvas.style.cursor='grab';
    return;
  }
  if(mouseOrbit?.id===e.pointerId){mouseOrbit=null;canvas.style.cursor='grab';return}
  if(drag?.id===e.pointerId){drag=null;canvas.style.cursor='grab'}
};
canvas.addEventListener('pointerup',endDrag);
canvas.addEventListener('pointercancel',endDrag);
canvas.addEventListener('lostpointercapture',endDrag);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{e.preventDefault();e.deltaY<0?zoomIn():zoomOut()},{passive:false});
addEventListener('keydown',e=>{
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
  if(e.key=='+'||e.key=='=')zoomIn();
  else if(e.key=='-')zoomOut();
  else if(e.key=='0')resetZoom();
});
scene.add(new THREE.AmbientLight(0xffffff,.88));const sun=new THREE.DirectionalLight(0xffffff,.55);sun.position.set(5,12,8);scene.add(sun);
