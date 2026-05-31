import { CELL } from '../core/constants';
import { state } from '../model/gameState';
import { TEMPLATES, BLOCK_TEMPLATES } from '../model/templates';
import { drawCell } from './drawUtils';
import type { PieceType } from '../model/types';

const LEGEND_ITEMS = [
  { id: 'lg_s3', type: 'source',   value: 3        },
  { id: 'lg_s5', type: 'source',   value: 5        },
  { id: 'lg_s9', type: 'source',   value: 9        },
  { id: 'lg_lr', type: 'led',      value: 'red'    },
  { id: 'lg_lg', type: 'led',      value: 'green'  },
  { id: 'lg_ly', type: 'led',      value: 'yellow' },
  { id: 'lg_r1', type: 'resistor', value: 100      },
  { id: 'lg_r2', type: 'resistor', value: 220      },
  { id: 'lg_r4', type: 'resistor', value: 470      },
  { id: 'lg_w',  type: 'wire3',    value: 'wire'   },
  { id: 'lg_b',  type: 'block',    value: '1'      },
] as const;

export function drawLegendPieces(): void {
  for (const leg of LEGEND_ITEMS) {
    const canvas = document.getElementById(leg.id) as HTMLCanvasElement | null;
    if (!canvas) continue;

    const lctx = canvas.getContext('2d')!;
    lctx.clearRect(0, 0, canvas.width, canvas.height);

    const template =
      leg.type === 'block'
        ? BLOCK_TEMPLATES.find(t => t.type === 'block')
        : TEMPLATES.find(t => t.type === leg.type && t.value === (leg.value as string | number));

    if (!template) continue;

    for (const cell of template.cells) {
      drawCell(lctx, cell.x * CELL, 0, {
        type:  (cell.type ?? template.type) as PieceType,
        value: leg.value as string | number,
        color: cell.color ?? template.color,
        ports: cell.ports,
        t:     cell.t,
        idx:   cell.idx,
      });
    }

    if (leg.type === 'led' && state.level < 5) {
      lctx.fillStyle = 'rgba(6,9,26,0.8)';
      lctx.fillRect(0, 0, canvas.width, canvas.height);
      lctx.fillStyle = '#ff5555';
      lctx.font = 'bold 10px system-ui,sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText('Nív.5', canvas.width / 2, canvas.height / 2 + 4);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Tutorial circuit illustrations (schematic 3×3 loops)
// ─────────────────────────────────────────────────────────────

type LedColor = 'red' | 'green' | 'yellow';

interface ScenarioCfg {
  sourceV:    number;
  left:       'resistor' | 'wire';
  resistorV?: number;
  bottom:     'led-ok' | 'led-burn' | 'led-rev' | 'wire';
  ledColor?:  LedColor;
  spark?:     boolean;   // ⚡ over the loop
}

function drawScenario(id: string, cfg: ScenarioCfg): void {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return;
  const cx = canvas.getContext('2d')!;
  cx.clearRect(0, 0, canvas.width, canvas.height);

  const s    = CELL;
  const ox   = Math.round((canvas.width - 3 * s) / 2);
  const topY = 14;
  const midY = topY + s;
  const botY = topY + 2 * s;
  const wire = '#aaaaaa';

  // Side wires (connect top row down to bottom row)
  cx.fillStyle = wire;
  cx.fillRect(ox + s / 2 - 2,         midY, 4, s); // left
  cx.fillRect(ox + 2 * s + s / 2 - 2, midY, 4, s); // right

  // Top row: voltage source  (+  body  −)
  drawCell(cx, ox,         topY, { type: 'source', value: cfg.sourceV, t: '+', idx: 0, ports: { S: 1 } });
  drawCell(cx, ox + s,     topY, { type: 'source', value: cfg.sourceV, idx: 1, ports: {} });
  drawCell(cx, ox + 2 * s, topY, { type: 'source', value: cfg.sourceV, t: '-', idx: 2, ports: { S: 1 } });

  // Left middle: resistor (or leave the plain wire)
  if (cfg.left === 'resistor') {
    cx.fillStyle = '#060921';
    cx.fillRect(ox - 4, midY, s + 8, s);            // erase wire behind
    drawCell(cx, ox, midY, { type: 'resistor', value: cfg.resistorV ?? 220, idx: 1, vertical: true, ports: { N: 1, S: 1 } });
  }

  // Bottom row
  if (cfg.bottom === 'wire') {
    cx.fillStyle = wire;
    cx.fillRect(ox + s / 2, botY + s / 2 - 2, 2 * s, 4); // straight short
  } else {
    const lit    = cfg.bottom === 'led-ok';
    const leftT  = cfg.bottom === 'led-rev' ? '-' : '+';
    const rightT = cfg.bottom === 'led-rev' ? '+' : '-';
    const color  = cfg.ledColor ?? 'green';
    drawCell(cx, ox,         botY, { type: 'led', value: color, t: leftT,  idx: 0, ports: { N: 1 } }, { lit });
    drawCell(cx, ox + s,     botY, { type: 'led', value: color, idx: 1, ports: {} }, { lit });
    drawCell(cx, ox + 2 * s, botY, { type: 'led', value: color, t: rightT, idx: 2, ports: { N: 1 } }, { lit });

    if (cfg.bottom === 'led-burn') {
      cx.fillStyle = 'rgba(255,60,40,0.40)';
      cx.fillRect(ox - 2, botY - 2, 3 * s + 4, s + 4);
      cx.fillStyle = '#ff5533';
      cx.font = 'bold 22px system-ui, sans-serif';
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText('✕', ox + 1.5 * s, botY + s / 2);
    }
  }

  // Spark over the loop (warning is conveyed by the red card + caption)
  if (cfg.spark) {
    cx.fillStyle = '#ffd24a';
    cx.font = 'bold 22px system-ui, sans-serif';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('⚡', ox + 1.5 * s, midY + s / 2);
  }
}

export function drawTutorial(): void {
  drawScenario('ill_ok',    { sourceV: 5, left: 'resistor', resistorV: 220, bottom: 'led-ok',   ledColor: 'green' });
  drawScenario('ill_short', { sourceV: 9, left: 'wire',                    bottom: 'wire',      spark: true });
  drawScenario('ill_burn',  { sourceV: 9, left: 'wire',                    bottom: 'led-burn',  ledColor: 'red' });
  drawScenario('ill_rev',   { sourceV: 5, left: 'resistor', resistorV: 220, bottom: 'led-rev',  ledColor: 'green' });
}
