import { BUILD, RENT } from './config.js';
import { directedNeighbor, LINKS, MAP, nextPos, T } from './map.js';

const uniqueLots=lots=>[...new Set(lots)].filter(Boolean);
const landingOddsCache=new WeakMap();
const rentAt=(lot,level=lot.lv)=>Math.round(lot.rent*RENT[level]/RENT[0]);
const groupLots=(lot,lots)=>uniqueLots(lots).filter(item=>item.group===lot.group);
const ownedGroupRent=(lot,owner,lots,levelLot=null,level=null)=>groupLots(lot,lots)
  .filter(item=>item.o===owner)
  .reduce((sum,item)=>sum+rentAt(item,item===levelLot?level:item.lv),0);
const petMultiplier=p=>p.pet?.kind==='cat-black'?2:p.pet?.kind==='cat-white'?0.5:1;

export function botReserve(p){
  const total=p.cash+p.bank;
  return Math.max(250,Math.ceil(total*.08));
}

function countOwnedGroup(p,lot,lots){
  return groupLots(lot,lots).filter(item=>item.o===p.i).length;
}

export function shouldBuyLot(p,lot,cost,players,lots){
  if(!p.alive||p.pet?.kind==='baby'||p.cash<cost)return false;
  const reserve=botReserve(p),remaining=p.cash-cost;
  const group=groupLots(lot,lots),owned=countOwnedGroup(p,lot,lots);
  const completesGroup=owned>0&&owned===group.length-1;
  const rental=rentAt(lot);
  return remaining>=reserve||(completesGroup&&remaining>=Math.floor(reserve*.55))||
    (remaining>=Math.floor(reserve*.75)&&rental>=100);
}

export function shouldUpgradeLot(p,lot,cost,players,lots,{free=false}={}){
  if(!p.alive||p.pet?.kind==='baby'||lot.o!==p.i||lot.lv>=5)return false;
  if(!free&&p.cash<cost)return false;
  const remaining=p.cash-(free?0:cost),reserve=botReserve(p);
  if(remaining<reserve)return false;
  const afterRent=ownedGroupRent(lot,p.i,lots,lot,lot.lv+1);
  const beforeRent=ownedGroupRent(lot,p.i,lots);
  const improvement=afterRent-beforeRent;
  return free||improvement>=Math.max(20,cost*.16)||remaining>=reserve*2;
}

export function botCashTarget(p,players,lots){
  const reserve=botReserve(p);
  const affordable=uniqueLots(lots).filter(lot=>lot.o<0&&p.pet?.kind!=='baby')
    .map(lot=>lot.price*petMultiplier(p));
  return reserve+Math.max(100,...affordable);
}

function stateKey(state){
  return `${state.pos}:${state.prev}:${state.forced??''}:${state.stopped?1:0}:${state.stepsUsed}:${[...state.usedSigns].sort((a,b)=>a-b).join(',')}`;
}

function obstacleFor(ctx,tile,overlay){
  if(overlay?.tile===tile)return overlay;
  return ctx.obstacles.get(tile);
}

function moveOptions(state,firstMove){
  if(firstMove&&Number.isInteger(firstMove.to)&&firstMove.from===state.pos&&firstMove.prev===state.prev)
    return [firstMove.to];
  if(state.pos<0)return [nextPos(state.pos,state.prev)].filter(Number.isInteger);
  if(Number.isInteger(state.forced))return [state.forced];
  const neighbors=LINKS[state.pos]||[];
  const options=neighbors.filter(index=>index!==state.prev);
  return options.length?options:neighbors;
}

function simulateRoll(p,roll,ctx,overlay=null){
  let states=[{pos:p.pos,prev:p.prev,forced:null,usedSigns:new Set(),weight:1,stopped:false,stepsUsed:0}];
  const firstMove=p.nextMove;
  for(let step=0;step<roll;step++){
    const nextStates=new Map();
    for(const state of states){
      if(state.stopped){const key=stateKey(state);const old=nextStates.get(key);if(old)old.weight+=state.weight;else nextStates.set(key,state);continue}
      const options=moveOptions(state,step===0?firstMove:null);
      if(!options.length){const ended={...state,stopped:true,stepsUsed:step};const key=stateKey(ended);const old=nextStates.get(key);if(old)old.weight+=state.weight;else nextStates.set(key,ended);continue}
      for(const tile of options){
        const obstacle=obstacleFor(ctx,tile,overlay),usedSigns=new Set(state.usedSigns);
        let forced=null,stopped=false;
        if(obstacle?.id==='stop-sign')stopped=true;
        if(obstacle?.id==='street-sign'&&!usedSigns.has(tile)){
          usedSigns.add(tile);
          forced=directedNeighbor(tile,obstacle.dir)??null;
        }
        const branch={pos:tile,prev:state.pos,forced,usedSigns,weight:state.weight/options.length,stopped,
          stepsUsed:step+1};
        const key=stateKey(branch),old=nextStates.get(key);
        if(old)old.weight+=branch.weight;else nextStates.set(key,branch);
      }
    }
    states=[...nextStates.values()];
  }
  return states;
}

