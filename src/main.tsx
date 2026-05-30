import './index.css';
import { init, loop, clearBoard } from './controller/gameController';
import { setupKeyboard, setupTouch } from './controller/inputController';
import { setupTutorialNav, setupPauseButton, setupLimparButton } from './view/tutorialView';
import { drawTutorial, drawLegendPieces } from './view/legendView';

setupTutorialNav(init);
setupPauseButton();
setupLimparButton(clearBoard);
setupKeyboard();
setupTouch();

init();
drawTutorial();
drawLegendPieces();
requestAnimationFrame(loop);
