import * as THREE from 'three';
import { $, cvs, rnd, tween } from './config.js';
import { tp } from './map.js';
import { scene } from './scene.js';

// ---------- dadu ----------
const PIP={1:[[.5,.5]],2:[[.25,.25],[.75,.75]],3:[[.25,.25],[.5,.5],[.75,.75]],4:[[.25,.25],[.75,.25],[.25,.75],[.75,.75]],5:[[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],6:[[.25,.25],[.75,.25],[.25,.5],[.75,.5],[.25,.75],[.75,.75]]};
export function face(v,sz=64){const c=cvs(sz),g=c.getContext('2d');g.fillStyle='#e6eaef';g.fillRect(0,0,sz,sz);g.fillStyle='#d62f2f';
  PIP[v].forEach(([a,b])=>{g.beginPath();g.arc(a*sz,b*sz,sz*.1,0,7);g.fill()});c.style.cssText='width:100%;height:100%;border-radius:14px;display:block';return c}
export const die=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.9),[1,6,2,5,3,4].map(v=>{
  const tex=new THREE.CanvasTexture(face(v,256));tex.encoding=THREE.sRGBEncoding;
  return new THREE.MeshLambertMaterial({map:tex})}));die.visible=false;scene.add(die);
const H=Math.PI/2,ROT={1:[0,0,H],2:[0,0,0],3:[-H,0,0],4:[H,0,0],5:[Math.PI,0,0],6:[0,0,-H]};
export async function rollDie(p,fixedValue=null,onValue=()=>{}){const v=fixedValue??rnd(1,6),[x,z]=tp(p.pos);onValue(v);die.visible=true;
  await tween(900,t=>{die.rotation.set(t*12,t*9,t*7);die.position.set(x+1.4,.5+Math.abs(Math.sin(t*Math.PI*2.2))*(1-t)*3,z+1.4)});
  die.rotation.set(...ROT[v]);die.position.set(x+1.4,.5,z+1.4);return v}
$('dice').append(face(5));
