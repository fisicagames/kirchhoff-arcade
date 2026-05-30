import { state } from '../model/gameState';

export const audio = {
  bgMusic:   new Audio('./src/assets/melodyayresgriffiths.mp3?v=2'),
  rotateSfx: new Audio('./src/assets/rotate.mp3?v=2'),
  dropSfx:   new Audio('./src/assets/drop.mp3?v=3'),
  sparkSfx:  new Audio('./src/assets/spark.mp3?v=2'),
};

audio.bgMusic.loop   = true;
audio.bgMusic.volume = 0.15;
audio.rotateSfx.volume = 0.8;
audio.dropSfx.volume   = 0.8;
audio.sparkSfx.volume  = 0.8;

let isWindowActive = true;
let muted = false;

export function updateMusicPlayback(): void {
  const isBurn = state.analyzingMode && state.pendingActions.some(a => a.type === 'burn');
  const shouldPause =
    !state.gameStarted ||
    state.gameOver     ||
    state.isPaused     ||
    document.hidden    ||
    !isWindowActive    ||
    isBurn             ||
    muted;

  if (shouldPause) audio.bgMusic.pause();
  else             audio.bgMusic.play().catch(() => {});
}

export function toggleMute(): void {
  muted = !muted;
  audio.bgMusic.muted   = muted;
  audio.rotateSfx.muted = muted;
  audio.dropSfx.muted   = muted;
  audio.sparkSfx.muted  = muted;
  if (!muted) updateMusicPlayback();
  else        audio.bgMusic.pause();
}

export function isMuted(): boolean { return muted; }

document.addEventListener('visibilitychange', updateMusicPlayback);
window.addEventListener('blur',  () => { isWindowActive = false; updateMusicPlayback(); });
window.addEventListener('focus', () => { isWindowActive = true;  updateMusicPlayback(); });
