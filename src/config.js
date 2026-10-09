import * as THREE from 'three';

export const CASH0=1000,LOT_SMALL=135,LOT_LARGE=200,RENT_SMALL=25,RENT_LARGE=50,RENT=[25,70,120,220],BUILD=[0,50,100,200],BN=['Tanah','Small House','Apartment','Skyscraper'];
export const $=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const tween=(ms,f)=>new Promise(r=>{const s=performance.now();(function k(n){const t=Math.min(1,(n-s)/ms);f(t);t<1?requestAnimationFrame(k):r()})(s)});
export const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),mat=c=>new THREE.MeshLambertMaterial({color:c}),hex=c=>'#'+c.toString(16).padStart(6,'0');
export const cvs=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

export const OWN=['#e53935','#43a047','#1e88e5'];
