import type { DirectionDef } from '../model/types';

export const COLS = 10;
export const ROWS = 18;
export const CELL = 30;

export const DIRECTIONS: DirectionDef[] = [
  { dx:  0, dy: -1, f: 'N', t: 'S' },
  { dx:  1, dy:  0, f: 'E', t: 'W' },
  { dx:  0, dy:  1, f: 'S', t: 'N' },
  { dx: -1, dy:  0, f: 'W', t: 'E' },
];
