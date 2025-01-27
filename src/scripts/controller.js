import nonograms from '../data/nonograms.json';
import drawGame, { elements, showWinMessage, showClues } from './view.js';

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

    calculateClues(nonogram);
    isGameStarted = true;
    elements.board.style.pointerEvents = 'auto';
  });

  document.addEventListener('cellSelected', (event) => {
    if (isGameStarted) {
      const { row, col, cell } = event.detail;

      if (cell.classList.contains('empty')) {
        userInput[row][col] = 0;
      } else if (cell.classList.contains('active')) {
        userInput[row][col] = 1;
      } else {
        userInput[row][col] = 0;
      }

      // userInput[row][col] = userInput[row][col] === 0 ? 1 : 0;
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
  showWinMessage("There's a win! 🎉");

  isGameStarted = false;
  elements.board.style.pointerEvents = 'none';
};

const calculateClues = (matrix) => {
  console.table(matrix);
  const data = {
    rows: [],
    cols: [],
  };

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    let sequence = [];
    let count = 0;

    row.forEach((cell) => {
      if (cell !== 0) {
        count++;
      } else if (count > 0) {
        sequence.push(count);
        count = 0;
      }
    });

    if (count > 0) sequence.push(count);
    if (sequence.length === 0) sequence.push(0);
    data.rows.push(sequence);
  }

  for (let c = 0; c < matrix[0].length; c++) {
    let sequence = [];
    let count = 0;

    for (let r = 0; r < matrix.length; r++) {
      if (matrix[r][c] !== 0) {
        count++;
      } else if (count > 0) {
        sequence.push(count);
        count = 0;
      }
    }

    if (count > 0) sequence.push(count);
    if (sequence.length === 0) sequence.push(0);
    data.cols[c] = sequence;
  }

  // console.log(data);
  showClues(data);
};

export default initGame;
