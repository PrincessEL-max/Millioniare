// Semua suara dibuat dari kode (Web Audio), tidak perlu file audio.
let AC;
export function unlock(){AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume();return AC}
const outG=(c,v)=>{const g=c.createGain();g.gain.value=v;g.connect(c.destination);return g};
function noise(c,out,t,dur,f,q,gain,pow=2){
  const b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,pow);
  const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();
  s.buffer=b;fl.type='bandpass';fl.frequency.value=f;fl.Q.value=q;g.gain.value=gain;
  s.connect(fl).connect(g).connect(out);s.start(t);
}
function tone(c,out,t,type,f0,f1,dur,peak,delay=0){
  const T=t+delay,o=c.createOscillator(),g=c.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,T);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,T+dur*.6);
  g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(peak,T+.004);g.gain.exponentialRampToValueAtTime(.0005,T+dur);
  o.connect(g).connect(out);o.start(T);o.stop(T+dur+.05);
}
// tutup peti terbuka: derit engsel kayu + benturan
export function creak(){
  const c=unlock(),t=c.currentTime,out=outG(c,.8);
  const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
  o.type='sawtooth';o.frequency.setValueAtTime(150,t);o.frequency.linearRampToValueAtTime(380,t+.28);o.frequency.linearRampToValueAtTime(230,t+.5);
  f.type='bandpass';f.frequency.value=700;f.Q.value=4;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.22,t+.06);g.gain.linearRampToValueAtTime(.0001,t+.52);
  o.connect(f).connect(g).connect(out);o.start(t);o.stop(t+.55);
  noise(c,out,t,.45,1400,1.2,.1,1);
}
export function thud(){
  const c=unlock(),t=c.currentTime,out=outG(c,.8);
  tone(c,out,t,'sine',160,60,.16,.9);noise(c,out,t,.04,1500,1,.4);
}
// dentingan koin kecil (isi peti bernilai kecil)
export function ting(){
  const c=unlock(),t=c.currentTime,out=outG(c,.7);
  [[1976,1,.9],[2960,.5,.65],[3951,.28,.45]].forEach(([f,a,d])=>tone(c,out,t,'sine',f,f,d,a*.35));
  [[2637,.5]].forEach(([f,d])=>tone(c,out,t,'sine',f,f,d,.12,.09));
}
// isi peti besar terbuka (bagus untuk pemain jika di peti LAIN? tidak: nilai besar tersingkir = buruk) -> nada turun
export function bad(){
  const c=unlock(),t=c.currentTime,out=outG(c,.7);
  tone(c,out,t,'triangle',392,330,.28,.4);tone(c,out,t,'triangle',311,246,.45,.4,.22);
}
// telepon bank berdering (tawaran muncul)
export function ring(){
  const c=unlock(),t=c.currentTime,out=outG(c,.6);
  for(let k=0;k<4;k++){tone(c,out,t,'sine',1480,1480,.12,.22,k*.18);tone(c,out,t,'sine',1175,1175,.12,.22,k*.18+.09)}
}
// "ching!" kasir (terima tawaran)
export function ching(){
  const c=unlock(),t=c.currentTime,out=outG(c,.85);
  tone(c,out,t,'sine',170,60,.08,.8);noise(c,out,t,.05,1100,.9,.6);
  const T=t+.075;
  [[2093,1],[2637,.8],[3951,.55],[5274,.4],[7459,.22]].forEach(([f,a],i)=>{
    const dur=1.5/(1+i*.5);
    for(const det of[0,2.5+i])tone(c,out,T,'sine',f+det,f+det,dur,a*.12);
  });
}
// suara orang sedih ("ya... aaah", formant manusia)
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
