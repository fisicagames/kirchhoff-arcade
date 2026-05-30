import { state } from '../model/gameState';
import { drawLegendPieces } from './legendView';

export function updateUI(): void {
  if (state.score > state.highScore) {
    state.highScore = state.score;
    localStorage.setItem('circuitHighScore', String(state.highScore));
  }

  const get = (id: string) => document.getElementById(id);
  const setText = (id: string, val: string | number) => { const el = get(id); if (el) el.textContent = String(val); };

  setText('score',           state.score);
  setText('highScoreDisplay', state.highScore);
  setText('lines',           state.lines);
  setText('level',           state.level);

  drawLegendPieces();
}
