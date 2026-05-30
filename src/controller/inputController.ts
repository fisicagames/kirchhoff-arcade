import { handleGameInput } from './gameController';
import { gameCanvas } from '../core/canvasSetup';
import { COLS } from '../core/constants';

// ── Keyboard ──

export function setupKeyboard(): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ([' ', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
    }
    switch (e.key) {
      case 'ArrowLeft':  handleGameInput('left');    break;
      case 'ArrowRight': handleGameInput('right');   break;
      case 'ArrowDown':  handleGameInput('down');    break;
      case 'ArrowUp':    handleGameInput('rotate');  break;
      case ' ':          handleGameInput('drop');    break;
      case 'r': case 'R': handleGameInput('restart'); break;
    }
  });
}

// ── Touch controls ──

interface RepeatTimer { timeout: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }
const repeatTimers: Record<string, RepeatTimer> = {};

function startRepeat(id: string, action: string, delay: number, interval: number): void {
  stopRepeat(id);
  handleGameInput(action);
  const timer: RepeatTimer = {
    timeout: setTimeout(() => {
      timer.interval = setInterval(() => handleGameInput(action), interval);
    }, delay),
  };
  repeatTimers[id] = timer;
}

function stopRepeat(id: string): void {
  const t = repeatTimers[id];
  if (!t) return;
  clearTimeout(t.timeout);
  if (t.interval) clearInterval(t.interval);
  delete repeatTimers[id];
}

interface TouchBinding {
  id:       string;
  action:   string;
  repeat:   boolean;
  delay?:   number;
  interval?: number;
}

const TOUCH_BINDINGS: TouchBinding[] = [
  { id: 'btnTouchLeft',   action: 'left',   repeat: true,  delay: 220, interval: 80 },
  { id: 'btnTouchRight',  action: 'right',  repeat: true,  delay: 220, interval: 80 },
  { id: 'btnTouchDown',   action: 'down',   repeat: true,  delay: 180, interval: 90 },
  { id: 'btnTouchRotate', action: 'rotate', repeat: false },
  { id: 'btnTouchDrop',   action: 'drop',   repeat: false },
];

export function setupTouch(): void {
  for (const { id, action, repeat, delay = 200, interval = 80 } of TOUCH_BINDINGS) {
    const btn = document.getElementById(id);
    if (!btn) continue;

    if (repeat) {
      btn.addEventListener('pointerdown', (e: Event) => {
        e.preventDefault();
        btn.classList.add('pressed');
        startRepeat(id, action, delay, interval);
      });
      const stop = (): void => { btn.classList.remove('pressed'); stopRepeat(id); };
      btn.addEventListener('pointerup',     stop);
      btn.addEventListener('pointerleave',  stop);
      btn.addEventListener('pointercancel', stop);
    } else {
      btn.addEventListener('pointerdown', (e: Event) => {
        e.preventDefault();
        btn.classList.add('pressed');
        handleGameInput(action);
      });
      const stop = (): void => btn.classList.remove('pressed');
      btn.addEventListener('pointerup',     stop);
      btn.addEventListener('pointerleave',  stop);
      btn.addEventListener('pointercancel', stop);
    }
  }
}

// ── Canvas gestures (tap = rotate, swipe ←→ = move, swipe ↓ = drop) ──

export function setupCanvasGestures(): void {
  let active     = false;
  let startX     = 0;
  let startY     = 0;
  let startT     = 0;
  let lastStepX  = 0;
  let stepPx     = 24;   // px per lateral cell-move (set on pointerdown)
  let tapDist    = 12;   // max travel to still count as a tap
  let dropDy     = 55;   // min downward travel for a hard drop
  let movedHoriz = false;
  let dropped    = false;

  const TAP_TIME    = 260;  // ms — max duration of a tap
  const DROP_RATIO  = 1.25; // vertical must dominate horizontal for a drop

  gameCanvas.addEventListener('pointerdown', (e: PointerEvent) => {
    active     = true;
    startX     = e.clientX;
    startY     = e.clientY;
    startT     = performance.now();
    lastStepX  = e.clientX;
    movedHoriz = false;
    dropped    = false;

    // Scale thresholds to the on-screen cell size so it feels the same on any device.
    const cellPx = gameCanvas.getBoundingClientRect().width / COLS;
    stepPx  = cellPx * 0.82;
    tapDist = cellPx * 0.55;
    dropDy  = cellPx * 1.9;

    gameCanvas.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });

  gameCanvas.addEventListener('pointermove', (e: PointerEvent) => {
    if (!active) return;
    e.preventDefault();

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Fast downward flick → hard drop (only if we haven't started moving sideways).
    if (!dropped && !movedHoriz && dy > dropDy && dy > Math.abs(dx) * DROP_RATIO) {
      handleGameInput('drop');
      dropped = true;
      active  = false;
      return;
    }

    // Lateral dragging → move one cell per step crossed.
    const stepDx = e.clientX - lastStepX;
    if (Math.abs(stepDx) >= stepPx && Math.abs(dx) > Math.abs(dy)) {
      const dir   = stepDx > 0 ? 'right' : 'left';
      const steps = Math.floor(Math.abs(stepDx) / stepPx);
      for (let i = 0; i < steps; i++) handleGameInput(dir);
      lastStepX  += (dir === 'right' ? 1 : -1) * steps * stepPx;
      movedHoriz  = true;
    }
  });

  const end = (e: PointerEvent): void => {
    if (!active) return;
    active = false;
    if (dropped) return;

    const dx   = e.clientX - startX;
    const dy   = e.clientY - startY;
    const dt   = performance.now() - startT;
    const dist = Math.hypot(dx, dy);

    if (dist < tapDist && dt < TAP_TIME && !movedHoriz) {
      handleGameInput('rotate');                       // quick tap
    } else if (!movedHoriz && dy > dropDy && dy > Math.abs(dx) * DROP_RATIO) {
      handleGameInput('drop');                          // slower downward swipe
    }
  };

  gameCanvas.addEventListener('pointerup', end);
  gameCanvas.addEventListener('pointercancel', () => { active = false; });

  // Belt-and-suspenders: block pull-to-refresh / page scroll started on the grid.
  gameCanvas.addEventListener('touchmove', (e: TouchEvent) => e.preventDefault(), { passive: false });
}
