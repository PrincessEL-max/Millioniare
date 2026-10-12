// Coordinate unit = one tile. x goes right; z goes down the screen.
const PADC={20:0x1e6fe0,50:0x00bcd4,100:0x2e9e2e};
const road=(x,z)=>({p:[x,z]});
const pad=(x,z,v)=>({p:[x,z],ic:{t:'pad',v,c:PADC[v]||0x888888}});
const bus=(x,z)=>({p:[x,z],ic:{t:'bus'}});
const bank=(x,z)=>({p:[x,z],ic:{t:'bank'}});
const star=(x,z)=>({p:[x,z],ic:{t:'star'}});

export const START=[2,-3];
const tiles=new Map(),put=tile=>tiles.set(tile.p.join(','),tile);
const putRoad=(x,z)=>put(road(x,z));

// Four connected rectangular loops share the outer roads and the center lane.
const topRows=[0,8,16,24],crossRows=[5,13,21,29];
for(let z=0;z<=29;z++){
  putRoad(0,z);putRoad(4,z);putRoad(9,z);
}
for(const z of [...topRows,...crossRows])
  for(let x=0;x<=9;x++)putRoad(x,z);

// Start spur feeds into the first loop.
put(bus(2,-2));put(pad(2,-1,20));

// Repeated special spaces on the top and bottom roads of each loop.
for(const z of topRows){
  put(star(0,z));put(bus(1,z));put(bank(2,z));put(pad(3,z,50));
  put(pad(4,z,100));put(pad(9,z,20));
}
for(const z of crossRows){
  put(pad(0,z,50));put(bus(4,z));put(pad(9,z,50));
}

// Small lots line the outside roads, and large hotel lots front the center lane.
let smallId=0,largeId=0;
const placeLot=(x,z,lx,lz,name,size=1,group='')=>{
  const key=`${x},${z}`,existing=tiles.get(key);
  const tile={p:[x,z],lot:{x:lx,z:lz,s:size,n:name,id:name,group}};
  if(existing?.ic)tile.ic=existing.ic;
  put(tile);
};
for(const [loopIndex,base] of topRows.entries()){
  if(base>0){
    for(let z=base+1;z<=base+4;z++){
      placeLot(0,z,-1,z,`Outer West ${++smallId}`,1,`outer-west-${loopIndex}`);
      placeLot(9,z,10,z,`Outer East ${smallId}`,1,`outer-east-${loopIndex}`);
    }
  }else{
    for(let z=1;z<=4;z++){
      placeLot(0,z,-1,z,`Outer West ${++smallId}`,1,`outer-west-${loopIndex}`);
      placeLot(9,z,10,z,`Outer East ${smallId}`,1,`outer-east-${loopIndex}`);
    }
  }
  for(let offset=1;offset<=4;offset+=2){
    const z=base+offset,property={x:2.5,z:z+.5,s:2,n:`Hotel Land ${++largeId}`,id:`Hotel Land ${largeId}`,group:`hotel-land-${largeId}`};
    for(let dz=0;dz<2;dz++)put({p:[4,z+dz],lot:property});
  }
}

// Small plots sit between consecutive horizontal roads; each row is buyable
// from the road directly beside it.
for(const [section,z] of crossRows.entries()){
  const lotZ=z+1;
  for(let x=1;x<=3;x++)placeLot(x,z,x,lotZ,`Inner West ${++smallId}`,1,`inner-west-${section}`);
  if(section<3)for(let x=5;x<=8;x++)
    placeLot(x,z,x,lotZ,`Inner East ${++smallId}`,1,`inner-east-${section}-upper`);
}
for(let section=1;section<4;section++){
  const roadZ=topRows[section],lotZ=roadZ-1;
  for(let x=5;x<=8;x++)
    placeLot(x,roadZ,x,lotZ,`Inner East ${++smallId}`,1,`inner-east-${section}-lower`);
}

// The final four frontage spaces offer two independent 2x2 hotel plots.
for(let x=5;x<=8;x++){
  const left=x<=6,centerX=left?5.5:7.5,id=left?'Hotel Land South A':'Hotel Land South B';
  const property={x:centerX,z:31,s:2,n:id,id,group:'hotel-land-south'};
  put({p:[x,29],lot:property});
}
// Four plots above the first loop match the entrance approach in the sketch.
for(let x=5;x<=8;x++)placeLot(x,0,x,-1,`Entrance ${++smallId}`,1,'entrance');

export const MAP=[...tiles.values()];
export const TREES={fixed:[],random:{n:0,box:[-8,-8,8,8]}};
export const T=MAP.map(m=>m.lot?[m.lot.n,'l',m.ic||null]:m.ic?
  m.ic.t=='bus'?['Bus','bus']:m.ic.t=='bank'?['Tabungan','bank']:
  m.ic.t=='star'?['Bintang','star']:[String(m.ic.v),'pad',m.ic.v,m.ic.c]:['Jalan','r']);
export const N=MAP.length;
const at=new Map(MAP.map((m,i)=>[m.p.join(','),i]));
const around=MAP.map(m=>[[1,0],[-1,0],[0,1],[0,-1]]
  .map(([dx,dz])=>at.get(`${m.p[0]+dx},${m.p[1]+dz}`)).filter(i=>i!==undefined));
export const LINKS=Object.fromEntries(around.map((neighbors,i)=>[i,neighbors]));
const startBus=at.get('2,-2');
export const tp=i=>i==-1?[START[0]*2,START[1]*2]:[MAP[i].p[0]*2,MAP[i].p[1]*2];
export const nextPos=(pos,prev)=>{
  if(pos==-1)return startBus;
  const options=(LINKS[pos]||[]).filter(i=>i!==prev);
  const choices=options.length?options:LINKS[pos]||[];
  return choices[Math.floor(Math.random()*choices.length)];
};
export const sn=i=>i<0?'Start':T[i][0];
