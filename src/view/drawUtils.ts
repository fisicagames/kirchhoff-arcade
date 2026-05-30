import { CELL } from '../core/constants';
import type { GridCell, DrawCellOpts } from '../model/types';

export function getResistorColors(v: number): string[] {
  if (v === 100) return ['#8b4513', '#000',    '#8b4513'];
  if (v === 220) return ['#ff2222', '#ff2222', '#8b4513'];
  if (v === 470) return ['#ffff00', '#8b00ff', '#8b4513'];
  return ['#888'];
}

export function drawCell(
  cx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cell: GridCell,
  opts: DrawCellOpts = {},
): void {
  if (!cell) return;

  if (cell.type === 'block') {
    cx.fillStyle = cell.color ?? '#555';
    cx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    cx.fillStyle = 'rgba(255,255,255,0.3)';
    cx.fillRect(px + 1, py + 1, CELL - 2, 4);
    cx.fillRect(px + 1, py + 1, 4, CELL - 2);
    cx.fillStyle = 'rgba(0,0,0,0.3)';
    cx.fillRect(px + 1, py + CELL - 5, CELL - 2, 4);
    cx.fillRect(px + CELL - 5, py + 1, 4, CELL - 2);
    return;
  }

  const mx = px + CELL / 2;
  const my = py + CELL / 2;
  const ports = cell.ports as Record<string, number>;
  const hasPort = ports && (ports['N'] || ports['S'] || ports['E'] || ports['W']);

  if (hasPort && cell.type !== 'burned') {
    if (cell.type === 'wire') {
      cx.strokeStyle = opts.lit ? '#ffee88' : '#c89050';
      cx.lineWidth = 3; cx.lineCap = 'round'; cx.beginPath();
      if (ports['N']) { cx.moveTo(mx, py + 2);        cx.lineTo(mx, my); }
      if (ports['S']) { cx.moveTo(mx, py + CELL - 2); cx.lineTo(mx, my); }
      if (ports['E']) { cx.moveTo(px + CELL - 2, my); cx.lineTo(mx, my); }
      if (ports['W']) { cx.moveTo(px + 2, my);        cx.lineTo(mx, my); }
      cx.stroke();
      cx.fillStyle = opts.lit ? '#ffee88' : '#c89050';
      cx.beginPath(); cx.arc(mx, my, 2.5, 0, Math.PI * 2); cx.fill();
    } else {
      cx.fillStyle = opts.lit ? '#ffcc66' : '#aaaaaa';
      const r = 2;
      if (ports['N']) cx.fillRect(mx - r, py, r * 2, 5);
      if (ports['S']) cx.fillRect(mx - r, py + CELL - 5, r * 2, 5);
      if (ports['E']) cx.fillRect(px + CELL - 5, my - r, 5, r * 2);
      if (ports['W']) cx.fillRect(px, my - r, 5, r * 2);
      if (cell.idx === 0 || cell.idx === 2) {
        if (ports['N']) cx.fillRect(mx - 1, py, 2, CELL / 2);
        if (ports['S']) cx.fillRect(mx - 1, my, 2, CELL / 2);
        if (ports['E']) cx.fillRect(mx, my - 1, CELL / 2, 2);
        if (ports['W']) cx.fillRect(px, my - 1, CELL / 2, 2);
      }
    }
  }

  if (cell.type === 'source') {
    if (cell.idx === 1) {
      cx.fillStyle = opts.lit ? '#55ccff' : '#aaaaaa';
      cell.vertical ? cx.fillRect(mx - 2, py, 4, CELL) : cx.fillRect(px, my - 2, CELL, 4);
      cx.fillStyle = '#1a1a1a'; cx.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
      const col = cell.value === 3 ? '#44ccff' : cell.value === 5 ? '#ffcc00' : '#bb33ff';
      cx.strokeStyle = col; cx.lineWidth = 2; cx.strokeRect(px + 3, py + 3, CELL - 6, CELL - 6);
      cx.fillStyle = col; cx.font = 'bold 10px monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(String(cell.value) + 'V', mx, my);
    } else {
      cx.fillStyle = cell.t === '+' ? '#e63946' : '#457b9d';
      cx.beginPath(); cx.arc(mx, my, 9, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#fff'; cx.font = 'bold 14px monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      if (cell.t) cx.fillText(cell.t, mx, my + 1);
    }

  } else if (cell.type === 'resistor') {
    if (cell.idx === 1) {
      cx.fillStyle = opts.lit ? '#ffcc66' : '#aaaaaa';
      cell.vertical ? cx.fillRect(mx - 2, py, 4, CELL) : cx.fillRect(px, my - 2, CELL, 4);
      const colors = getResistorColors(cell.value as number);
      if (cell.vertical) {
        cx.fillStyle = '#d4b896'; cx.fillRect(px + CELL / 2 - 7, py + 3, 14, CELL - 6);
        cx.strokeStyle = '#8a7050'; cx.lineWidth = 1; cx.strokeRect(px + CELL / 2 - 7, py + 3, 14, CELL - 6);
        for (let i = 0; i < colors.length; i++) { cx.fillStyle = colors[i]; cx.fillRect(px + CELL / 2 - 7, py + 6 + i * 6, 14, 2.5); }
      } else {
        cx.fillStyle = '#d4b896'; cx.fillRect(px + 3, py + CELL / 2 - 7, CELL - 6, 14);
        cx.strokeStyle = '#8a7050'; cx.lineWidth = 1; cx.strokeRect(px + 3, py + CELL / 2 - 7, CELL - 6, 14);
        for (let i = 0; i < colors.length; i++) { cx.fillStyle = colors[i]; cx.fillRect(px + 6 + i * 6, py + CELL / 2 - 7, 2.5, 14); }
      }
    } else {
      cx.fillStyle = opts.lit ? '#ffcc66' : '#aaaaaa';
      // Body-facing stub points along the main axis toward the side WITHOUT an
      // external port (= where the center body sits). Port-based, so it stays
      // correct across all 4 rotations.
      if (cell.vertical) {
        if (!ports['S']) cx.fillRect(mx - 2, my, 4, CELL / 2);  // body below → down
        else             cx.fillRect(mx - 2, py, 4, CELL / 2);  // body above → up
      } else {
        if (!ports['E']) cx.fillRect(mx, my - 2, CELL / 2, 4);  // body right → right
        else             cx.fillRect(px, my - 2, CELL / 2, 4);  // body left  → left
      }
      cx.fillStyle = '#999'; cx.beginPath(); cx.arc(mx, my, 3, 0, Math.PI * 2); cx.fill();
    }

  } else if (cell.type === 'wire3') {
    if (cell.idx === 1) {
      cx.fillStyle = opts.lit ? '#ffcc66' : '#aaaaaa';
      cell.vertical ? cx.fillRect(mx - 2, py, 4, CELL) : cx.fillRect(px, my - 2, CELL, 4);
    } else {
      cx.fillStyle = opts.lit ? '#ffcc66' : '#aaaaaa';
      // Body-facing stub points along the main axis toward the side WITHOUT an
      // external port (= where the center body sits). Port-based, so it stays
      // correct across all 4 rotations.
      if (cell.vertical) {
        if (!ports['S']) cx.fillRect(mx - 2, my, 4, CELL / 2);  // body below → down
        else             cx.fillRect(mx - 2, py, 4, CELL / 2);  // body above → up
      } else {
        if (!ports['E']) cx.fillRect(mx, my - 2, CELL / 2, 4);  // body right → right
        else             cx.fillRect(px, my - 2, CELL / 2, 4);  // body left  → left
      }
      cx.fillStyle = '#999'; cx.beginPath(); cx.arc(mx, my, 3, 0, Math.PI * 2); cx.fill();
    }

  } else if (cell.type === 'led') {
    if (cell.idx === 1) {
      cx.fillStyle = opts.lit ? '#ffcc66' : '#aaaaaa';
      cell.vertical ? cx.fillRect(mx - 2, py, 4, CELL) : cx.fillRect(px, my - 2, CELL, 4);
      const colMap: Record<string, string> = { red: '#ff2244', green: '#22ff66', yellow: '#ffee22' };
      const color = colMap[cell.value as string] ?? '#ffffff';
      if (opts.lit) {
        const g = cx.createRadialGradient(mx, my, 2, mx, my, CELL * 1.5);
        g.addColorStop(0, color); g.addColorStop(0.4, color + '88'); g.addColorStop(1, 'transparent');
        cx.fillStyle = g; cx.fillRect(px - CELL, py - CELL, CELL * 3, CELL * 3);
      }
      cx.fillStyle = color; cx.beginPath(); cx.arc(mx, my, CELL / 3, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = opts.lit ? '#fff' : 'rgba(255,255,255,0.4)'; cx.lineWidth = 1.5; cx.stroke();
      cx.fillStyle = 'rgba(255,255,255,0.5)'; cx.beginPath(); cx.arc(mx - 3, my - 3, 2.5, 0, Math.PI * 2); cx.fill();
    } else {
      cx.fillStyle = cell.t === '+' ? '#e63946' : '#457b9d';
      cx.beginPath(); cx.arc(mx, my, 9, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#fff'; cx.font = 'bold 14px monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      if (cell.t) cx.fillText(cell.t, mx, my + 1);
    }

  } else if (cell.type === 'burned') {
    cx.fillStyle = '#1a0505'; cx.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
    cx.strokeStyle = '#aa2222'; cx.lineWidth = 2; cx.strokeRect(px + 3, py + 3, CELL - 6, CELL - 6);
    cx.fillStyle = '#ff3344'; cx.font = 'bold 16px monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('✕', mx, my);
  }
}
