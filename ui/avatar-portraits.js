// Avatar "foto profil" 2D (SVG) untuk keenam karakter: princess, prince, witch, pilot, fairy, builder.
// Bingkai bulat-persegi berwarna sesuai warna pemain, seperti ikon pemain di panel samping.
//   avatarPortraitSVG('princess', '#e53935')  ->  string SVG (viewBox 0 0 100 100)
const OUT = '#33200f', SW = 'stroke="#33200f" stroke-width="1.6" stroke-linejoin="round"';
let apUid = 0;

const eye = (cx, c, boy, mood, skin) => {
  const dy = mood === 'sad' ? 1.8 : 0, lash = mood === 'happy' ? 2.9 : 2.3;
  let e = `<ellipse cx="${cx}" cy="54" rx="8" ry="${boy ? 8.6 : 10}" fill="#fff" stroke="${OUT}" stroke-width="1.3"/><ellipse cx="${cx}" cy="${55 + dy}" rx="6.4" ry="${boy ? 7.6 : 9}" fill="${c}"/><ellipse cx="${cx}" cy="${58 + dy}" rx="4.4" ry="3.8" fill="#fff" opacity=".35"/><ellipse cx="${cx}" cy="${54.5 + dy}" rx="3.3" ry="${boy ? 4.2 : 5.2}" fill="#10202a"/><circle cx="${cx - 2.6}" cy="${50.6 + dy}" r="${mood === 'sad' ? 3.1 : 2.5}" fill="#fff"/><circle cx="${cx + 2.3}" cy="${58.5 + dy}" r="1.2" fill="#fff"/>`;
  if (mood === 'sad') e += `<ellipse cx="${cx}" cy="61.5" rx="7.4" ry="2.1" fill="#9fdcff" opacity=".7"/><path d="M${cx + (cx < 50 ? -2 : 2)} 63 Q${cx + (cx < 50 ? 1.4 : 5.4)} 68.5 ${cx + (cx < 50 ? -2 : 2)} 72.5 Q${cx + (cx < 50 ? -5.4 : -1.4)} 68.5 ${cx + (cx < 50 ? -2 : 2)} 63Z" fill="#8fd8ff" stroke="#3a8ad0" stroke-width="1"/>`;
  if (mood === 'happy') e += `<path d="M${cx - 9} 61 Q${cx} 49 ${cx + 9} 61 L${cx + 9.5} 67 L${cx - 9.5} 67Z" fill="${skin}"/><path d="M${cx - 8.6} 60.2 Q${cx} 50.4 ${cx + 8.6} 60.2" fill="none" stroke="${OUT}" stroke-width="1.5" stroke-linecap="round"/>`;
  return e + `<path d="M${cx - 8.6} 50.5 Q${cx} 41 ${cx + 8.6} 50.5" fill="none" stroke="#2a1712" stroke-width="${lash}" stroke-linecap="round"/>`;
};
function face(o) {
  const ear = (x, s) => o.pointy
    ? `<path d="M${x} 50 L${x + s * 15} 40 L${x + s * 2} 60Z" fill="${o.skin}" ${SW}/>`
    : `<ellipse cx="${x}" cy="54" rx="4.4" ry="6.4" fill="${o.skin}" ${SW}/>`;
  return `<rect x="43" y="72" width="14" height="16" fill="${o.skin}" ${SW}/>${ear(23.5, -1)}${ear(76.5, 1)}
<path d="M23 50 C23 30 36 22 50 22 C64 22 77 30 77 50 C77 66 66 80 50 80 C34 80 23 66 23 50Z" fill="${o.skin}" ${SW}/>`;
}
const features = o => {
  const m = o.mood || 'neutral', bc = o.brow || '#4a3020', bw = o.boy ? 3 : 1.8, bl = o.boy ? 0.3 : 0.5;
  const brows = m === 'sad' ? ['M27 47.5 Q37 43.5 46 37.5', 'M73 47.5 Q63 43.5 54 37.5'] : m === 'happy' ? ['M28 42 Q37 35.5 45 40.5', 'M72 42 Q63 35.5 55 40.5'] : ['M28 44.5 Q37 39 45 43.5', 'M72 44.5 Q63 39 55 43.5'];
  const mouth = m === 'happy'
    ? `<path d="M37 65.5 Q50 85 63 65.5 Q50 71 37 65.5Z" fill="#8a1f2a" stroke="#b5504f" stroke-width="1.6" stroke-linejoin="round"/><path d="M40 66.6 Q50 71.4 60 66.6 L58.6 70 Q50 74.4 41.4 70Z" fill="#fff"/><path d="M43.5 76 Q50 71 56.5 76 Q50 82.5 43.5 76Z" fill="#ff8a9a"/>`
    : m === 'sad' ? `<path d="M42.5 75 Q50 66.5 57.5 75" fill="none" stroke="#b5504f" stroke-width="2.3" stroke-linecap="round"/>`
    : `<path d="M44 69 Q50 74 56 69" fill="none" stroke="#b5504f" stroke-width="2" stroke-linecap="round"/>`;
  const blush = m === 'happy' ? 0.75 : m === 'sad' ? 0.22 : (o.boy ? 0.3 : 0.5);
  return `${eye(37, o.eye, o.boy, m, o.skin)}${eye(63, o.eye, o.boy, m, o.skin)}
<path d="${brows[0]}" fill="none" stroke="${bc}" stroke-width="${bw}" stroke-linecap="round"/><path d="${brows[1]}" fill="none" stroke="${bc}" stroke-width="${bw}" stroke-linecap="round"/>
<path d="M49 63 Q50 65 52 64" fill="none" stroke="#b5755a" stroke-width="1.4" stroke-linecap="round"/>${mouth}
<ellipse cx="29.5" cy="${m === 'happy' ? 65 : 64}" rx="5" ry="3" fill="#ff8f9c" opacity="${blush}"/><ellipse cx="70.5" cy="${m === 'happy' ? 65 : 64}" rx="5" ry="3" fill="#ff8f9c" opacity="${blush}"/>`;
};
const shoulders = (col, extra = '') => `<path d="M8 100 C10 84 26 80 50 82 C74 80 92 84 92 100Z" fill="${col}" ${SW}/>${extra}`;
const star = (cx, cy, r, f) => { let d = ''; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}Z" fill="${f}" stroke="#a87400" stroke-width="1"/>`; };

