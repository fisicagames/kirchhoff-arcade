import { state } from './gameState';
import { POOL, BLOCK_TEMPLATES } from './templates';
import type { Piece, PieceTemplate } from './types';

function cellsFromTemplate(t: PieceTemplate, idCounter: number): Piece {
  return {
    type:  t.type,
    value: t.value,
    color: t.color,
    id:    idCounter,
    cells: t.cells.map(c => ({
      x:     c.x,
      y:     c.y,
      ports: c.ports ? { ...c.ports } : {},
      t:     c.t,
      idx:   c.idx,
      type:  c.type,
      color: c.color,
    })),
    x: 0,
    y: 0,
  };
}

export function refillBag(): void {
  state.currentBag = POOL.filter(t => state.level >= 5 || t.type !== 'led');
  for (let i = state.currentBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.currentBag[i], state.currentBag[j]] = [state.currentBag[j], state.currentBag[i]];
  }
}

export function rndPiece(): Piece {
  if (!state.currentBag.length) refillBag();

  let idx = state.currentBag.length - 1;
  let attempts = 0;
  while (state.currentBag[idx].type === state.lastPieceType && attempts < 5 && idx > 0) {
    const j = Math.floor(Math.random() * idx);
    [state.currentBag[idx], state.currentBag[j]] = [state.currentBag[j], state.currentBag[idx]];
    attempts++;
  }

  const t = state.currentBag.pop()!;
  state.lastPieceType = t.type;
  return cellsFromTemplate(t, state.pieceIdCounter++);
}

export function blockPiece(): Piece {
  const t = BLOCK_TEMPLATES[0];
  state.lastPieceType = t.type;
  return cellsFromTemplate(t, state.pieceIdCounter++);
}
