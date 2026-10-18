// Lelang untuk alat FOR RENT: juru lelang, gelembung ucapan, BID, SKIP, dan foto pemain dengan uangnya.
//   const r = await runAuction({ mount, price: 140, players: [{ id:0, name:'You', type:'princess', color:'#e53935', cash:817, human:true }, { id:1, ... }, ...], step: 100 });
//   r = { sold, winnerId, price, skipped, bids: [{ id, price }] }     (uang TIDAK dipotong di sini; game yang memotong)
// Aturan: harga mulai = harga asli lahan, tiap tawaran naik +step (100). Pemegang tawaran tertinggi ditandai papan BID.
// Player mengetuk fotonya untuk menawar; SKIP = player berhenti ikut dan hasilnya ditentukan komputer saja (dipercepat).
import { avatarPortraitSVG } from './avatar-portraits.js';
import { playEffect } from '../src/audio.js';
const unlockAudio=()=>{},playTick=()=>playEffect('coins'),playTuk=()=>playEffect('coins'),
  playChaChing=()=>playEffect('coins'),playDenied=()=>playEffect('bank');

/* ---------- logika murni (bisa dites tanpa tampilan) ---------- */
export function createAuction({ price, step = 100, players, rng = Math.random }) {
  const st = { price, step, holder: null, bid: null, next: price, bids: [], out: new Set(), players: players.map(p => Object.assign({}, p)) };
  st.players.forEach(p => { p.max = p.human ? Infinity : Math.min(p.cash, price * (0.9 + rng() * 1.7)); p.eager = 0.75 + rng() * 0.25; });
  const by = id => st.players.find(p => p.id === id);
  st.canBid = p => !!p && !st.out.has(p.id) && p.id !== st.holder && p.cash >= st.next;
  st.candidates = () => st.players.filter(p => !p.human && st.canBid(p) && st.next <= p.max && rng() < p.eager);
  st.place = id => { const p = by(id); if (!st.canBid(p)) return false; st.holder = id; st.bid = st.next; st.next = st.bid + step; st.bids.push({ id, price: st.bid }); return true; };
  st.result = () => st.holder == null ? { sold: false, winnerId: null, price: 0, bids: st.bids } : { sold: true, winnerId: st.holder, price: st.bid, bids: st.bids };
  st.by = by; return st;
}

/* ---------- gambar ---------- */
const MAN = `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M8 150 C8 114 30 100 60 100 C90 100 112 114 112 150Z" fill="#2a2a32" stroke="#101014" stroke-width="3"/><path d="M44 101 L60 130 L76 101Z" fill="#fff" stroke="#9aa" stroke-width="1.5"/>
<path d="M55 112 L65 112 L68 140 L60 148 L52 140Z" fill="#f06aa8" stroke="#8a2a64" stroke-width="1.5"/><path d="M54 122 L66 119 M53 130 L67 127 M54 138 L66 135" stroke="#3a5ac8" stroke-width="2.4"/>
<rect x="50" y="86" width="20" height="18" fill="#e9a468"/>
<ellipse cx="60" cy="62" rx="31" ry="35" fill="#f7b87a" stroke="#8a5020" stroke-width="2.5"/><ellipse cx="34" cy="68" rx="5" ry="9" fill="#f0a468" stroke="#8a5020" stroke-width="2"/><ellipse cx="86" cy="68" rx="5" ry="9" fill="#f0a468" stroke="#8a5020" stroke-width="2"/>
<path d="M29 58 C26 28 46 17 60 17 C74 17 94 28 91 58 C86 44 74 37 60 37 C46 37 34 44 29 58Z" fill="#f4f4f4" stroke="#a0a0a0" stroke-width="2"/>
<g fill="#f4f4f4" stroke="#a0a0a0" stroke-width="2"><circle cx="28" cy="52" r="9"/><circle cx="25" cy="66" r="8"/><circle cx="92" cy="52" r="9"/><circle cx="95" cy="66" r="8"/><circle cx="40" cy="26" r="8"/><circle cx="80" cy="26" r="8"/><circle cx="60" cy="20" r="8"/></g>
<circle cx="45" cy="63" r="12" fill="rgba(255,255,255,.4)" stroke="#222" stroke-width="3.2"/><circle cx="75" cy="63" r="12" fill="rgba(255,255,255,.4)" stroke="#222" stroke-width="3.2"/><path d="M57 62 Q60 59 63 62" fill="none" stroke="#222" stroke-width="3"/>
<circle cx="45" cy="64" r="6" fill="#e8902a"/><circle cx="75" cy="64" r="6" fill="#e8902a"/><circle cx="45" cy="64" r="3" fill="#201008"/><circle cx="75" cy="64" r="3" fill="#201008"/><circle cx="43" cy="61.5" r="1.8" fill="#fff"/><circle cx="73" cy="61.5" r="1.8" fill="#fff"/>
<ellipse cx="60" cy="76" rx="6.5" ry="5" fill="#ea9a5c"/>
<path d="M34 84 C42 74 55 78 60 83 C65 78 78 74 86 84 C82 97 68 94 60 90 C52 94 38 97 34 84Z" fill="#f6f6f6" stroke="#a0a0a0" stroke-width="2"/>
<ellipse cx="60" cy="99" rx="5.5" ry="2.6" fill="#b04a3a"/>
<circle cx="97" cy="136" r="11" fill="#f2aa6c" stroke="#8a5020" stroke-width="2"/>
<g class="au-gavel"><rect x="19" y="88" width="6" height="46" rx="2.5" fill="#8a5a2a" stroke="#4a2a0a" stroke-width="1.5"/><rect x="4" y="80" width="36" height="17" rx="4" fill="#c98a4a" stroke="#6a3d12" stroke-width="2"/><rect x="10" y="80" width="4" height="17" fill="#8a5a2a"/><rect x="30" y="80" width="4" height="17" fill="#8a5a2a"/><circle cx="23" cy="136" r="11" fill="#f2aa6c" stroke="#8a5020" stroke-width="2"/></g></svg>`;

