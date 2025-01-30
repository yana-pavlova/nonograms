import {
  createElement,
  changeTheme,
  padWithZero,
  checkIfThereIsDataInLocalStorage,
  getDataFromLocalStorage,
  handleOverlayClick,
} from './utils/utils.js';
import {
  numberOfLevels,
  modeTypes,
  levelDifficulty,
} from '../data/constants.js';
import nonograms from '../data/nonograms.json';
import * as sounds from './utils/sounds.js';
import { nonogramMatrix, userInput } from './controller.js';

export const elements = {
  board: null,
  boardContainer: null,
  colsClues: null,
  rowsClues: null,
  levelTabs: null,
  popup: null,
  resetButton: null,
  showSolutionButton: null,
  stopwatch: null,
  stopwatchHours: null,
  stopwatchMinutes: null,
  stopwatchSeconds: null,
  soundButton: null,
  saveStateButton: null,
  randomGameButton: null,
  bestResultsButton: null,
  bestResults: null,
  levelButtons: [],
  easyNonograms: [],
  mediumNonograms: [],
  hardNonograms: [],
};

let intervalId = null;
let soundsEnabled = false;

const drawGame = (nonograms, anchor) => {
  const fragment = document.createDocumentFragment();

  const header = createElement({ tag: 'nav', classes: ['menu'] });
  header.append(createStopwatch());
  header.append(createBestResultsButton());
  header.append(createRandomGameButton());
  header.append(createSoundButton());
  header.append(themeButtons());
  fragment.append(header);

  fragment.append(createLevelTabs(anchor));
  fragment.append(createNonogramMenu(nonograms));
  fragment.append(createPopup());
  fragment.append(createBestResults());

  if (anchor) {
    fragment.append(createBoard(levelDifficulty[modeTypes.indexOf(anchor)]));
  } else {
    fragment.append(createBoard());
  }

  const footer = createElement({ tag: 'nav', classes: ['game-menu'] });
  footer.append(createResetButton());
  footer.append(createShowSolutionButton());
  footer.append(createSaveStateButton());
  footer.append(createRestoreStateButton());
  fragment.append(footer);

  document.body.classList.add('page', 'theme_light');
  document.body.append(fragment);
};

const themeButtons = () => {
  const themeMenu = createElement({
    tag: 'nav',
    classes: ['theme-menu'],
  });
  const lightThemeButton = createElement({
    tag: 'button',
    classes: ['button', 'theme-menu-button', 'theme-menu-button_type_light'],
    text: 'Light',
  });
  const darkThemeButton = createElement({
    tag: 'button',
    classes: ['button', 'theme-menu-button', 'theme-menu-button_type_dark'],
    text: 'Dark',
  });

  lightThemeButton.disabled = true;

  [lightThemeButton, darkThemeButton].forEach((button) => {
    button.addEventListener('click', () => {
      [lightThemeButton, darkThemeButton].forEach((btn) => {
        btn.classList.remove('theme-menu-button_active');
        btn.removeAttribute('disabled');
      });
      if ([...button.classList].includes('theme-menu-button_type_light')) {
        changeTheme('light');
      } else if (
        [...button.classList].includes('theme-menu-button_type_dark')
      ) {
        changeTheme('dark');
      }
      button.classList.add('theme-menu-button_active');
      button.setAttribute('disabled', true);
    });
  });

  themeMenu.append(lightThemeButton);
  themeMenu.append(darkThemeButton);

  return themeMenu;
};

