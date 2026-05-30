import { state } from '../model/gameState';
import { updateMusicPlayback } from '../core/audioManager';

let currentPage = 1;
const TOTAL_PAGES = 5;

function updatePage(): void {
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const el = document.getElementById('tutorialPage' + i);
    if (el) el.style.display = i === currentPage ? 'block' : 'none';
  }
  const indicator = document.getElementById('tutorialPageIndicator');
  if (indicator) indicator.textContent = `${currentPage}/${TOTAL_PAGES}`;

  const prev = document.getElementById('btnPrevTutorial') as HTMLButtonElement | null;
  const next = document.getElementById('btnNextTutorial') as HTMLButtonElement | null;
  if (prev) prev.style.visibility = currentPage > 1             ? 'visible' : 'hidden';
  if (next) next.style.visibility = currentPage < TOTAL_PAGES   ? 'visible' : 'hidden';
}

export function showTutorial(): void {
  const msg = document.getElementById('tutorialStartMsg');
  if (msg && state.gameStarted) msg.style.display = 'none';
  document.getElementById('tutorialScreen')?.classList.add('show');
}

export function hideTutorial(): void {
  document.getElementById('tutorialScreen')?.classList.remove('show');
}

export function setupTutorialNav(onStart: () => void): void {
  document.getElementById('btnNextTutorial')?.addEventListener('click', () => {
    if (currentPage < TOTAL_PAGES) { currentPage++; updatePage(); }
  });

  document.getElementById('btnPrevTutorial')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; updatePage(); }
  });

  document.getElementById('btnCloseTutorial')?.addEventListener('click', () => {
    hideTutorial();
    if (!state.gameStarted) { state.gameStarted = true; updateMusicPlayback(); }
  });

  document.getElementById('btnHelp')?.addEventListener('click', () => showTutorial());

  document.getElementById('btnRestart')?.addEventListener('click', () => {
    if (!state.gameStarted) state.gameStarted = true;
    onStart();
  });
}

export function setupPauseButton(): void {
  document.getElementById('btnPause')?.addEventListener('click', () => {
    if (!state.gameStarted || state.gameOver || state.analyzingMode) return;
    if (!state.isPaused && state.hasUsedPause) return;

    state.isPaused = !state.isPaused;
    updateMusicPlayback();

    const btn = document.getElementById('btnPause');
    if (!btn) return;
    if (state.isPaused) {
      btn.textContent  = '▶';
      btn.style.color  = '#55ee88';
    } else {
      state.hasUsedPause = true;
      btn.textContent    = '⏸';
      btn.style.color    = '';
      btn.style.cursor   = 'not-allowed';
      btn.style.opacity  = '0.4';
    }
  });
}

export function setupLimparButton(onClear: () => void): void {
  document.getElementById('btnLimpar')?.addEventListener('click', () => {
    if (!state.gameStarted || state.gameOver || state.analyzingMode || state.isPaused || state.hasUsedLimpar) return;
    state.hasUsedLimpar = true;
    const btn = document.getElementById('btnLimpar');
    if (btn) { btn.style.cursor = 'not-allowed'; btn.style.opacity = '0.4'; }
    onClear();
  });
}
