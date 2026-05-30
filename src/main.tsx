import './index.css';
import { init, loop, clearBoard } from './controller/gameController';
import { setupKeyboard, setupTouch, setupCanvasGestures } from './controller/inputController';
import { setupTutorialNav, setupPauseButton, setupLimparButton, setupSoundButton } from './view/tutorialView';
import { drawTutorial, drawLegendPieces } from './view/legendView';

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