const createLevelTabs = (anchor) => {
  elements.levelTabs = null;
  elements.levelTabs = createElement({ tag: 'nav', classes: ['level-menu'] });

  for (let i = 0; i < numberOfLevels; i++) {
    const level = createElement({
      tag: 'button',
      classes: ['button', 'level'],
      text: modeTypes[i],
    });
    level.dataset.level = levelDifficulty[i];

    level.dataset.mode = modeTypes[i];

    if (anchor) {
      if (anchor === modeTypes[i]) {
        level.disabled = true;
        level.classList.add('active');
      }
    } else if (modeTypes[i] === 'easy') {
      window.location.hash = modeTypes[i];
      level.disabled = true;
      level.classList.add('active');
    }
    elements.levelTabs.append(level);
    elements.levelButtons.push(level);
  }

  elements.levelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      resetStopwatch();
      elements.levelButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.removeAttribute('disabled');
      });
      button.classList.add('active');
      button.setAttribute('disabled', true);

      elements.easyNonograms.forEach((n) => {
        n.classList.remove('active');
        n.removeAttribute('disabled');
      });
      elements.mediumNonograms.forEach((n) => {
        n.classList.remove('active');
        n.removeAttribute('disabled');
      });
      elements.hardNonograms.forEach((n) => {
        n.classList.remove('active');
        n.removeAttribute('disabled');
      });

      elements.resetButton.style.display = 'none';
      elements.saveStateButton.style.display = 'none';
      elements.showSolutionButton.style.display = 'none';

      const mode = button.dataset.mode;
      location.href = `${location.origin}${location.pathname}#${mode}`;

      elements.boardContainer.replaceWith(createBoard(button.dataset.level));
    });
  });

  return elements.levelTabs;
};

const createNonogramMenu = (nonograms) => {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < Object.keys(nonograms).length; i++) {
    const level = Object.keys(nonograms)[i];
    const nonogramOfOneLevel = nonograms[Object.keys(nonograms)[i]];
    const namesOfNonogramsOfOneLevel = Object.keys(nonogramOfOneLevel);

    const nonogramMenu = createElement({
      tag: 'nav',
      classes: ['nonogram-menu'],
    });

    nonogramMenu.id = level;

    namesOfNonogramsOfOneLevel.forEach((name) => {
      const nonogram = createElement({
        tag: 'button',
        classes: ['button', 'nonogram'],
        text: name,
      });
      nonogram.dataset.nonogram = name;

      nonogram.addEventListener('click', () => {
        resetStopwatch();
        nonogramMenu.querySelectorAll('.nonogram').forEach((btn) => {
          btn.classList.remove('active');
          btn.removeAttribute('disabled');
        });
        nonogram.classList.add('active');
        nonogram.setAttribute('disabled', true);

        elements.showSolutionButton.style.display = 'block';
        elements.resetButton.style.display = 'block';
        elements.saveStateButton.style.display = 'block';
        elements.restoreStateButton.style.display = 'block';

        elements.boardContainer.replaceWith(createBoard(levelDifficulty[i]));

        const event = new CustomEvent('nonogramSelected', {
          detail: { name, level },
        });
        document.dispatchEvent(event);
      });
      elements[`${level}Nonograms`].push(nonogram);
      nonogramMenu.append(nonogram);
    });

    fragment.append(nonogramMenu);
  }

  return fragment;
};

const createBoard = (difficulty = 5) => {
  elements.boardContainer = null;
  elements.colsClues = null;
  elements.rowsClues = null;

  elements.boardContainer = createElement({
    tag: 'div',
    classes: ['board-container', `board-container-${difficulty}`],
  });

  elements.colsClues = createElement({
    tag: 'div',
    classes: ['cols-clues', `cols-clues-${difficulty}`],
  });

  elements.rowsClues = createElement({
    tag: 'div',
    classes: ['rows-clues', `rows-clues-${difficulty}`],
  });

  for (let i = 0; i < difficulty; i++) {
    const colClue = createElement({
      tag: 'div',
      classes: ['clue', 'clue-col'],
    });
    const rowClue = createElement({
      tag: 'div',
      classes: ['clue', 'clue-row'],
    });
    elements.colsClues.append(colClue);
    elements.rowsClues.append(rowClue);
  }

  elements.boardContainer.append(elements.colsClues);
  elements.boardContainer.append(elements.rowsClues);

  elements.board = createElement({
    tag: 'div',
    classes: ['board', `board-${difficulty}`],
  });
  elements.boardContainer.style.pointerEvents = 'none';

  for (let i = 0; i < difficulty ** 2; i++) {
    const row = Math.floor(i / difficulty);
    const col = i % difficulty;

    const cell = createElement({ tag: 'div', classes: ['cell'] });

    cell.dataset.row = row;
    cell.dataset.col = col;

    cell.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    cell.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        cell.classList.remove('empty');
        cell.classList.toggle('active');
        if (cell.classList.contains('active')) {
          if (soundsEnabled) {
            sounds.filledCellSound.currentTime = 0;
            sounds.filledCellSound.play();
          }
        } else {
          if (soundsEnabled) {
            sounds.clearedCellSound.currentTime = 0;
            sounds.clearedCellSound.play();
          }
        }
      } else if (e.button === 2) {
        cell.classList.remove('active');
        cell.classList.add('empty');
        if (soundsEnabled) {
          sounds.emptiedCellSound.currentTime = 0;
          sounds.emptiedCellSound.play();
        }
      }

      const event = new CustomEvent('cellSelected', {
        detail: { row, col, cell },
      });
      document.dispatchEvent(event);
    });

    elements.board.append(cell);
  }

  elements.boardContainer.append(elements.board);
  return elements.boardContainer;
};

