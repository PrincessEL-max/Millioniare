import * as THREE from 'three';
import { $, mat } from './config.js';

// ---------- scene ----------
export const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fd6ff);
export const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
export const cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,150);
function rs(){const w=$('app').clientWidth,h=$('app').clientHeight,a=w/h,hh=Math.max(5.2,6.5/a);renderer.setSize(w,h,false);
  cam.left=-hh*a;cam.right=hh*a;cam.top=hh;cam.bottom=-hh;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
scene.add(new THREE.AmbientLight(0xffffff,.88));const sun=new THREE.DirectionalLight(0xffffff,.55);sun.position.set(5,12,8);scene.add(sun);
const gr=new THREE.Mesh(new THREE.PlaneGeometry(160,160),mat(0x6cc644));gr.rotation.x=-Math.PI/2;scene.add(gr);
