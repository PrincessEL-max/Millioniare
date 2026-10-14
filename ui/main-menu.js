import { unlockAudio, playChaChing } from '../Bank/cha-ching.js';
import { ching as playChing, tuk as playTick } from './sound.js';
import { MAPS, CHARACTERS, pickComputers } from './menu-data.js';
import { createSkyline, createCharacterStage } from './menu-3d.js';
import { createToolPreview } from './tool-preview.js';
import { ITEMS } from './items.js';
import { buildHouseV2 } from './building-kit-v2.js';
import { buildHotel } from './building-kit.js';

/* Semua ukuran memakai --s (satuan relatif layar) lewat container query, jadi tampilan sama di HP tegak, HP miring, maupun layar besar. */
const MM_CSS = `
.mm-root{position:absolute;inset:0;z-index:5;overflow:hidden;container:mm/size;font-family:"Trebuchet MS","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#fff;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;pointer-events:auto;background:#1a63d6;--px:0;--py:0}
.mm-in{--s:min(1cqw,1.9cqh);position:absolute;inset:0}
@container mm (max-aspect-ratio:1/1){.mm-in{--s:min(2.5cqw,1.25cqh)}}
.mm-sky{position:absolute;inset:0;background:linear-gradient(#1558cc 0%,#2f8fee 30%,#6cc8ff 55%,#bfe9ff 74%,#ffe6b8 92%,#ffd493 100%)}
.mm-sun{position:absolute;left:50%;top:30%;width:calc(var(--s)*70);height:calc(var(--s)*70);margin:calc(var(--s)*-35) 0 0 calc(var(--s)*-35);translate:calc(var(--px)*var(--s)*-1.5) calc(var(--py)*var(--s)*-1)}
.mm-sun i{display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,rgba(255,247,200,.95) 0,rgba(255,224,140,.55) 28%,rgba(255,214,120,0) 68%);animation:mm-pulse 7s ease-in-out infinite}
@keyframes mm-pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.12);opacity:1}}
.mm-cloud{position:absolute;left:0;top:var(--t);width:calc(var(--s)*var(--w));opacity:var(--o);translate:calc(var(--px)*var(--s)*var(--k)) 0;pointer-events:none}
.mm-cloud svg{display:block;width:100%;animation:mm-drift var(--dur) linear infinite;animation-delay:var(--dl)}
@keyframes mm-drift{from{transform:translateX(-45cqw)}to{transform:translateX(125cqw)}}
.mm-bg3d{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.mm-spk{position:absolute;left:var(--l);top:0;width:calc(var(--s)*var(--z));height:calc(var(--s)*var(--z));opacity:.85;pointer-events:none;animation:mm-rise var(--dur) linear infinite;animation-delay:var(--dl)}
.mm-spk svg{display:block;width:100%;height:100%;animation:mm-twirl 3s ease-in-out infinite}
@keyframes mm-rise{0%{transform:translate(0,108cqh)}100%{transform:translate(var(--sw),-12cqh)}}
@keyframes mm-twirl{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.35)}}
.mm-screen{position:absolute;inset:0;opacity:0;pointer-events:none;transform:translateX(5%);transition:opacity .35s ease,transform .5s cubic-bezier(.2,.9,.3,1)}
.mm-screen.on{opacity:1;pointer-events:auto;transform:none}
.mm-screen.left{transform:translateX(-5%)}
.mm-title{position:absolute;left:50%;top:calc(var(--s)*2.5);width:calc(var(--s)*74);margin-left:calc(var(--s)*-37);translate:calc(var(--px)*var(--s)*1) calc(var(--py)*var(--s)*.6)}
.mm-title-in{animation:mm-bob 5s ease-in-out infinite}
.mm-logo{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 calc(var(--s)*1) calc(var(--s)*1.2) rgba(10,40,110,.35));animation:mm-pop 1s cubic-bezier(.2,1.4,.4,1) both}
@keyframes mm-bob{0%,100%{transform:translateY(0) rotate(-.5deg)}50%{transform:translateY(calc(var(--s)*-.9)) rotate(.5deg)}}
@keyframes mm-pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.05);opacity:1}100%{transform:scale(1)}}
.mm-shine{animation:mm-shine 4.5s ease-in-out infinite}
@keyframes mm-shine{0%,55%{transform:translateX(-340px) skewX(-20deg)}100%{transform:translateX(1300px) skewX(-20deg)}}
.mm-rib{transform-box:fill-box;transform-origin:50% 50%;animation:mm-sway 4s ease-in-out infinite}
@keyframes mm-sway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}
.mm-tiles{position:absolute;left:50%;bottom:calc(var(--s)*5);transform:translateX(-50%);display:flex;gap:calc(var(--s)*2.4)}
.mm-tile{width:calc(var(--s)*19);height:calc(var(--s)*17);border:0;border-radius:calc(var(--s)*3.2);padding:0;background:linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,.16));box-shadow:inset 0 0 0 calc(var(--s)*.25) rgba(255,255,255,.8),0 calc(var(--s)*1) calc(var(--s)*2.4) rgba(8,40,110,.35);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--s)*.6);cursor:pointer;font:inherit;animation:mm-float 4s ease-in-out infinite;animation-delay:var(--d);transition:filter .2s}
.mm-tile.pri{background:linear-gradient(#ffe98a,#ffb53a);color:#6a3300}
.mm-tile:hover{filter:brightness(1.1)}
.mm-tile:active{animation:none;transform:scale(.95)}
.mm-tile:focus-visible{outline:calc(var(--s)*.4) solid #fff}
.mm-ico{width:calc(var(--s)*8.6);height:calc(var(--s)*8.6);filter:drop-shadow(0 calc(var(--s)*.5) calc(var(--s)*.5) rgba(0,0,0,.25))}
.mm-ico svg{display:block;width:100%;height:100%}
.mm-lbl{font-size:calc(var(--s)*2.45);font-weight:800;font-style:italic;letter-spacing:.03em;text-shadow:0 calc(var(--s)*.25) 0 rgba(0,30,100,.45);line-height:1.1;text-align:center}
.mm-tile.pri .mm-lbl{text-shadow:0 calc(var(--s)*.2) 0 rgba(255,255,255,.55)}
@keyframes mm-float{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--s)*-.8))}}
.mm-ver{position:absolute;left:0;right:0;bottom:calc(var(--s)*1.4);text-align:center;font-size:calc(var(--s)*1.6);font-weight:700;letter-spacing:.12em;opacity:.8;text-shadow:0 1px 2px rgba(0,30,100,.5)}
.mm-pickbg{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 20%,rgba(120,200,255,.55),rgba(120,200,255,0) 55%),linear-gradient(#0a5fd0,#0b7af0);overflow:hidden}
.mm-pickbg::before{content:"";position:absolute;inset:-50%;background:repeating-linear-gradient(115deg,rgba(255,255,255,.07) 0 calc(var(--s)*4),rgba(255,255,255,0) calc(var(--s)*4) calc(var(--s)*12));animation:mm-beams 26s linear infinite}
@keyframes mm-beams{from{transform:translateX(0)}to{transform:translateX(calc(var(--s)*12*1.3))}}
.mm-badge{position:absolute;left:calc(var(--s)*30);top:calc(var(--s)*2);padding:calc(var(--s)*.7) calc(var(--s)*2);border-radius:999px;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 calc(var(--s)*.2) rgba(255,255,255,.6);font-size:calc(var(--s)*1.9);font-weight:800;font-style:italic;letter-spacing:.08em}
.mm-strip{position:absolute;left:calc(var(--s)*10);top:0;bottom:0;width:calc(var(--s)*17);background:rgba(3,40,125,.4);border-left:calc(var(--s)*.5) solid #0a47b0;border-right:calc(var(--s)*.5) solid #0a47b0}
.mm-list{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;padding:calc(var(--s)*2) 0 calc(var(--s)*6);scrollbar-width:none;scroll-snap-type:y proximity;overscroll-behavior:contain;touch-action:pan-y}
.mm-list::-webkit-scrollbar{display:none}
.mm-item{display:block;position:relative;width:calc(var(--s)*12);height:calc(var(--s)*10.5);margin:calc(var(--s)*1.2) auto;padding:0;border:0;background:rgba(255,255,255,.1);border-radius:calc(var(--s)*1.6);cursor:pointer;scroll-snap-align:center;transition:transform .25s cubic-bezier(.2,1.4,.4,1),background .2s}
.mm-item:hover{background:rgba(255,255,255,.2)}
.mm-item.sel{transform:scale(1.1);background:rgba(255,255,255,.3);box-shadow:inset 0 0 0 calc(var(--s)*.3) #fff}
.mm-item.sel::after{content:"";position:absolute;right:calc(var(--s)*-1.55);top:50%;margin-top:calc(var(--s)*-1.1);border:calc(var(--s)*1.1) solid transparent;border-right-color:#fff;border-left:0;animation:mm-nudge 1.2s ease-in-out infinite}
@keyframes mm-nudge{0%,100%{translate:0 0}50%{translate:calc(var(--s)*-.4) 0}}
.mm-item svg,.mm-item img{position:absolute;inset:6%;width:88%;height:88%;object-fit:contain;display:block}
.mm-item:focus-visible{outline:calc(var(--s)*.35) solid #fff}
.mm-detail{position:absolute;left:calc(var(--s)*30);right:calc(var(--s)*11);top:calc(var(--s)*5);bottom:calc(var(--s)*2);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.mm-art{position:relative;width:calc(var(--s)*28);height:calc(var(--s)*22);flex:none;animation:mm-hover 4.2s ease-in-out infinite}
.mm-art svg{display:block;width:100%;height:100%;overflow:visible}
.mm-art canvas{display:block;width:100%;height:100%}
.mm-char .mm-art{width:calc(var(--s)*24);height:calc(var(--s)*20)}
.mm-art.swap{animation:mm-swap .45s cubic-bezier(.2,1.4,.4,1)}
@keyframes mm-hover{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--s)*-.9))}}
@keyframes mm-swap{0%{transform:scale(.7) translateY(calc(var(--s)*2));opacity:0}100%{transform:scale(1);opacity:1}}
.mm-name{margin:calc(var(--s)*.6) 0 0;font-size:calc(var(--s)*5.8);font-weight:800;font-style:italic;letter-spacing:.06em;line-height:1.1;text-shadow:0 calc(var(--s)*.5) 0 rgba(0,25,90,.5)}
.mm-desc{margin:calc(var(--s)*1.4) 0 0;max-width:calc(var(--s)*54);font-size:calc(var(--s)*2.5);font-weight:700;letter-spacing:.05em;line-height:1.32;text-shadow:0 calc(var(--s)*.2) 0 rgba(0,25,90,.45)}
.mm-equipment{display:flex;justify-content:center;flex-wrap:wrap;gap:calc(var(--s)*.8);max-width:calc(var(--s)*54);margin-top:calc(var(--s)*1.1)}
.mm-equipment-item{display:grid;justify-items:center;gap:calc(var(--s)*.25);width:calc(var(--s)*8.2);font-size:calc(var(--s)*1.35);font-weight:800;line-height:1.1;text-shadow:0 1px 2px #123b8c}
.mm-equipment-item img{width:calc(var(--s)*6.8);height:calc(var(--s)*6.8);object-fit:contain;border-radius:calc(var(--s)*1);background:#fff8;box-shadow:0 2px 8px #123b8c55}
.mm-equipment-empty{font-size:calc(var(--s)*1.8);font-weight:700}
.mm-name.swap,.mm-desc.swap{animation:mm-fadein .4s ease both}
@keyframes mm-fadein{from{opacity:0;transform:translateY(calc(var(--s)*1.2))}to{opacity:1;transform:none}}
.mm-edge{position:absolute;top:50%;margin-top:calc(var(--s)*-8.5);width:calc(var(--s)*7);height:calc(var(--s)*17);border:0;padding:0;background:linear-gradient(90deg,#fff,#e3eaf4 60%,#c3d1e6);color:#0a47b0;font:inherit;font-weight:900;font-size:calc(var(--s)*3.4);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;box-shadow:0 calc(var(--s)*.6) calc(var(--s)*1.6) rgba(0,30,110,.4);transition:transform .2s cubic-bezier(.2,1.4,.4,1),filter .2s}
.mm-edge svg{width:60%;height:auto}
.mm-back{left:0;border-radius:0 calc(var(--s)*2.6) calc(var(--s)*2.6) 0}
.mm-ok{right:0;border-radius:calc(var(--s)*2.6) 0 0 calc(var(--s)*2.6);background:linear-gradient(90deg,#c3d1e6,#e3eaf4 40%,#fff);animation:mm-okpulse 2.4s ease-in-out infinite}
.mm-edge:hover{filter:brightness(1.05)}.mm-back:hover{transform:translateX(calc(var(--s)*.6))}.mm-ok:hover{transform:translateX(calc(var(--s)*-.6))}
.mm-edge:active{filter:brightness(.92)}
.mm-edge:focus-visible{outline:calc(var(--s)*.35) solid #ffd24a}
@keyframes mm-okpulse{0%,100%{box-shadow:0 calc(var(--s)*.6) calc(var(--s)*1.6) rgba(0,30,110,.4),0 0 0 0 rgba(255,255,255,.55)}50%{box-shadow:0 calc(var(--s)*.6) calc(var(--s)*1.6) rgba(0,30,110,.4),0 0 0 calc(var(--s)*1) rgba(255,255,255,0)}}
.mm-modal{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(6,30,90,.5);opacity:0;pointer-events:none;transition:opacity .25s;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.mm-modal.on{opacity:1;pointer-events:auto}
.mm-card{width:calc(var(--s)*40);max-width:92cqw;padding:calc(var(--s)*3);border-radius:calc(var(--s)*3);background:linear-gradient(#f5f9ff,#d6e4f8);color:#0a3b94;box-shadow:0 calc(var(--s)*1.4) calc(var(--s)*4) rgba(0,20,80,.5);transform:scale(.9);transition:transform .35s cubic-bezier(.2,1.4,.4,1)}
.mm-modal.on .mm-card{transform:none}
.mm-card h3{margin:0 0 calc(var(--s)*1.6);font-size:calc(var(--s)*3.6);font-style:italic;font-weight:900;text-align:center}
.mm-row{display:flex;align-items:center;justify-content:space-between;padding:calc(var(--s)*1.1) 0;font-size:calc(var(--s)*2.4);font-weight:800;border-top:calc(var(--s)*.15) solid rgba(10,59,148,.15)}
.mm-sw{width:calc(var(--s)*7);height:calc(var(--s)*3.6);border:0;border-radius:999px;background:#aab8d0;position:relative;cursor:pointer;transition:background .2s;padding:0}
.mm-sw::after{content:"";position:absolute;top:calc(var(--s)*.35);left:calc(var(--s)*.35);width:calc(var(--s)*2.9);height:calc(var(--s)*2.9);border-radius:50%;background:#fff;box-shadow:0 calc(var(--s)*.2) calc(var(--s)*.5) rgba(0,0,0,.3);transition:transform .25s cubic-bezier(.2,1.4,.4,1)}
.mm-sw[aria-pressed=true]{background:#2f9cf0}.mm-sw[aria-pressed=true]::after{transform:translateX(calc(var(--s)*3.4))}
.mm-close{display:block;margin:calc(var(--s)*2) auto 0;border:0;border-radius:999px;padding:calc(var(--s)*1) calc(var(--s)*4);background:linear-gradient(#ffe98a,#ffb53a);color:#6a3300;font:inherit;font-weight:900;font-size:calc(var(--s)*2.4);cursor:pointer}
.mm-toast{position:absolute;left:50%;bottom:calc(var(--s)*14);transform:translate(-50%,calc(var(--s)*2));padding:calc(var(--s)*1.1) calc(var(--s)*3);border-radius:999px;background:rgba(8,30,90,.85);font-size:calc(var(--s)*2.3);font-weight:800;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;white-space:nowrap}
.mm-toast.on{opacity:1;transform:translate(-50%,0)}
.mm-go{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--s)*2);background:radial-gradient(circle,#2a8cf0,#0a4bb5);opacity:0;pointer-events:none;transition:opacity .4s;font-size:calc(var(--s)*4);font-weight:900;font-style:italic}
.mm-go.on{opacity:1;pointer-events:auto}
.mm-coin{width:calc(var(--s)*12);height:calc(var(--s)*12);animation:mm-spin 1.1s linear infinite}
@keyframes mm-spin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
@container mm (max-aspect-ratio:1/1){
 .mm-title{width:calc(var(--s)*38);margin-left:calc(var(--s)*-19);top:calc(var(--s)*7)}
 .mm-tiles{display:grid;grid-template-columns:repeat(2,calc(var(--s)*17.5));gap:calc(var(--s)*2);bottom:calc(var(--s)*7)}
 .mm-tile{width:100%;height:calc(var(--s)*14.5)}
 .mm-ico{width:calc(var(--s)*7);height:calc(var(--s)*7)}.mm-lbl{font-size:calc(var(--s)*2.5)}
 .mm-strip{left:calc(var(--s)*1.2);width:calc(var(--s)*10.5)}
 .mm-item{width:calc(var(--s)*7.4);height:calc(var(--s)*6.8)}.mm-item.sel::after{right:calc(var(--s)*-1.2)}
 .mm-badge{left:calc(var(--s)*14);top:calc(var(--s)*2)}
 .mm-detail{left:calc(var(--s)*13.5);right:calc(var(--s)*1.5);top:calc(var(--s)*6);bottom:calc(var(--s)*12)}
 .mm-art{width:calc(var(--s)*23);height:calc(var(--s)*20)}.mm-char .mm-art{width:calc(var(--s)*20);height:calc(var(--s)*17)}
 .mm-name{font-size:calc(var(--s)*4.2)}.mm-desc{font-size:calc(var(--s)*2.1);max-width:calc(var(--s)*24)}
 .mm-equipment{max-width:calc(var(--s)*25);gap:calc(var(--s)*.5);margin-top:calc(var(--s)*.7)}
 .mm-equipment-item{width:calc(var(--s)*5.8);font-size:calc(var(--s)*1.35)}
 .mm-equipment-item img{width:calc(var(--s)*4.6);height:calc(var(--s)*4.6)}
 .mm-edge{top:auto;bottom:calc(var(--s)*3);margin-top:0;width:calc(var(--s)*14);height:calc(var(--s)*6);border-radius:999px;flex-direction:row;gap:calc(var(--s)*.6);font-size:calc(var(--s)*2.6)}
 .mm-edge svg{width:auto;height:70%}.mm-back{left:calc(var(--s)*2)}.mm-ok{right:calc(var(--s)*2)}
 .mm-ok span+span{margin-left:calc(var(--s)*.1)}
 .mm-toast{bottom:calc(var(--s)*12)}.mm-card{width:calc(var(--s)*34)}
}
@media (prefers-reduced-motion:reduce){.mm-root *,.mm-root *::before{animation:none!important;transition-duration:.01s!important}}
`;

