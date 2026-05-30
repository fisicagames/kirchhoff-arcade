import { COLS, ROWS, DIRECTIONS } from '../core/constants';
import { state } from './gameState';
import type { GridCell, DirectionDef } from './types';

export function isConnected(cellA: GridCell, cellB: GridCell, dir: DirectionDef): boolean {
  if (cellA.pieceId !== undefined && cellA.pieceId === cellB.pieceId) return true;
  if (!cellA.ports || !cellB.ports) return false;
  return !!((cellA.ports as Record<string, number>)[dir.f] && (cellB.ports as Record<string, number>)[dir.t]);
}

export function fillInnerCorners(): void {
  let changed = false;
  do {
    changed = false;
    for (let y = 0; y < ROWS - 1; y++) {
      for (let x = 0; x < COLS - 1; x++) {
        const quad = [
          { cx: x,   cy: y,   c: state.grid[y][x] },
          { cx: x+1, cy: y,   c: state.grid[y][x+1] },
          { cx: x,   cy: y+1, c: state.grid[y+1][x] },
          { cx: x+1, cy: y+1, c: state.grid[y+1][x+1] },
        ];

        const filled = quad.filter(q => q.c !== null);
        const empty  = quad.filter(q => q.c === null);

        if (filled.length === 3 && empty.length === 1) {
          const compCells = filled.filter(f =>
            f.c!.type !== 'burned' &&
            ['source', 'resistor', 'led'].includes(f.c!.pieceType ?? f.c!.type)
          );
          if (compCells.length === 3 && new Set(compCells.map(f => f.c!.pieceId)).size >= 2) {
            const e = empty[0];
            state.grid[e.cy][e.cx] = {
              type:      'block',
              color:     '#666',
              ports:     {},
              pieceId:   state.pieceIdCounter++,
              pieceType: 'block',
            };
            changed = true;
          }
        }
      }
    }
  } while (changed);
}

/** BFS flood-fill returning all cells in a connected component. */
export function floodFill(startX: number, startY: number, visited: boolean[][]): { x: number; y: number; c: GridCell }[] {
  const comp: { x: number; y: number; c: GridCell }[] = [];
  const q: { x: number; y: number }[] = [{ x: startX, y: startY }];
  visited[startY][startX] = true;

  while (q.length) {
    const cur = q.shift()!;
    comp.push({ x: cur.x, y: cur.y, c: state.grid[cur.y][cur.x]! });
    const cell = state.grid[cur.y][cur.x]!;

    for (const d of DIRECTIONS) {
      const nx = cur.x + d.dx;
      const ny = cur.y + d.dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || visited[ny][nx]) continue;
      const nb = state.grid[ny][nx];
      if (nb && nb.type !== 'burned' && isConnected(cell, nb, d)) {
        visited[ny][nx] = true;
        q.push({ x: nx, y: ny });
      }
    }
  }
  return comp;
}