const ART = {
  princess: (mood) => { const o = { mood, skin: '#ffe0cf', eye: '#5a8cff' }, H = '#f2c75c';
    return `<path d="M19 50 C13 28 29 12 50 12 C71 12 87 28 81 50 C85 66 87 84 80 96 L64 96 C68 84 66 72 64 62 L36 62 C34 72 32 84 36 96 L20 96 C13 84 15 66 19 50Z" fill="${H}" ${SW}/><circle cx="19" cy="84" r="7.5" fill="${H}" ${SW}/><circle cx="81" cy="84" r="7.5" fill="${H}" ${SW}/>
${shoulders('#f06aa0', `<path d="M28 84 Q50 97 72 84" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${(30 + i * 6.7).toFixed(1)}" cy="${(88 + Math.sin(i / 6 * Math.PI) * 7).toFixed(1)}" r="2.2" fill="#fff" stroke="#b8a8b0" stroke-width=".8"/>`).join('')}`)}
${face(o)}${features(o)}
<path d="M24 46 C24 28 38 20 52 20 C66 20 76 28 76 46 C70 36 62 31 52 31 C44 34 34 40 24 46Z" fill="${H}" ${SW}/><path d="M42 23 C38 27 36 31 35 35" stroke="#fff2b0" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>
<path d="M30 25 L34 15 L41 22 L50 9 L59 22 L66 15 L70 25 C60 28 40 28 30 25Z" fill="#ffd24a" stroke="#a87400" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="17" r="3.4" fill="#4aa8ff" stroke="#1a5aa0"/><circle cx="23.5" cy="64" r="2.4" fill="#4aa8ff"/><circle cx="76.5" cy="64" r="2.4" fill="#4aa8ff"/>`; },
  prince: (mood) => { const o = { mood, skin: '#ffd9c4', eye: '#2f9aa0', boy: true }, H = '#6b4a2e';
    return `<path d="M22 50 C19 28 34 12 50 12 C66 12 81 28 78 50 C76 40 72 34 64 30 L36 30 C28 34 24 40 22 50Z" fill="${H}" ${SW}/>
${shoulders('#2d4aa8', `<path d="M40 82 L50 99 L60 82 Q50 87 40 82Z" fill="#fff" stroke="#9aa" stroke-width="1"/><rect x="12" y="84" width="16" height="6" rx="2" fill="#ffd24a" stroke="#a87400" transform="rotate(-14 20 87)"/><rect x="72" y="84" width="16" height="6" rx="2" fill="#ffd24a" stroke="#a87400" transform="rotate(14 80 87)"/><path d="M68 84 L90 98 L84 100 L62 88Z" fill="#c0283a" stroke="${OUT}" stroke-width="1"/>`)}
${face(o)}${features(o)}
<path d="M24 46 C23 30 36 18 52 18 C66 18 76 28 77 44 C70 34 60 30 48 32 C40 36 30 40 24 46Z" fill="${H}" ${SW}/><path d="M44 20 C50 9 63 11 65 22 C58 17 50 17 44 20Z" fill="${H}" ${SW}/>
<path d="M28 27 L30 12 L40 20 L50 6 L60 20 L70 12 L72 27 C60 30 40 30 28 27Z" fill="#ffd24a" stroke="#a87400" stroke-width="1.6" stroke-linejoin="round"/><circle cx="30" cy="12" r="2.6" fill="#d0342c"/><circle cx="50" cy="6" r="2.8" fill="#d0342c"/><circle cx="70" cy="12" r="2.6" fill="#d0342c"/><circle cx="50" cy="25" r="3" fill="#4aa8ff" stroke="#1a5aa0"/>`; },
  witch: (mood) => { const o = { mood, skin: '#ffe3d6', eye: '#8a5cff' }, H = '#2f2459';
    return `<path d="M19 50 C13 30 30 14 50 14 C70 14 87 30 81 50 L84 96 L66 96 L64 62 L36 62 L34 96 L16 96Z" fill="${H}" ${SW}/>
${shoulders('#5a3a9a', `<path d="M36 82 Q50 94 64 82" fill="none" stroke="#e8e0f8" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="92" r="3.6" fill="#ffd24a" stroke="#a87400"/>`)}
${face(o)}${features(o)}
<path d="M24 48 C22 32 36 24 50 24 C64 24 78 32 76 48 C72 40 66 37 58 36 L50 44 L42 36 C34 37 28 40 24 48Z" fill="${H}" ${SW}/>
<ellipse cx="50" cy="27" rx="43" ry="10" fill="#2f2058" ${SW}/><path d="M24 27 C30 22 38 18 46 6 C48 -2 56 -8 64 -9 C58 1 62 12 72 22 C74 24 76 26 76 27Z" fill="#2f2058" ${SW}/><path d="M26 26 C40 31 60 31 74 26 L74 21 C60 26 40 26 26 21Z" fill="#d04a9a"/>${star(50, 26, 5.4, '#ffd24a')}`; },
  pilot: (mood) => { const o = { mood, skin: '#f6d2b8', eye: '#3a8ae8' }, H = '#f0c860', L = '#7a5230';
    return `<path d="M22 50 C20 34 32 26 50 26 C68 26 80 34 78 50 C80 60 78 70 70 72 L70 56 L30 56 L30 72 C22 70 20 60 22 50Z" fill="${H}" ${SW}/>
${shoulders('#8a5a34', `<path d="M26 84 Q34 75 44 84 Q50 77 56 84 Q66 75 74 84 Q74 93 50 95 Q26 93 26 84Z" fill="#f3ead2" stroke="#b8a888" stroke-width="1.2"/><path d="M40 86 Q50 93 60 86 L64 98 L54 100 L46 98 L38 98Z" fill="#fff" stroke="#bbb" stroke-width="1"/>`)}
${face(o)}${features(o)}
<path d="M28 46 C32 38 42 36 50 40 C58 36 68 38 72 46 C64 42 56 44 50 48 C44 44 36 42 28 46Z" fill="${H}" ${SW}/>
<path d="M20 46 C14 50 14 64 22 67 L27 52Z" fill="${L}" ${SW}/><path d="M80 46 C86 50 86 64 78 67 L73 52Z" fill="${L}" ${SW}/>
<path d="M20 46 C18 22 34 9 50 9 C66 9 82 22 80 46 L74 38 C62 31 38 31 26 38Z" fill="${L}" ${SW}/><path d="M22 33 C36 27 64 27 78 33" stroke="#1a1a1a" stroke-width="4.5" fill="none"/>
<circle cx="37" cy="23" r="8.5" fill="#7ac0f0" stroke="#d4af37" stroke-width="3.2"/><circle cx="63" cy="23" r="8.5" fill="#7ac0f0" stroke="#d4af37" stroke-width="3.2"/><circle cx="34" cy="20" r="2.4" fill="#fff" opacity=".8"/><circle cx="60" cy="20" r="2.4" fill="#fff" opacity=".8"/>`; },
  fairy: (mood) => { const o = { mood, skin: '#ffd9c8', eye: '#4ab36a', pointy: true }, H = '#f7a5b6';
    return `<ellipse cx="9" cy="72" rx="13" ry="23" fill="#9ee0ff" opacity=".85" stroke="#3a86c8" stroke-width="1.5" transform="rotate(-24 9 72)"/><ellipse cx="91" cy="72" rx="13" ry="23" fill="#9ee0ff" opacity=".85" stroke="#3a86c8" stroke-width="1.5" transform="rotate(24 91 72)"/>
<path d="M21 50 C15 28 31 13 50 13 C69 13 85 28 79 50 C81 60 79 70 72 72 L70 56 L30 56 L28 72 C21 70 19 60 21 50Z" fill="${H}" ${SW}/><circle cx="14" cy="48" r="8" fill="${H}" ${SW}/><circle cx="86" cy="48" r="8" fill="${H}" ${SW}/><circle cx="19" cy="42" r="3.4" fill="#5fbf6a" stroke="#2f7a3a" stroke-width="1"/><circle cx="81" cy="42" r="3.4" fill="#5fbf6a" stroke="#2f7a3a" stroke-width="1"/>
${shoulders('#7fd8b0', `<path d="M28 84 Q34 95 42 84 Q46 95 50 86 Q54 95 58 84 Q66 95 72 84" fill="#ff8fb8" stroke="#c9507a" stroke-width="1.3" stroke-linejoin="round"/>`)}
${face(o)}${features(o)}
<path d="M23 46 C23 28 37 20 51 20 C65 20 77 28 77 46 C70 36 62 32 52 32 C42 34 32 40 23 46Z" fill="${H}" ${SW}/>
${[[28, 31, '#ff8fb8'], [36, 23, '#ffd24a'], [46, 19, '#fff'], [56, 19, '#ff8fb8'], [66, 23, '#b48cf0'], [74, 31, '#ffd24a']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5.2" fill="${c}" stroke="#7a5a8a" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="1.8" fill="#ffe27a"/>`).join('')}
<ellipse cx="31" cy="25" rx="3.4" ry="1.8" fill="#4fb85a" transform="rotate(-40 31 25)"/><ellipse cx="42" cy="19" rx="3.4" ry="1.8" fill="#4fb85a" transform="rotate(-10 42 19)"/><ellipse cx="62" cy="19" rx="3.4" ry="1.8" fill="#4fb85a" transform="rotate(10 62 19)"/><ellipse cx="71" cy="25" rx="3.4" ry="1.8" fill="#4fb85a" transform="rotate(40 71 25)"/>`; },
  builder: (mood) => { const o = { mood, skin: '#f0cba8', eye: '#8a5a2a', boy: true, brow: '#2a1a10' }, H = '#3a2a1e';
    return `<path d="M22 50 C20 34 32 28 50 28 C68 28 80 34 78 50 L78 44 C66 40 34 40 22 44Z" fill="${H}" ${SW}/>
${shoulders('#70767e', `<path d="M16 100 C18 88 28 84 38 84 L46 100Z" fill="#ff7a1a" ${SW}/><path d="M84 100 C82 88 72 84 62 84 L54 100Z" fill="#ff7a1a" ${SW}/><path d="M22 96 L41 89 M59 89 L78 96" stroke="#e8e8ee" stroke-width="3.2" stroke-linecap="round"/>`)}
${face(o)}${features(o)}
<path d="M18 40 C18 16 34 6 50 6 C66 6 82 16 82 40Z" fill="#f7b43a" ${SW}/><path d="M12 40 C12 35 18 34 22 36 L78 36 C82 34 88 35 88 40 C88 46 80 46 76 44 L24 44 C20 46 12 46 12 40Z" fill="#f3a62a" ${SW}/>
<rect x="44" y="6" width="12" height="31" rx="5" fill="#ffd36a" stroke="#c9871a" stroke-width="1.3"/><circle cx="50" cy="29" r="4.6" fill="#dadde2" stroke="#666" stroke-width="1.2"/><path d="M26 18 C30 14 34 12 38 11" stroke="#fff" stroke-width="2.4" opacity=".55" fill="none" stroke-linecap="round"/>`; }
};
export const AVATAR_PORTRAIT_TYPES = Object.keys(ART);

/** Ikon foto profil lengkap dengan bingkai berwarna (warna pemain). */
export function avatarPortraitSVG(type, color = '#e53935', opts = {}) {
  const id = 'ap' + (++apUid), art = () => (ART[type] || ART.princess)(opts.mood || 'neutral'), c = color;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ${opts.label ? `role="img" aria-label="${opts.label}"` : 'aria-hidden="true"'}><defs><clipPath id="${id}c"><rect x="3.5" y="3.5" width="93" height="93" rx="20"/></clipPath>
<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity=".78"/></linearGradient>
<radialGradient id="${id}r" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect x="2" y="2" width="96" height="96" rx="21" fill="${c}"/><rect x="2" y="2" width="96" height="96" rx="21" fill="url(#${id}g)"/><rect x="2" y="2" width="96" height="96" rx="21" fill="url(#${id}r)"/>
<g clip-path="url(#${id}c)">${art()}</g>
<rect x="5" y="5" width="90" height="90" rx="19" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.2"/><rect x="2" y="2" width="96" height="96" rx="21" fill="none" stroke="#2a0a0c" stroke-opacity=".85" stroke-width="3"/></svg>`;
}

export const AVATAR_MOODS = ['neutral', 'happy', 'sad'];
/**
 * Kepala saja tanpa bingkai (untuk banner kejadian): avatarHeadSVG('princess', 'happy')
 * mood: 'happy' (senang, bintang berkilau) | 'sad' (sedih, air mata dan tetes keringat) | 'neutral'.
 */
export function avatarHeadSVG(type, mood = 'neutral', opts = {}) {
  const id = 'ah' + (++apUid), art = (ART[type] || ART.princess)(mood);
  const spark = (x, y, r) => `<path d="M${x} ${y - r} Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y} Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r} Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y} Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z" fill="#fffbb0" stroke="#e8b800" stroke-width="1.2" stroke-linejoin="round"/>`;
  const deco = mood === 'happy' ? spark(-1, 14, 6.5) + spark(103, 30, 5.2) + spark(96, 4, 4) : mood === 'sad' ? '<path d="M96 22 Q101.5 31 96 37 Q90.5 31 96 22Z" fill="#8fd8ff" stroke="#3a8ad0" stroke-width="1.4"/><ellipse cx="94.4" cy="30.6" rx="1.2" ry="2" fill="#fff" opacity=".8"/>' : '';
  return `<svg viewBox="-8 -18 116 116" xmlns="http://www.w3.org/2000/svg" ${opts.label ? `role="img" aria-label="${opts.label}"` : 'aria-hidden="true"'}><defs><clipPath id="${id}"><path d="M-8 -18 H108 V84 Q108 90 100 90 H0 Q-8 90 -8 84Z"/></clipPath></defs><g clip-path="url(#${id})">${art}</g>${deco}</svg>`;
}
