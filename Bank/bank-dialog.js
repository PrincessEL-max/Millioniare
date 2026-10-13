import { playChaChing, unlockAudio } from './cha-ching.js';

// Seluruh dialog digambar sebagai satu SVG (viewBox 1019 x 630) supaya proporsinya persis dan halus di ukuran berapa pun.
const W = 1019, TX0 = 183, TX1 = 632;           // panjang jalur slider: x 183 -> 632
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const fitSize = str => Math.round(Math.min(72, 72 * 9 / str.length) * 10) / 10;   // sampai 9 karakter tetap 72px, lebih panjang mengecil

const STYLE = `
.bkd-root{pointer-events:auto;box-sizing:border-box;max-width:100%;transition:opacity .25s,transform .25s;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.bkd-root svg{display:block;width:100%;height:auto;overflow:visible;touch-action:none}
.bkd-panel{padding:2.4%;border-radius:36px;background:rgba(224,228,234,.78);box-shadow:0 8px 30px rgba(0,0,0,.28),inset 0 0 0 2px rgba(255,255,255,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.bkd-out{opacity:0;transform:scale(.96)}
.bkd-btn{cursor:pointer;transform-box:fill-box;transform-origin:center;transition:transform .08s}
.bkd-btn:active,.bkd-btn.bkd-press{transform:scale(.92)}
.bkd-btn:focus{outline:none}
.bkd-btn:focus-visible .bkd-ring,.bkd-slider:focus-visible .bkd-knob{stroke:#fff;stroke-width:5}
.bkd-hit{cursor:grab}.bkd-drag .bkd-hit{cursor:grabbing}
.bkd-thumb{transform-box:fill-box;transform-origin:center;transition:transform .1s}
.bkd-drag .bkd-thumb{transform:scale(1.1)}
.bkd-slider{outline:none}
.bkd-money{transform-box:fill-box;transform-origin:center}
.bkd-pop{animation:bkd-pop .55s ease-out}
@keyframes bkd-pop{0%{transform:scale(1)}35%{transform:scale(1.2) rotate(-4deg)}100%{transform:scale(1)}}
.bkd-coin{animation:bkd-coin .9s ease-out forwards}
@keyframes bkd-coin{0%{transform:translate(0,0) scale(.5);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1);opacity:0}}
@media (prefers-reduced-motion:reduce){.bkd-pop,.bkd-coin{animation:none}.bkd-btn,.bkd-thumb{transition:none}}
`;

const blueBtn = icon => `
<circle cx="56" cy="56" r="55" fill="#0a2a73"/>
<circle class="bkd-ring" cx="56" cy="56" r="51" fill="url(#bkdBlue)"/>
<circle cx="56" cy="56" r="47" fill="none" stroke="#7cc0ff" stroke-opacity=".55" stroke-width="2"/>
<ellipse cx="56" cy="92" rx="30" ry="11" fill="#7cc4ff" opacity=".4"/>
<path d="M17,48 C19,23 37,8 56,8 C75,8 93,23 95,48 C81,37 68,33 56,33 C44,33 31,37 17,48 Z" fill="url(#bkdHl)"/>${icon}`;
const ICON_OK = `<path d="M30,60 L49,79 L85,35" fill="none" stroke="#0a3a96" stroke-opacity=".6" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,3)"/><path d="M30,60 L49,79 L85,35" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`;
const ICON_NO = `<path d="M33,33 L79,79 M79,33 L33,79" fill="none" stroke="#0a3a96" stroke-opacity=".6" stroke-width="16" stroke-linecap="round" transform="translate(0,3)"/><path d="M33,33 L79,79 M79,33 L33,79" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>`;

const PIGGY = `
<path d="M128,50 C142,42 146,60 134,62" fill="none" stroke="#b02828" stroke-width="5" stroke-linecap="round"/>
<rect x="92" y="80" width="21" height="27" rx="8" fill="url(#bkdPigD)" stroke="#8f1d1d" stroke-width="2"/>
<rect x="44" y="82" width="21" height="25" rx="8" fill="url(#bkdPigD)" stroke="#8f1d1d" stroke-width="2"/>
<ellipse cx="78" cy="56" rx="56" ry="40" fill="url(#bkdPig)" stroke="#8f1d1d" stroke-width="2"/>
<rect x="72" y="17" width="27" height="6" rx="3" fill="#7a1414" transform="rotate(-6 85 20)"/>
<path d="M50,27 L58,5 Q72,11 77,25 Z" fill="url(#bkdPigD)" stroke="#8f1d1d" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="22" cy="61" rx="17" ry="14" fill="url(#bkdPigD)" stroke="#8f1d1d" stroke-width="2"/>
<ellipse cx="16" cy="61" rx="3" ry="4.6" fill="#5a0f0f"/><ellipse cx="28" cy="61" rx="3" ry="4.6" fill="#5a0f0f"/>
<ellipse cx="43" cy="45" rx="4.6" ry="6.2" fill="#2a0808"/><circle cx="41.4" cy="42" r="1.7" fill="#fff"/>
<ellipse cx="70" cy="33" rx="31" ry="11" fill="#fff" opacity=".35" transform="rotate(-10 70 33)"/><ellipse cx="46" cy="64" rx="7" ry="4" fill="#fff" opacity=".18"/>`;

