import './index.css';
import { setupLayout } from './core/layout';
import { init, loop, clearBoard } from './controller/gameController';
import { setupKeyboard, setupTouch, setupCanvasGestures } from './controller/inputController';
import { setupTutorialNav, setupPauseButton, setupLimparButton, setupSoundButton } from './view/tutorialView';
import { drawTutorial, drawLegendPieces } from './view/legendView';

// Lock the layout size before anything paints, then watch for resize/zoom.
setupLayout();

setupTutorialNav(init);
setupPauseButton();
setupLimparButton(clearBoard);
setupSoundButton();
setupKeyboard();
setupTouch();
setupCanvasGestures();

init();
drawTutorial();
drawLegendPieces();
requestAnimationFrame(loop);
