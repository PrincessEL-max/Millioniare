
import { ITEMS as UI_ITEMS } from '../ui/items.js';

export const ITEMS=UI_ITEMS
  .filter(item=>Number.isSafeInteger(item.price)&&item.price>0&&!item.name.startsWith('('))
  .map(item=>({id:item.id,n:item.name,price:item.price,description:item.description,icon:item.icon}));
