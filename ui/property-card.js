// Kartu properti "Swanston st" + palu yang bisa diketuk.
// Pakai:  const card=createPropertyCard(el,{name:'Swanston  st',cost:200,rent:50,onClose(){},onStrike(){}})
//         card.setData({name,cost,rent});  card.strike();
import {audio,tuk} from './sound.js';

const FONT="'Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif";
const PC_KF=[[0,0],[.28,22],[.46,-12.5],[.55,-6],[.62,-11],[1,0]];
const PC_EZ=[o=>1-(1-o)**3,o=>o*o*o,o=>1-(1-o)**2,o=>o*o,o=>.5-.5*Math.cos(Math.PI*o)];
const pcAngle=p=>{for(let i=0;i<PC_KF.length-1;i++){const[a,x]=PC_KF[i],[b,y]=PC_KF[i+1];if(p<=b)return x+(y-x)*PC_EZ[i]((p-a)/(b-a))}return 0};
let pcCount=0;

function pcMarkup(id){return `<svg viewBox="0 0 1564 796" style="width:100%;height:auto;display:block;touch-action:manipulation;-webkit-tap-highlight-color:transparent" role="img" aria-label="Kartu properti">
<defs>
<linearGradient id="${id}-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dde3e8"/><stop offset=".5" stop-color="#c9cfd5"/><stop offset=".56" stop-color="#b5bbc1"/><stop offset="1" stop-color="#c3c9cf"/></linearGradient>
<linearGradient id="${id}-dlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f6"/><stop offset="1" stop-color="#e3e9ec"/></linearGradient>
<radialGradient id="${id}-gold" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#f9d171"/><stop offset="1" stop-color="#eeaf49"/></radialGradient>
<linearGradient id="${id}-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b66d30"/><stop offset=".5" stop-color="#8e4a1d"/><stop offset="1" stop-color="#6f3512"/></linearGradient>
<linearGradient id="${id}-woodL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c77d3a"/><stop offset="1" stop-color="#96501f"/></linearGradient>
<linearGradient id="${id}-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8ef"/><stop offset="1" stop-color="#cdc6b4"/></linearGradient>
<filter id="${id}-txt" x="-5%" y="-20%" width="112%" height="150%"><feDropShadow dx="3" dy="4" stdDeviation="1.6" flood-color="#6f7c86" flood-opacity=".55"/></filter>
</defs>
<rect width="1564" height="796" fill="#e3e9ec"/>
<path d="M0 0H92Q40 8 0 64Z" fill="#62b83c"/>
<rect x="-8" y="-10" width="1580" height="830" rx="120" fill="url(#${id}-dlg)" stroke="#c4cbd0" stroke-width="3"/>
<path d="M1150 300Q1400 250 1564 330V796H1100Z" fill="#dcefd5" opacity=".65"/>
<path d="M1090 118L1385 22" stroke="#e58a8a" stroke-opacity=".3" stroke-width="5" fill="none"/>
<g stroke="#8b96a0" stroke-opacity=".4" stroke-width="7" stroke-linecap="round"><path d="M428 558l13-20M458 562l13-20M486 566l13-20M514 570l13-20"/></g>
<text class="pc-ghost" x="400" y="742" font-size="112" font-weight="700" font-family="${FONT}" fill="#b9c2c8" opacity=".25" style="white-space:pre"></text>
<rect x="22" y="18" width="1120" height="517" rx="72" fill="url(#${id}-panel)"/>
<rect x="25" y="21" width="1114" height="511" rx="69" fill="none" stroke="#eef2f5" stroke-opacity=".75" stroke-width="5"/>
<g filter="url(#${id}-txt)" font-family="${FONT}" font-weight="700" fill="#fff" stroke="#d3dadf" stroke-width="2" paint-order="stroke">
<text class="pc-name" data-slot="name" x="90" y="147" font-size="112" style="white-space:pre"></text>
<text class="pc-cost" data-slot="cost" x="540" y="252" font-size="54" style="white-space:pre"></text>
<text class="pc-rent" data-slot="rent" x="540" y="312" font-size="54" style="white-space:pre"></text>
</g>
<polygon class="pc-tile" fill="url(#${id}-gold)" stroke="#f9dc86" stroke-width="13" stroke-linejoin="round"/>
<polygon class="pc-tileIn" fill="none" stroke="#e0a23a" stroke-width="2.5"/>
<path class="pc-grid" stroke="#d99a2c" stroke-opacity=".55" stroke-width="2" fill="none"/>
<image class="pc-preview" x="72" y="215" width="410" height="320" preserveAspectRatio="xMidYMid meet" pointer-events="none"/>
<g class="pc-x" style="cursor:pointer;transform-box:fill-box;transform-origin:center;transition:transform .08s" transform="translate(1416 682)" role="button" aria-label="Tutup">
<rect x="-67" y="-20" width="134" height="40" rx="12" transform="rotate(45)" fill="url(#${id}-wood)" stroke="#4d260c" stroke-width="6"/>
<rect x="-67" y="-20" width="134" height="40" rx="12" transform="rotate(-45)" fill="url(#${id}-wood)" stroke="#4d260c" stroke-width="6"/>
<rect x="-60" y="-15" width="120" height="9" rx="4" transform="rotate(-45)" fill="#e0955a" opacity=".55"/>
<rect x="-60" y="-15" width="120" height="9" rx="4" transform="rotate(45)" fill="#e0955a" opacity=".45"/>
</g>
<g class="pc-btn" tabindex="0" role="button" aria-label="Ketuk palu" style="cursor:pointer;outline:none">
<rect x="1280" y="360" width="270" height="215" fill="transparent"/>
<g class="pc-block">
<polygon points="1322,512 1424,512 1440,534 1304,534" fill="url(#${id}-wood)" stroke="#4d260c" stroke-width="5" stroke-linejoin="round"/>
<rect x="1297" y="534" width="151" height="22" rx="7" fill="url(#${id}-woodL)" stroke="#4d260c" stroke-width="5"/>
<path d="M1330 520H1416" stroke="#d58a4a" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<path d="M1306 541H1440" stroke="#e3a064" stroke-width="4" stroke-linecap="round" opacity=".55"/>
</g>
<g class="pc-gavel">
<line x1="1398" y1="438" x2="1497" y2="532" stroke="#4d260c" stroke-width="38" stroke-linecap="round"/>
<line x1="1398" y1="438" x2="1497" y2="532" stroke="#9a5524" stroke-width="28" stroke-linecap="round"/>
<line x1="1394" y1="432" x2="1488" y2="521" stroke="#c8793a" stroke-width="7" stroke-linecap="round" opacity=".8"/>
<circle cx="1500" cy="535" r="19" fill="#8a4619" stroke="#4d260c" stroke-width="5"/>
<g transform="translate(1393 418) rotate(-24)">
<rect x="-62" y="-30" width="124" height="60" rx="16" fill="url(#${id}-wood)" stroke="#4d260c" stroke-width="5"/>
<rect x="-17" y="-31.5" width="34" height="63" fill="url(#${id}-cream)" stroke="#4d260c" stroke-width="3"/>
<ellipse cx="-62" cy="0" rx="11" ry="30" fill="#6a300f" stroke="#4d260c" stroke-width="4"/>
<ellipse cx="62" cy="0" rx="11" ry="30" fill="url(#${id}-woodL)" stroke="#4d260c" stroke-width="4"/>
<rect x="-58" y="-24" width="36" height="8" rx="4" fill="#ffc890" opacity=".35"/>
<rect x="24" y="-24" width="30" height="8" rx="4" fill="#ffc890" opacity=".35"/>
</g></g>
<g class="pc-sparks" style="opacity:0" stroke="#fff3c0" stroke-width="6" stroke-linecap="round"></g>
</g></svg>`}

