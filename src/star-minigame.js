import { createChestGame, bankOffer } from './chest-game.js';
import { createCupGame } from './cup-game.js';
import { portrait } from './players.js';

export const STAR_REWARD = 250;

const CHEST_VALUES = [1, 2, 5, 10, 20, 50, 200, 500];
const CHEST_OFFERS = [0.8, 0.92];
const CHEST_OPEN_COUNTS = [3, 3];

function simulateChestGame() {
  const values = CHEST_VALUES.slice();
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  const own = Math.floor(Math.random() * values.length);
  const opened = new Set();

  for (let round = 0; round < CHEST_OPEN_COUNTS.length; round++) {
    const available = values.map((_, index) => index).filter(index => index !== own && !opened.has(index));
    for (let count = 0; count < CHEST_OPEN_COUNTS[round]; count++) {
      const index = Math.floor(Math.random() * available.length);
      opened.add(available.splice(index, 1)[0]);
    }
    const remaining = values.filter((_, index) => !opened.has(index));
    const offer = bankOffer(remaining, CHEST_OFFERS[round]);
    const expected = remaining.reduce((sum, value) => sum + value, 0) / remaining.length;
    if (offer >= expected * (round === 0 ? 0.84 : 0.88)) return offer;
  }
  return values[own];
}

function createOverlay(player) {
  const app = document.getElementById('app');
  if (!app) throw new Error('Kontainer permainan tidak ditemukan untuk mini-game bintang.');

  const overlay = document.createElement('div');
  overlay.className = 'star-game-overlay';
  const container = document.createElement('div');
  container.className = 'star-game-container';
  const avatar = portrait(player);
  avatar.className = 'star-game-player-avatar';
  overlay.append(container, avatar);
  app.append(overlay);
  return { overlay, container };
}

export async function playStarMinigame(player) {
  const chestGame = Math.random() < 0.5;
  if (!player.h) {
    if (chestGame) return simulateChestGame();
    return Math.random() < 1 / 3 ? STAR_REWARD : 0;
  }

  const { overlay, container } = createOverlay(player);
  return new Promise((resolve, reject) => {
    let game;
    try {
      if (chestGame) {
        game = createChestGame(container, {
          values: CHEST_VALUES,
          openPerRound: CHEST_OPEN_COUNTS,
          offerFactors: CHEST_OFFERS,
          onFinish: result => {
            game.destroy();
            overlay.remove();
            resolve(result.winnings);
          }
        });
      } else {
        game = createCupGame(container, {
          reward: STAR_REWARD,
          shuffles: 14,
          onComplete: won => {
            game.destroy();
            overlay.remove();
            resolve(won ? STAR_REWARD : 0);
          }
        });
      }
    } catch (error) {
      overlay.remove();
      reject(error);
    }
  });
}
