import { resolveAnalyzing } from '../controller/gameController';
import { state } from '../model/gameState';
import { updateMusicPlayback, toggleMute, isMuted } from '../core/audioManager';
import { t, toggleLang, applyI18n } from '../core/i18n';

let currentPage = 1;
const TOTAL_PAGES = 9;

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
  if (btn) btn.textContent = state.gameStarted ? t('tut.continue') : t('tut.start');
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
  document.getElementById('btnHelp')?.addEventListener('click', () => {
    // Resolve qualquer circuito pendente (adiciona os pontos e fecha o overlay)
    resolveAnalyzing(); 
    
    // Exibe o tutorial
    state.helpOpen = true; 
    showTutorial();
  });

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

  // Language toggle — switches PT ⇄ EN and re-applies every translation.
  document.getElementById('btnEnglish')?.addEventListener('click', () => {
    toggleLang();
    refreshLanguage();
  });
}

/** Re-render all language-dependent text (static DOM + dynamic widgets). */
export function refreshLanguage(): void {
  applyI18n();
  syncPauseButton();
  syncSoundButton();
  // Iniciar/Continuar label depends on game state.
  const ini = document.getElementById('btnIniciar');
  if (ini) ini.textContent = state.gameStarted ? t('tut.continue') : t('tut.start');
  refreshDynamic?.();
}

// Allows main.tsx to register a callback that redraws HUD + next-piece text.
let refreshDynamic: (() => void) | null = null;
export function onLanguageRefresh(cb: () => void): void { refreshDynamic = cb; }

function syncPauseButton(): void {
  const btn = document.getElementById('btnPause');
  if (!btn) return;
  btn.textContent = state.isPaused ? t('btn.resume') : t('btn.pause');
}

function syncSoundButton(): void {
  const btn = document.getElementById('btnSound');
  if (!btn) return;
  btn.textContent = isMuted() ? t('btn.soundOff') : t('btn.sound');
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
      btn.textContent = t('btn.resume');
      btn.style.color = '#55ee88';
    } else {
      btn.textContent = t('btn.pause');
      btn.style.color = '';
    }
  });
}

export function setupSoundButton(): void {
  const btn = document.getElementById('btnSound');
  if (!btn) return;

  const update = (): void => {
    btn.textContent = isMuted() ? t('btn.soundOff') : t('btn.sound');
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
