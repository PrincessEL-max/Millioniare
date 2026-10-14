import { createChibi } from '../Character/chibi.js';
import { createChibiBoy } from '../Character/chibi-boy.js';

export const MAPS = [
  { id: 1, name: 'Jakarta', cash: 1500, bank: 1500, theme: ['#71bd58', '#f4cb68', '#e25b4a', '#4aa3e2'], desc: 'Kota metropolitan dengan peluang bisnis di setiap sudut.' },
  { id: 2, name: 'Jogja', cash: 2000, bank: 2000, theme: ['#6fc7b5', '#f2a65a', '#3f7fd0', '#e8e4d8'], desc: 'Kota budaya dengan banyak tempat menarik untuk dikembangkan.' },
  { id: 3, name: 'Solo', cash: 2500, bank: 2500, theme: ['#9ad06a', '#d9d4cc', '#7a5a3a', '#e8506a'], desc: 'Bangun kawasan usaha di kota yang nyaman dan bersahabat.' },
  { id: 4, name: 'Malang', cash: 2000, bank: 2000, theme: ['#e8c47a', '#4fb58a', '#c9663a', '#f2e2b4'], desc: 'Kota sejuk untuk memulai perjalanan menjadi taipan.' },
  { id: 5, name: 'Bandung', cash: 2500, bank: 2500, theme: ['#e6f0f8', '#c94a3a', '#4a8fd0', '#7a9a6a'], desc: 'Kembangkan properti di kota kreatif yang terus tumbuh.' },
  { id: 6, name: 'Indonesia', cash: 5000, bank: 5000, theme: ['#5a4a9a', '#ff6fb5', '#35d0e8', '#ffd24a'], desc: 'Tantangan terbesar: bangun kerajaan properti di seluruh Indonesia.' }
];

export const CHARACTERS = [
  { id: 'mimi', name: 'Mimi', kind: 'girl', items: ['street-sign-left', 'street-sign-right', 'street-sign-front', 'street-sign-back'], desc: 'Ceria dan selalu punya arah untuk menang.', make: () => createChibi({ wave: true }) },
  { id: 'luna', name: 'Luna', kind: 'girl', items: ['remote-control', 'toolkit'], desc: 'Tenang, cermat, dan selalu menyiapkan strategi.', make: () => createChibi({ wave: true, hair: 0x2a2438, eyes: 0x8a5cff, sweater: 0xb9a2e8, trim: 0xe8c7f0, plaidA: 0x7a5aa8, plaidB: 0xf3d6ee, boots: 0x5a4a6a, ribbon: 0xff8ac0, socks: 0xd8d0e0 }) },
  { id: 'mika', name: 'Mika', kind: 'girl', items: ['remote-control', 'for-rent'], desc: 'Ceria dan berani mengambil kesempatan.', make: () => createChibi({ wave: true, hair: 0xe8b84a, eyes: 0x3a8ae8, sweater: 0xf6d36a, trim: 0x9bd0a8, plaidA: 0x3f8a5a, plaidB: 0xf1ead0, boots: 0x9a6a4a, ribbon: 0xff9a6a }) },
  { id: 'rin', name: 'Rin', kind: 'girl', items: ['lawyer'], desc: 'Tegas dan berani memperjuangkan lahannya.', make: () => createChibi({ wave: true, hair: 0xa8402a, eyes: 0x4ab36a, skin: 0xf4cdb4, sweater: 0x9fd8c4, trim: 0xe8b49a, plaidA: 0x8a4a3a, plaidB: 0xf0dcc4, boots: 0x6a4a3a, ribbon: 0xe85a5a }) },
  { id: 'kai', name: 'Kai', kind: 'boy', items: ['thief', 'bomb'], desc: 'Santai, lincah, dan selalu punya kejutan.', make: () => createChibiBoy({ outfit: 'hoodie' }) },
  { id: 'dika', name: 'Dika', kind: 'boy', items: ['stop-sign', 'demolition'], desc: 'Tangguh dan siap membangun atau merombak strategi.', make: () => createChibiBoy({ outfit: 'hoodie', hair: 0x1c1c26, eyes: 0xc2503a, top: 0x3aa6a0, trim: 0x2a827d, pants: 0x4a4a58, accent: 0xf2c94a }) }
];

// Komputer memilih karakter secara acak dari sisa karakter (pemain saja yang boleh memilih).
export function pickComputers(characters, chosenId, count = 2, rnd = Math.random) {
  const pool = characters.filter(c => c.id !== chosenId);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, Math.min(count, pool.length));
}
