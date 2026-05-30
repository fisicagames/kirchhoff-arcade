import { handleGameInput } from './gameController';

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
