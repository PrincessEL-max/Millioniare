import * as THREE from 'three';
import { $, mat } from './config.js';

// ---------- scene ----------
export const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fd6ff);
export const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2.5));
renderer.outputEncoding=THREE.sRGBEncoding;
export const cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,150);
function rs(){const w=$('app').clientWidth,h=$('app').clientHeight,a=w/h,hh=Math.max(5.2,6.5/a);renderer.setSize(w,h,false);
  cam.left=-hh*a;cam.right=hh*a;cam.top=hh;cam.bottom=-hh;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
const MIN_ZOOM=.65,MAX_ZOOM=2.8;
function setZoom(value){cam.zoom=Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,value));cam.updateProjectionMatrix()}
export const zoomIn=()=>setZoom(cam.zoom*1.2);
export const zoomOut=()=>setZoom(cam.zoom/1.2);
export const resetZoom=()=>setZoom(1);
$('zoomIn').addEventListener('click',zoomIn);
$('zoomOut').addEventListener('click',zoomOut);
$('zoomReset').addEventListener('click',resetZoom);
const canvas=$('c');
canvas.addEventListener('wheel',e=>{e.preventDefault();e.deltaY<0?zoomIn():zoomOut()},{passive:false});
addEventListener('keydown',e=>{
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
  if(e.key=='+'||e.key=='=')zoomIn();
  else if(e.key=='-')zoomOut();
  else if(e.key=='0')resetZoom();
});
scene.add(new THREE.AmbientLight(0xffffff,.88));const sun=new THREE.DirectionalLight(0xffffff,.55);sun.position.set(5,12,8);scene.add(sun);
const gr=new THREE.Mesh(new THREE.PlaneGeometry(160,160),mat(0x6cc644));gr.rotation.x=-Math.PI/2;scene.add(gr);