const AU_STYLE = `
.au-root{position:absolute;inset:0;container-type:size;--u:min(1cqh,.58cqw);z-index:60;font-family:"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif;-webkit-user-select:none;user-select:none;touch-action:manipulation;animation:au-in .25s ease-out;pointer-events:none}
.au-root>*{pointer-events:auto}
@keyframes au-in{from{opacity:0}to{opacity:1}}
.au-ts{color:#fff;font-style:italic;font-weight:900;letter-spacing:.04em;-webkit-text-stroke:calc(var(--u)*.9) #6b7380;paint-order:stroke fill;text-shadow:0 calc(var(--u)*.5) 0 rgba(60,68,80,.6)}
.au-cost{position:absolute;left:calc(var(--u)*4);top:calc(var(--u)*2.2);font-size:calc(var(--u)*7);line-height:1.1}
.au-bub{position:absolute;right:calc(var(--u)*5.5);top:calc(var(--u)*2.5);width:calc(var(--u)*98);min-height:calc(var(--u)*32);box-sizing:border-box;padding:calc(var(--u)*3.2) calc(var(--u)*5);border-radius:calc(var(--u)*7);background:linear-gradient(#d9dee5,#c5ccd5);border:calc(var(--u)*.8) solid #4b525d;box-shadow:inset 0 calc(var(--u)*.6) 0 rgba(255,255,255,.55),0 calc(var(--u)*1) calc(var(--u)*2) rgba(0,0,0,.3);display:flex;align-items:center}
.au-bub:after{content:"";position:absolute;right:calc(var(--u)*13);bottom:calc(var(--u)*-5.2);width:calc(var(--u)*7);height:calc(var(--u)*7);background:#c5ccd5;border-right:calc(var(--u)*.8) solid #4b525d;border-bottom:calc(var(--u)*.8) solid #4b525d;transform:skewX(-35deg) rotate(35deg) translateX(calc(var(--u)*1));clip-path:polygon(100% 0,100% 100%,0 100%);transform-origin:top right}
.au-txt{margin:0;font-size:calc(var(--u)*8.6);line-height:1.18;animation:au-pop .22s ease-out}
@keyframes au-pop{from{transform:scale(.94);opacity:.4}to{transform:none;opacity:1}}
.au-man{position:absolute;right:calc(var(--u)*3);bottom:calc(var(--u)*8);width:calc(var(--u)*36);height:calc(var(--u)*45)}.au-man svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 calc(var(--u)*.8) calc(var(--u)*.8) rgba(0,0,0,.3))}
.au-gavel{transform-box:fill-box;transform-origin:50% 90%;transform:rotate(-14deg);transition:transform .18s}.au-hit .au-gavel{animation:au-hit .45s ease-in}
@keyframes au-hit{0%{transform:rotate(-14deg)}35%{transform:rotate(-48deg)}60%{transform:rotate(14deg)}100%{transform:rotate(-14deg)}}
.au-skip{position:absolute;right:calc(var(--u)*2.5);bottom:calc(var(--u)*.8);border:0;background:none;cursor:pointer;padding:0 calc(var(--u)*2);font-family:inherit;font-size:calc(var(--u)*14);line-height:1;font-style:italic;font-weight:900;letter-spacing:.03em;color:#ee1c9d;-webkit-text-stroke:calc(var(--u)*1.3) #fff;paint-order:stroke fill;text-shadow:0 calc(var(--u)*1) 0 #8a0f62,0 calc(var(--u)*1.8) calc(var(--u)*1) rgba(0,0,0,.4);transition:transform .12s;-webkit-tap-highlight-color:transparent}
.au-skip:hover{transform:scale(1.07)}.au-skip:active{transform:scale(.94)}.au-skip[hidden]{display:none}.au-skip:focus-visible{outline:calc(var(--u)*.7) solid #fff;border-radius:calc(var(--u)*2)}
.au-pls{position:absolute;left:calc(var(--u)*3);bottom:calc(var(--u)*1.2);display:flex;gap:calc(var(--u)*2.4);align-items:flex-end}
.au-pl{position:relative;width:calc(var(--u)*18.5);text-align:center;transition:filter .3s,opacity .3s}
.au-av{width:calc(var(--u)*15.5);height:calc(var(--u)*15.5);margin:0 auto;position:relative;border:0;padding:0;background:none;display:block;cursor:default}.au-av svg{display:block;width:100%;height:100%;filter:drop-shadow(0 calc(var(--u)*.7) calc(var(--u)*.6) rgba(0,0,0,.35))}
.au-mn{margin-top:calc(var(--u)*.5);font-size:calc(var(--u)*5.6);line-height:1.1}
.au-pl.au-off{filter:grayscale(.9) brightness(.8);opacity:.75}
.au-me .au-av{cursor:pointer;transition:transform .12s}.au-me .au-av:hover{transform:scale(1.07)}.au-me .au-av:active{transform:scale(.92)}.au-me:not(.au-off) .au-av:after{content:"";position:absolute;inset:calc(var(--u)*-1);border-radius:calc(var(--u)*4.5);border:calc(var(--u)*.7) solid rgba(255,255,255,.85);animation:au-ring 1.3s ease-out infinite}
@keyframes au-ring{from{transform:scale(.9);opacity:1}to{transform:scale(1.25);opacity:0}}
.au-tip{position:absolute;left:50%;bottom:calc(100% + var(--u)*1);transform:translateX(-50%);white-space:nowrap;padding:calc(var(--u)*.8) calc(var(--u)*2.2);border-radius:999px;background:rgba(20,24,34,.88);color:#fff;font-size:calc(var(--u)*3.4);font-weight:800;pointer-events:none}.au-tip[hidden]{display:none}
.au-sign{position:absolute;left:50%;bottom:calc(100% - var(--u)*3.5);width:calc(var(--u)*15);height:calc(var(--u)*17);margin-left:calc(var(--u)*-7.5);opacity:0;transform:translateY(calc(var(--u)*-6));transition:opacity .15s,transform .25s cubic-bezier(.3,1.6,.5,1);pointer-events:none;z-index:2}
.au-hold .au-sign{opacity:1;transform:none}.au-tip~.au-sign{}
.au-sign b{display:block;box-sizing:border-box;height:calc(var(--u)*8.8);border-radius:calc(var(--u)*1.4);background:linear-gradient(#ffd44a,#e9a410);border:calc(var(--u)*.7) solid #5a3a00;color:#1a1000;font-size:calc(var(--u)*6.6);line-height:calc(var(--u)*7.6);font-weight:900;letter-spacing:.02em;text-align:center;box-shadow:inset 0 calc(var(--u)*.5) 0 rgba(255,255,255,.5)}
.au-sign i{display:block;width:calc(var(--u)*2.6);height:calc(var(--u)*7);margin:0 auto;background:linear-gradient(90deg,#f0b020,#c88a10);border:calc(var(--u)*.5) solid #5a3a00;border-top:0}
@media (prefers-reduced-motion:reduce){.au-root,.au-txt,.au-sign,.au-hit .au-gavel,.au-me .au-av:after{animation:none;transition:none}}
`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let auStyled = false;