const CASH = `
<polygon points="10,58 70,92 70,120 10,86" fill="url(#bkdGL)" stroke="#2f6a2e" stroke-width="1.5" stroke-linejoin="round"/>
<polygon points="70,92 150,52 150,80 70,120" fill="url(#bkdGR)" stroke="#2f6a2e" stroke-width="1.5" stroke-linejoin="round"/>
<polygon points="10,58 92,26 150,52 70,92" fill="url(#bkdGT)" stroke="#2f6a2e" stroke-width="1.5" stroke-linejoin="round"/>
<g stroke="#e9f8dd" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M10,63 L70,97 M10,68 L70,102 M10,73 L70,107 M10,78 L70,112 M10,83 L70,117"/><path d="M70,97 L150,57 M70,102 L150,62 M70,107 L150,67 M70,112 L150,72 M70,117 L150,77"/></g>
<g transform="matrix(82 -32 60 34 10 58)"><rect x=".06" y=".1" width=".88" height=".8" fill="none" stroke="#5fa04e" stroke-width=".025"/><ellipse cx=".5" cy=".5" rx=".2" ry=".27" fill="none" stroke="#5fa04e" stroke-width=".03"/><text x=".5" y=".62" font-size=".42" font-weight="700" text-anchor="middle" fill="#4f9440" font-family="Arial,sans-serif">$</text></g>
<polygon points="46.9,43.6 59.2,38.8 119.2,72.8 106.9,77.6" fill="url(#bkdBand)" stroke="#b97d00" stroke-width="1"/>
<polygon points="106,74 118,68 118,96 106,102" fill="#d99a06" stroke="#b97d00" stroke-width="1"/>`;