const MM_SPARKLE = {
  coin: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#ffd24a" stroke="#c98a00" stroke-width="3"/><circle cx="20" cy="20" r="12" fill="none" stroke="#e8a817" stroke-width="2"/><text x="20" y="27" text-anchor="middle" font-size="19" font-weight="900" fill="#b57a00" font-family="Arial">$</text></svg>',
  star: '<svg viewBox="0 0 40 40"><path d="M20 3 L25 15 L38 16 L28 25 L31 38 L20 31 L9 38 L12 25 L2 16 L15 15 Z" fill="#fff6b8" stroke="#ffd24a" stroke-width="2" stroke-linejoin="round"/></svg>'
};
const MM_CLOUD = '<svg viewBox="0 0 200 80"><g fill="#fff"><ellipse cx="62" cy="52" rx="48" ry="22"/><ellipse cx="106" cy="38" rx="42" ry="28"/><ellipse cx="150" cy="54" rx="40" ry="20"/><rect x="40" y="48" width="130" height="24" rx="12"/></g></svg>';
const mmGear = (() => { const n = 8, ro = 50, ri = 38; let d = ''; for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n; [[-0.2, ri], [-0.1, ro], [0.1, ro], [0.2, ri]].forEach(([da, r], k) => { const t = a + da; d += (i || k ? 'L' : 'M') + (60 + Math.cos(t) * r).toFixed(1) + ',' + (60 + Math.sin(t) * r).toFixed(1); }); } return d + 'Z'; })();
const MM_ICON = {
  offline: '<svg viewBox="0 0 120 120"><defs><linearGradient id="mmDie" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a6a"/><stop offset="1" stop-color="#c91f1f"/></linearGradient></defs><ellipse cx="60" cy="104" rx="38" ry="7" fill="rgba(0,0,0,.22)"/><g transform="rotate(-10 60 60)"><rect x="22" y="20" width="76" height="76" rx="16" fill="url(#mmDie)" stroke="#8a1010" stroke-width="4"/><rect x="28" y="25" width="64" height="26" rx="12" fill="#fff" opacity=".3"/><g fill="#fff"><circle cx="42" cy="38" r="7"/><circle cx="78" cy="38" r="7"/><circle cx="60" cy="58" r="7"/><circle cx="42" cy="78" r="7"/><circle cx="78" cy="78" r="7"/></g></g></svg>',
  online: '<svg viewBox="0 0 120 120"><defs><radialGradient id="mmGlobe" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#8fe0ff"/><stop offset=".6" stop-color="#2f8fe8"/><stop offset="1" stop-color="#1450b8"/></radialGradient></defs><circle cx="56" cy="64" r="42" fill="url(#mmGlobe)" stroke="#0e3f96" stroke-width="4"/><g fill="#6fd06a" stroke="#2f8a3a" stroke-width="2"><path d="M30 50 Q42 36 56 44 Q50 56 38 58 Q30 64 26 58Z"/><path d="M64 70 Q80 62 90 74 Q84 92 70 92 Q62 82 64 70Z"/></g><path d="M56 22 Q36 64 56 106 M56 22 Q76 64 56 106 M14 64 H98" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.5"/><ellipse cx="42" cy="44" rx="14" ry="8" fill="#fff" opacity=".35" transform="rotate(-30 42 44)"/><g fill="none" stroke="#ffd24a" stroke-width="6" stroke-linecap="round"><path d="M86 28 Q98 28 104 38"/><path d="M88 16 Q110 16 118 40"/></g><circle cx="84" cy="36" r="5" fill="#ffd24a"/></svg>',
  load: '<svg viewBox="0 0 120 120"><defs><linearGradient id="mmFold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe98a"/><stop offset="1" stop-color="#f4a626"/></linearGradient></defs><path d="M14 32 Q14 24 22 24 H46 L54 34 H98 Q106 34 106 42 V92 Q106 100 98 100 H22 Q14 100 14 92Z" fill="#d98a14" stroke="#8a5600" stroke-width="4" stroke-linejoin="round"/><path d="M14 48 Q14 42 22 42 H98 Q106 42 106 48 V92 Q106 100 98 100 H22 Q14 100 14 92Z" fill="url(#mmFold)" stroke="#8a5600" stroke-width="4" stroke-linejoin="round"/><path d="M50 58 L78 72 L50 86Z" fill="#37b24a" stroke="#1f7a2e" stroke-width="4" stroke-linejoin="round"/><path d="M20 50 H98" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></svg>',
  options: '<svg viewBox="0 0 120 120"><defs><linearGradient id="mmGearG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#3fa9e0"/></linearGradient></defs><path d="' + mmGear + '" fill="url(#mmGearG)" stroke="#1d6fa8" stroke-width="4" stroke-linejoin="round"/><circle cx="60" cy="60" r="17" fill="#e6f7ff" stroke="#1d6fa8" stroke-width="4"/><path d="M30 40 Q44 24 62 22" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/></svg>'
};
const MM_LOGO = `<svg class="mm-logo" viewBox="0 0 1000 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Millionaire Tafa">
<defs>
<linearGradient id="mmGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8cc"/><stop offset=".32" stop-color="#ffd84a"/><stop offset=".62" stop-color="#ffa91f"/><stop offset="1" stop-color="#ff7a12"/></linearGradient>
<linearGradient id="mmRibG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a5a"/><stop offset="1" stop-color="#c41e2a"/></linearGradient>
<linearGradient id="mmShineG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="mmCoinG" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff6a0"/><stop offset=".6" stop-color="#ffc21f"/><stop offset="1" stop-color="#d9860a"/></radialGradient>
<path id="mmArc" d="M 22,236 Q 500,18 978,236"/>
<mask id="mmTxM"><rect width="1000" height="372" fill="#000"/><text font-family="'Trebuchet MS','Segoe UI',Arial,sans-serif" font-weight="900" font-style="italic" font-size="124" letter-spacing="2" fill="#fff"><textPath href="#mmArc" startOffset="50%" text-anchor="middle">MILLIONAIRE</textPath></text></mask>
</defs>
<g font-family="'Trebuchet MS','Segoe UI',Arial,sans-serif" font-weight="900" font-style="italic" font-size="124" letter-spacing="2" stroke-linejoin="round">
<text transform="translate(0,16)" fill="#a64300" stroke="#4a1a00" stroke-width="22"><textPath href="#mmArc" startOffset="50%" text-anchor="middle">MILLIONAIRE</textPath></text>
<text fill="url(#mmGold)" stroke="#4a1a00" stroke-width="16" paint-order="stroke"><textPath href="#mmArc" startOffset="50%" text-anchor="middle">MILLIONAIRE</textPath></text>
</g>
<g mask="url(#mmTxM)"><rect class="mm-shine" x="0" y="0" width="170" height="372" fill="url(#mmShineG)"/></g>
<g class="mm-rib"><path d="M236,262 H764 L800,306 L764,350 H236 L200,306Z" fill="url(#mmRibG)" stroke="#5a0f14" stroke-width="9" stroke-linejoin="round"/><path d="M236,274 H764" stroke="#fff" stroke-opacity=".4" stroke-width="6"/>
<text x="500" y="334" text-anchor="middle" font-family="'Trebuchet MS','Segoe UI',Arial,sans-serif" font-weight="900" font-style="italic" font-size="84" letter-spacing="14" fill="#fff" stroke="#6a1018" stroke-width="10" paint-order="stroke" stroke-linejoin="round">TAFA</text>
<g fill="#ffe27a" stroke="#c98a00" stroke-width="3"><path d="M262 306 l7 -16 l7 16 l17 2 l-13 11 l4 17 l-15 -9 l-15 9 l4 -17 l-13 -11z" transform="scale(.8) translate(66 76)"/><path d="M738 306 l7 -16 l7 16 l17 2 l-13 11 l4 17 l-15 -9 l-15 9 l4 -17 l-13 -11z" transform="scale(.8) translate(184 76)"/></g></g>
<g transform="translate(936 46) rotate(14)"><circle r="46" fill="url(#mmCoinG)" stroke="#9a5d00" stroke-width="7"/><circle r="33" fill="none" stroke="#e29a10" stroke-width="4"/><text y="17" text-anchor="middle" font-size="52" font-weight="900" fill="#a86a00" font-family="Arial,sans-serif">$</text></g>
</svg>`;
const MM_CHEV = '<svg viewBox="0 0 24 40"><path d="M18 4 L6 20 L18 36" fill="none" stroke="#0a47b0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MM_COINBIG = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#ffd24a" stroke="#b57a00" stroke-width="6"/><circle cx="50" cy="50" r="33" fill="none" stroke="#e29a10" stroke-width="4"/><text x="50" y="68" text-anchor="middle" font-size="50" font-weight="900" fill="#a86a00" font-family="Arial,sans-serif">$</text></svg>';

const mmEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mmMoney = n => '$' + Math.round(n).toLocaleString('en-US');
const MM_OPT_KEY = 'mt_menu_opts';
export function getMenuOptions() {
  const d = { sound: true, music: true, vibrate: true };
  try { return Object.assign(d, JSON.parse(localStorage.getItem(MM_OPT_KEY) || '{}')); } catch (e) { return d; }
}

/* Gambar mini peta (placeholder): papan isometrik dengan jalan melingkar dan lahan berwarna sesuai tema. */
function mmMapArt(theme, uid) {
  const V = [[0, -44], [78, 0], [0, 44], [-78, 0]], lots = [];
  for (let e = 0; e < 4; e++) {
    const a = V[e], b = V[(e + 1) % 4], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ml = Math.hypot(mx, my), ox = mx / ml * 11, oy = my / ml * 11;
    [0.2, 0.5, 0.8].forEach((t, k) => { const x = a[0] + (b[0] - a[0]) * t + ox, y = a[1] + (b[1] - a[1]) * t + oy; lots.push(`<path d="M${(x - 7).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y - 4).toFixed(1)} L${(x + 7).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 4).toFixed(1)}Z" fill="${theme[1 + ((e + k) % 3)]}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>`); });
  }
  return `<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mmMs${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${theme[0]}"/><stop offset="1" stop-color="${theme[0]}" stop-opacity=".78"/></linearGradient></defs>
<ellipse cx="110" cy="136" rx="92" ry="11" fill="rgba(0,10,60,.3)"/>
<g transform="translate(110 66)"><path d="M-98 0 L0 56 L98 0 V13 L0 69 L-98 13Z" fill="rgba(0,0,0,.28)"/><path d="M0 -56 L98 0 L0 56 L-98 0Z" fill="url(#mmMs${uid})" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linejoin="round"/>
<path d="M0 -46 L81 0 L0 46 L-81 0Z" fill="#8c9097"/><path d="M0 -34 L58 0 L0 34 L-58 0Z" fill="${theme[0]}"/><path d="M0 -46 L81 0 L0 46 L-81 0Z" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-dasharray="6 6"/>
${lots.join('')}
<path d="M-12 4 L0 -2 L12 4 L0 10Z" fill="#fff" opacity=".85"/><path d="M-10 -2 V-16 L0 -22 L10 -16 V-2 L0 4Z" fill="${theme[2]}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><path d="M-10 -16 L0 -10 L10 -16 L0 -22Z" fill="#fff" opacity=".6"/></g></svg>`;
}
const mmPlaceholder = (c, name) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${c}"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="900" fill="#fff" font-family="Arial">${mmEsc((name || '?')[0])}</text></svg>`;

