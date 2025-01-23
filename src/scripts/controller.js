import nonograms from '../data/nonograms.json';
import drawGame from './view.js';

let isGameStarted = false;
let nonogram = null;
let userInput = null;

const initGame = () => {
  drawGame(nonograms);

  document.addEventListener('nonogramSelected', (event) => {
    console.log('Выбрана нонограмма:', event.detail.name);
    console.log('Номер уровня:', event.detail.level);

    nonogram = nonograms[event.detail.level][event.detail.name];
    console.table(nonogram);
    isGameStarted = true;
  });
};

export default initGame;
