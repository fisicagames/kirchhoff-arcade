import { COLS, ROWS } from '../core/constants';
import type { Piece, GridCell, AnimatingCell, GameAction, PieceTemplate } from './types';

export interface GameState {
  grid:               (GridCell | null)[][];
  currentPiece:       Piece | null;
  nextPiece:          Piece | null;
  score:              number;
  highScore:          number;
  lines:              number;
  level:              number;
  gameOver:           boolean;
  gameStarted:        boolean;
  dropCounter:        number;
  dropInterval:       number;
  lastTime:           number;
  animatingCells:     AnimatingCell[];
  waitingToSpawn:     boolean;
  spawnTimer:         number;
  pieceIdCounter:     number;
  piecesSpawnedCount: number;
  lastPieceType:      string | null;
  analyzingMode:      boolean;
  pendingActions:     GameAction[];
  isPaused:           boolean;
  hasUsedPause:       boolean;
  hasUsedLimpar:      boolean;
  currentBag:         PieceTemplate[];
}

function makeGrid(): (GridCell | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export const state: GameState = {
  grid:               makeGrid(),
  currentPiece:       null,
  nextPiece:          null,
  score:              0,
  highScore:          parseInt(localStorage.getItem('circuitHighScore') ?? '0', 10),
  lines:              0,
  level:              1,
  gameOver:           false,
  gameStarted:        false,
  dropCounter:        0,
  dropInterval:       1600,
  lastTime:           0,
  animatingCells:     [],
  waitingToSpawn:     false,
  spawnTimer:         0,
  pieceIdCounter:     0,
  piecesSpawnedCount: 0,
  lastPieceType:      null,
  analyzingMode:      false,
  pendingActions:     [],
  isPaused:           false,
  hasUsedPause:       false,
  hasUsedLimpar:      false,
  currentBag:         [],
};

export function resetState(): void {
  state.grid               = makeGrid();
  state.currentPiece       = null;
  state.nextPiece          = null;
  state.score              = 0;
  state.lines              = 0;
  state.level              = 1;
  state.gameOver           = false;
  state.dropCounter        = 0;
  state.dropInterval       = 1600;
  state.lastTime           = 0;
  state.animatingCells     = [];
  state.waitingToSpawn     = false;
  state.spawnTimer         = 0;
  state.pieceIdCounter     = 0;
  state.piecesSpawnedCount = 0;
  state.lastPieceType      = null;
  state.analyzingMode      = false;
  state.pendingActions     = [];
  state.isPaused           = false;
  state.hasUsedPause       = false;
  state.hasUsedLimpar      = false;
  state.currentBag         = [];
}
