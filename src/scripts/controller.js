import nonograms from '../data/nonograms.json';
import drawGame, { drawClues, elements } from './view.js';

let isGameStarted = false;
let nonogram = null;
let userInput = null;

const anchor = window.location.hash.slice(1);

const initGame = () => {
  drawGame(nonograms, anchor);

  document.addEventListener('nonogramSelected', (event) => {
    console.log('Выбрана нонограмма:', event.detail.name);
    console.log('Номер уровня:', event.detail.level);

    nonogram = nonograms[event.detail.level][event.detail.name];
    userInput = Array.from({ length: nonogram.length }, () =>
      Array(nonogram[0].length).fill(0)
    );

    drawClues(nonogram);
    isGameStarted = true;
    elements.board.style.pointerEvents = 'auto';
  });

  document.addEventListener('cellSelected', (event) => {
    if (isGameStarted) {
      const { row, col } = event.detail;
      userInput[row][col] = userInput[row][col] === 0 ? 1 : 0;

      checkIfUserWins();
    }
  });
};

const checkIfUserWins = () => {
  for (let i = 0; i < nonogram.length; i++) {
    for (let j = 0; j < nonogram[i].length; j++) {
      if (nonogram[i][j] !== userInput[i][j]) {
        return;
      }
    }
  }
  console.log('Пользователь победил!');
  isGameStarted = false;
  elements.board.style.pointerEvents = 'none';
};

export default initGame;
