// Ikon bawaan. Di items.js, isi  icon: 'bomb' | 'sign' | 'placeholder'  atau SVG/URL gambar kamu sendiri.
const star=(cx,cy,ro,ri,n)=>Array.from({length:n*2},(_,i)=>{const a=Math.PI*i/n-Math.PI/2,r=i%2?ri:ro;return (cx+Math.cos(a)*r).toFixed(1)+','+(cy+Math.sin(a)*r).toFixed(1)}).join(' ');
const bone=r=>`<g transform="translate(84 172) rotate(${r})" fill="#e6dfcf" stroke="#2a0c0c" stroke-width="3"><rect x="-52" y="-7" width="104" height="14" rx="7"/><circle cx="-54" cy="-6" r="9"/><circle cx="-54" cy="7" r="9"/><circle cx="54" cy="-6" r="9"/><circle cx="54" cy="7" r="9"/></g>`;
export const ICONS={
...Object.fromEntries([
  ['broom','🧹','#19a9a2'],['computer','PC','#6652ba'],['stop-sign','STOP','#d64235'],
  ['demolition','💥','#d68527'],['for-rent','RENT','#d64235'],['remote-control','🎲','#5149a0'],
  ['lawyer','⚖','#385d9c'],['toolkit','🔧','#d69b28'],['thief','💰','#454b5b']
].map(([id,label,color])=>[id,`<svg viewBox="0 0 160 190" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="144" height="174" rx="24" fill="${color}"/><text x="80" y="112" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="${label.length>5?24:42}" font-weight="900" fill="#fff">${label}</text></svg>`])),
bomb:`<svg viewBox="0 0 330 240" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="ib-s" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d8433a"/><stop offset=".55" stop-color="#9c1d1d"/><stop offset="1" stop-color="#4a0b0c"/></radialGradient>
<radialGradient id="ib-f" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#ffd23a"/><stop offset="1" stop-color="#f39a1c"/></radialGradient></defs>
<ellipse cx="102" cy="232" rx="64" ry="7" fill="#000" opacity=".18"/>
<path d="M152 52C160 8 235 -6 252 74" fill="none" stroke="#6b5a22" stroke-width="22" stroke-linecap="round"/>
<path d="M152 52C160 8 235 -6 252 74" fill="none" stroke="#c9b668" stroke-width="15" stroke-linecap="round"/>
<path d="M156 46C168 14 226 4 244 56" fill="none" stroke="#ece2a4" stroke-width="4" stroke-linecap="round" opacity=".8"/>
<path d="M130 40L164 20L190 66L150 88Z" fill="#8b1c1a" stroke="#1a0505" stroke-width="5" stroke-linejoin="round"/>
<ellipse cx="148" cy="31" rx="19" ry="11" transform="rotate(-28 148 31)" fill="#a02522" stroke="#1a0505" stroke-width="4"/>
<circle cx="102" cy="133" r="94" fill="url(#ib-s)" stroke="#1a0505" stroke-width="5"/>
<path d="M28 108A80 80 0 0 1 98 50" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="9" stroke-linecap="round"/>
<g fill="#f3efe4" stroke="#2a0c0c" stroke-width="3"><ellipse cx="100" cy="104" rx="36" ry="32"/><rect x="82" y="124" width="36" height="20" rx="8"/></g>
<ellipse cx="86" cy="104" rx="9" ry="11" fill="#1a0505"/><ellipse cx="115" cy="102" rx="9" ry="11" fill="#1a0505"/><path d="M101 118l-5 10h10z" fill="#1a0505"/>
${bone(-22)}${bone(22)}
<polygon points="${star(267,122,58,24,9)}" fill="#f39a1c" stroke="#d9780c" stroke-width="3" stroke-linejoin="round"/>
<polygon points="${star(267,122,40,18,9)}" fill="url(#ib-f)"/>
</svg>`,
sign:`<svg viewBox="0 0 150 195" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="is-d" x1="0" x2="1"><stop offset="0" stop-color="#050505"/><stop offset="1" stop-color="#3c3c3c"/></linearGradient>
<linearGradient id="is-y" x1="0" x2="1"><stop offset="0" stop-color="#d6b820"/><stop offset="1" stop-color="#f2d93c"/></linearGradient></defs>
<rect x="2" y="2" width="146" height="200" fill="#0b0b0b"/>
<rect x="96" y="10" width="46" height="200" fill="url(#is-d)"/>
<polygon points="8,12 98,12 98,176 8,200" fill="url(#is-y)" stroke="#111" stroke-width="4"/>
<path d="M12 97H70V83L92 106L70 128V115H12Z" fill="#141414"/>
</svg>`,
placeholder:`<svg viewBox="0 0 150 195" xmlns="http://www.w3.org/2000/svg">
<rect x="14" y="30" width="122" height="122" rx="20" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/>
<text x="75" y="115" text-anchor="middle" font-size="80" font-weight="800" fill="#fff" stroke="#9aa6b0" stroke-width="3" paint-order="stroke">?</text>
</svg>`
};