export function promptAuctionBid({ mount = document.body, property, bid, minBid, players = [], activePlayer, leader = -1 } = {}) {
  if (!auStyled) { auStyled = true; const st = document.createElement('style'); st.id = 'au-style'; st.textContent = AU_STYLE; document.head.appendChild(st); }
  const root = document.createElement('div');
  root.className = 'au-root';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', `Lelang ${property}`);
  root.innerHTML = `<div class="au-cost au-ts">Minimum $${minBid}</div><div class="au-bub"><p class="au-txt au-ts" aria-live="polite">TAWARAN TERTINGGI: $${Math.max(0,bid)}<br>Giliran ${esc(activePlayer?.n||'pemain')} menawar</p></div><div class="au-man">${MAN}</div><button class="au-skip">PASS</button>
<div class="au-pls">${players.map(p => `<div class="au-pl${p.i===activePlayer?.i?' au-me':''}${p.i===leader?' au-hold':''}" data-id="${p.i}"><div class="au-tip" hidden></div><div class="au-sign"><b>BID</b><i></i></div><button class="au-av" ${p.i===activePlayer?.i?'':'tabindex="-1" aria-hidden="true"'} aria-label="${esc(p.n)}">${avatarPortraitSVG(p.avatarType||'princess',p.css||'#8794a4')}</button><div class="au-mn au-ts">$${p.cash}</div></div>`).join('')}</div>`;
  mount.appendChild(root);
  let finished=false;
  return new Promise(resolve=>{
    const finish=value=>{
      if(finished)return;
      if(value!==false)playTick(.7);
      finished=true;window.removeEventListener('keydown',onKey);
      root.remove();resolve(value);
    };
    const onKey=event=>{
      if(event.key==='Enter'){event.preventDefault();finish(minBid)}
      else if(event.key==='Escape'){event.preventDefault();finish(false)}
    };
    root.querySelector('.au-me .au-av')?.addEventListener('click',()=>finish(minBid));
    root.querySelector('.au-skip').addEventListener('click',()=>finish(false));
    root.addEventListener('pointerdown',unlockAudio,{capture:true});
    window.addEventListener('keydown',onKey);
  });
}

