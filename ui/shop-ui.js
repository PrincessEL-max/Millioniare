import { audio as unlockAudio, ching as playChing, nope as playDenied, tuk as playTick } from './sound.js';

const SHP_STYLE = `
.shp-root{container-type:inline-size;position:relative;aspect-ratio:1554/763;max-width:100%;pointer-events:auto;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;transition:opacity .25s,transform .25s;font-family:"Trebuchet MS","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
@media (max-width:640px){.shp-root{aspect-ratio:1554/1000}}
.shp-out{opacity:0;transform:scale(.96)}
.shp-in{--u:calc(100cqw/1554);position:absolute;inset:0;overflow:hidden;border-radius:calc(var(--u)*72)}
.shp-bg{position:absolute;inset:0;background:linear-gradient(135deg,rgba(246,249,252,.8),rgba(224,230,238,.8));box-shadow:inset 0 0 0 calc(var(--u)*3) rgba(255,255,255,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.shp-list{position:absolute;left:0;top:0;width:calc(var(--u)*1170);height:100%;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;scroll-padding-top:calc(var(--u)*15);padding-top:calc(var(--u)*15);box-sizing:border-box;scrollbar-width:none;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;transition:opacity .35s}
.shp-list::-webkit-scrollbar{display:none}
.shp-list.shp-gone{opacity:0;pointer-events:none}
.shp-item{position:relative;height:calc(var(--u)*515);width:calc(var(--u)*1115);margin:0 0 calc(var(--u)*20) calc(var(--u)*20);scroll-snap-align:start;cursor:pointer;color:#fff}
.shp-item::before{content:"";position:absolute;inset:0;border-radius:calc(var(--u)*72);background:linear-gradient(#bbc3cc 0,#c6ccd4 52%,#d5dae0 53%,#c2c9d1 100%);box-shadow:inset 0 calc(var(--u)*3) 0 rgba(255,255,255,.45),0 calc(var(--u)*6) calc(var(--u)*18) rgba(0,0,0,.18);opacity:0;transition:opacity .25s}
.shp-active::before{opacity:1}
.shp-sold{height:0!important;margin-bottom:0!important;opacity:0;overflow:hidden;pointer-events:none;transition:height .4s ease,margin .4s ease,opacity .3s ease}
.shp-t,.shp-d,.shp-c{position:absolute;margin:0;text-shadow:0 calc(var(--u)*5) 0 rgba(104,114,128,.85),0 0 calc(var(--u)*6) rgba(104,114,128,.5)}
.shp-t{left:calc(var(--u)*45);top:calc(var(--u)*6);font-size:calc(var(--u)*100);line-height:1.12;font-style:italic;font-weight:800;letter-spacing:.02em;white-space:nowrap}
.shp-i{position:absolute;left:calc(var(--u)*150);top:calc(var(--u)*105);width:calc(var(--u)*350);height:calc(var(--u)*315);object-fit:contain;pointer-events:none;filter:drop-shadow(0 calc(var(--u)*8) calc(var(--u)*8) rgba(0,0,0,.28))}
.shp-d{left:calc(var(--u)*515);top:calc(var(--u)*118);width:calc(var(--u)*560);font-size:calc(var(--u)*56);line-height:1.1;font-weight:700;letter-spacing:.1em}
.shp-c{left:calc(var(--u)*517);top:calc(var(--u)*400);font-size:calc(var(--u)*52);font-weight:800;font-style:italic;letter-spacing:.08em}
.shp-end{height:calc(100% - var(--u)*535);min-height:1px}
.shp-reg,.shp-door{position:absolute;cursor:pointer;transition:transform .08s,filter .2s;outline:none}
.shp-reg{left:calc(var(--u)*1290);bottom:calc(var(--u)*211);width:calc(var(--u)*240);height:calc(var(--u)*240)}
.shp-door{left:calc(var(--u)*1338);bottom:calc(var(--u)*-3);width:calc(var(--u)*148);height:calc(var(--u)*191)}
.shp-reg svg,.shp-door svg{display:block;width:100%;height:100%;overflow:visible}
.shp-reg:active,.shp-door:active{transform:scale(.94)}
.shp-reg:focus-visible,.shp-door:focus-visible{filter:drop-shadow(0 0 calc(var(--u)*6) #fff)}
.shp-reg.shp-off{filter:grayscale(.85) brightness(.85);cursor:default}
.shp-pop{animation:shp-pop .5s ease-out}.shp-shake{animation:shp-shake .4s}
@keyframes shp-pop{0%{transform:scale(1)}35%{transform:scale(1.14) rotate(-3deg)}100%{transform:scale(1)}}
@keyframes shp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(calc(var(--u)*-14))}40%{transform:translateX(calc(var(--u)*12))}60%{transform:translateX(calc(var(--u)*-8))}80%{transform:translateX(calc(var(--u)*6))}}
.shp-coin{position:absolute;width:calc(var(--u)*34);height:calc(var(--u)*34);border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3a8,#ffd84a 55%,#c98a00);border:calc(var(--u)*3) solid #b57a00;pointer-events:none;animation:shp-coin .9s ease-out forwards}
@keyframes shp-coin{0%{transform:translate(0,0) scale(.5);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1);opacity:0}}
.shp-msg{position:absolute;left:calc(var(--u)*20);top:calc(var(--u)*15);width:calc(var(--u)*1115);height:calc(var(--u)*515);border-radius:calc(var(--u)*72);background:linear-gradient(#bbc3cc,#d5dae0);display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*36);color:#fff;font-size:calc(var(--u)*64);font-weight:800;font-style:italic;text-shadow:0 calc(var(--u)*5) 0 rgba(104,114,128,.85);text-align:left;opacity:0;pointer-events:none;transition:opacity .35s}
.shp-msg.shp-show{opacity:1}
.shp-msg img{width:calc(var(--u)*300);height:calc(var(--u)*300);object-fit:contain}
.shp-msg[hidden]{display:none}
.shp-toast{position:absolute;left:50%;bottom:calc(var(--u)*24);transform:translateX(-50%) translateY(calc(var(--u)*20));background:rgba(28,28,36,.86);color:#fff;font-size:calc(var(--u)*40);font-weight:700;padding:calc(var(--u)*12) calc(var(--u)*34);border-radius:999px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;white-space:nowrap}
.shp-toast.shp-show{opacity:1;transform:translateX(-50%)}
@media (prefers-reduced-motion:reduce){.shp-pop,.shp-shake,.shp-coin{animation:none}}
`;
const SHP_REG = `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<linearGradient id="shpY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff27c"/><stop offset=".55" stop-color="#f4da2e"/><stop offset="1" stop-color="#d3ad0c"/></linearGradient>
<linearGradient id="shpD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ececec"/><stop offset="1" stop-color="#9a9a9a"/></linearGradient>
<linearGradient id="shpS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#000"/></linearGradient></defs>
<polygon points="18,0 222,0 240,238 0,238" fill="#0d0d0d"/><polygon points="25,7 215,7 231,231 9,231" fill="url(#shpY)"/>
<rect x="100" y="12" width="110" height="36" rx="4" fill="#000"/><rect x="104" y="16" width="102" height="28" rx="3" fill="url(#shpS)"/><rect x="108" y="19" width="94" height="4" fill="#fff" opacity=".18"/>
<rect x="34" y="26" width="42" height="5" fill="#111"/>
<g fill="#b5b5b5" stroke="#555" stroke-width="1.5">${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${36 + c * 22}" y="${62 + r * 20}" width="18" height="15" rx="2"/>`).join('')).join('')}</g>
<g stroke="#222" stroke-width="1.2">${[['#e9de5c', '#4cc04a'], ['#3a8ee0', '#4cc04a'], ['#35c8de', '#3a8ee0'], ['#3a8ee0', '#e5842c']].map((p, r) => `<rect x="156" y="${64 + r * 19}" width="24" height="15" fill="${p[0]}"/><rect x="186" y="${64 + r * 19}" width="24" height="15" fill="${p[1]}"/>`).join('')}</g>
<rect x="22" y="168" width="196" height="52" rx="9" fill="#0d0d0d"/><rect x="26" y="172" width="188" height="44" rx="7" fill="url(#shpD)"/><rect x="118" y="192" width="4" height="9" fill="#444"/></svg>`;
const SHP_DOOR = `<svg viewBox="0 0 148 191" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="shpDY" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe94a"/><stop offset="1" stop-color="#e2bd16"/></linearGradient></defs>
<rect x="0" y="0" width="148" height="191" fill="#0d0d0d"/><polygon points="9,10 98,24 98,191 9,191" fill="url(#shpDY)"/><polygon points="9,10 98,24 98,31 9,17" fill="#fff6a0" opacity=".6"/>
<g fill="#161616"><rect x="20" y="95" width="46" height="17"/><polygon points="62,78 88,103.5 62,129"/></g></svg>`;
const SHP_CHECK = `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="120" cy="120" r="110" fill="#0d0d0d"/><circle cx="120" cy="120" r="99" fill="#65bd57"/><path d="M58 122l42 42 84-91" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SHP_CLOSE = `<svg viewBox="0 0 148 191" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="148" height="191" fill="#0d0d0d"/><rect x="9" y="10" width="130" height="171" rx="24" fill="#e25151"/><path d="M48 51l52 89M100 51l-52 89" fill="none" stroke="#fff" stroke-width="17" stroke-linecap="round"/></svg>`;
let shpStyled = false; const shpThumbs = {};
const shpEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SHP_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="16" fill="#9aa3ae"/><text x="50" y="66" font-size="48" text-anchor="middle" fill="#fff" font-family="Arial">?</text></svg>');