const createPopup = () => {
  const popupContainer = createElement({
    tag: 'div',
    classes: ['modal'],
  });

  const popup = createElement({
    tag: 'div',
    classes: ['modal-content'],
  });

  const closeButton = createElement({
    tag: 'span',
    classes: ['close'],
  });

  const text = createElement({
    tag: 'span',
    text: 'Great! You solved the puzzle in ',
  });

  const time = createElement({
    tag: 'span',
    classes: ['time'],
  });

  const secondPartOfText = createElement({
    tag: 'span',
    text: ' seconds! 🎉',
  });

  popup.append(closeButton);
  popup.append(text);
  popup.append(time);
  popup.append(secondPartOfText);

  popupContainer.append(popup);

  elements.popup = popupContainer;
  return popupContainer;
};

export const showWinMessage = (secs) => {
  const popup = elements.popup;
  const closeButton = popup.querySelector('.close');

  const time = popup.querySelector('.time');

  time.textContent = secs;

  elements.resetButton.style.display = 'none';
  elements.saveStateButton.style.display = 'none';
  elements.showSolutionButton.style.display = 'none';

  stopStopwatch();

  if (soundsEnabled) {
    sounds.winSound.play();
  }

  popup.style.display = 'block';
  document.body.classList.add('no-scroll');

  closeButton.onclick = function () {
    popup.style.display = 'none';
    document.body.classList.remove('no-scroll');
    window.onclick = null;
  };

  window.onclick = (e) => handleOverlayClick(e, popup);
};

export const showClues = (data) => {
  const cols = elements.colsClues.querySelectorAll('.clue-col');

  for (let i = 0; i < cols.length; i++) {
    data.cols[i].forEach((clue) => {
      const span = createElement({
        tag: 'span',
        text: `${clue}`,
      });
      span.addEventListener('click', () => {
        span.classList.toggle('crossed-out');
      });

      cols[i].append(span);
    });
  }

  const rows = elements.rowsClues.querySelectorAll('.clue-row');

  for (let i = 0; i < rows.length; i++) {
    data.rows[i].forEach((clue) => {
      const span = createElement({
        tag: 'span',
        text: `${clue}`,
      });
      span.addEventListener('click', () => {
        span.classList.toggle('crossed-out');
      });
      rows[i].append(span);
    });
  }
};

const createStopwatch = () => {
  elements.stopwatch = createElement({
    tag: 'div',
    classes: ['stopwatch'],
  });

  elements.stopwatchHours = createElement({
    tag: 'span',
    classes: ['stopwatch__hours'],
    text: '00',
  });
  elements.stopwatchMinutes = createElement({
    tag: 'span',
    classes: ['stopwatch__minutes'],
    text: '00',
  });
  elements.stopwatchSeconds = createElement({
    tag: 'span',
    classes: ['stopwatch__seconds'],
    text: '00',
  });

  elements.stopwatch.append(elements.stopwatchHours);
  elements.stopwatch.append(createElement({ tag: 'span', text: ':' }));
  elements.stopwatch.append(elements.stopwatchMinutes);
  elements.stopwatch.append(createElement({ tag: 'span', text: ':' }));
  elements.stopwatch.append(elements.stopwatchSeconds);

  return elements.stopwatch;
};

