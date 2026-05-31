import { state } from '../model/gameState';
import { updateMusicPlayback, toggleMute, isMuted } from '../core/audioManager';

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
  if (prev) prev.style.visibility = currentPage > 1           ? 'visible' : 'hidden';
  if (next) next.style.visibility = currentPage < TOTAL_PAGES ? 'visible' : 'hidden';
}

export function showTutorial(): void {
  // Mid-game help freezes the board (music keeps playing).
  if (state.gameStarted && !state.gameOver) state.helpOpen = true;
  const btn = document.getElementById('btnIniciar');
  if (btn) btn.textContent = state.gameStarted ? 'Continuar' : 'Iniciar';
  document.getElementById('tutorialScreen')?.classList.add('show');
}

export function hideTutorial(): void {
  document.getElementById('tutorialScreen')?.classList.remove('show');
}

export function setupTutorialNav(onInit: () => void): void {
  document.getElementById('btnNextTutorial')?.addEventListener('click', () => {
    if (currentPage < TOTAL_PAGES) { currentPage++; updatePage(); }
  });

  document.getElementById('btnPrevTutorial')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; updatePage(); }
  });

  // "Iniciar / Continuar" — main CTA
  document.getElementById('btnIniciar')?.addEventListener('click', () => {
    if (!state.gameStarted) {
      state.gameStarted = true;
      updateMusicPlayback();
    }
    state.helpOpen = false;   // resume the board
    hideTutorial();
  });

  // Tutorial button (opens panel mid-game)
  document.getElementById('btnHelp')?.addEventListener('click', () => showTutorial());

  // Reiniciar
  document.getElementById('btnRestart')?.addEventListener('click', () => {
    if (!state.gameStarted) state.gameStarted = true;
    onInit();
  });

  // ── Menu top bar (série) ──
  const musicaBtn  = document.getElementById('btnMusica');
  const musicaIcon = document.getElementById('musicaIcon');
  musicaBtn?.addEventListener('click', () => {
    toggleMute();
    if (musicaIcon) musicaIcon.textContent = isMuted() ? '🔇' : '🔊';
  });

  // ENGLISH — i18n fica para uma etapa futura
  document.getElementById('btnEnglish')?.addEventListener('click', () => {
    /* placeholder */
  });
}

export function setupPauseButton(): void {
  document.getElementById('btnPause')?.addEventListener('click', () => {
    if (!state.gameStarted || state.gameOver || state.analyzingMode || state.helpOpen) return;

    // Free toggle — no per-session limit.
    state.isPaused = !state.isPaused;
    updateMusicPlayback();

    const btn = document.getElementById('btnPause');
    if (!btn) return;
    if (state.isPaused) {
      btn.textContent = 'RETOMAR';
      btn.style.color = '#55ee88';
    } else {
      btn.textContent = 'PAUSA';
      btn.style.color = '';
    }
  });
}

export function setupLimparButton(onClear: () => void): void {
  document.getElementById('btnLimpar')?.addEventListener('click', () => {
    if (!state.gameStarted || state.gameOver || state.analyzingMode || state.isPaused || state.hasUsedLimpar) return;
    state.hasUsedLimpar = true;
    const btn = document.getElementById('btnLimpar');
    if (btn) { btn.style.cursor = 'not-allowed'; btn.style.opacity = '0.38'; }
    onClear();
  });
}

export function setupSoundButton(): void {
  const btn = document.getElementById('btnSound');
  if (!btn) return;

  const update = (): void => {
    btn.textContent = isMuted() ? 'SOM OFF' : 'SOM';
    btn.style.color = isMuted() ? '#cc4466' : '';
  };

  btn.addEventListener('click', () => {
    toggleMute();
    update();
    // keep the menu speaker icon in sync
    const musicaIcon = document.getElementById('musicaIcon');
    if (musicaIcon) musicaIcon.textContent = isMuted() ? '🔇' : '🔊';
  });
}
