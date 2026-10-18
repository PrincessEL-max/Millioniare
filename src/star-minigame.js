import { createCupGame } from './cup-game.js';

export const STAR_REWARD = 250;

export async function playStarMinigame(player) {
  if (!player.h) return Math.random() < 1 / 3;

  const app = document.getElementById('app');
  if (!app) throw new Error('Kontainer permainan tidak ditemukan untuk mini-game bintang.');

  const overlay = document.createElement('div');
  overlay.className = 'star-game-overlay';
  const container = document.createElement('div');
  container.className = 'star-game-container';
  overlay.append(container);
  app.append(overlay);

  return new Promise((resolve, reject) => {
    let game;
    try {
      game = createCupGame(container, {
        reward: STAR_REWARD,
        shuffles: 14,
        onComplete: won => {
          game.destroy();
          overlay.remove();
          resolve(won);
        }
      });
    } catch (error) {
      overlay.remove();
      reject(error);
    }
  });
}
