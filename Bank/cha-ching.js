// Bunyi mesin kasir "Cha-Chinggg!" dibuat dari nol dengan Web Audio API (tanpa file audio).
// "Cha"   = klik laci kasir (derau pita sempit + ketukan rendah)
// "Ching" = lonceng dengan beberapa nada sumbang yang berdenging lama
// Lalu beberapa denting koin kecil. Panggil playChaChing() dari dalam event klik/sentuh (aturan browser).

let ctx = null;

export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function playChaChing(volume = 0.9) {
  const c = unlockAudio();
  if (!c) return;
  const t0 = c.currentTime + 0.01;
  const master = c.createGain(); master.gain.value = 0.8 * volume;
  const comp = c.createDynamicsCompressor(); master.connect(comp); comp.connect(c.destination);

  const nb = c.createBuffer(1, Math.floor(c.sampleRate * 0.4), c.sampleRate), nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  const noise = (t, dur, freq, q, gain) => {
    const s = c.createBufferSource(); s.buffer = nb;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
  };
  const tone = (t, freq, dur, gain, type = 'sine') => {
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(Math.min(freq, c.sampleRate * 0.45), t);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
    return o;
  };
  const bell = (t, f, gain, ring) => [1, 2.756, 5.404, 8.933].forEach((m, i) => tone(t, f * m, ring / (1 + i * 0.8), gain / (1 + i * 0.9)));

  // "Cha": laci kasir terbuka
  noise(t0, 0.07, 3200, 1.2, 0.9); noise(t0 + 0.055, 0.09, 1700, 0.9, 0.6);
  const thunk = tone(t0, 170, 0.14, 0.7); thunk.frequency.exponentialRampToValueAtTime(70, t0 + 0.13);
  // "Ching-ng-ng": dua pukulan lonceng yang berdenging panjang
  bell(t0 + 0.15, 2093, 0.30, 2.4); bell(t0 + 0.23, 3136, 0.20, 2.0);
  // denting koin
  [0.34, 0.41, 0.47, 0.56, 0.62, 0.71].forEach((d, i) => tone(t0 + d, 4800 + ((i * 937) % 2200), 0.18, 0.05 + 0.02 * (i % 3), 'triangle'));
}
