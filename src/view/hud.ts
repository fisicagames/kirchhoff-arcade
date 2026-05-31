import { state } from '../model/gameState';
import { drawLegendPieces } from './legendView';

// Rank shown on the start menu, derived from the all-time high score.
const RANKS: [number, string][] = [
  [1200, 'Kirchhoff ⚡'],
  [800,  'Engenheiro ⚡'],
  [400,  'Técnico ⚡'],
  [200,  'Aprendiz ⚡'],
  [0,    'Iniciante ⚡'],
];

function rankFor(score: number): string {
  for (const [min, label] of RANKS) if (score >= min) return label;
  return 'Iniciante ⚡';
}

export function updateUI(): void {
  if (state.score > state.highScore) {
    state.highScore = state.score;
    localStorage.setItem('circuitHighScore', String(state.highScore));
  }

  const setText = (id: string, val: string | number): void => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val);
  };

  setText('score',            state.score);
  setText('highScoreDisplay', state.highScore);
  setText('lines',            state.lines);
  setText('level',            state.level);

  // Keep the start-menu best-result in sync with the high score.
  setText('menuHighScore', state.highScore);
  setText('menuRank',      rankFor(state.highScore));

  drawLegendPieces();
}