export function bankDialogSVG(cash, bank, labels = { cash: 'Cash:', bank: 'Bank:' }) {
  const total = cash + bank, f = total ? cash / total : 0, tx = TX0 + f * (TX1 - TX0);
  const boxTop = 'M68,18 H749 A46,46 0 0 1 795,64 V172 A46,46 0 0 1 749,218 H712 L706,248 L668,218 H68 A46,46 0 0 1 22,172 V64 A46,46 0 0 1 68,18 Z';
  const boxBot = 'M68,412 H108 L111,383 L158,412 H749 A46,46 0 0 1 795,458 V566 A46,46 0 0 1 749,612 H68 A46,46 0 0 1 22,566 V458 A46,46 0 0 1 68,412 Z';
  const txt = (cls, label, y, val) => `<g font-family="'Trebuchet MS','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" font-style="italic" font-weight="800" font-size="72" letter-spacing="1">
    <text x="75" y="${y + 5}" fill="#777">${label}</text><text x="75" y="${y}" fill="#fff">${label}</text>
    <text class="${cls}-s" x="318" y="${y + 5}" fill="#777" font-size="${fitSize(money(val))}">${money(val)}</text><text class="${cls}" x="318" y="${y}" fill="#fff" font-size="${fitSize(money(val))}">${money(val)}</text></g>`;
  return `<svg viewBox="0 0 ${W} 630" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Tarik atau simpan uang">
<defs>
<linearGradient id="bkdBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3b3b"/><stop offset=".15" stop-color="#262626"/><stop offset="1" stop-color="#0c0c0c"/></linearGradient>
<linearGradient id="bkdBoxHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="bkdTrack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset=".5" stop-color="#262626"/><stop offset="1" stop-color="#101010"/></linearGradient>
<radialGradient id="bkdKnob" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#ececec"/><stop offset=".85" stop-color="#bdbdbd"/><stop offset="1" stop-color="#8f8f8f"/></radialGradient>
<radialGradient id="bkdPig" cx=".36" cy=".28" r=".85"><stop offset="0" stop-color="#ffb3a6"/><stop offset=".45" stop-color="#f0645a"/><stop offset=".85" stop-color="#c93030"/><stop offset="1" stop-color="#a82020"/></radialGradient>
<linearGradient id="bkdPigD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ee5a52"/><stop offset="1" stop-color="#b52a2a"/></linearGradient>
<linearGradient id="bkdBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb4ff"/><stop offset=".45" stop-color="#2f7ae8"/><stop offset="1" stop-color="#0f46b4"/></linearGradient>
<linearGradient id="bkdHl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>
<linearGradient id="bkdGT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ecf9df"/><stop offset="1" stop-color="#b5e29d"/></linearGradient>
<linearGradient id="bkdGL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86c872"/><stop offset="1" stop-color="#4f9c45"/></linearGradient>
<linearGradient id="bkdGR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fae52"/><stop offset="1" stop-color="#2f7a32"/></linearGradient>
<linearGradient id="bkdBand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#eaa90a"/></linearGradient>
<filter id="bkdSh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".45"/></filter>
</defs>
<path d="${boxTop}" fill="url(#bkdBox)" stroke="#dcdcdc" stroke-width="3" stroke-linejoin="round"/><rect x="28" y="24" width="761" height="72" rx="40" fill="url(#bkdBoxHi)"/>
${txt('bkd-cash', labels.cash, 114, cash)}
<path d="${boxBot}" fill="url(#bkdBox)" stroke="#dcdcdc" stroke-width="3" stroke-linejoin="round"/><rect x="28" y="418" width="761" height="72" rx="40" fill="url(#bkdBoxHi)"/>
${txt('bkd-bank', labels.bank, 508, bank)}
<g transform="translate(42,256) scale(0.96,1.1)">${PIGGY}</g>
<rect x="${TX0}" y="302" width="${TX1 - TX0}" height="33" rx="3" fill="url(#bkdTrack)" stroke="#000" stroke-width="1.5"/><rect x="${TX0 + 2}" y="304" width="${TX1 - TX0 - 4}" height="3" fill="#fff" opacity=".12"/>
<g class="bkd-slider" role="slider" tabindex="0" aria-label="Pembagian uang tunai dan bank" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${cash}" aria-valuetext="Cash ${money(cash)}, Bank ${money(bank)}">
<g class="bkd-thumbpos" transform="translate(${tx.toFixed(2)},0)"><g class="bkd-thumb"><circle class="bkd-knob" cx="0" cy="318.5" r="33" fill="url(#bkdKnob)" stroke="#8a8a8a" stroke-width="1.5" filter="url(#bkdSh)"/></g></g>
<rect class="bkd-hit" x="150" y="262" width="520" height="112" fill="#fff" fill-opacity="0"/></g>
<g transform="translate(637,238) scale(1.12)"><g class="bkd-money">${CASH}</g></g>
<g transform="translate(889,226)"><g class="bkd-btn bkd-ok" role="button" tabindex="0" aria-label="Konfirmasi">${blueBtn(ICON_OK)}</g></g>
<g transform="translate(889,387)"><g class="bkd-btn bkd-no" role="button" tabindex="0" aria-label="Batal">${blueBtn(ICON_NO)}</g></g>
</svg>`;
}

let styled = false;
function injectStyle() {
  if (styled || typeof document === 'undefined') return;
  styled = true; const s = document.createElement('style'); s.id = 'bkd-style'; s.textContent = STYLE; document.head.appendChild(s);
}

/**
 * Tampilkan dialog. Mengembalikan Promise<{ confirmed, cash, bank }>.
 * Opsi: cash, bank (jumlah bebas, total = cash + bank), mount (elemen induk), width (CSS, bawaan 'min(92vw, 560px)'),
 *   step ('auto' = 1 untuk total <= 2000, selebihnya kelipatan 10/100/1000..., atau angka tetap), panel (latar kaca), sound, closeDelay (ms), labels
 */
