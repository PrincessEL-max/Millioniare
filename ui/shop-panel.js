// Panel toko: daftar item bisa di-scroll, item terpilih tampil di panel besar, kasir = tombol beli ("ching!").
// Pakai:
//   const shop=createShopPanel(el,{items:ITEMS,onBuy(item){ ...; return true/false },onSelect(item){}});
//   shop.setItems([...]); shop.select(2); shop.buy();
// Event DOM di elemen root: 'shop:select' dan 'shop:buy' (detail:{item,index}).
// Slot isian tiap baris: [data-slot="icon"|"name"|"description"|"price"]
import {audio,ching,nope} from './sound.js';
import {ICONS} from './icons.js';

const U=n=>`calc(var(--u)*${n})`;
let spStyled=false;
const CSS=`
.sp-root{container-type:inline-size;position:relative;width:100%;aspect-ratio:1554/900;font-family:'Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif;-webkit-user-select:none;user-select:none}
.sp{position:absolute;inset:0;--u:calc(100cqw/1554);border-radius:${U(110)};overflow:hidden;background:#e3e9ec}
.sp-bg{position:absolute;inset:0;width:100%;height:100%}
.sp-list{position:absolute;z-index:2;left:${U(28)};top:${U(28)};bottom:${U(28)};width:${U(580)};overflow-y:auto;overscroll-behavior:contain;padding:${U(6)} ${U(14)} ${U(12)} ${U(4)};scrollbar-width:thin;scrollbar-color:rgba(120,130,140,.55) transparent;outline:none;scroll-behavior:smooth}
.sp-row{position:relative;display:flex;align-items:center;gap:${U(14)};box-sizing:border-box;width:100%;min-height:${U(168)};margin:0 0 ${U(10)};padding:${U(8)} ${U(8)};border:${U(3)} solid transparent;border-radius:${U(32)};background:rgba(189,197,204,.76);cursor:pointer;color:#37424a;font-weight:800;text-shadow:0 ${U(2)} ${U(2)} #fff9}
.sp-row.sel{border-color:#e1b735;background:rgba(255,247,209,.96);box-shadow:0 ${U(5)} ${U(12)} #42505a33}
.sp-row>*{flex:none}
.sp-icon{width:${U(170)};height:${U(148)}}
.sp-icon svg,.sp-icon img,.sp-icon canvas{width:100%;height:100%;object-fit:contain;display:block;-webkit-text-stroke:0;text-shadow:none}
.sp-row-copy{display:grid;gap:${U(6)};min-width:0}
.sp-row-name{overflow:hidden;font-size:${U(42)};line-height:1.05;text-overflow:ellipsis;white-space:nowrap}
.sp-row-price{font-size:${U(32)};color:#47545c}
.sp-detail{position:absolute;z-index:3;left:${U(635)};top:${U(24)};right:${U(25)};bottom:${U(24)};border-radius:${U(65)};background:linear-gradient(#dde3e8,#c9cfd5 50%,#b5bbc1 56%,#c3c9cf);box-shadow:inset 0 0 0 ${U(5)} rgba(238,242,245,.75),0 ${U(4)} ${U(10)} rgba(60,70,80,.15)}
.sp-name{position:absolute;left:${U(56)};top:${U(35)};right:${U(45)};font-size:${U(68)};letter-spacing:.03em;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp-desc{position:absolute;left:${U(56)};right:${U(330)};bottom:${U(70)};max-height:${U(125)};overflow:auto;font-size:${U(34)};line-height:1.2;letter-spacing:.03em}
.sp-detail>.sp-icon{left:${U(70)};top:${U(115)};width:${U(660)};height:${U(520)}}
.sp-cost{position:absolute;left:${U(55)};bottom:${U(22)};font-size:${U(38)};letter-spacing:.05em;white-space:pre}
.sp-buy{position:absolute;right:${U(205)};bottom:${U(32)};width:${U(190)};height:${U(190)};padding:0;border:0;background:none;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent}
.sp-buy:disabled{opacity:.35;cursor:default}
.sp-buy svg{width:100%;height:100%;display:block;overflow:visible}
.sp-detail-empty{position:absolute;inset:0;display:grid;place-items:center;color:#59656c;font-size:${U(36)};text-align:center}
.sp-detail-empty[hidden]{display:none}
.sp-buy .reg-body,.sp-buy .reg-tray{transition:transform .08s}
.sp-buy:active .reg-body,.sp-buy.press .reg-body{transform:translateY(6px)}
.sp-buy.press .reg-tray{animation:sptray .5s ease-out}
@keyframes sptray{0%{transform:translateY(0)}30%{transform:translateY(16px)}100%{transform:translateY(0)}}
.sp-buy.shake{animation:spshake .4s}
@keyframes spshake{0%,100%{transform:translateX(0)}20%{transform:translateX(${U(-10)})}40%{transform:translateX(${U(10)})}60%{transform:translateX(${U(-6)})}80%{transform:translateX(${U(6)})}}
.sp-coins{position:absolute;left:50%;top:18%;pointer-events:none}
.sp-coins i{position:absolute;left:0;top:0;font-style:normal;font-size:${U(56)};font-weight:900;color:#ffd23a;-webkit-text-stroke:${U(3)} #7a4e00;paint-order:stroke fill;text-shadow:none;opacity:0;animation:spcoin .9s ease-out forwards}
@keyframes spcoin{0%{opacity:1;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(var(--dx),${U(-160)}) scale(1.1)}}
`;
function spStyle(){if(spStyled)return;spStyled=true;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s)}

