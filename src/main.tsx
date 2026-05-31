import './index.css';
import { setupLayout } from './core/layout';
import { applyI18n } from './core/i18n';
import { init, loop } from './controller/gameController';
import { drawNext } from './view/nextPieceView';
import { updateUI } from './view/hud';
import { setupKeyboard, setupTouch, setupCanvasGestures } from './controller/inputController';
import { setupTutorialNav, setupPauseButton, setupSoundButton, onLanguageRefresh } from './view/tutorialView';
import { drawTutorial, drawLegendPieces } from './view/legendView';

// Apply the detected/saved language to all static DOM before first paint.
applyI18n();

// Lock the layout size before anything paints, then watch for resize/zoom.
setupLayout();

setupTutorialNav(init);
setupPauseButton();
setupSoundButton();
setupKeyboard();
setupTouch();
setupCanvasGestures();

// When the language toggles, refresh the dynamic widgets too.
onLanguageRefresh(() => { updateUI(); drawNext(); });

init();
drawTutorial();
drawLegendPieces();
requestAnimationFrame(loop);
