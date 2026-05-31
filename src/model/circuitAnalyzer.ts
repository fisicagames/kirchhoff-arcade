import { COLS, ROWS, DIRECTIONS } from '../core/constants';
import { state } from './gameState';
import { isConnected, floodFill } from './gridOps';
import { buildAndSolveMNA } from './mnaSolver';
import { t, fmtNum } from '../core/i18n';
import type { GameAction, CompCell, MNAResistor, MNAVoltageSource, MNALed } from './types';

function getKey(x: number, y: number): string { return `${x},${y}`; }

function analyzeComponent(compCells: CompCell[]): GameAction[] {
  const nodeMap: Record<string, number> = {};
  for (const { x, y } of compCells) nodeMap[getKey(x, y)] = -1;

  let numNodes = 0;

  function dfsNode(x: number, y: number, nodeId: number): void {
    nodeMap[getKey(x, y)] = nodeId;
    const cell = state.grid[y][x]!;
    for (const d of DIRECTIONS) {
      const nx = x + d.dx, ny = y + d.dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      const nb = state.grid[ny][nx];
      if (!nb || nb.type === 'burned' || nodeMap[getKey(nx, ny)] !== -1) continue;
      if (!isConnected(cell, nb, d)) continue;
      if (cell.pieceId === nb.pieceId && cell.type !== 'wire' && cell.type !== 'wire3') continue;
      dfsNode(nx, ny, nodeId);
    }
  }

  for (const { x, y, c } of compCells) {
    if (c.type === 'resistor' && c.idx === 1) continue;
    if (nodeMap[getKey(x, y)] === -1) dfsNode(x, y, numNodes++);
  }

  const realSources: MNAVoltageSource[] = [];
  const resistors:   MNAResistor[]      = [];
  const leds:        MNALed[]           = [];
  const pieces: Record<string, { type: string; cells: CompCell[] }> = {};

  for (const cell of compCells) {
    const { c } = cell;
    if (c.type === 'wire' || c.type === 'wire3') continue;
    const pid = String(c.pieceId);
    if (!pieces[pid]) pieces[pid] = { type: c.pieceType ?? c.type, cells: [] };
    pieces[pid].cells.push(cell);
  }

  for (const pid in pieces) {
    const p = pieces[pid];
    if (p.type === 'source') {
      const cP = p.cells.find(c => c.c.t === '+');
      const cM = p.cells.find(c => c.c.t === '-');
      if (cP && cM) realSources.push({ nodePlus: nodeMap[getKey(cP.x, cP.y)], nodeMinus: nodeMap[getKey(cM.x, cM.y)], value: cP.c.value as number, pieceId: pid });
    } else if (p.type === 'resistor') {
      const c1 = p.cells.find(c => c.c.idx === 0);
      const c2 = p.cells.find(c => c.c.idx === 2);
      if (c1 && c2) resistors.push({ nodeA: nodeMap[getKey(c1.x, c1.y)], nodeB: nodeMap[getKey(c2.x, c2.y)], value: c1.c.value as number, pieceId: pid });
    } else if (p.type === 'led') {
      const cP = p.cells.find(c => c.c.idx === 0);
      const cM = p.cells.find(c => c.c.idx === 2);
      if (cP && cM) leds.push({ nodePlus: nodeMap[getKey(cP.x, cP.y)], nodeMinus: nodeMap[getKey(cM.x, cM.y)], pieceId: pid, isOn: false });
    }
  }

  if (!realSources.length || !numNodes) return [];

  // Iterative LED non-linearity solver (up to 10 passes, 2 V forward voltage)
  let ledsChanged = true;
  let iters = 0;
  let finalV: number[] | null = null;
  let finalI: number[] | null = null;
  let cvs: MNAVoltageSource[] = [];

  while (ledsChanged && iters < 10) {
    ledsChanged = false;
    iters++;
    cvs = [...realSources];
    for (let i = 0; i < leds.length; i++) {
      if (leds[i].isOn) cvs.push({ nodePlus: leds[i].nodePlus, nodeMinus: leds[i].nodeMinus, value: 2.0, isLed: true, ledIdx: i });
    }
    const sol = buildAndSolveMNA(numNodes, resistors, cvs);
    if (!sol) break;
    finalV = sol.slice(0, numNodes);
    finalI = sol.slice(numNodes);
    for (let i = 0; i < leds.length; i++) {
      const led = leds[i];
      if (led.isOn) {
        const idx = cvs.findIndex(s => s.isLed && s.ledIdx === i);
        if (finalI[idx] < -1e-5) { led.isOn = false; ledsChanged = true; }
      } else {
        if (finalV[led.nodePlus] - finalV[led.nodeMinus] > 2.0) { led.isOn = true; ledsChanged = true; }
      }
    }
  }

  if (!finalV || !finalI) return [];

  const actions: GameAction[] = [];
  let shouldBurn = false;
  let litCount   = 0;
  const burnedIds = new Set<string>();
  const litIds    = new Set<string>();
  const activePieceIds = new Set<string>();
  const burnR:  string[] = [];
  const succR:  string[] = [];

  for (let i = 0; i < leds.length; i++) {
    const led = leds[i];
    if (!led.isOn) continue;
    const idx  = cvs.findIndex(s => s.isLed && s.ledIdx === i);
    const I_mA = finalI[idx] * 1000;
    if (I_mA > 28) {
      shouldBurn = true; burnedIds.add(led.pieceId);
      burnR.push(t('reason.ledBurn', { i: fmtNum(I_mA) }));
    } else if (I_mA >= 1) {
      litCount++; litIds.add(led.pieceId);
      activePieceIds.add(led.pieceId); // LED com corrente
      succR.push(t('reason.ledLit', { i: fmtNum(I_mA) }));
    }
  }

  for (let i = 0; i < realSources.length; i++) {
    const I = Math.abs(finalI[i]);
    if (I > 1.0) {
      shouldBurn = true; burnedIds.add(realSources[i].pieceId!);
      burnR.push(t('reason.sourceShort', { i: fmtNum(I) }));
    } else if (I > 0.001) {
      activePieceIds.add(realSources[i].pieceId!); // Fonte com corrente
      succR.push(t('reason.sourceActive', { v: realSources[i].value, i: fmtNum(I * 1000) }));
    }
  }

  for (const r of resistors) {
    const V    = Math.abs(finalV[r.nodeA] - finalV[r.nodeB]);
    const I_mA = (V / r.value) * 1000;
    if (I_mA > 50) {
      shouldBurn = true; burnedIds.add(r.pieceId);
      burnR.push(t('reason.resBurn', { v: r.value, i: fmtNum(I_mA) }));
    } else if (V > 0.01) {
      activePieceIds.add(r.pieceId); // Resistor com corrente
      succR.push(t('reason.resActive', { v: r.value, volt: fmtNum(V), i: fmtNum(I_mA) }));
    }
  }

  if (shouldBurn) {
    const unique = [...new Set([...burnR, ...succR])];
    for (const { x, y, c } of compCells) {
      if (burnedIds.has(String(c.pieceId))) actions.push({ type: 'burn', cell: { x, y }, reasons: unique });
    }
  } else if (succR.length > 0) {
    const adjIds = new Set(compCells.map(c => c.c.pieceId));
    for (const { x, y } of compCells) {
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
          const nb = state.grid[ny][nx];
          // Blocks AND burned debris (lixo) clear when next to a closed circuit.
          if (nb && (nb.type === 'block' || nb.type === 'burned')) adjIds.add(nb.pieceId);
        }
      }
    }
    const toRemove: [number, number][] = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (state.grid[y][x] && adjIds.has(state.grid[y][x]!.pieceId)) toRemove.push([x, y]);
    }
    actions.push({ 
      type: 'light', 
      cells: toRemove, 
      litCount, 
      litPieceIds: [...litIds], 
      reasons: [...new Set(succR)],
      activeCount: activePieceIds.size
    });
  }

  return actions;
}

export function processCircuits(): GameAction[] {
  const visited = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false));
  const allActions: GameAction[] = [];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = state.grid[y][x];
      if (cell && cell.type !== 'burned' && !visited[y][x]) {
        const comp = floodFill(x, y, visited);
        allActions.push(...analyzeComponent(comp));
      }
    }
  }

  return allActions;
}