const BG=`<defs><linearGradient id="sp-dlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f6"/><stop offset="1" stop-color="#e3e9ec"/></linearGradient></defs>
<rect width="1554" height="763" fill="#e3e9ec"/>
<rect x="-8" y="-10" width="1570" height="790" rx="115" fill="url(#sp-dlg)" stroke="#c4cbd0" stroke-width="3"/>
<path d="M1150 330Q1400 270 1554 350V763H1100Z" fill="#dcefd5" opacity=".6"/>
<path d="M1140 160L1420 40" stroke="#e58a8a" stroke-opacity=".35" stroke-width="5" fill="none"/>
<polygon points="880,540 1010,540 960,620" fill="#f3c9c9" opacity=".5"/>
<path d="M900 640L1300 700" stroke="#e58a8a" stroke-opacity=".25" stroke-width="5" fill="none"/>`;

// kasir
const keys=Array.from({length:20},(_,i)=>`<rect x="${38+(i%4)*16}" y="${68+Math.floor(i/4)*14}" width="12" height="10" rx="2" fill="#c4c4c4" stroke="#6a6a6a" stroke-width="1.5"/>`).join('');
const btns=[['#f2e04a',160,74],['#1e9be0',160,98],['#2ac0d8',160,122],['#4cbf3a',190,70],['#35b04a',190,96],['#f0801c',190,122]]
  .map(([c,x,y])=>`<rect x="${x}" y="${y}" width="22" height="18" rx="3" fill="${c}" stroke="#2a2a2a" stroke-width="2"/>`).join('');
const REG=`<svg viewBox="0 0 244 244" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="rg-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e24a"/><stop offset=".55" stop-color="#eacb22"/><stop offset="1" stop-color="#c9a20f"/></linearGradient>
<linearGradient id="rg-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ececec"/><stop offset="1" stop-color="#b9b9b9"/></linearGradient></defs>
<g class="reg-body">
<polygon points="22,5 224,5 242,242 4,242" fill="url(#rg-b)" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
<polygon points="22,5 38,5 20,242 4,242" fill="#fff" opacity=".22"/><polygon points="224,5 210,5 228,242 242,242" fill="#000" opacity=".12"/>
<rect x="30" y="14" width="184" height="128" rx="4" fill="#f4de3c" stroke="#b8960e" stroke-width="2.5"/>
<rect x="102" y="20" width="108" height="34" rx="3" fill="#0d0d0d" stroke="#6b6b6b" stroke-width="3"/>
<rect x="105" y="23" width="102" height="7" fill="#3a3a3a" opacity=".6"/>
<rect x="40" y="31" width="48" height="6" rx="2" fill="#111"/>
<rect x="34" y="62" width="72" height="82" rx="3" fill="#8e8e8e"/>${keys}
<rect x="152" y="62" width="68" height="84" rx="3" fill="#9a9a52" opacity=".0"/>${btns}
<path d="M10 150H236" stroke="#b8960e" stroke-width="3"/><path d="M10 154H236" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
<g class="reg-tray"><rect x="22" y="178" width="205" height="46" rx="12" fill="url(#rg-t)" stroke="#111" stroke-width="4"/><path d="M122 196v12" stroke="#222" stroke-width="3"/></g>
</g></svg>`;

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function spSetIcon(box,icon){
  box.textContent='';
  if(icon instanceof Element){box.appendChild(icon.cloneNode(true));return}
  if(typeof icon==='function'){icon(box);return}
  if(typeof icon==='string'&&icon.startsWith('data:image/')){
    const im=new Image();im.src=icon;im.alt='';im.draggable=false;box.appendChild(im);return;
  }
  if(typeof icon==='string'){
    if(ICONS[icon])box.innerHTML=ICONS[icon];
    else if(icon.trim().startsWith('<'))box.innerHTML=icon;
    else{const im=new Image();im.src=icon;im.alt='';im.draggable=false;box.appendChild(im)}
    return;
  }
  box.innerHTML=ICONS.placeholder;
}
const spNorm=(it,i)=>Object.assign({id:'item-'+i,name:'(nama item)',price:0,description:'(deskripsi item)',icon:'placeholder'},it);

