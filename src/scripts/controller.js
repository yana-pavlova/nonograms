import nonograms from '../data/nonograms.json';
import drawGame, {
  elements,
  restoreState,
  showWinMessage,
  showClues,
} from './view.js';
import {
  saveDataInLocalStorage,
  getDataFromLocalStorage,
} from './utils/utils.js';

let isGameStarted = false;
let nonogramMatrix = null;
let nonogramName;

let userInput = null;

let anchor = window.location.hash.slice(1);

const initGame = () => {
  drawGame(nonograms, anchor);

  document.addEventListener('nonogramSelected', (event) => {
    console.log('Выбрана нонограмма:', event.detail.name);

    nonogramName = event.detail.name;
    nonogramMatrix = nonograms[event.detail.level][event.detail.name];

    if (event.detail.input) {
      userInput = event.detail.input;
    } else {
      userInput = Array.from({ length: nonogramMatrix.length }, () =>
        Array(nonogramMatrix[0].length).fill(0)
      );
    }

    calculateClues(nonogramMatrix);
    isGameStarted = true;
    elements.board.style.pointerEvents = 'auto';

    console.table(nonogramMatrix);
  });

  document.addEventListener('cellSelected', (event) => {
    if (isGameStarted) {
      const { row, col, cell } = event.detail;

      if (cell.classList.contains('empty')) {
        userInput[row][col] = 2;
      } else if (cell.classList.contains('active')) {
        userInput[row][col] = 1;
      } else {
        userInput[row][col] = 0;
      }

      checkIfUserWins();
    }
  });

  document.addEventListener('resetBoard', () => {
    if (isGameStarted) {
      resetGame();
    }
  });

  document.addEventListener('saveState', () => {
    if (isGameStarted) {
      saveDataInLocalStorage(
        {
          userInput: userInput,
          nonogramMatrix: nonogramMatrix,
          nonogramName: nonogramName,
          level: window.location.hash.slice(1),
          hours: elements.stopwatchHours.textContent,
          minutes: elements.stopwatchMinutes.textContent,
          seconds: elements.stopwatchSeconds.textContent,
        },
        'gameState'
      );
    }
  });

  document.addEventListener('restoreState', () => {
    const state = getDataFromLocalStorage('gameState');
    if (!state) return;

    nonogramMatrix = state.nonogramMatrix;
    userInput = state.userInput;
    nonogramName = state.nonogramName;
    anchor = state.level;
    isGameStarted = true;

    restoreState(state);
  });
};

const checkIfUserWins = () => {
  for (let i = 0; i < nonogramMatrix.length; i++) {
    for (let j = 0; j < nonogramMatrix[i].length; j++) {
      if (nonogramMatrix[i][j] === 0 && userInput[i][j] === 1) {
        return;
      }
      if (nonogramMatrix[i][j] === 1 && userInput[i][j] !== 1) {
        return;
      }
    }
  }

  showWinMessage();
  isGameStarted = false;
  elements.board.style.pointerEvents = 'none';
  elements.resetButton.style.display = 'none';
};

const calculateClues = (matrix) => {
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

  showClues(data);
};

const resetGame = () => {
  userInput = Array.from({ length: nonogramMatrix.length }, () =>
    Array(nonogramMatrix[0].length).fill(0)
  );

  elements.board.querySelectorAll('.cell').forEach((cell) => {
    cell.classList.remove('active');
    cell.classList.remove('empty');
  });
};

export default initGame;
