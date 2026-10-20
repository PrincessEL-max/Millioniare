import { ask, G } from '../src/ui.js';
import { isHost, myPlayerIndex } from '../src/multiplayer.js';

const ICONS = {
  thief: `<svg viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="46" fill="#34363c" stroke="#17191e" stroke-width="5"/>
  <path d="M19 48c3-23 16-35 31-35s28 12 31 35" fill="#25282e"/>
  <path d="M17 47h66v18H17z" fill="#e9c69d" stroke="#17191e" stroke-width="3"/>
  <ellipse cx="34" cy="56" rx="10" ry="7" fill="#fff"/>
  <ellipse cx="66" cy="56" rx="10" ry="7" fill="#fff"/>
  <ellipse cx="35" cy="56" rx="4.3" ry="5" fill="#17191e"/>
  <ellipse cx="65" cy="56" rx="4.3" ry="5" fill="#17191e"/>
  <circle cx="36.5" cy="54.5" r="1.4" fill="#fff"/>
  <circle cx="66.5" cy="54.5" r="1.4" fill="#fff"/>
  <path d="M37 78q13 8 26 0" fill="none" stroke="#e9c69d" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  'stop-sign': `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M48 52h6v37h-6z" fill="#777f88" stroke="#424850" stroke-width="2"/><path d="M37 8h26l18 18v26L63 70H37L19 52V26z" fill="#fff" stroke="#fff" stroke-width="4"/><path d="M39 13h22l15 15v22L61 65H39L24 50V28z" fill="#e5342c" stroke="#9b1f20" stroke-width="2"/><text x="50" y="44" fill="#fff" font-size="18" font-weight="900" text-anchor="middle" font-family="Arial,sans-serif">STOP</text></svg>`,
  bomb: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M53 25q2-18 22-15l9 15" fill="none" stroke="#b88736" stroke-width="8"/><circle cx="48" cy="58" r="32" fill="#323844" stroke="#171a20" stroke-width="5"/><path d="M27 51q10-24 30-19" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/><path d="M41 53q7-8 14 0m-14 8q7 8 14 0" fill="none" stroke="#f4eee1" stroke-width="4" stroke-linecap="round"/><path d="M80 54l6-10 4 11 11 3-10 5 1 11-8-8-10 5 5-10-7-8z" fill="#ffcf42"/></svg>`,
  broom: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M65 12L36 68" stroke="#8a5b30" stroke-width="8" stroke-linecap="round"/><path d="M26 58l29 15-17 21-25-14z" fill="#e2ad3b" stroke="#805b24" stroke-width="4"/><path d="M13 80l25 14m-18-24l25 14m-32-2l24 14" stroke="#f3d77b" stroke-width="3"/></svg>`,
  computer: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="12" y="12" width="76" height="56" rx="8" fill="#4c5e86" stroke="#252d43" stroke-width="5"/><rect x="20" y="20" width="60" height="40" rx="3" fill="#9cdef1"/><path d="M50 68v14m-20 4h40" stroke="#414957" stroke-width="7" stroke-linecap="round"/><path d="M29 45l12 8 24-24" fill="none" stroke="#348b62" stroke-width="5"/></svg>`,
  demolition: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M13 74h66l-8 11H17z" fill="#30343b"/><rect x="20" y="48" width="39" height="25" rx="4" fill="#f1b323" stroke="#553d1a" stroke-width="4"/><path d="M44 48l30-27 7 7-24 30" fill="none" stroke="#d99b17" stroke-width="9"/><circle cx="77" cy="69" r="13" fill="#40444b" stroke="#202329" stroke-width="4"/></svg>`,
  'for-rent': `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M13 32l37-20 37 20-37 20z" fill="#f0c35d" stroke="#805b2a" stroke-width="4"/><path d="M20 48v26l30 16 30-16V48L50 64z" fill="#d9a448" stroke="#805b2a" stroke-width="4"/><path d="M50 52v37" stroke="#fff1c7" stroke-width="3"/><text x="50" y="46" text-anchor="middle" font-size="19" font-weight="900" fill="#7b3027">RENT</text></svg>`,
  'remote-control': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="25" y="10" width="50" height="80" rx="13" fill="#44495d" stroke="#222633" stroke-width="5"/><rect x="34" y="20" width="32" height="18" rx="4" fill="#95dff3"/><circle cx="39" cy="54" r="5" fill="#ef5350"/><circle cx="61" cy="54" r="5" fill="#ef5350"/><circle cx="39" cy="72" r="5" fill="#e6c24a"/><circle cx="61" cy="72" r="5" fill="#58bf79"/></svg>`,
  lawyer: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M49 18v61M20 32h59M27 33L16 57h24L27 33zm44 0L60 57h24L71 33z" fill="none" stroke="#31517d" stroke-width="5" stroke-linejoin="round"/><path d="M11 58q15 15 32 0m13 0q15 15 32 0M36 81h28M50 77v9" fill="none" stroke="#c8963c" stroke-width="5" stroke-linecap="round"/></svg>`,
  toolkit: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M58 20a22 22 0 0 0-27 27L14 64a10 10 0 0 0 14 14l17-17a22 22 0 0 0 27-27L59 47 48 36z" fill="#d5a535" stroke="#58451d" stroke-width="5" stroke-linejoin="round"/><path d="M21 71l8 8" stroke="#f8e5a5" stroke-width="4"/></svg>`,
  'street-sign-front': `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M47 48h7v43h-7z" fill="#777f88"/><path d="M50 10v48M50 10L35 27m15-17l15 17" fill="none" stroke="#345c84" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'street-sign-back': `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M47 48h7v43h-7z" fill="#777f88"/><path d="M50 58V10M50 58L35 41m15 17l15-17" fill="none" stroke="#345c84" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'street-sign-left': `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M47 48h7v43h-7z" fill="#777f88"/><path d="M12 40h65M12 40l18-15M12 40l18 15" fill="none" stroke="#345c84" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'street-sign-right': `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M47 48h7v43h-7z" fill="#777f88"/><path d="M23 40h65M88 40L70 25m18 15L70 55" fill="none" stroke="#345c84" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

export function confirmPreview({ title, text, toolId, player = null }) {
  if (player && isHost() && G.cur !== myPlayerIndex()) {
    return ask(document.createElement('div'), title, text, '✓', '✕');
  }
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'presentation');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;pointer-events:auto';

  const dialog = document.createElement('div');
  dialog.className = 'tool-confirm-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', title);
  dialog.innerHTML = `
    <div class="tool-confirm-avatar" aria-hidden="true">${ICONS[toolId]||ICONS.toolkit}</div>
    <strong class="tool-confirm-title"></strong>
    <div class="tool-confirm-copy"></div>
    <div class="tool-confirm-actions">
      <button class="tool-confirm-yes" type="button" aria-label="Ya, gunakan alat">✓</button>
      <button class="tool-confirm-no" type="button" aria-label="Batal">×</button>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .tool-confirm-dialog{box-sizing:border-box;width:min(590px,96vw);min-height:min(360px,calc(100dvh - 28px));padding:20px 30px 24px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:6px;overflow:auto;color:#fff;text-align:center;background:linear-gradient(145deg,#b9c3d0 0%,#9ba7b8 58%,#8794a8 100%);border:2px solid #dce2ea;border-radius:34px 20px 27px 22px;box-shadow:0 10px 30px #10192766,inset 0 2px 8px #ffffff70;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
    .tool-confirm-avatar{width:94px;height:94px;flex:none;filter:drop-shadow(0 4px 3px #0005)}
    .tool-confirm-avatar svg{display:block;width:100%;height:100%}
    .tool-confirm-title{font-size:clamp(25px,6vw,36px);font-style:italic;line-height:1.15;text-shadow:0 3px 0 #555d68,0 0 5px #fff8}
    .tool-confirm-copy{display:grid;gap:2px;font-size:clamp(16px,4vw,23px);font-weight:800;font-style:italic;line-height:1.18;white-space:pre-line;text-shadow:0 2px 0 #68717d,0 0 4px #fff8}
    .tool-confirm-actions{display:flex;justify-content:center;gap:clamp(34px,9vw,68px);margin-top:auto;padding-top:14px}
    .tool-confirm-actions button{width:82px;height:82px;border:5px solid #173d6b;border-radius:50%;color:#fff;font:900 62px/1 system-ui;cursor:pointer;text-shadow:0 2px 2px #0005;box-shadow:inset 0 3px 6px #fff9,inset 0 -5px 8px #0003,0 4px 8px #0005}
    .tool-confirm-yes{background:radial-gradient(circle at 35% 28%,#80d3ff,#2783dc 62%,#1550a8)}
    .tool-confirm-actions .tool-confirm-no{border-color:#79201d;background:radial-gradient(circle at 35% 28%,#ffaaa1,#ed5148 62%,#b72320);font-size:68px}
    @media(max-height:500px){.tool-confirm-dialog{min-height:0;padding:10px 20px}.tool-confirm-avatar{width:60px;height:60px}.tool-confirm-actions button{width:60px;height:60px;font-size:46px}}
  `;
  dialog.querySelector('.tool-confirm-title').textContent = title;
  dialog.querySelector('.tool-confirm-copy').textContent = text;
  overlay.append(style, dialog);
  document.body.appendChild(overlay);

  return new Promise(resolve => {
    const finish = result => {
      document.removeEventListener('keydown', onKeyDown);
      overlay.remove();
      resolve(result);
    };
    const onKeyDown = event => {
      if (event.key === 'Escape') finish(false);
      if (event.key === 'Enter') finish(true);
    };
    dialog.querySelector('.tool-confirm-yes').addEventListener('click', () => finish(true));
    dialog.querySelector('.tool-confirm-no').addEventListener('click', () => finish(false));
    overlay.addEventListener('click', event => {
      if (event.target === overlay) finish(false);
    });
    document.addEventListener('keydown', onKeyDown);
    dialog.querySelector('.tool-confirm-no').focus();
  });
}

export function confirmDialog({ title, text, toolId = 'toolkit', player = null }) {
  return confirmPreview({ title, text, toolId, player });
}

export function confirmThiefDialog({ title, amount, rate = 0.25, player = null }) {
  return confirmPreview({
    title: `Rob ${title}?`,
    text: `Steal ${Math.round(rate * 100)}% of the cash they carry: $${amount}\n(their savings are safe)`,
    toolId: 'thief',
    player
  });
}
