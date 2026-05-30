import type { PieceTemplate } from './types';

export const TEMPLATES: PieceTemplate[] = [
  { type: 'source',   value: 3,        w: 8, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},t:'+',idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},t:'-',idx:2 }] },
  { type: 'source',   value: 5,        w: 4, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},t:'+',idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},t:'-',idx:2 }] },
  { type: 'source',   value: 9,        w: 3, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},t:'+',idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},t:'-',idx:2 }] },
  { type: 'resistor', value: 100,      w: 3, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},idx:2 }] },
  { type: 'resistor', value: 220,      w: 6, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},idx:2 }] },
  { type: 'resistor', value: 470,      w: 6, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},idx:2 }] },
  { type: 'led',      value: 'red',    w: 5, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},t:'+',idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},t:'-',idx:2 }] },
  { type: 'led',      value: 'green',  w: 5, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},t:'+',idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},t:'-',idx:2 }] },
  { type: 'led',      value: 'yellow', w: 4, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},t:'+',idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},t:'-',idx:2 }] },
  { type: 'wire3',    value: 'wire',   w: 4, cells: [{ x:0,y:0,ports:{N:1,E:0,W:1,S:1},idx:0 },{ x:1,y:0,ports:{N:0,E:0,W:0,S:0},idx:1 },{ x:2,y:0,ports:{N:1,E:1,W:0,S:1},idx:2 }] },
];

export const BLOCK_TEMPLATES: PieceTemplate[] = [
  { type: 'block', value: '1', color: '#999999', w: 1, cells: [{ x: 0, y: 0, ports: {} }] },
];

export const POOL: PieceTemplate[] = [];
for (const t of TEMPLATES) {
  for (let i = 0; i < t.w; i++) POOL.push(t);
}
