import { COLS, ROWS } from '../core/constants';
import { state } from './gameState';
import type { Piece } from './types';

export function collides(piece: Piece, px: number, py: number): boolean {
  for (const c of piece.cells) {
    const x = c.x + px;
    const y = c.y + py;
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y >= 0 && state.grid[y][x]) return true;
  }
  return false;
}

export function rotatePiece(piece: Piece): Piece {
  const cells = piece.cells.map(c => ({
    x:     -c.y,
    y:      c.x,
    ports:  c.ports
      ? { N: c.ports.W ?? 0, E: c.ports.N ?? 0, S: c.ports.E ?? 0, W: c.ports.S ?? 0 }
      : {},
    t:     c.t,
    idx:   c.idx,
    type:  c.type,
    color: c.color,
  }));

  const minX = Math.min(...cells.map(c => c.x));
  const minY = Math.min(...cells.map(c => c.y));
  for (const c of cells) { c.x -= minX; c.y -= minY; }

  return { type: piece.type, value: piece.value, color: piece.color, id: piece.id, cells, x: piece.x, y: piece.y };
}
