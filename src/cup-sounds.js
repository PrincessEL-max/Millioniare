// Semua suara dibuat dari kode (Web Audio), tidak perlu file audio.
let AC;
export function unlock(){AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume();return AC}
const outG=(c,v)=>{const g=c.createGain();g.gain.value=v;g.connect(c.destination);return g};
function noise(c,out,t,dur,f,q,gain){
  const b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
  const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();
  s.buffer=b;fl.type='bandpass';fl.frequency.value=f;fl.Q.value=q;g.gain.value=gain;
  s.connect(fl).connect(g).connect(out);s.start(t);
}
// gelas menyentuh meja
export function thud(){
  const c=unlock(),t=c.currentTime,out=outG(c,.7),o=c.createOscillator(),g=c.createGain();
  o.frequency.setValueAtTime(170,t);o.frequency.exponentialRampToValueAtTime(65,t+.08);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.9,t+.004);g.gain.exponentialRampToValueAtTime(.001,t+.14);
  o.connect(g).connect(out);o.start(t);o.stop(t+.16);noise(c,out,t,.03,1800,1,.35);
}
// desir gelas saat diputar
export function whoosh(ms){const c=unlock();noise(c,outG(c,.5),c.currentTime,Math.max(.12,ms/1000*.9),650,.8,.07)}
// "ting!" koin
export function ting(){
  const c=unlock(),t=c.currentTime,out=outG(c,.8);
  [[1976,1,1.1],[2960,.5,.8],[3951,.3,.55],[5920,.14,.3]].forEach(([f,a,d])=>{
    const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(a*.35,t+.002);g.gain.exponentialRampToValueAtTime(.0005,t+d);
    o.connect(g).connect(out);o.start(t);o.stop(t+d+.05)});
  [[2637,.6],[3951,.25]].forEach(([f,d])=>{
    const o=c.createOscillator(),g=c.createGain(),T=t+.09;o.frequency.value=f;
    g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(.12,T+.002);g.gain.exponentialRampToValueAtTime(.0005,T+d);
    o.connect(g).connect(out);o.start(T);o.stop(T+d+.05)});
}
// suara orang sedih: "ya... aaaah" (sintesis formant suara manusia)
function voice(c,out,t,f0a,f0b,dur,fa,fb,peak){
  const src=c.createOscillator();src.type='sawtooth';
  src.frequency.setValueAtTime(f0a,t);src.frequency.linearRampToValueAtTime(f0b,t+dur);
  const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=5.5;lg.gain.value=f0a*.025;lfo.connect(lg).connect(src.frequency);
  const env=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3600;
  env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(peak,t+.09);env.gain.setValueAtTime(peak,t+dur*.55);env.gain.linearRampToValueAtTime(0,t+dur);
  fa.forEach((f,i)=>{const bp=c.createBiquadFilter(),g=c.createGain();bp.type='bandpass';bp.Q.value=[7,9,11][i];
    bp.frequency.setValueAtTime(f,t);bp.frequency.linearRampToValueAtTime(fb[i],t+dur);g.gain.value=[1,.55,.25][i];
    src.connect(bp);bp.connect(g);g.connect(env)});
  env.connect(lp);lp.connect(out);src.start(t);lfo.start(t);src.stop(t+dur+.05);lfo.stop(t+dur+.05);
}
export function sad(){
  const c=unlock(),t=c.currentTime,out=outG(c,.9);
  voice(c,out,t,330,300,.42,[700,1100,2600],[820,1250,2700],.45);
  voice(c,out,t+.5,305,160,1.35,[820,1250,2700],[470,830,2500],.5);
}
