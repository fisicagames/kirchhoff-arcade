import { CELL } from '../core/constants';
import { nctx, nextCanvas } from '../core/canvasSetup';
import { state } from '../model/gameState';
import { drawCell } from './drawUtils';

export function drawNext(): void {
  nctx.fillStyle = '#06091a';
  nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  const specsDiv = document.getElementById('nextPieceSpecs');
  if (specsDiv) specsDiv.textContent = '';
  if (!state.nextPiece) return;

  const p  = state.nextPiece;
  const w  = (Math.max(...p.cells.map(c => c.x)) + 1) * CELL;
  const h  = (Math.max(...p.cells.map(c => c.y)) + 1) * CELL;
  const ox = Math.max(0, (nextCanvas.width  - w) / 2);
  const oy = Math.max(0, (nextCanvas.height - h) / 2);

  for (const c of p.cells) {
    drawCell(nctx, ox + c.x * CELL, oy + c.y * CELL, {
      type:  c.type ?? p.type,
      value: p.value,
      color: c.color ?? p.color,
      ports: c.ports,
      t:     c.t,
      idx:   c.idx,
    });
  }

  if (specsDiv) {
    if      (p.type === 'led')      specsDiv.textContent = `LED ${p.value} — Vf:2V Imax:28mA`;
    else if (p.type === 'resistor') specsDiv.textContent = `Resistor ${p.value}Ω — Imax:50mA`;
    else if (p.type === 'source')   specsDiv.textContent = `Fonte ${p.value}V — Icc:1A`;
    else if (p.type === 'wire3')    specsDiv.textContent = 'Fio condutor';
    else if (p.type === 'block')    specsDiv.textContent = 'Bloco isolante';
  }
}