function petValue(p,kind,ctx){
  const upgradeReady=uniqueLots(ctx.lots).some(lot=>lot.o===p.i&&lot.lv<5);
  if(kind==='baby')return p.cash>p.bank+500?-14:4;
  if(kind==='cat-black')return p.cash<700?-13:-2;
  if(kind==='cat-white')return p.cash<1200?12:8;
  if(kind==='santa')return upgradeReady?20:7;
  return 0;
}

function evaluateLanding(p,tile,ctx){
  const kind=T[tile]?.[1],lot=ctx.lots[tile];
  let value=0;
  if(kind==='pad')value+=T[tile][2]*.8;
  if(kind==='bus')value+=p.cash>botReserve(p)+300?8:3;
  if(kind==='bank')value+=Math.min(Math.max(0,botCashTarget(p,ctx.players,ctx.lots)-p.cash),p.bank)*.12;
  if(kind==='l'&&lot){
    if(lot.o<0){
      const cost=lot.price*petMultiplier(p);
      if(shouldBuyLot(p,lot,cost,ctx.players,ctx.lots)){
        const group=groupLots(lot,ctx.lots),owned=countOwnedGroup(p,lot,ctx.lots);
        value+=24+rentAt(lot)*.45+(owned?35:0)+(owned===group.length-1&&owned>0?65:0);
      }else value-=8;
    }else if(lot.o===p.i){
      if(p.pet?.kind!=='baby'&&lot.lv<5){
        const cost=BUILD[lot.lv+1]*petMultiplier(p);
        if(shouldUpgradeLot(p,lot,cost,ctx.players,ctx.lots))
          value+=Math.max(3,(rentAt(lot,lot.lv+1)-rentAt(lot))*.15);
      }
    }else{
      value-=ownedGroupRent(lot,lot.o,ctx.lots)*petMultiplier(p)*.5;
    }
  }
  const pet=ctx.pets.get(tile);
  if(pet)value+=petValue(p,pet.kind,ctx);
  if(obstacleFor(ctx,tile,null)?.id==='bomb')value-=950;
  return value;
}

export function scoreBotRoll(p,roll,ctx,overlay=null){
  return simulateRoll(p,roll,ctx,overlay).reduce((sum,state)=>{
    const unused=state.stopped?Math.max(0,roll-state.stepsUsed):0;
    return sum+state.weight*(evaluateLanding(p,state.pos,ctx)-unused*8);
  },0);
}

export function chooseBotRoll(p,ctx){
  if(p.nextRoll)return null;
  const scores=Array.from({length:6},(_,index)=>scoreBotRoll(p,index+1,ctx));
  const average=scores.reduce((sum,value)=>sum+value,0)/scores.length;
  const best=Math.max(...scores),roll=scores.indexOf(best)+1;
  return best-average>=12?roll:null;
}

function predictedLandingOdds(p,ctx){
  let playerCache=landingOddsCache.get(ctx);
  if(!playerCache){playerCache=new Map();landingOddsCache.set(ctx,playerCache)}
  if(playerCache.has(p.i))return playerCache.get(p.i);
  const odds=new Map();
  for(let roll=1;roll<=6;roll++)
    for(const state of simulateRoll(p,roll,ctx))
      odds.set(state.pos,(odds.get(state.pos)||0)+state.weight/6);
  playerCache.set(p.i,odds);
  return odds;
}

function candidateObstacle(ctx,kind){
  const rivals=ctx.players.filter(player=>player.alive&&player.i!==ctx.currentPlayer);
  const odds=new Map();
  for(const rival of rivals){
    const landing=predictedLandingOdds(rival,ctx);
    landing.forEach((chance,tile)=>odds.set(tile,(odds.get(tile)||0)+chance));
  }
  const candidates=ctx.pathTiles.filter(tile=>!ctx.obstacles.has(tile));
  const best=candidates.map(tile=>({tile,score:(odds.get(tile)||0)*(kind==='bomb'?1100:220)}))
    .sort((a,b)=>b.score-a.score)[0];
  return best?.score>25?best.tile:null;
}