/**
 * Halaman depan. Pilihan: Offline Game / Online Game -> pilih peta -> pilih karakter -> onStart(hasil).
 * hasil = { mode: 'offline'|'online', map, character, computers: [karakter acak untuk komputer] }
 * Opsi: mount, hasSave() -> boolean, onLoad(), onStart(hasil), onOptions(opsi), maps, characters, computers (jumlah), sound, background (3D)
 * Mengembalikan { el, destroy, show(nama) }.
 */
export function showMainMenu(opts = {}) {
  const o = Object.assign({ mount: document.body, hasSave: () => false, onLoad: null, onStart: null, onOptions: null, maps: MAPS, characters: CHARACTERS, computers: 2, sound: true, background: true }, opts);
  if (!document.getElementById('mm-style')) { const st = document.createElement('style'); st.id = 'mm-style'; st.textContent = MM_CSS; document.head.appendChild(st); }
  const root = document.createElement('div'); root.className = 'mm-root'; let options = getMenuOptions();
  const sfx = fn => { if (o.sound && options.sound) { try { fn(); } catch (e) {} } };
  const rnd = (a, b) => a + Math.random() * (b - a);
  let sparkles = ''; for (let i = 0; i < 12; i++) sparkles += `<div class="mm-spk" style="--l:${Math.round(rnd(3, 94))}%;--z:${rnd(2.2, 4.2).toFixed(1)};--dur:${Math.round(rnd(16, 30))}s;--dl:${-Math.round(rnd(0, 28))}s;--sw:${Math.round(rnd(-8, 8))}cqw">${MM_SPARKLE[i % 3 ? 'star' : 'coin']}</div>`;
  let clouds = ''; [[8, 38, 0.9, 80, 0.5], [22, 26, 0.7, 120, 1.4], [46, 44, 0.55, 95, 0.8], [60, 30, 0.8, 140, 1.8], [12, 22, 0.5, 170, 0.3], [34, 34, 0.65, 110, 1.1]].forEach(([t, w, op, dur, k], i) => { clouds += `<div class="mm-cloud" style="--t:${t}%;--w:${w};--o:${op};--k:${k};--dur:${dur}s;--dl:${-Math.round(dur * (i * 0.27 % 1))}s">${MM_CLOUD}</div>`; });
  const tile = (act, icon, label, d, pri) => `<button class="mm-tile${pri ? ' pri' : ''}" data-act="${act}" style="--d:${d}s"><span class="mm-ico">${icon}</span><span class="mm-lbl">${label}</span></button>`;
  const pick = (kind) => `<section class="mm-screen mm-pick mm-${kind}" data-kind="${kind}"><div class="mm-pickbg"></div><div class="mm-badge"></div><div class="mm-strip"><div class="mm-list" role="listbox"></div></div><div class="mm-detail"><div class="mm-art"></div><h2 class="mm-name"></h2><p class="mm-desc"></p>${kind === 'char' ? '<div class="mm-equipment" aria-label="Perlengkapan awal"></div>' : ''}</div><button class="mm-edge mm-back" aria-label="Back">${MM_CHEV}</button><button class="mm-edge mm-ok" aria-label="OK"><span>O</span><span>K</span></button></section>`;
  root.innerHTML = `<div class="mm-in"><div class="mm-sky"></div><div class="mm-sun"><i></i></div>${clouds}<canvas class="mm-bg3d"></canvas>${sparkles}
<section class="mm-screen mm-home on"><div class="mm-title"><div class="mm-title-in">${MM_LOGO}</div></div><nav class="mm-tiles">${tile('offline', MM_ICON.offline, 'Offline Game', 0, true)}${tile('online', MM_ICON.online, 'Online Game', 0.4, true)}${tile('load', MM_ICON.load, 'Load', 0.8)}${tile('options', MM_ICON.options, 'Options', 1.2)}</nav><div class="mm-ver">VERSION 1.0</div></section>
${pick('map')}${pick('char')}
<div class="mm-modal"><div class="mm-card"><h3>Options</h3><div class="mm-row"><span>Sound effects</span><button class="mm-sw" data-opt="sound" aria-pressed="true" aria-label="Sound effects"></button></div><div class="mm-row"><span>Music</span><button class="mm-sw" data-opt="music" aria-pressed="true" aria-label="Music"></button></div><div class="mm-row"><span>Vibration</span><button class="mm-sw" data-opt="vibrate" aria-pressed="true" aria-label="Vibration"></button></div><button class="mm-close">Close</button></div></div>
<div class="mm-toast"></div><div class="mm-go"><div class="mm-coin">${MM_COINBIG}</div><div>Get ready...</div></div></div>`;
  o.mount.appendChild(root);
  const q = s => root.querySelector(s), qa = s => [...root.querySelectorAll(s)], home = q('.mm-home'), mapS = q('.mm-map'), charS = q('.mm-char'), toast = q('.mm-toast'), modal = q('.mm-modal');
  const state = { screen: 'home', mode: 'offline', mapIdx: 0, charIdx: 0, stack: [] }; let toastT = 0, sky = null, stage = null, destroyed = false;
  const say = t => { toast.textContent = t; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 1800); };

  /* ---- latar 3D ---- */
  if (o.background) { try { sky = createSkyline(q('.mm-bg3d'), [() => buildHouseV2(5), () => buildHotel(3), () => buildHouseV2(3), () => buildHotel(5), () => buildHouseV2(2)]); sky.start(); } catch (e) { sky = null; } }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { if (sky) sky.resize(); if (stage) stage.resize(); }) : null; if (ro) ro.observe(root);
  root.addEventListener('pointermove', e => { const r = root.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * 2 - 1, y = ((e.clientY - r.top) / r.height) * 2 - 1; root.style.setProperty('--px', x.toFixed(3)); root.style.setProperty('--py', y.toFixed(3)); if (sky) sky.setParallax(x, y); });
  root.addEventListener('pointerdown', () => unlockAudio(), { capture: true });

  /* ---- daftar peta dan karakter ---- */
  const mapList = mapS.querySelector('.mm-list'), charList = charS.querySelector('.mm-list');
  mapList.innerHTML = o.maps.map((m, i) => `<button class="mm-item" role="option" data-i="${i}" aria-label="${mmEsc(m.name)}">${mmMapArt(m.theme, 't' + i)}</button>`).join('');
  charList.innerHTML = o.characters.map((c, i) => `<button class="mm-item" role="option" data-i="${i}" aria-label="${mmEsc(c.name)}">${mmPlaceholder(c.kind === 'boy' ? '#3f8ae0' : '#e8689a', c.name)}</button>`).join('');
  const setSel = (list, i) => [...list.children].forEach((b, k) => { b.classList.toggle('sel', k === i); b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
  const swap = (el) => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); };
  function showMap(i, quiet) {
    state.mapIdx = i = Math.max(0, Math.min(o.maps.length - 1, i)); const m = o.maps[i]; setSel(mapList, i);
    const art = mapS.querySelector('.mm-art'), name = mapS.querySelector('.mm-name'), desc = mapS.querySelector('.mm-desc'); art.innerHTML = mmMapArt(m.theme, 'big' + i); name.textContent = m.name;
    desc.textContent = `${m.desc} Start with ${mmMoney(m.cash)} cash and ${mmMoney(m.bank)} in bank. Win by eliminating all other players.`; swap(art); swap(name); swap(desc); if (!quiet) sfx(() => playTick(0.4));
    mapList.children[i] && mapList.children[i].scrollIntoView && mapList.children[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function showEquipment(character) {
    const equipment = charS.querySelector('.mm-equipment');
    if (!equipment) return;
    equipment.innerHTML = character.items.length ? character.items.map(id => {
      const item = ITEMS.find(entry => entry.id === id);
      const image = toolPreview?.thumbnail(id) || '';
      return `<div class="mm-equipment-item"><img src="${image}" alt="Model 3D ${mmEsc(item?.name || id)}"><span>${mmEsc(item?.name || id)}</span></div>`;
    }).join('') : '<span class="mm-equipment-empty">Tidak membawa alat</span>';
  }
  let toolPreview = null;
  function showChar(i, quiet) {
    state.charIdx = i = Math.max(0, Math.min(o.characters.length - 1, i)); const c = o.characters[i]; setSel(charList, i);
    const name = charS.querySelector('.mm-name'), desc = charS.querySelector('.mm-desc'); name.textContent = c.name; desc.textContent = c.desc; swap(name); swap(desc); if (!quiet) sfx(() => playTick(0.4));
    showEquipment(c);
    if (stage) stage.show(c.make); charList.children[i] && charList.children[i].scrollIntoView && charList.children[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  mapList.addEventListener('click', e => { const b = e.target.closest('.mm-item'); if (b) showMap(+b.dataset.i); });
  charList.addEventListener('click', e => { const b = e.target.closest('.mm-item'); if (b) showChar(+b.dataset.i); });

  /* ---- perpindahan layar ---- */
  const screens = { home, map: mapS, char: charS };
  function go(name, back) {
    if (destroyed) return; const prev = state.screen; if (prev === name) return;
    if (!back) state.stack.push(prev); screens[prev].classList.remove('on'); screens[prev].classList.toggle('left', !back); screens[name].classList.remove('left'); screens[name].classList.add('on'); state.screen = name;
    if (name === 'home') { if (sky) sky.start(); } else if (sky) sky.stop();
    if (name === 'char') { ensureStage(); if (stage) { stage.start(); stage.resize(); } } else if (stage) stage.stop();
    if (name === 'map') { mapS.querySelector('.mm-badge').textContent = state.mode === 'online' ? 'Online Game' : 'Offline Game'; showMap(state.mapIdx, true); }
    if (name === 'char') { charS.querySelector('.mm-badge').textContent = o.maps[state.mapIdx].name; showChar(state.charIdx, true); }
  }
  const back = () => { if (state.screen === 'home') return; sfx(() => playTick(0.5)); go(state.stack.pop() || 'home', true); };
  function ensureStage() {
    if (stage) return; const art = charS.querySelector('.mm-art'); art.innerHTML = '<canvas></canvas>';
    try { stage = createCharacterStage(art.querySelector('canvas')); } catch (e) { stage = null; art.innerHTML = '<div style="font-size:calc(var(--s)*3)">3D not available</div>'; }
  }
  function startGame() {
    const character = o.characters[state.charIdx], result = { mode: state.mode, map: o.maps[state.mapIdx], character, computers: pickComputers(o.characters, character.id, o.computers) };
    sfx(() => playChaChing(0.6)); try { options.vibrate && navigator.vibrate && navigator.vibrate(30); } catch (e) {} q('.mm-go').classList.add('on');
    setTimeout(() => { if (o.onStart) o.onStart(result); }, 1100);
  }
  const press = (el, fn) => { el.addEventListener('click', fn); };
  qa('.mm-tile').forEach(t => press(t, () => {
    const act = t.dataset.act; sfx(() => playTick(0.6));
    if (act === 'offline' || act === 'online') { state.mode = act; state.stack = []; go('map'); }
    else if (act === 'load') { if (o.hasSave()) { if (o.onLoad) o.onLoad(); else say('Loading...'); } else say('No saved game found'); }
    else if (act === 'options') { modal.classList.add('on'); }
  }));
  qa('.mm-back').forEach(b => press(b, back));
  press(mapS.querySelector('.mm-ok'), () => { sfx(() => playChing(0.5)); go('char'); });
  press(charS.querySelector('.mm-ok'), startGame);
  qa('.mm-sw').forEach(sw => { sw.setAttribute('aria-pressed', options[sw.dataset.opt] ? 'true' : 'false'); sw.addEventListener('click', () => { options[sw.dataset.opt] = !options[sw.dataset.opt]; sw.setAttribute('aria-pressed', options[sw.dataset.opt] ? 'true' : 'false'); try { localStorage.setItem(MM_OPT_KEY, JSON.stringify(options)); } catch (e) {} if (o.onOptions) o.onOptions(Object.assign({}, options)); sfx(() => playTick(0.5)); }); });
  press(q('.mm-close'), () => { modal.classList.remove('on'); sfx(() => playTick(0.5)); }); modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('on'); });
  root.addEventListener('keydown', e => {
    if (modal.classList.contains('on')) { if (e.key === 'Escape') modal.classList.remove('on'); return; }
    const s = state.screen; if (s === 'home') return;
    const step = d => (s === 'map' ? showMap(state.mapIdx + d) : showChar(state.charIdx + d));
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } else if (e.key === 'Escape') back(); else if (e.key === 'Enter') { (s === 'map' ? mapS : charS).querySelector('.mm-ok').click(); }
  });

  /* ---- gambar karakter (diisi setelah halaman tampil) ---- */
  setTimeout(() => {
    if (destroyed) return;
    try { toolPreview = createToolPreview(); showEquipment(o.characters[state.charIdx]); }
    catch (error) { say(`Model alat 3D tidak dapat dimuat: ${error.message || String(error)}`); }
  }, 60);
  showMap(0, true); showChar(0, true);
  return { el: root, show: n => go(n, n === 'home'), destroy() { destroyed = true; if (sky) sky.dispose(); if (stage) stage.dispose(); if (toolPreview) toolPreview.destroy(); if (ro) ro.disconnect(); root.remove(); } };
}
