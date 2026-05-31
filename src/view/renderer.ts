import { COLS, ROWS, CELL } from '../core/constants';
import { ctx, gameCanvas } from '../core/canvasSetup';
import { state } from '../model/gameState';
import { collides } from '../model/pieceOps';
import { drawCell } from './drawUtils';

export function draw(): void {
  ctx.fillStyle = '#060921';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Grid lines
  ctx.strokeStyle = 'rgba(36,46,110,0.3)'; ctx.lineWidth = 1;
  for (let x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke(); }
  for (let y = 1; y < ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke(); }

  // Board cells
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = state.grid[y][x];
      if (cell) drawCell(ctx, x * CELL, y * CELL, cell);
    }
  }

  // Hard-drop speed trails (motion blur), drawn behind the animations
  if (state.dropTrails.length) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const t of state.dropTrails) {
      const k = Math.max(0, t.timer / t.life);     // 1 → 0
      const grad = ctx.createLinearGradient(0, t.yTop, 0, t.yBot);
      grad.addColorStop(0,    `rgba(${t.rgb},0)`);
      grad.addColorStop(0.85, `rgba(${t.rgb},${0.45 * k})`);
      grad.addColorStop(1,    `rgba(${t.rgb},${0.10 * k})`);
      ctx.fillStyle = grad;
      ctx.fillRect(t.px + 3, t.yTop, CELL - 6, t.yBot - t.yTop);
    }
    ctx.restore();
  }

  // Animations
  for (const a of state.animatingCells) {
    const total     = a.atype === 'lit' ? 500 : 300;
    const intensity = Math.max(0, a.timer / total);
    if (a.atype === 'lit') {
      ctx.save(); ctx.globalAlpha = intensity;
      drawCell(ctx, a.x * CELL, a.y * CELL, a.cell!, { lit: a.isActLit });
      ctx.restore();
      if (a.isActLit !== false) {
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 0.5 * intensity)})`;
        ctx.fillRect(a.x * CELL, a.y * CELL, CELL, CELL);
      }
    } else {
      ctx.fillStyle = `rgba(255,50,50,${Math.max(0, 0.6 * intensity)})`;
      ctx.fillRect(a.x * CELL, a.y * CELL, CELL, CELL);
    }
  }

  // Active piece + ghost
  if (state.currentPiece && !state.gameOver) {
    const p      = state.currentPiece;
    const isVert = ['resistor', 'source', 'led', 'wire3'].includes(p.type) &&
      new Set(p.cells.map(c => c.y)).size > new Set(p.cells.map(c => c.x)).size;

    let gy = p.y;
    while (!collides(p, p.x, gy + 1)) gy++;
    if (gy !== p.y) {
      ctx.save(); ctx.globalAlpha = 0.25;
      for (const c of p.cells) {
        drawCell(ctx, (c.x + p.x) * CELL, (c.y + gy) * CELL,
          { type: c.type ?? p.type, value: p.value, color: c.color ?? p.color, ports: c.ports, t: c.t, idx: c.idx, vertical: isVert });
      }
      ctx.restore();
    }
    for (const c of p.cells) {
      drawCell(ctx, (c.x + p.x) * CELL, (c.y + p.y) * CELL,
        { type: c.type ?? p.type, value: p.value, color: c.color ?? p.color, ports: c.ports, t: c.t, idx: c.idx, vertical: isVert });
    }
  }

  // Analyzing overlay
  if (state.analyzingMode) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (const action of state.pendingActions) {
      if (action.type === 'burn') {
        const { x, y } = action.cell;
        const cell = state.grid[y][x];
        if (cell) drawCell(ctx, x * CELL, y * CELL, cell);
        ctx.fillStyle = 'rgba(255,50,50,0.5)';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      } else if (action.type === 'light') {
        const litIds = new Set(action.litPieceIds);
        for (const [x, y] of action.cells) {
          const cell = state.grid[y][x];
          if (cell) drawCell(ctx, x * CELL, y * CELL, cell, { lit: cell.type === 'led' ? litIds.has(String(cell.pieceId)) : true });
        }
      }
    }
  }

  // Pause indicator
  if (state.isPaused) {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
    ctx.font = 'bold 28px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeText('PAUSADO', gameCanvas.width / 2, gameCanvas.height / 2);
    ctx.fillText('PAUSADO', gameCanvas.width / 2, gameCanvas.height / 2);
  }
}