/**
 * Buka toko. Setiap alat hanya bisa dibeli 1 kali: alat yang sudah dibeli (atau sudah dimiliki) hilang dari daftar,
 * alat lain tetap tersedia dan bisa dibeli selama uangnya cukup. Toko ditutup lewat pintu (atau Escape).
 * Returns the purchased items and total spent when the shop closes.
 * Opsi: cash (uang pemain), owned (array id alat yang sudah dimiliki), mount, items (katalog), thumbs ({id: dataURL}),
 *   sound, width, texts, onBuy(item), dan mode='inventory' untuk memilih alat yang disimpan.
 */
export async function openShop(opts = {}) {
  const o = Object.assign({ cash: 0, owned: [], mount: document.body, items: [], thumbs: null, sound: true, width: 'min(96vw, 980px)', texts: {}, onBuy: null, mode: 'shop', onSelect: null }, opts);
  const inventoryMode = o.mode === 'inventory';
  const TX = Object.assign({ poor: 'Uang tidak cukup', all: inventoryMode ? 'Penyimpanan alat kosong' : 'Semua alat sudah dimiliki!', bought: 'Dibeli!' }, o.texts);
  const have = new Set(Array.isArray(o.owned) || o.owned instanceof Set ? [...o.owned] : []);
  const items = o.items.filter(it => !have.has(it.id));
  if (!shpStyled) { shpStyled = true; const st = document.createElement('style'); st.id = 'shp-style'; st.textContent = SHP_STYLE; document.head.appendChild(st); }
  if (o.thumbs) Object.assign(shpThumbs, o.thumbs);
  const src = it => shpThumbs[it.id] || SHP_PLACEHOLDER;

  const rows = items.map((it, i) => `<section class="shp-item" role="option" aria-selected="false" data-i="${i}"><h2 class="shp-t">${shpEsc(it.name)}</h2><img class="shp-i" alt="${shpEsc(it.name)}" draggable="false" src="${src(it)}"><p class="shp-d">${shpEsc(it.desc)}</p><p class="shp-c">${inventoryMode ? 'Tersimpan' : `Cost: $${it.price}`}</p></section>`).join('');
  const root = document.createElement('div'); root.className = 'shp-root'; root.style.width = o.width;
  root.innerHTML = `<div class="shp-in"><div class="shp-bg"></div><div class="shp-list" role="listbox" aria-label="${inventoryMode ? 'Penyimpanan alat' : 'Toko'}">${rows}<div class="shp-end"></div></div><div class="shp-msg" hidden></div><div class="shp-reg" role="button" tabindex="0" aria-label="${inventoryMode ? 'Gunakan alat pilihan' : 'Beli alat pilihan'}">${inventoryMode ? SHP_CHECK : SHP_REG}</div><div class="shp-door" role="button" tabindex="0" aria-label="${inventoryMode ? 'Tutup penyimpanan' : 'Keluar dari toko'}">${inventoryMode ? SHP_CLOSE : SHP_DOOR}</div><div class="shp-toast"></div></div>`;
  o.mount.appendChild(root);
  const q = s => root.querySelector(s), list = q('.shp-list'), rowEls = [...root.querySelectorAll('.shp-item')], reg = q('.shp-reg'), door = q('.shp-door'), msg = q('.shp-msg'), toast = q('.shp-toast');
  let cash = o.cash, cur = -1, busy = false, finished = false, toastT = 0; const bought = [];
  const pitch = () => (rowEls[1] && rowEls[1].offsetTop - rowEls[0].offsetTop) || (rowEls[0] && rowEls[0].offsetHeight) || 1;
  const select = i => { const n = rowEls.length; if (!n) return; i = Math.max(0, Math.min(n - 1, i)); if (i === cur) return; const first = cur < 0; cur = i; rowEls.forEach((el, k) => { el.classList.toggle('shp-active', k === i); el.setAttribute('aria-selected', k === i ? 'true' : 'false'); }); if (!first && o.sound) playTick(0.35); };
  const goTo = (i, instant) => { i = Math.max(0, Math.min(rowEls.length - 1, i)); if (!instant && list.scrollTo) list.scrollTo({ top: i * pitch(), behavior: 'smooth' }); else list.scrollTop = i * pitch(); select(i); };
  const say = (t, ms = 1600) => { toast.textContent = t; toast.classList.add('shp-show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('shp-show'), ms); };
  const empty = () => { list.classList.add('shp-gone'); reg.classList.add('shp-off'); msg.innerHTML = `<span>${shpEsc(TX.all)}</span>`; msg.hidden = false; void msg.offsetWidth; msg.classList.add('shp-show'); };
  const pack = it => ({ id: it.id, name: it.name, price: it.price, desc: it.desc, thumb: src(it), index: it.index });
  if (!items.length) empty(); else select(0);

  return new Promise(resolve => {
    const close = (delay, selected = null) => { if (finished) return; finished = true; setTimeout(() => root.classList.add('shp-out'), Math.max(0, delay - 250)); setTimeout(() => { root.remove(); resolve({ bought: bought.map(pack), spent: bought.reduce((a, it) => a + it.price, 0), selected }); }, delay); };
    root.addEventListener('pointerdown', () => unlockAudio(), { capture: true });
    list.addEventListener('scroll', () => { if (!busy) select(Math.round(list.scrollTop / pitch())); }, { passive: true });
    rowEls.forEach(el => el.addEventListener('click', () => { const k = rowEls.indexOf(el); if (!busy && k >= 0 && k !== cur) goTo(k); }));
    const buy = () => {
      if (finished || busy || cur < 0 || !rowEls.length) return; const it = items[cur];
      if (inventoryMode) {
        if (o.onSelect) o.onSelect(pack(it));
        if (o.sound) playTick(0.5);
        close(200, pack(it));
        return;
      }
      if (cash < it.price) { reg.classList.remove('shp-shake'); void reg.offsetWidth; reg.classList.add('shp-shake'); say(`${TX.poor} ($${it.price})`); if (o.sound) playDenied(); return; }
      if (o.onBuy && o.onBuy(pack(it)) === false) { reg.classList.remove('shp-shake'); void reg.offsetWidth; reg.classList.add('shp-shake'); say(TX.poor); if (o.sound) playDenied(); return; }
      cash -= it.price; bought.push(it); busy = true;
      if (o.sound) playChing();
      reg.classList.remove('shp-pop'); void reg.offsetWidth; reg.classList.add('shp-pop'); say(`${it.name} - ${TX.bought}`, 1500);
      const inRect = q('.shp-in'); for (let i = 0; i < 9; i++) { const c = document.createElement('div'), a = -Math.PI / 2 + (i - 4) * 0.45; c.className = 'shp-coin'; c.style.left = 'calc(var(--u)*1390)'; c.style.top = `calc(var(--u)*${763 - 211 - 140})`; c.style.setProperty('--dx', `calc(var(--u)*${Math.round(Math.cos(a) * (120 + (i % 3) * 40))})`); c.style.setProperty('--dy', `calc(var(--u)*${Math.round(Math.sin(a) * (150 + (i % 2) * 50))})`); inRect.appendChild(c); setTimeout(() => c.remove(), 950); }
      // alat yang sudah dibeli menciut lalu hilang dari daftar; yang lain tetap
      const idx = cur, el = rowEls[idx]; items.splice(idx, 1); rowEls.splice(idx, 1); el.classList.remove('shp-active'); el.classList.add('shp-sold'); cur = -1;
      if (rowEls.length) select(Math.min(idx, rowEls.length - 1));
      setTimeout(() => { el.remove(); busy = false; if (!rowEls.length) empty(); else goTo(Math.min(idx, rowEls.length - 1), true); }, 420);
    };
    const bind = (el, fn) => { el.addEventListener('click', fn); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); };
    bind(reg, buy); bind(door, () => { if (o.sound) playTick(0.5); close(200); });
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(200); return; }
      if (busy || !rowEls.length) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(cur + 1); } else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(cur - 1); }
    });
  });
}
