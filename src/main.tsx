import './index.css';
import { setupLayout } from './core/layout';
import { init, loop } from './controller/gameController';
import { setupKeyboard, setupTouch, setupCanvasGestures } from './controller/inputController';
import { setupTutorialNav, setupPauseButton, setupSoundButton } from './view/tutorialView';
import { drawTutorial, drawLegendPieces } from './view/legendView';

// Lock the layout size before anything paints, then watch for resize/zoom.
setupLayout();

setupTutorialNav(init);
setupPauseButton();
setupSoundButton();
setupKeyboard();
setupTouch();
setupCanvasGestures();

init();
drawTutorial();
drawLegendPieces();
requestAnimationFrame(loop);
