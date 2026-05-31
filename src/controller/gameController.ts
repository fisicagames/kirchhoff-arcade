import { COLS, CELL } from '../core/constants';
import { audio, updateMusicPlayback } from '../core/audioManager';
import { state, resetState } from '../model/gameState';
import { rndPiece, blockPiece } from '../model/pieceBag';
import { collides, rotatePiece } from '../model/pieceOps';
import { fillInnerCorners } from '../model/gridOps';
import { processCircuits } from '../model/circuitAnalyzer';
import { draw } from '../view/renderer';
import { drawNext } from '../view/nextPieceView';
import { updateUI } from '../view/hud';
import { showStatusOverlay, hideStatusOverlay, showGameOverOverlay, hideGameOverOverlay } from '../view/overlayManager';

export function init(): void {

  if (state.analyzingMode) {
    resolveAnalyzing();
  }
  
  resetState();
  updateMusicPlayback();

  const btnPause = document.getElementById('btnPause');
  if (btnPause) { btnPause.style.cssText = ''; btnPause.textContent = 'PAUSA'; }

  state.nextPiece = rndPiece();
  spawn();
  updateUI();

  hideGameOverOverlay();
  hideStatusOverlay();
}

export function spawn(): void {
  state.currentPiece = state.nextPiece;
  const oldLevel = state.level;
  state.piecesSpawnedCount++;

  state.level        = Math.floor(state.piecesSpawnedCount / 10) + 1;
  state.dropInterval = Math.max(200, 1600 - (state.level - 1) * 100);

  if (state.level === 5 && oldLevel < 5) state.currentBag = [];

  state.nextPiece = state.piecesSpawnedCount % 3 === 2 ? blockPiece() : rndPiece();

  const w = Math.max(...state.currentPiece!.cells.map(c => c.x)) + 1;
  state.currentPiece!.x = Math.floor((COLS - w) / 2);
  state.currentPiece!.y = 0;

  if (collides(state.currentPiece!, state.currentPiece!.x, state.currentPiece!.y)) {
    endGame();
  }
  drawNext();
}

export function move(dx: number, dy: number): boolean {
  if (!state.currentPiece) return false;
  if (!collides(state.currentPiece, state.currentPiece.x + dx, state.currentPiece.y + dy)) {
    state.currentPiece.x += dx;
    state.currentPiece.y += dy;
    return true;
  }
  return false;
}

export function rotate(): void {
  if (!state.currentPiece) return;
  const rotated = rotatePiece(state.currentPiece);
  if (!collides(rotated, rotated.x, rotated.y)) {
    state.currentPiece.cells = rotated.cells;
    audio.rotateSfx.currentTime = 0;
    audio.rotateSfx.play().catch(() => {});
    return;
  }
  for (const k of [-1, 1, -2, 2]) {
    if (!collides(rotated, rotated.x + k, rotated.y)) {
      state.currentPiece.cells = rotated.cells;
      state.currentPiece.x   += k;
      return;
    }
  }
}

// Representative streak colour (r,g,b) for the falling piece.
function trailColor(p: typeof state.currentPiece): string {
  if (!p) return '200,225,255';
  if (p.type === 'led') {
    if (p.value === 'red')    return '255,80,110';
    if (p.value === 'green')  return '90,255,150';
    if (p.value === 'yellow') return '255,235,90';
  }
  if (p.type === 'source') {
    if (p.value === 3) return '90,210,255';
    if (p.value === 5) return '255,210,80';
    return '200,120,255';
  }
  if (p.type === 'resistor') return '230,200,150';
  if (p.type === 'block')    return '170,180,210';
  return '200,225,255'; // wire / default
}

function spawnDropTrails(p: NonNullable<typeof state.currentPiece>, startY: number, endY: number): void {
  if (endY <= startY) return;
  const rgb  = trailColor(p);
  const life = 240;
  // Topmost cell per column → one streak per column from start to landing.
  const topByCol = new Map<number, number>();
  for (const c of p.cells) {
    const col = c.x + p.x;
    const cur = topByCol.get(col);
    if (cur === undefined || c.y < cur) topByCol.set(col, c.y);
  }
  for (const [col, cy] of topByCol) {
    state.dropTrails.push({
      px:    col * CELL,
      yTop:  (cy + startY) * CELL,
      yBot:  (cy + endY) * CELL + CELL,
      rgb,
      timer: life,
      life,
    });
  }
}

export function hardDrop(): void {
  audio.dropSfx.currentTime = 0;
  audio.dropSfx.play().catch(() => {});
  const p = state.currentPiece;
  if (!p) return;
  const startY = p.y;
  while (move(0, 1)) {}
  spawnDropTrails(p, startY, p.y);
  lockPiece();
}

