import { CELL } from '../core/constants';
import { nctx, nextCanvas } from '../core/canvasSetup';
import { state } from '../model/gameState';
import { t } from '../core/i18n';
import { drawCell } from './drawUtils';

/** Returns [name, detail] describing the upcoming piece. */
function describePiece(): [string, string] {
  const p = state.nextPiece!;
  switch (p.type) {
    case 'led':      return [t(`piece.led.${p.value}`), t('piece.led.detail')];
    case 'resistor': return [t('piece.resistor', { v: p.value }), t('piece.resistor.detail')];
    case 'source':   return [t('piece.source',   { v: p.value }), t('piece.source.detail')];
    case 'wire3':    return [t('piece.wire'),  t('piece.wire.detail')];
    case 'block':    return [t('piece.block'), t('piece.block.detail')];
    default:         return ['', ''];
  }
}

export function drawNext(): void {
  nctx.fillStyle = '#06091a';
  nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  const specsDiv = document.getElementById('nextPieceSpecs');
  if (specsDiv) specsDiv.innerHTML = '';
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

  if (!specsDiv) return;
  const [name, detail] = describePiece();
  specsDiv.innerHTML =
    `<span class="np-name">${name}</span><span class="np-detail">${detail}</span>`;
}
