import { PROPERTY_TIERS } from './config.js';

export { PROPERTY_TIERS };

const between = (value, min, max) => value >= min && value <= max;
const xBetween = (x, min, max) => between(x, min, max);

export function propertyStarRating({ x, z, s }) {
  if (s === 2) {
    if (between(z, 1, 4)) return 2;
    if (between(z, 9, 12) || between(z, 17, 20)) return 2.5;
    if (between(z, 25, 28) || (z === 30.5 && (x === 5.5 || x === 7.5))) return 3;
    return 1;
  }

  if (x === -1 && between(z, 1, 4)) return 1.5;
  if (x === -1 && between(z, 9, 12)) return 1.5;
  if (x === -1 && (between(z, 17, 20) || between(z, 25, 28))) return 2.5;
  if (x === 10 && between(z, 1, 4)) return 1;
  if (x === 10 && between(z, 9, 12)) return 2;
  if (x === 10 && between(z, 17, 20)) return 2;
  if (x === 10 && between(z, 25, 28)) return 3;
  if (xBetween(x, 1, 3) && (z === 6 || z === 14)) return 1.5;
  if (xBetween(x, 1, 3) && (z === 22 || z === 30)) return 2.5;
  if (xBetween(x, 5, 8) && (z === -1 || z === 6)) return 1;
  if (xBetween(x, 5, 8) && (z === 7 || z === 14 || z === 15 || z === 22)) return 2;
  if (xBetween(x, 5, 8) && z === 23) return 3;
  return 1;
}

export function propertyEconomy(stars, size) {
  const tier = PROPERTY_TIERS[stars] || PROPERTY_TIERS[1];
  const isLarge = size === 2;
  const values = isLarge ? tier.large : tier.small;
  const buildingPrices = isLarge ? values.hotelPrices : values.housePrices;
  const buildingRents = isLarge ? values.hotelRents : values.houseRents;
  return {
    price: values.landPrice,
    rents: [values.landRent, ...buildingRents],
    buildCosts: [0, ...buildingPrices]
  };
}
