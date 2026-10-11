// Coordinate unit = one tile. x goes right; z goes down the screen.
const PADC={20:0x1e6fe0,50:0x00bcd4,100:0x2e9e2e};
const road=(x,z)=>({p:[x,z]});
const lot=(x,z,lx,lz,n,s=1,group='')=>({p:[x,z],lot:{x:lx,z:lz,s,n,id:n,group}});
export const pad=(x,z,v)=>({p:[x,z],ic:{t:'pad',v,c:PADC[v]||0x888888}});
export const bus=(x,z)=>({p:[x,z],ic:{t:'bus'}});
const bank=(x,z)=>({p:[x,z],ic:{t:'bank'}});
const star=(x,z)=>({p:[x,z],ic:{t:'star'}});

export const START=[-2,-4];
const tiles=new Map(), put=tile=>tiles.set(tile.p.join(','),tile);
const putRoad=(x,z)=>put(road(x,z));

// Compact ring and middle lane, leaving enough road frontage for the lots.
for(let x=-4;x<=5;x++)putRoad(x,-1);
for(let z=0;z<=4;z++)putRoad(5,z);
for(let x=4;x>=-4;x--)putRoad(x,4);
for(let z=3;z>=0;z--)putRoad(-4,z);
for(let z=0;z<4;z++)putRoad(0,z);

// Start spur and the special spaces copied from the sketch.
put(bus(-2,-3)); put(pad(-2,-2,20));
put(star(-4,-1)); put(bus(-3,-1)); put(bank(-2,-1));
put(pad(-1,-1,50)); put(pad(0,-1,100)); put(pad(5,-1,20));
put(pad(-4,4,50)); put(bus(0,4)); put(pad(5,4,50));

// Small lots occupy one tile; large lots are 2x2 plots (four times the area)
// and share one property across the two adjacent road spaces.
const smallLots=[
  ...[0,1,2,3].map(z=>({x:-4,z,lx:-5,lz:z,n:`West ${z+1}`,group:'west'})),
  ...[0,1,2,3].map(z=>({x:5,z,lx:6,lz:z,n:`East ${z+1}`,group:'east'})),
  ...[1,2,3,4].map(x=>({x,z:-1,lx:x,lz:-2,n:`North East ${x}`,group:'north-east'})),
  ...[-3,-2,-1].map(x=>({x,z:4,lx:x,lz:5,n:`South West ${x}`,group:'south-west'})),
  ...[1,2,3,4].map(x=>({x,z:4,lx:x,lz:5,n:`South East ${x}`,group:'south-east'}))
];
for(const d of smallLots)put(lot(d.x,d.z,d.lx,d.lz,d.n,1,d.group));
const largeLots=[
  {tiles:[[0,0],[0,1]],x:-1.5,z:.5,n:'Central Hotel Lot',group:'middle'},
  {tiles:[[0,2],[0,3]],x:-1.5,z:2.5,n:'Central Restaurant Lot',group:'middle'}
];
for(const d of largeLots){
  const property={x:d.x,z:d.z,s:2,n:d.n,id:d.n,group:d.group};
  for(const [x,z] of d.tiles)put({p:[x,z],lot:property});
}
export const MAP=[...tiles.values()];
export const TREES={fixed:[],random:{n:0,box:[-8,-8,8,8]}};
export const T=MAP.map(m=>m.lot?[m.lot.n,'l']:m.ic?
  m.ic.t=='bus'?['Bus','bus']:m.ic.t=='bank'?['Tabungan','bank']:
  m.ic.t=='star'?['Bintang','star']:[String(m.ic.v),'pad',m.ic.v,m.ic.c]:['Jalan','r']);
export const N=MAP.length;
const at=new Map(MAP.map((m,i)=>[m.p.join(','),i]));
const around=MAP.map(m=>[[1,0],[-1,0],[0,1],[0,-1]]
  .map(([dx,dz])=>at.get(`${m.p[0]+dx},${m.p[1]+dz}`)).filter(i=>i!==undefined));
export const LINKS=Object.fromEntries(around.map((neighbors,i)=>[i,neighbors]));
const startBus=at.get('-2,-3');
export const tp=i=>i==-1?[START[0]*2,START[1]*2]:[MAP[i].p[0]*2,MAP[i].p[1]*2];
export const nextPos=(pos,prev)=>{
  // START is a one-time spawn point, never a road destination.
  if(pos==-1)return startBus;
  const options=(LINKS[pos]||[]).filter(i=>i!==prev);
  const choices=options.length?options:LINKS[pos]||[];
  return choices[Math.floor(Math.random()*choices.length)];
};
export const sn=i=>i<0?'Start':T[i][0];
