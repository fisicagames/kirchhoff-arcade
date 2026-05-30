import { state } from '../model/gameState';
import { audio, updateMusicPlayback } from '../core/audioManager';
import type { GameAction } from '../model/types';

export function showStatusOverlay(actions: GameAction[]): void {
  updateMusicPlayback();

  let isBurn = false;
  let reasons: string[] = [];

  for (const a of actions) {
    if (a.type === 'burn')  { isBurn = true; if (a.reasons.length) reasons = a.reasons; }
    if (a.type === 'light') { if (a.reasons.length) reasons = a.reasons; }
  }

  if (isBurn) { audio.sparkSfx.currentTime = 0; audio.sparkSfx.play().catch(() => {}); }

  const titleEl   = document.getElementById('statusTitle');
  const overlayEl = document.getElementById('statusOverlay');
  const reasonsEl = document.getElementById('statusReasons');

  if (titleEl) {
    titleEl.textContent = isBurn ? 'Circuito Queimou!' : 'Circuito Fechado!';
    titleEl.style.color = isBurn ? '#ff4444' : '#55ee88';
  }
  if (overlayEl) {
    overlayEl.style.borderColor = isBurn ? '#ff4444' : '#55ee88';
    overlayEl.style.boxShadow   = isBurn
      ? '0 8px 32px rgba(255,68,68,0.3)'
      : '0 8px 32px rgba(85,238,136,0.3)';
    overlayEl.classList.add('show');
  }
  if (reasonsEl) {
    reasonsEl.innerHTML = '';
    if (reasons.length > 0) {
      reasonsEl.style.display = 'flex';
      for (const r of reasons) {
        const el = document.createElement('div'); el.textContent = r; reasonsEl.appendChild(el);
      }
    } else {
      reasonsEl.style.display = 'none';
    }
  }
}

export function hideStatusOverlay(): void {
  document.getElementById('statusOverlay')?.classList.remove('show');
}

export function showGameOverOverlay(): void {
  const el = document.getElementById('finalScore');
  if (el) el.textContent = String(state.score);
  const hs = document.getElementById('finalHighScore');
  if (hs) hs.textContent = String(state.highScore);
  document.getElementById('message')?.classList.add('show');
}

export function hideGameOverOverlay(): void {
  document.getElementById('message')?.classList.remove('show');
}
