import { state } from '../model/gameState';
import { t } from '../core/i18n';
import { drawLegendPieces } from './legendView';

// Rank thresholds → i18n key, derived from the all-time high score.
const RANKS: [number, string][] = [
  [4000, 'rank.master'],
  [3000, 'rank.engineer'],
  [2000, 'rank.technician'],
  [1000,  'rank.apprentice'],
  [0,    'rank.beginner'],
];

function rankFor(score: number): string {
  for (const [min, key] of RANKS) if (score >= min) return t(key);
  return t('rank.beginner');
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