export const startStopwatch = () => {
  if (intervalId) return;

  intervalId = setInterval(() => {
    let seconds = parseInt(elements.stopwatchSeconds.textContent, 10);
    let minutes = parseInt(elements.stopwatchMinutes.textContent, 10);
    let hours = parseInt(elements.stopwatchHours.textContent, 10);

    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }

    elements.stopwatchSeconds.textContent = padWithZero(seconds);
    elements.stopwatchMinutes.textContent = padWithZero(minutes);
    elements.stopwatchHours.textContent = padWithZero(hours);
  }, 1000);
};

const stopStopwatch = () => {
  clearInterval(intervalId);
  intervalId = null;
};

const resetStopwatch = () => {
  stopStopwatch();
  elements.stopwatchHours.textContent = '00';
  elements.stopwatchMinutes.textContent = '00';
  elements.stopwatchSeconds.textContent = '00';
};

const createSoundButton = () => {
  elements.soundButton = createElement({
    tag: 'button',
    classes: ['button', 'sound-button', 'sound-off'],
    text: '♫',
  });

  elements.soundButton.addEventListener('click', () => {
    soundsEnabled = !soundsEnabled;
    elements.soundButton.classList.toggle('sound-off');
  });

  return elements.soundButton;
};

const createShowSolutionButton = () => {
  let solutionIsShown = false;

  elements.showSolutionButton = createElement({
    tag: 'button',
    classes: ['button', 'game-menu-button', 'show-solution-button'],
    text: 'show solution',
  });

  elements.showSolutionButton.addEventListener('click', () => {
    if (!solutionIsShown) {
      solutionIsShown = true;
      elements.showSolutionButton.textContent = 'hide solution';
      const currentMatrix = nonogramMatrix;

      for (let i = 0; i < currentMatrix.length; i++) {
        for (let j = 0; j < currentMatrix[i].length; j++) {
          const cell = elements.board.querySelector(
            `.cell[data-row="${i}"][data-col="${j}"]`
          );
          cell.classList.remove('active');
          cell.classList.remove('empty');
          if (currentMatrix[i][j] === 1) {
            cell.classList.add('active');
          }
        }
      }
    } else {
      for (let i = 0; i < userInput.length; i++) {
        for (let j = 0; j < userInput[i].length; j++) {
          const cell = elements.board.querySelector(
            `.cell[data-row="${i}"][data-col="${j}"]`
          );
          cell.classList.remove('active');
          cell.classList.remove('empty');
          if (userInput[i][j] === 1) {
            cell.classList.add('active');
          } else if (userInput[i][j] === 2) {
            cell.classList.add('empty');
          }
        }
      }

      solutionIsShown = false;
      elements.showSolutionButton.textContent = 'show solution';
    }
  });

  elements.showSolutionButton.style.display = 'none';

  return elements.showSolutionButton;
};

const createResetButton = () => {
  elements.resetButton = createElement({
    tag: 'button',
    classes: ['button', 'game-menu-button', 'reset-button'],
    text: 'clear board',
  });

  elements.resetButton.addEventListener('click', () => {
    const event = new CustomEvent('resetBoard');
    document.dispatchEvent(event);
  });

  elements.resetButton.style.display = 'none';

  return elements.resetButton;
};

const createSaveStateButton = () => {
  elements.saveStateButton = createElement({
    tag: 'button',
    classes: ['button', 'game-menu-button', 'save-state-button'],
    text: 'save game',
  });

  elements.saveStateButton.addEventListener('click', () => {
    elements.restoreStateButton.disabled = false;

    const event = new CustomEvent('saveState');
    document.dispatchEvent(event);
  });

  elements.saveStateButton.style.display = 'none';

  return elements.saveStateButton;
};

const createRestoreStateButton = () => {
  elements.restoreStateButton = createElement({
    tag: 'button',
    classes: ['button', 'game-menu-button', 'restore-state-button'],
    text: 'restore game',
  });

  elements.restoreStateButton.style.display =
    (checkIfThereIsDataInLocalStorage('gameState') && 'block') || 'none';
  elements.restoreStateButton.disabled =
    !checkIfThereIsDataInLocalStorage('gameState');
  elements.restoreStateButton.addEventListener('click', () => {
    const event = new CustomEvent('restoreState');
    document.dispatchEvent(event);
  });

  return elements.restoreStateButton;
};