export function runAuction(opts = {}) {
  const o = Object.assign({ mount: document.body, price: 100, step: 100, players: [], sound: true, rng: Math.random, speed: 1, autoSkipHuman: false, onStart: null, onBid: null, onEnd: null, texts: {} }, opts);
  const TX = Object.assign({
    intro: "Today's AUCTION.", start: p => `Starting bid $${p}.`, current: (n, p) => `CURRENT BID: ${n} FOR $${p}.`, once: 'Going once...', twice: 'Going twice...',
    sold: (n, p) => `SOLD TO ${n} FOR $${p}.`, none: 'No bids. Auction closed.', skip: 'SKIP', cost: p => `Cost: $${p}`, tap: p => `Tap to bid $${p}`
  }, o.texts);
  if (!auStyled) { auStyled = true; const st = document.createElement('style'); st.id = 'au-style'; st.textContent = AU_STYLE; document.head.appendChild(st); }
  const eng = createAuction({ price: o.price, step: o.step, players: o.players, rng: o.rng }), snd = f => { if (o.sound) { try { f(); } catch (e) {} } };
  const me = eng.players.find(p => p.human);
  const root = document.createElement('div'); root.className = 'au-root'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Auction');
  root.innerHTML = `<div class="au-cost au-ts"></div><div class="au-bub"><p class="au-txt au-ts" aria-live="polite"></p></div><div class="au-man">${MAN}</div><button class="au-skip">${esc(TX.skip)}</button>
<div class="au-pls">${eng.players.map(p => `<div class="au-pl${p.human ? ' au-me' : ''}" data-id="${esc(p.id)}"><div class="au-tip" hidden></div><div class="au-sign"><b>BID</b><i></i></div><button class="au-av" ${p.human ? '' : 'tabindex="-1" aria-hidden="true"'} aria-label="${esc(p.name)}">${avatarPortraitSVG(p.type || 'princess', p.color || '#8794a4')}</button><div class="au-mn au-ts">$${p.cash}</div></div>`).join('')}</div>`;
  o.mount.appendChild(root);
  const q = s => root.querySelector(s), txt = q('.au-txt'), cost = q('.au-cost'), man = q('.au-man'), skipBtn = q('.au-skip'), els = new Map(eng.players.map(p => [p.id, root.querySelector(`.au-pl[data-id="${CSS.escape(String(p.id))}"]`)]));
  let phase = 'intro', speed = o.speed, skipped = false, finished = false, tBid = 0, tSale = 0, tOnce = 0, tTwice = 0, tEnd = 0, tStart = 0; const timers = new Set(), later = (f, ms) => { const t = setTimeout(() => { timers.delete(t); f(); }, ms); timers.add(t); return t; };
  if (!me || o.autoSkipHuman) { skipped = !!me; skipBtn.hidden = true; speed *= 2.4; }
  const say = t => { txt.textContent = t; txt.style.animation = 'none'; void txt.offsetWidth; txt.style.animation = ''; };
  const hit = () => { man.classList.remove('au-hit'); void man.offsetWidth; man.classList.add('au-hit'); };
  const refresh = () => {
    cost.textContent = phase === 'intro' ? '' : TX.cost(eng.holder == null ? eng.price : eng.bid);
    eng.players.forEach(p => { const el = els.get(p.id); el.classList.toggle('au-hold', p.id === eng.holder); const off = phase === 'bid' && !eng.canBid(p) && p.id !== eng.holder; el.classList.toggle('au-off', (p.human && skipped) || (!p.human && off && eng.next > p.cash)); });
    const tip = me && root.querySelector('.au-me .au-tip'); if (tip) { const can = phase === 'bid' && !skipped && eng.canBid(me); tip.hidden = !can; tip.textContent = TX.tap(eng.next); }
  };
  const bid = id => {
    if (phase !== 'bid' || finished || !eng.place(id)) return false; const p = eng.by(id);
    say(TX.current(p.name, eng.bid)); snd(() => playTick(0.7)); refresh(); if (o.onBid) o.onBid({ id, price: eng.bid, player: p }); plan(); return true;
  };
  function plan() {
    clearTimeout(tBid); clearTimeout(tSale); clearTimeout(tOnce); clearTimeout(tTwice);
    const c = eng.candidates(), k = speed, first = eng.holder == null;
    if (c.length) { const p = c[Math.floor(o.rng() * c.length)]; tBid = later(() => bid(p.id), (700 + o.rng() * 900) * (first ? 1.6 : 1) / k); }
    const hold = (first ? 3400 : 3000) / k;
    if (!first) { tOnce = later(() => { if (phase === 'bid') { say(TX.once); snd(() => playTick(0.4)); } }, hold * 0.5); tTwice = later(() => { if (phase === 'bid') { say(TX.twice); snd(() => playTick(0.5)); } }, hold * 0.78); }
    tSale = later(close, hold);
  }
  function close() {
    if (phase !== 'bid') return; phase = 'end'; refresh(); const r = eng.result();
    if (!r.sold) { say(TX.none); snd(() => playDenied(0.6)); tEnd = later(done, 2000 / Math.max(1, speed * 0.6)); return; }
    const w = eng.by(r.winnerId); say(TX.sold(w.name, r.price)); hit(); snd(() => { playTuk(0.9); setTimeout(() => playChaChing(0.7), 260); });
    const mn = els.get(w.id).querySelector('.au-mn'), from = w.cash, to = from - r.price, t0 = performance.now(); const tick = now => { const f = Math.min(1, (now - t0) / 700); mn.textContent = '$' + Math.round(from + (to - from) * f); if (f < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    tEnd = later(done, 2400 / Math.max(1, speed * 0.6));
  }
  function done() {
    if (finished) return; finished = true; timers.forEach(clearTimeout); timers.clear(); root.style.transition = 'opacity .25s'; root.style.opacity = '0'; setTimeout(() => root.remove(), 260);
    const r = Object.assign(eng.result(), { skipped: skipped && !!me && !o.autoSkipHuman }); if (o.onEnd) { try { o.onEnd(r); } catch (e) {} } resolveFn(r);
  }
  let resolveFn = null; const promise = new Promise(r => { resolveFn = r; });
  const skip = () => { if (skipped || finished || !me) return; skipped = true; skipBtn.hidden = true; speed *= 2.4; snd(() => playTick(0.5)); refresh(); if (phase === 'bid') plan(); };
  skipBtn.addEventListener('click', skip);
  root.addEventListener('pointerdown', () => unlockAudio(), { capture: true });
  if (me) {
    const humanBid = () => { if (skipped || phase !== 'bid') return; if (!bid(me.id)) { if (!eng.canBid(me) && me.cash < eng.next) snd(() => playDenied(0.5)); } };
    els.get(me.id).querySelector('.au-av').addEventListener('click', humanBid);
    root.tabIndex = -1; window.addEventListener('keydown', kd); function kd(e) { if (finished) { window.removeEventListener('keydown', kd); return; } if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); humanBid(); } else if (e.key === 'Escape') skip(); }
  }
  say(TX.intro); refresh(); if (o.onStart) { try { o.onStart(); } catch (e) {} }
  tStart = later(() => { phase = 'bid'; say(TX.start(eng.price)); refresh(); plan(); }, 1700 / Math.max(1, speed * 0.7));
  promise.engine = eng; return promise;
}