export function createShopPanel(root,opts={}){
  spStyle();
  const o=Object.assign({items:[],formatPrice:p=>'$'+p,onBuy:null,onSelect:null,selected:0},opts);
  root.classList.add('sp-root');
  root.innerHTML=`<div class="sp"><svg class="sp-bg" viewBox="0 0 1554 900" preserveAspectRatio="none">${BG}</svg><div class="sp-list" tabindex="0" role="listbox" aria-label="Toko"></div><section class="sp-detail" aria-live="polite"><div class="sp-detail-empty">Pilih alat untuk melihat pratinjau</div><div class="sp-icon" data-slot="icon"></div><div class="sp-name" data-slot="name"></div><div class="sp-desc" data-slot="description"></div><div class="sp-cost">Cost : <span data-slot="price"></span></div><button class="sp-buy" type="button" aria-label="Beli alat">${REG}<span class="sp-coins"></span></button></section></div>`;
  const list=root.querySelector('.sp-list');
  const detail=root.querySelector('.sp-detail'),previewBox=detail.querySelector('.sp-icon'),buyButton=detail.querySelector('.sp-buy');
  let items=[],sel=-1;

  function render(){
    list.innerHTML=items.map((it,i)=>`<div class="sp-row" role="option" aria-selected="false" data-index="${i}" data-id="${esc(it.id)}">
<div class="sp-icon" data-slot="icon"></div><div class="sp-row-copy"><div class="sp-row-name">${esc(it.name)}</div><div class="sp-row-price">${esc(o.formatPrice(it.price))}</div></div>
</div>`).join('');
    items.forEach((it,i)=>spSetIcon(list.children[i].querySelector('.sp-icon'),o.thumbnail?.(it.id)||it.icon));
    sel=-1;
  }
  function select(i,scroll=true){
    if(!items.length)return;
    i=Math.max(0,Math.min(items.length-1,+i||0));
    const rows=list.children;
    if(sel>=0&&rows[sel]){rows[sel].classList.remove('sel');rows[sel].setAttribute('aria-selected','false')}
    sel=i;rows[i].classList.add('sel');rows[i].setAttribute('aria-selected','true');
    if(scroll)list.scrollTo({top:rows[i].offsetTop-rows[0].offsetTop,behavior:'smooth'});
    const item=items[i];
    detail.querySelector('[data-slot="name"]').textContent=item.name;
    detail.querySelector('[data-slot="description"]').textContent=item.description;
    detail.querySelector('[data-slot="price"]').textContent=o.formatPrice(item.price);
    detail.querySelector('.sp-detail-empty').hidden=true;
    buyButton.disabled=false;buyButton.setAttribute('aria-label',`Beli ${item.name}`);
    o.onSelect&&o.onSelect(items[i],i);
    root.dispatchEvent(new CustomEvent('shop:select',{detail:{item:items[i],index:i}}));
  }
  function buy(i=sel){
    const it=items[i];if(!it)return false;
    audio();
    const btn=buyButton;
    let ok=true;
    if(o.onBuy){try{ok=o.onBuy(it,i)}catch(e){console.error(e);ok=false}}
    if(ok===false){nope();btn.classList.add('shake');setTimeout(()=>btn.classList.remove('shake'),420);return false}
    ching();
    btn.classList.add('press');setTimeout(()=>btn.classList.remove('press'),520);
    const coins=btn.querySelector('.sp-coins');
    for(let k=0;k<3;k++){const c=document.createElement('i');c.textContent='$';c.style.setProperty('--dx',`calc(var(--u)*${(k-1)*70})`);c.style.animationDelay=(k*.07)+'s';coins.appendChild(c);setTimeout(()=>c.remove(),1100)}
    root.dispatchEvent(new CustomEvent('shop:buy',{detail:{item:it,index:i}}));
    const scrollTop=list.scrollTop;items.splice(i,1);render();list.scrollTop=scrollTop;
    if(items.length)select(Math.min(i,items.length-1),false);
    else{
      sel=-1;previewBox.replaceChildren();detail.querySelector('[data-slot="name"]').textContent='';
      detail.querySelector('[data-slot="description"]').textContent='';
      detail.querySelector('[data-slot="price"]').textContent='';
      detail.querySelector('.sp-detail-empty').hidden=false;buyButton.disabled=true;
      o.onSelect?.(null,-1);
    }
    return true;
  }
  function setItems(arr){items=(arr||[]).map(spNorm);render();if(items.length)select(o.selected,false);else{detail.querySelector('.sp-detail-empty').hidden=false;buyButton.disabled=true}}

  list.addEventListener('click',e=>{
    const row=e.target.closest('.sp-row');if(!row)return;
    const i=+row.dataset.index;
    if(i!==sel)select(i,false);
  });
  buyButton.addEventListener('click',()=>buy());
  list.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();select(sel+1)}
    else if(e.key==='ArrowUp'){e.preventDefault();select(sel-1)}
    else if(e.key==='Enter'){e.preventDefault();buy()}
  });
  setItems(o.items);
  return {el:root,list,setItems,select,buy,get selected(){return items[sel]},destroy(){root.innerHTML='';root.classList.remove('sp-root')}};
}
