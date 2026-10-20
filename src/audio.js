import { getMenuOptions } from '../ui/main-menu.js';
import { tuk as playTuk } from '../ui/sound.js';

const ASSETS = {
  bank: new URL('./audio-assets/Bank.wav', import.meta.url).href,
  baby: new URL('./audio-assets/Bayi.wav', import.meta.url).href,
  bomb: new URL('./audio-assets/Bomb.wav', import.meta.url).href,
  coins: new URL('./audio-assets/Coins.wav', import.meta.url).href,
  dice: new URL('./audio-assets/Dadu.wav', import.meta.url).href,
  catBlack: new URL('./audio-assets/Kucing hitam.wav', import.meta.url).href,
  catWhite: new URL('./audio-assets/Kucing putih.wav', import.meta.url).href,
  santa: new URL('./audio-assets/Santa.wav', import.meta.url).href,
  music: new URL('./audio-assets/Sound game.wav', import.meta.url).href,
  players: {
    1: {
      turn: new URL('./audio-assets/P1.mp3', import.meta.url).href,
      win: new URL('./audio-assets/WinP1.mp3', import.meta.url).href,
      lose: new URL('./audio-assets/LoseP1.mp3', import.meta.url).href
    },
    2: {
      turn: new URL('./audio-assets/P2.mp3', import.meta.url).href,
      win: new URL('./audio-assets/WinP2.mp3', import.meta.url).href,
      lose: new URL('./audio-assets/LoseP2.mp3', import.meta.url).href
    },
    3: {
      turn: new URL('./audio-assets/P3.mp3', import.meta.url).href,
      win: new URL('./audio-assets/WinP3.mp3', import.meta.url).href,
      lose: new URL('./audio-assets/LoseP3.mp3', import.meta.url).href
    },
    4: {
      turn: new URL('./audio-assets/P4.mp3', import.meta.url).href,
      win: new URL('./audio-assets/WinP4.mp3', import.meta.url).href,
      lose: new URL('./audio-assets/LoseP4.mp3', import.meta.url).href
    },
    5: {
      turn: new URL('./audio-assets/P5.mp3', import.meta.url).href,
      win: new URL('./audio-assets/WinP5.mp3', import.meta.url).href,
      lose: new URL('./audio-assets/LoseP5.mp3', import.meta.url).href
    },
    6: {
      turn: new URL('./audio-assets/P6.mp3', import.meta.url).href,
      win: new URL('./audio-assets/WinP6.mp3', import.meta.url).href,
      lose: new URL('./audio-assets/LoseP6.mp3', import.meta.url).href
    }
  }
};

const CHARACTER_PLAYER = { mimi: 1, kai: 2, tafa: 3, luna: 4, princessel: 5, rin: 6 };
const activeEffects = new Set();
let musicAudio = null;

function options() {
  return getMenuOptions();
}

function playUrl(url, volume = 0.8) {
  if (!options().sound) return;
  const audio = new Audio(url);
  audio.volume = volume;
  activeEffects.add(audio);
  audio.addEventListener('ended', () => activeEffects.delete(audio), { once: true });
  audio.addEventListener('error', () => {
    activeEffects.delete(audio);
    console.error(`Audio gagal dimuat: ${url}`);
  }, { once: true });
  audio.play().catch(error => {
    activeEffects.delete(audio);
    console.warn('Pemutaran audio diblokir atau gagal:', error);
  });
}

export function playEffect(name) {
  const url = ASSETS[name];
  if (!url) throw new Error(`Efek audio tidak dikenal: ${name}`);
  playUrl(url);
}

export function playHammerTuk() {
  if (options().sound) playTuk();
}

function playPlayerLine(player, line) {
  if (!player) return Promise.resolve();
  const playerNumber = CHARACTER_PLAYER[player.characterId] || player.i + 1;
  const url = ASSETS.players[playerNumber]?.[line];
  if (!url || !options().sound) return Promise.resolve();
  const audio = new Audio(url);
  audio.volume = 0.8;
  activeEffects.add(audio);
  return new Promise(resolve => {
    let guard = 0;
    const finish = () => {
      clearTimeout(guard);
      activeEffects.delete(audio);
      audio.removeEventListener('ended', finish);
      audio.removeEventListener('error', onError);
      resolve();
    };
    const onError = () => {
      console.error(`Audio gagal dimuat: ${url}`);
      finish();
    };
    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener('error', onError, { once: true });
    // Pengaman: jika suara macet dan event 'ended' tidak pernah datang, game tetap lanjut.
    guard = setTimeout(() => { audio.pause(); finish(); }, 8000);
    audio.play().catch(error => {
      console.warn('Pemutaran audio diblokir atau gagal:', error);
      finish();
    });
  });
}

export const playPlayerTurn = player => {
  return player?.h ? playPlayerLine(player, 'turn') : Promise.resolve();
};
export const playPlayerWin = player => playPlayerLine(player, 'win');
export const playPlayerLose = player => playPlayerLine(player, 'lose');

export function playPetArrival(kind) {
  const sounds = { baby: 'baby', 'cat-black': 'catBlack', 'cat-white': 'catWhite', santa: 'santa' };
  const sound = sounds[kind];
  if (sound) playEffect(sound);
}

export function startGameMusic() {
  if (!options().music || musicAudio) return;
  musicAudio = new Audio(ASSETS.music);
  musicAudio.loop = true;
  musicAudio.volume = 0.28;
  musicAudio.addEventListener('error', () => {
    console.error('BGM permainan gagal dimuat.');
    musicAudio = null;
  }, { once: true });
  musicAudio.play().catch(error => {
    console.warn('BGM diblokir atau gagal diputar:', error);
    if (error.name === 'NotAllowedError') {
      const resume = () => {
        document.removeEventListener('pointerdown', resume);
        if (musicAudio) musicAudio.play().catch(retryError => {
          console.error('BGM tetap gagal diputar setelah interaksi pengguna:', retryError);
        });
      };
      document.addEventListener('pointerdown', resume, { once: true });
    }
  });
}

export function stopGameMusic() {
  if (!musicAudio) return;
  musicAudio.pause();
  musicAudio.currentTime = 0;
  musicAudio = null;
}

export function pauseGameMusic() {
  if (musicAudio) musicAudio.pause();
}

export function resumeGameMusic() {
  if (!musicAudio || !options().music) return;
  musicAudio.play().catch(error => console.warn('BGM gagal dilanjutkan:', error));
}