export function lockPiece(): void {
  if (!state.currentPiece) return;

  const p        = state.currentPiece;
  const ys       = p.cells.map(c => c.y);
  const xs       = p.cells.map(c => c.x);
  const vertical = ['resistor', 'source', 'led', 'wire3'].includes(p.type)
    && new Set(ys).size > new Set(xs).size;

  for (const c of p.cells) {
    const x = c.x + p.x;
    const y = c.y + p.y;
    if (y < 0) { endGame(); return; }
    state.grid[y][x] = {
      type:      c.type ?? p.type,
      value:     p.value,
      color:     c.color ?? p.color,
      ports:     { ...c.ports },
      t:         c.t,
      idx:       c.idx,
      pieceId:   p.id,
      pieceType: p.type,
      vertical,
    };
  }

  fillInnerCorners();

  const actions = processCircuits();
  state.currentPiece = null;

  if (actions.length > 0) {
    state.analyzingMode  = true;
    state.pendingActions = actions;
    showStatusOverlay(actions);
  } else {
    state.waitingToSpawn = true;
    state.spawnTimer     = 400;
  }
}

export function applyActions(): void {
  for (const action of state.pendingActions) {
    if (action.type === 'burn') {
      const { x, y } = action.cell;
      if (!state.grid[y][x]) continue;
      // Give debris a unique id so it can later be cleared when adjacent to a circuit.
      state.grid[y][x] = { type: 'burned', value: null, ports: { N: 0, E: 0, W: 0, S: 0 }, pieceId: state.pieceIdCounter++, pieceType: 'burned' };
      state.animatingCells.push({ x, y, cell: null, timer: 300, atype: 'burn' });

    } else if (action.type === 'light') {
      const litIds = new Set(action.litPieceIds);
      for (const [x, y] of action.cells) {
        const cell = state.grid[y][x];
        if (!cell) continue;
        const isActLit = cell.type === 'led' ? litIds.has(String(cell.pieceId)) : true;
        state.animatingCells.push({ x, y, cell: { ...cell }, timer: 500, atype: 'lit', isActLit });
        state.grid[y][x] = null;
      }
      state.score += action.litCount > 0
        ? 100 * action.litCount + (action.litCount > 1 ? 200 : 0)
        : 50;
      state.lines++;
    }
  }
  updateUI();
}

export function endGame(): void {
  state.gameOver     = true;
  state.currentPiece = null;
  updateMusicPlayback();
  showGameOverOverlay();
}


export function handleGameInput(action: string): void {
  if (action === 'restart') { init(); return; }

  if (state.analyzingMode) {
    if (action === 'drop') {
      resolveAnalyzing();
    }
    return;
  }

  if (!state.gameStarted) {
    if (action === 'drop') {
      state.gameStarted = true;
      updateMusicPlayback();
      document.getElementById('tutorialScreen')?.classList.remove('show');
    }
    return;
  }

  if (state.gameOver || state.isPaused || state.helpOpen) return;

  switch (action) {
    case 'left':   move(-1, 0); break;
    case 'right':  move( 1, 0); break;
    case 'rotate': rotate();    break;
    case 'down':   if (!move(0, 1) && state.currentPiece) lockPiece(); break;
    case 'drop':   if (state.currentPiece) hardDrop(); break;
  }
}

export function loop(time = 0): void {
  const dt = time - state.lastTime;
  state.lastTime = time;

  if (state.gameStarted && !state.gameOver && !state.waitingToSpawn && !state.isPaused && !state.helpOpen) {
    state.dropCounter += dt;
    if (state.dropCounter > state.dropInterval) {
      if (state.currentPiece && !move(0, 1)) lockPiece();
      state.dropCounter = 0;
    }
  }

  if (state.gameStarted && state.waitingToSpawn && !state.isPaused && !state.helpOpen) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      state.waitingToSpawn = false;
      state.dropCounter    = 0;
      spawn();
    }
  }

  for (let i = state.animatingCells.length - 1; i >= 0; i--) {
    state.animatingCells[i].timer -= dt;
    if (state.animatingCells[i].timer <= 0) state.animatingCells.splice(i, 1);
  }

  for (let i = state.dropTrails.length - 1; i >= 0; i--) {
    state.dropTrails[i].timer -= dt;
    if (state.dropTrails[i].timer <= 0) state.dropTrails.splice(i, 1);
  }

  draw();
  requestAnimationFrame(loop);
}

export function resolveAnalyzing(): void {
  if (!state.analyzingMode) return;
  
  applyActions();
  hideStatusOverlay();
  
  state.analyzingMode  = false;
  state.pendingActions = [];
  state.waitingToSpawn = true;
  state.spawnTimer     = 400;
  updateMusicPlayback();
}