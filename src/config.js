import * as THREE from 'three';

export const CASH0=5000,LOT_SMALL=100,LOT_LARGE=200,RENT_SMALL=25,RENT_LARGE=50,RENT=[25,70,120,220,350,500],BUILD=[0,50,100,200,350,500],BN=['Tanah','Rumah sederhana','Rumah rapi','Rumah modern','Vila','Mansion'],HOTEL=['Tanah','Hotel bintang 1','Hotel bintang 2','Hotel bintang 3','Hotel bintang 4','Hotel bintang 5'];
export const PROPERTY_TIERS={
  1:{
    small:{landPrice:100,landRent:12,housePrices:[80,110,125,175,200],houseRents:[50,100,150,225,325]},
    large:{landPrice:200,landRent:50,hotelPrices:[100,150,200,350,500],hotelRents:[70,200,300,500,800]}
  },
  1.5:{
    small:{landPrice:125,landRent:25,housePrices:[85,100,190,275,375],houseRents:[60,110,250,440,625]},
    large:{landPrice:250,landRent:63,hotelPrices:[65,100,200,300,500],hotelRents:[100,250,400,650,1000]}
  },
  2:{
    small:{landPrice:150,landRent:38,housePrices:[90,100,125,275,375],houseRents:[65,125,285,475,750]},
    large:{landPrice:275,landRent:75,hotelPrices:[75,100,200,300,550],hotelRents:[125,300,500,850,1200]}
  },
  2.5:{
    small:{landPrice:175,landRent:44,housePrices:[70,100,170,275,400],houseRents:[75,175,360,575,875]},
    large:{landPrice:300,landRent:80,hotelPrices:[80,130,200,400,600],hotelRents:[150,350,600,1000,1400]}
  },
  3:{
    small:{landPrice:200,landRent:50,housePrices:[50,120,170,300,450],houseRents:[100,250,450,700,1000]},
    large:{landPrice:325,landRent:100,hotelPrices:[100,150,300,500,700],hotelRents:[200,480,880,1200,1600]}
  }
};
export const $=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const tween=(ms,f)=>new Promise(r=>{const s=performance.now();(function k(n){const t=Math.min(1,(n-s)/ms);f(t);t<1?requestAnimationFrame(k):r()})(s)});
export const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),mat=c=>new THREE.MeshLambertMaterial({color:c}),hex=c=>'#'+c.toString(16).padStart(6,'0');
export const cvs=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

export const OWN=['#e53935','#43a047','#1e88e5'];
