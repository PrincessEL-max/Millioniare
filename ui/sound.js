// Semua suara dibuat dari kode (Web Audio), tidak perlu file audio.
let AC;
export function audio(){
  AC=AC||new (window.AudioContext||window.webkitAudioContext)();
  if(AC.state!=='running')AC.resume();
  return AC;
}
function noiseBurst(c,out,t,dur,freq,q,gain){
  const n=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=n.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  s.buffer=n;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;g.gain.value=gain;
  s.connect(f).connect(g).connect(out);s.start(t);
}
function tone(c,out,t,type,f0,f1,dur,peak){
  const o=c.createOscillator(),g=c.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);
  if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur*.5);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+.003);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g).connect(out);o.start(t);o.stop(t+dur+.02);
}
function master(c,v){const g=c.createGain();g.gain.value=v;g.connect(c.destination);return g}

// "tuk" ketukan palu kayu
export function tuk(){
  const c=audio(),t=c.currentTime,out=master(c,.9);
  tone(c,out,t,'sine',340,105,.11,1);
  tone(c,out,t,'triangle',900,520,.06,.35);
  noiseBurst(c,out,t,.03,2200,1.3,.7);
}
// "ching!" mesin kasir: "ka" mekanik lalu bel logam
export function ching(){
  const c=audio(),t=c.currentTime,out=master(c,.85);
  tone(c,out,t,'sine',170,60,.08,.8);
  noiseBurst(c,out,t,.05,1100,.9,.6);
  const T=t+.075;
  [[2093,1],[2637,.8],[3951,.55],[5274,.4],[7459,.22]].forEach(([f,a],i)=>{
    const dur=1.5/(1+i*.5);
    for(const det of[0,2.5+i]){            // dua osilator beda tipis -> bel terdengar bergetar
      const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f+det;
      g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(a*.12,T+.002);g.gain.exponentialRampToValueAtTime(.0008,T+dur);
      o.connect(g).connect(out);o.start(T);o.stop(T+dur+.05);
    }
  });
  noiseBurst(c,out,T,.02,6000,2,.35);
}
// bunyi gagal (uang tidak cukup)
export function nope(){
  const c=audio(),t=c.currentTime,out=master(c,.7);
  tone(c,out,t,'square',150,90,.2,.18);
}
