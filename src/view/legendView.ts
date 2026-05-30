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

export function drawTutorial(): void {
  const tCanvas = document.getElementById('tutorialCanvas') as HTMLCanvasElement | null;
  if (!tCanvas) return;

  const tctx = tCanvas.getContext('2d')!;
  tctx.clearRect(0, 0, tCanvas.width, tCanvas.height);

  const s = CELL, oy = 10, ox = 55;

  drawCell(tctx, ox,       oy, { type: 'source', value: 9, t: '+', ports: { S: 1 } });
  drawCell(tctx, ox + s,   oy, { type: 'source', value: 9, idx: 1, ports: {} });
  drawCell(tctx, ox + s*2, oy, { type: 'source', value: 9, t: '-', idx: 2, ports: { S: 1 } });

  tctx.fillStyle = '#aaaaaa';
  tctx.fillRect(ox + s/2 - 2, oy + s/2, 4, s*2);
  tctx.fillRect(ox + s*2 + s/2 - 2, oy + s/2, 4, s*2);

  drawCell(tctx, ox,       oy + s*2, { type: 'led', value: 'green', t: '+', ports: { N: 1 } },       { lit: true });
  drawCell(tctx, ox + s,   oy + s*2, { type: 'led', value: 'green', idx: 1, ports: {} },              { lit: true });
  drawCell(tctx, ox + s*2, oy + s*2, { type: 'led', value: 'green', t: '-', idx: 2, ports: { N: 1 } }, { lit: true });

  tctx.fillStyle = '#0a1035';
  tctx.fillRect(ox - 5, oy + s*0.8, s + 10, s*1.4);
  drawCell(tctx, ox, oy + s, { type: 'resistor', value: 220, idx: 1, vertical: true, ports: { N: 1, S: 1 } });
}