const createRandomGameButton = () => {
  elements.randomGameButton = null;
  elements.randomGameButton = createElement({
    tag: 'button',
    classes: ['button', 'level', 'level_random'],
    text: 'Random game',
  });
  elements.randomGameButton.dataset.mode = 'random';

  elements.randomGameButton.addEventListener('click', () => {
    resetStopwatch();
    elements.levelButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.removeAttribute('disabled');
    });

    elements.easyNonograms.forEach((n) => {
      n.classList.remove('active');
      n.removeAttribute('disabled');
    });
    elements.mediumNonograms.forEach((n) => {
      n.classList.remove('active');
      n.removeAttribute('disabled');
    });
    elements.hardNonograms.forEach((n) => {
      n.classList.remove('active');
      n.removeAttribute('disabled');
    });

    elements.resetButton.style.display = 'none';
    elements.saveStateButton.style.display = 'none';
    elements.showSolutionButton.style.display = 'none';

    const mode = modeTypes[Math.floor(Math.random() * modeTypes.length)];
    const level = levelDifficulty[modeTypes.indexOf(mode)];

    location.href = `${location.origin}${location.pathname}#${mode}`;

    const nonogramOfOveLevel = nonograms[mode];
    const randomNonogramName =
      Object.keys(nonogramOfOveLevel)[
        Math.floor(Math.random() * Object.keys(nonogramOfOveLevel).length)
      ];

    document.body.querySelectorAll('.nonogram').forEach((btn) => {
      btn.classList.remove('active');
      btn.removeAttribute('disabled');

      if (btn.dataset.nonogram === randomNonogramName) {
        btn.classList.add('active');
        btn.setAttribute('disabled', true);
      }
    });

    elements.levelTabs.querySelectorAll('.level').forEach((btn) => {
      btn.classList.remove('active');
      btn.removeAttribute('disabled');

      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
        btn.setAttribute('disabled', true);
      }
    });

    elements.boardContainer.replaceWith(createBoard(level));

    const event = new CustomEvent('nonogramSelected', {
      detail: {
        name: randomNonogramName,
        level: mode,
      },
    });
    document.dispatchEvent(event);

    elements.resetButton.style.display = 'block';
    elements.saveStateButton.style.display = 'block';
    elements.showSolutionButton.style.display = 'block';
  });

  return elements.randomGameButton;
};

export const restoreState = (state) => {
  elements.levelButtons.forEach((button) => {
    button.classList.remove('active');
    button.removeAttribute('disabled');
    if (button.dataset.mode === state.level) {
      button.classList.add('active');
      button.setAttribute('disabled', true);
    }
  });

  window.location.hash = state.level;

  elements.boardContainer.replaceWith(
    createBoard(levelDifficulty[modeTypes.indexOf(state.level)])
  );

  for (let i = 0; i < state.nonogramMatrix.length; i++) {
    for (let j = 0; j < state.nonogramMatrix[i].length; j++) {
      const cell = elements.board.querySelector(
        `.cell[data-row="${i}"][data-col="${j}"]`
      );
      if (state.userInput[i][j] === 1) {
        cell.classList.add('active');
      } else if (state.userInput[i][j] === 2) {
        cell.classList.add('empty');
      }
    }
  }

  elements.stopwatchHours.textContent = state.hours;
  elements.stopwatchMinutes.textContent = state.minutes;
  elements.stopwatchSeconds.textContent = state.seconds;

  const nonogramButton = elements[`${state.level}Nonograms`].find(
    (btn) => btn.dataset.nonogram === state.nonogramName
  );

  if (nonogramButton) {
    document.body.querySelectorAll('.nonogram').forEach((btn) => {
      btn.classList.remove('active');
      btn.removeAttribute('disabled');

      if (nonogramButton === btn) {
        btn.classList.add('active');
        btn.setAttribute('disabled', true);
      }
    });

    elements.showSolutionButton.style.display = 'block';
    elements.resetButton.style.display = 'block';
    elements.saveStateButton.style.display = 'block';
    elements.restoreStateButton.style.display = 'block';

    const event = new CustomEvent('nonogramSelected', {
      detail: {
        name: state.nonogramName,
        level: state.level,
        input: state.userInput,
      },
    });
    document.dispatchEvent(event);
  }

  startStopwatch();
};