export function chooseBotTarget(p,id,ctx){
  if(id==='broom'){
    return [...ctx.obstacles.entries()]
      .filter(([,obstacle])=>obstacle.id==='bomb'||obstacle.id==='stop-sign'||obstacle.id==='street-sign')
      .map(([tile])=>({tile,score:scoreBotRoll(p,4,ctx)-scoreBotRoll(p,4,ctx,{id:'broom-cleared',tile})}))
      .sort((a,b)=>b.score-a.score)[0]?.score>30
      ?[...ctx.obstacles.entries()].map(([tile])=>({tile,score:scoreBotRoll(p,4,ctx)-scoreBotRoll(p,4,ctx,{id:'broom-cleared',tile})}))
        .sort((a,b)=>b.score-a.score)[0].tile:null;
  }
  if(id==='demolition'){
    return uniqueLots(ctx.lots).map(lot=>({lot,score:lot.o!==p.i&&lot.o>=0&&lot.lv>0
      ?(rentAt(lot,lot.lv)-rentAt(lot,0))*3+lot.lv*25:0}))
      .sort((a,b)=>b.score-a.score)[0]?.lot??null;
  }
  if(id==='for-rent'){
    return uniqueLots(ctx.lots).map(lot=>({lot,score:lot.o<0
      ?rentAt(lot)*2+(countOwnedGroup(p,lot,ctx.lots)?80:0)-lot.price*.25:0}))
      .sort((a,b)=>b.score-a.score)[0]?.lot;
  }
  if(id==='bomb'||id==='stop-sign')return candidateObstacle(ctx,id);
  if(id.startsWith('street-sign-')||id==='street-sign'){
    const directions={'street-sign-front':'back','street-sign-right':'right',
      'street-sign-back':'front','street-sign-left':'left','street-sign':'back'};
    const rivals=ctx.players.filter(player=>player.alive&&player.i!==p.i);
    const reachable=new Map();
    for(const rival of rivals)predictedLandingOdds(rival,ctx).forEach((chance,tile)=>
      reachable.set(tile,(reachable.get(tile)||0)+chance));
    const candidates=[...reachable.entries()].filter(([,chance])=>chance>.015)
      .sort((a,b)=>b[1]-a[1]).slice(0,18).map(([tile])=>tile);
    const normal=rivals.reduce((sum,rival)=>{
      for(let roll=1;roll<=6;roll++)sum+=scoreBotRoll(rival,roll,ctx)/6;
      return sum;
    },0);
    let bestTile=null,bestScore=0;
    for(const tile of candidates){
      if(ctx.obstacles.has(tile))continue;
      const affected=rivals.reduce((sum,rival)=>{
        for(let roll=1;roll<=6;roll++)
          sum+=scoreBotRoll(rival,roll,ctx,{id:'street-sign',tile,dir:directions[id]})/6;
        return sum;
      },0);
      const score=(normal-affected)/(rivals.length||1);
      if(score>bestScore){bestScore=score;bestTile=tile}
    }
    return bestScore>=18?bestTile:null;
  }
  if(id==='lawyer'){
    const lot=ctx.lots[p.pos];
    return lot&&lot.o>=0&&lot.o!==p.i?p.pos:null;
  }
  return null;
}

export function botItemValue(id,p,ctx){
  const rivals=ctx.players.filter(player=>player.alive&&player.i!==p.i);
  const reserve=botReserve(p);
  if(id==='computer')return p.bank>0&&p.cash<botCashTarget(p,ctx.players,ctx.lots)
    ?Math.min(p.bank,botCashTarget(p,ctx.players,ctx.lots)-p.cash)*.85-50:-Infinity;
  if(id==='remote-control')return chooseBotRoll(p,ctx)!==null?300:-Infinity;
  if(id==='thief')return Math.max(0,...rivals.map(rival=>Math.floor(rival.cash*.25)))*1.4-125;
  if(id==='toolkit'){
    const ready=uniqueLots(ctx.lots).some(lot=>shouldUpgradeLot(p,lot,0,ctx.players,ctx.lots,{free:true}));
    return ready?300:-Infinity;
  }
  if(id==='lawyer'){
    const chances=predictedLandingOdds(p,ctx);
    const value=uniqueLots(ctx.lots).reduce((sum,lot)=>{
      if(lot.o<0||lot.o===p.i)return sum;
      const tile=ctx.lots.indexOf(lot),chance=chances.get(tile)||0;
      return sum+chance*(lot.price+lot.lv*100);
    },0);
    return value>200?value*3-325:-Infinity;
  }
  if(id==='demolition'){
    const target=chooseBotTarget(p,id,ctx);
    return target&&target.o!==p.i&&target.lv>0
      ?(rentAt(target,target.lv)-rentAt(target,0))*3+target.lv*25-175:-Infinity;
  }
  if(id==='for-rent'){
    const target=chooseBotTarget(p,id,ctx);
    return target?.o<0&&p.cash-target.price>=reserve
      ?target.price+rentAt(target)*5+100:-Infinity;
  }
  if(id==='broom')return chooseBotTarget(p,id,ctx)!==null?110:-Infinity;
  if(id==='bomb')return chooseBotTarget(p,id,ctx)!==null?200:-Infinity;
  if(id==='stop-sign'||id.startsWith('street-sign'))
    return chooseBotTarget(p,id,ctx)!==null?170:-Infinity;
  return -Infinity;
}

export function chooseBotShopItem(stock,p,ctx){
  const reserve=botReserve(p);
  return stock.map(item=>({item,value:botItemValue(item.id,p,ctx)-item.price*1.15}))
    .filter(choice=>choice.value>0&&(choice.item.id==='computer'
      ?p.cash+p.bank-choice.item.price>=reserve
      :p.cash-choice.item.price>=reserve))
    .sort((a,b)=>b.value-a.value)[0]?.item??null;
}