export function showBankDialog(opts = {}) {
  const o = Object.assign({ cash: 0, bank: 0, mount: document.body, width: 'min(92vw, 560px)', step: 'auto', panel: true, sound: true, closeDelay: 650, labels: { cash: 'Cash:', bank: 'Bank:' } }, opts);
  injectStyle();
  const total = Math.max(0, Math.round(o.cash + o.bank)), start = Math.min(total, Math.max(0, Math.round(o.cash)));
  const step = o.step === 'auto' ? (total <= 2000 ? 1 : Math.pow(10, Math.floor(Math.log10(total / 1000)))) : Math.max(1, o.step);
  let cash = start, finished = false, drag = false;
  const root = document.createElement('div'); root.className = 'bkd-root' + (o.panel ? ' bkd-panel' : ''); root.style.width = o.width;
  root.innerHTML = bankDialogSVG(start, total - start, o.labels); o.mount.appendChild(root);
  const q = s => root.querySelector(s), svg = q('svg'), pos = q('.bkd-thumbpos'), hit = q('.bkd-hit'), slider = q('.bkd-slider');
  const setCash = v => {
    cash = Math.min(total, Math.max(0, v)); const bank = total - cash, f = total ? cash / total : 0;
    pos.setAttribute('transform', `translate(${(TX0 + f * (TX1 - TX0)).toFixed(2)},0)`);
    root.querySelectorAll('.bkd-cash,.bkd-cash-s').forEach(t => { t.textContent = money(cash); t.setAttribute('font-size', fitSize(money(cash))); });
    root.querySelectorAll('.bkd-bank,.bkd-bank-s').forEach(t => { t.textContent = money(bank); t.setAttribute('font-size', fitSize(money(bank))); });
    slider.setAttribute('aria-valuenow', cash); slider.setAttribute('aria-valuetext', `Cash ${money(cash)}, Bank ${money(bank)}`);
  };
  const fromPointer = e => {
    const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, f = Math.min(1, Math.max(0, (x - TX0) / (TX1 - TX0)));
    const v = Math.round(f * total / step) * step;
    return (f >= 0.999 || total - v < step) ? total : Math.min(total, v);
  };

  return new Promise(resolve => {
    const finish = (confirmed, delay) => {
      if (finished) return; finished = true;
      const result = { confirmed, cash: confirmed ? cash : start, bank: confirmed ? total - cash : total - start };
      setTimeout(() => root.classList.add('bkd-out'), Math.max(0, delay - 250));
      setTimeout(() => { root.remove(); resolve(result); }, delay);
    };
    root.addEventListener('pointerdown', () => unlockAudio(), { capture: true });
    hit.addEventListener('pointerdown', e => { if (!total) return; e.preventDefault(); drag = true; try { hit.setPointerCapture(e.pointerId); } catch (_) {} root.classList.add('bkd-drag'); setCash(fromPointer(e)); });
    hit.addEventListener('pointermove', e => { if (drag) setCash(fromPointer(e)); });
    ['pointerup', 'pointercancel'].forEach(t => hit.addEventListener(t, () => { drag = false; root.classList.remove('bkd-drag'); }));
    slider.addEventListener('keydown', e => {
      const big = Math.max(step, Math.round(total / 10)), k = e.key; let v = null;
      if (k === 'ArrowLeft' || k === 'ArrowDown') v = cash - (e.shiftKey ? big : step);
      else if (k === 'ArrowRight' || k === 'ArrowUp') v = cash + (e.shiftKey ? big : step);
      else if (k === 'PageDown') v = cash - big; else if (k === 'PageUp') v = cash + big;
      else if (k === 'Home') v = 0; else if (k === 'End') v = total;
      if (v !== null) { e.preventDefault(); setCash(v); }
    });
    const ok = () => {
      if (finished) return; if (o.sound) playChaChing();
      try { navigator.vibrate && navigator.vibrate(25); } catch (_) {}
      const m = q('.bkd-money'); m.classList.remove('bkd-pop'); void m.getBoundingClientRect(); m.classList.add('bkd-pop');
      for (let i = 0; i < 9; i++) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'), a = -Math.PI / 2 + (i - 4) * 0.42;
        c.setAttribute('class', 'bkd-coin'); c.setAttribute('cx', 726); c.setAttribute('cy', 312); c.setAttribute('r', 11); c.setAttribute('fill', '#ffd84a'); c.setAttribute('stroke', '#c98a00'); c.setAttribute('stroke-width', 3);
        c.style.setProperty('--dx', Math.round(Math.cos(a) * (90 + (i % 3) * 30)) + 'px'); c.style.setProperty('--dy', Math.round(Math.sin(a) * (110 + (i % 2) * 40)) + 'px'); svg.appendChild(c);
      }
      q('.bkd-ok').classList.add('bkd-press'); finish(true, o.closeDelay);
    };
    const no = () => finish(false, 200);
    const bind = (el, fn) => { el.addEventListener('click', fn); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); };
    bind(q('.bkd-ok'), ok); bind(q('.bkd-no'), no);
    root.addEventListener('keydown', e => { if (e.key === 'Escape') no(); });
  });
}
