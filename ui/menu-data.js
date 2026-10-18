import { createAvatar } from '../Character/avatar-kit.js';

export const MAPS = [
  { id: 1, name: 'Jakarta', cash: 1500, bank: 1500, theme: ['#71bd58', '#f4cb68', '#e25b4a', '#4aa3e2'], desc: 'Kota metropolitan dengan peluang bisnis di setiap sudut.' },
  { id: 2, name: 'Jogja', cash: 2000, bank: 2000, theme: ['#6fc7b5', '#f2a65a', '#3f7fd0', '#e8e4d8'], desc: 'Kota budaya dengan banyak tempat menarik untuk dikembangkan.' },
  { id: 3, name: 'Solo', cash: 2500, bank: 2500, theme: ['#9ad06a', '#d9d4cc', '#7a5a3a', '#e8506a'], desc: 'Bangun kawasan usaha di kota yang nyaman dan bersahabat.' },
  { id: 4, name: 'Malang', cash: 2000, bank: 2000, theme: ['#e8c47a', '#4fb58a', '#c9663a', '#f2e2b4'], desc: 'Kota sejuk untuk memulai perjalanan menjadi taipan.' },
  { id: 5, name: 'Bandung', cash: 2500, bank: 2500, theme: ['#e6f0f8', '#c94a3a', '#4a8fd0', '#7a9a6a'], desc: 'Kembangkan properti di kota kreatif yang terus tumbuh.' },
  { id: 6, name: 'Indonesia', cash: 5000, bank: 5000, theme: ['#5a4a9a', '#ff6fb5', '#35d0e8', '#ffd24a'], desc: 'Tantangan terbesar: bangun kerajaan properti di seluruh Indonesia.' }
];

export const CHARACTERS = [
  { id: 'mimi', name: 'Mimi', kind: 'girl', avatarType: 'fairy', items: ['street-sign-left', 'street-sign-right', 'street-sign-front', 'street-sign-back'], desc: 'Ceria dan selalu punya arah untuk menang.', make: () => createAvatar('fairy', { wave: false }) },
  { id: 'luna', name: 'Luna', kind: 'girl', avatarType: 'witch', items: ['remote-control', 'toolkit'], desc: 'Tenang, cermat, dan selalu menyiapkan strategi.', make: () => createAvatar('witch', { wave: false }) },
  { id: 'princessel', name: 'PrincessEL', kind: 'girl', avatarType: 'princess', items: ['remote-control', 'for-rent'], desc: 'Ceria dan berani mengambil kesempatan.', make: () => createAvatar('princess', { wave: false }) },
  { id: 'rin', name: 'Rin', kind: 'girl', avatarType: 'pilot', items: ['lawyer'], desc: 'Tegas dan berani memperjuangkan lahannya.', make: () => createAvatar('pilot', { wave: false }) },
  { id: 'kai', name: 'Tafa', kind: 'boy', avatarType: 'prince', items: ['thief', 'toolkit'], desc: 'Santai, lincah, dan selalu punya kejutan.', make: () => createAvatar('prince', { wave: false }) },
  { id: 'tafa', name: 'Dika', kind: 'boy', avatarType: 'builder', items: ['stop-sign', 'demolition'], desc: 'Tangguh dan siap membangun atau merombak strategi.', make: () => createAvatar('builder', { wave: false }) }
];

// Komputer memilih karakter secara acak dari sisa karakter (pemain saja yang boleh memilih).
export function pickComputers(characters, chosenId, count = 2, rnd = Math.random) {
  const pool = characters.filter(c => c.id !== chosenId);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, Math.min(count, pool.length));
}
