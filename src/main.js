const maps=[
  {id:1,title:'Map 1',size:'X 0–9 · Y 0–5'},
  {id:2,title:'Map 2',size:'X 0–9 · Y 0–13'},
  {id:3,title:'Map 3',size:'X 0–9 · Y 0–21'},
  {id:4,title:'Map 4',size:'X 0–5 · Y 0–13'},
  {id:5,title:'Map 5',size:'X 0–5 · Y 0–29'},
  {id:6,title:'Map 6',size:'Map saat ini'}
];
const overlay=document.getElementById('ov');
document.body.classList.add('map-picking');
const picker=document.createElement('section');
picker.className='map-picker';
const title=document.createElement('h2');
title.textContent='Pilih Map';
const hint=document.createElement('p');
hint.textContent='Pilih papan permainan. Untuk multiplayer, pastikan semua pemain memilih map yang sama.';
const options=document.createElement('div');
options.className='map-options';
const error=document.createElement('div');
error.className='map-picker-error';
error.setAttribute('role','alert');
picker.append(title,hint,options,error);
maps.forEach(map=>{
  const button=document.createElement('button');
  button.type='button';
  button.className='map-choice';
  const name=document.createElement('strong');
  name.textContent=map.title;
  const size=document.createElement('span');
  size.textContent=map.size;
  button.append(name,size);
  button.addEventListener('click',async()=>{
    options.querySelectorAll('button').forEach(choice=>choice.disabled=true);
    error.textContent='';
    try{
      localStorage.setItem('mt3d-map',String(map.id));
      document.body.classList.remove('map-picking');
      await import('./game.js');
    }catch(reason){
      document.body.classList.add('map-picking');
      overlay.replaceChildren(picker);
      error.textContent=`Gagal memuat map: ${reason.message||String(reason)}`;
      options.querySelectorAll('button').forEach(choice=>choice.disabled=false);
    }
  });
  options.append(button);
});
overlay.replaceChildren(picker);