export function createPropertyCard(root,opts={}){
  const o=Object.assign({name:'Swanston  st',cost:200,rent:50,preview:'',onClose:null,onStrike:null},opts);
  const id='pc'+(++pcCount);
  root.innerHTML=pcMarkup(id);
  const $=s=>root.querySelector(s);
  // ubin isometrik
  const T=[283,242],R=[521,367],L=[43,367];
  const P=(u,v)=>[T[0]+u*(R[0]-T[0])+v*(L[0]-T[0]),T[1]+u*(R[1]-T[1])+v*(L[1]-T[1])];
  $('.pc-tile').setAttribute('points',[T,R,P(1,1),L].join(' '));
  $('.pc-tileIn').setAttribute('points',[P(.04,.04),P(.96,.04),P(.96,.96),P(.04,.96)].join(' '));
  let g='';for(let k=1;k<4;k++){const a=P(k/4,.04),b=P(k/4,.96),c=P(.04,k/4),d=P(.96,k/4);g+=`M${a}L${b}M${c}L${d}`}
  $('.pc-grid').setAttribute('d',g);
  const sp=$('.pc-sparks');
  [-150,-115,-90,-65,-30].forEach(a=>{
    const r=a*Math.PI/180,l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',Math.cos(r)*12);l.setAttribute('y1',Math.sin(r)*12);l.setAttribute('x2',Math.cos(r)*28);l.setAttribute('y2',Math.sin(r)*28);
    sp.appendChild(l);
  });
  // data -> teks
  function fit(el,max){
    el.removeAttribute('textLength');
    try{const w=el.getComputedTextLength();if(w>max){el.setAttribute('textLength',max);el.setAttribute('lengthAdjust','spacingAndGlyphs')}}catch(e){}
  }
  function setData(d={}){
    if(d.name!==undefined)o.name=d.name;if(d.cost!==undefined)o.cost=d.cost;if(d.rent!==undefined)o.rent=d.rent;
    $('.pc-name').textContent=o.name;$('.pc-ghost').textContent=o.name;
    $('.pc-cost').textContent='Cost : '+o.cost;$('.pc-rent').textContent='Rent : '+o.rent;
    fit($('.pc-name'),770);fit($('.pc-ghost'),760);fit($('.pc-cost'),300);fit($('.pc-rent'),270);
  }
  setData();
  const preview=$('.pc-preview');
  if(o.preview)preview.setAttribute('href',o.preview);
  else preview.remove();
  // animasi palu
  const gav=$('.pc-gavel'),blk=$('.pc-block'),DUR=800,IMP=.46;
  let raf,t0,hit;
  function strike(){
    audio();cancelAnimationFrame(raf);t0=performance.now();hit=false;
    const step=now=>{
      const t=now-t0,p=Math.min(1,t/DUR);
      gav.setAttribute('transform',`rotate(${pcAngle(p)} 1498 533)`);
      if(p>=IMP&&!hit){hit=true;tuk();if(navigator.vibrate)navigator.vibrate(12);
        o.onStrike&&o.onStrike();root.dispatchEvent(new CustomEvent('card:strike'))}
      const s=hit?(t-IMP*DUR)/1000:0;
      blk.setAttribute('transform',`translate(0 ${hit?(7*Math.exp(-s*16)*Math.cos(s*46)).toFixed(2):0})`);
      sp.style.opacity=hit?Math.max(0,1-s/.2):0;
      sp.setAttribute('transform',`translate(1346 508) scale(${.6+s*5})`);
      if(p<1)raf=requestAnimationFrame(step);
      else{gav.removeAttribute('transform');blk.removeAttribute('transform');sp.style.opacity=0}
    };
    raf=requestAnimationFrame(step);
  }
  const btn=$('.pc-btn');
  btn.addEventListener('pointerdown',e=>{e.preventDefault();strike()});
  btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();strike()}});
  const x=$('.pc-x');
  x.addEventListener('pointerdown',()=>x.style.transform='scale(.9)');
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>x.addEventListener(ev,()=>x.style.transform=''));
  x.addEventListener('click',()=>{o.onClose&&o.onClose();root.dispatchEvent(new CustomEvent('card:close'))});
  return {el:root,setData,strike,destroy(){cancelAnimationFrame(raf);root.innerHTML=''}};
}