const createBestResultsButton = () => {
  elements.bestResultsButton = createElement({
    tag: 'button',
    classes: ['button', 'level', 'level_best-results'],
    text: 'Last results',
  });

  elements.bestResultsButton.addEventListener('click', () => {
    renderBestResults();
  });

  return elements.bestResultsButton;
};

const renderBestResults = () => {
  document.body.classList.add('no-scroll');
  createBestResults(true);
};

export const createBestResults = (shouldBeVisible) => {
  const data = getDataFromLocalStorage('win');
  if (!data) return renderLastResultsWithoutData(shouldBeVisible);

  const sortedData = data.sort((a, b) => a.time - b.time);

  if (elements.bestResults) {
    elements.bestResults.remove();
  }

  elements.bestResults = createElement({
    tag: 'div',
    classes: ['modal', 'best-results__table'],
  });

  const closeButton = createElement({
    tag: 'span',
    classes: ['close'],
  });

  closeButton.addEventListener('click', () => {
    elements.bestResults.style.display = 'none';
    document.body.classList.remove('no-scroll');
    window.onclick = null;
  });

  window.onclick = (e) => handleOverlayClick(e, elements.bestResults);

  elements.bestResults.append(closeButton);

  const bestResults = createElement({
    tag: 'div',
    classes: ['best-results', 'modal-content'],
  });

  elements.bestResults.style.display = shouldBeVisible ? 'grid' : 'none';

  const title = createElement({
    tag: 'h2',
    classes: ['best-results__title'],
    text: 'Last 5 results',
  });

  bestResults.append(title);

  const row = createElement({
    tag: 'div',
    classes: ['best-results-row', 'best-results-row-header'],
  });

  const nameCell = createElement({
    tag: 'div',
    classes: ['best-results-cell', 'best-results-header'],
    text: 'Nonogram',
  });

  const levelCell = createElement({
    tag: 'div',
    classes: ['best-results-cell', 'best-results-header'],
    text: 'Level',
  });

  const timeCell = createElement({
    tag: 'div',
    classes: ['best-results-cell', 'best-results-header'],
    text: 'Time',
  });

  row.append(nameCell);
  row.append(levelCell);
  row.append(timeCell);

  bestResults.append(row);

  sortedData.forEach((result) => {
    const { name, level, time } = result;

    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;

    const row = createElement({
      tag: 'div',
      classes: ['best-results-row'],
    });

    const nameCell = createElement({
      tag: 'div',
      classes: ['best-results-cell'],
      text: name,
    });

    const levelCell = createElement({
      tag: 'div',
      classes: ['best-results-cell'],
      text: level,
    });

    const timeCell = createElement({
      tag: 'div',
      classes: ['best-results-cell'],
      text: `${padWithZero(minutes)}:${padWithZero(seconds)}`,
    });

    row.append(nameCell);
    row.append(levelCell);
    row.append(timeCell);
    bestResults.append(row);
  });

  bestResults.append(closeButton);
  elements.bestResults.append(bestResults);

  document.body.append(elements.bestResults);

  return elements.bestResults;
};

const renderLastResultsWithoutData = (shouldBeVisible) => {
  elements.bestResults = createElement({
    tag: 'div',
    classes: ['modal', 'best-results__table'],
  });

  const closeButton = createElement({
    tag: 'span',
    classes: ['close'],
  });

  closeButton.addEventListener('click', () => {
    elements.bestResults.style.display = 'none';
    document.body.classList.remove('no-scroll');
  });

  elements.bestResults.append(closeButton);

  const bestResults = createElement({
    tag: 'div',
    classes: ['best-results', 'modal-content'],
  });

  elements.bestResults.style.display = shouldBeVisible ? 'grid' : 'none';

  const title = createElement({
    tag: 'h2',
    classes: ['best-results__title'],
    text: 'Here will be last 5 results',
  });

  bestResults.append(title);

  const paragraph = createElement({
    tag: 'p',
    text: ["Win any game and it'll appear here."],
  });

  bestResults.append(paragraph);
  bestResults.append(closeButton);
  elements.bestResults.append(bestResults);

  document.body.append(elements.bestResults);

  return elements.bestResults;
};

export default drawGame;
