import {
  createElement,
  changeTheme,
  padWithZero,
  checkIfThereIsDataInLocalStorage,
} from './utils/utils.js';
import {
  numberOfLevels,
  modeTypes,
  levelDifficulty,
} from '../data/constants.js';
import * as sounds from './utils/sounds.js';

export const elements = {
  board: null,
  boardContainer: null,
  colsClues: null,
  rowsClues: null,
  levelTabs: null,
  popup: null,
  resetButton: null,
  stopwatch: null,
  stopwatchHours: null,
  stopwatchMinutes: null,
  stopwatchSeconds: null,
  soundButton: null,
  saveStateButton: null,
  levelButtons: [],
  easyNonograms: [],
  mediumNonograms: [],
  hardNonograms: [],
};

let intervalId = null;
let soundsEnabled = true;

const drawGame = (nonograms, anchor) => {
  const fragment = document.createDocumentFragment();

  const header = createElement({ tag: 'nav', classes: ['menu'] });
  header.append(createStopwatch());
  header.append(createSoundButton());
  header.append(themeButtons());
  fragment.append(header);

  fragment.append(createLevelTabs(anchor));
  fragment.append(createNonogramMenu(nonograms));
  fragment.append(createPopup());

  if (anchor) {
    fragment.append(createBoard(levelDifficulty[modeTypes.indexOf(anchor)]));
  } else {
    fragment.append(createBoard());
  }

  const footer = createElement({ tag: 'nav', classes: ['game-menu'] });
  footer.append(createResetButton());
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

      elements.easyNonograms.forEach((n) => n.classList.remove('active'));
      elements.easyNonograms.forEach((n) => n.removeAttribute('disabled'));
      elements.mediumNonograms.forEach((n) => n.classList.remove('active'));
      elements.mediumNonograms.forEach((n) => n.removeAttribute('disabled'));
      elements.hardNonograms.forEach((n) => n.classList.remove('active'));
      elements.hardNonograms.forEach((n) => n.removeAttribute('disabled'));

      location.href = `${location.origin}#${button.dataset.mode}`;

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

        elements.resetButton.style.display = 'block';
        elements.saveStateButton.style.display = 'block';
        elements.restoreStateButton.style.display = 'block';

        startStopwatch();

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
  elements.board.style.pointerEvents = 'none';

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

export const showWinMessage = () => {
  const popup = elements.popup;
  const closeButton = popup.querySelector('.close');

  const time = popup.querySelector('.time');
  const seconds = parseInt(elements.stopwatchSeconds.textContent, 10);
  const minutes = parseInt(elements.stopwatchMinutes.textContent, 10);
  const hours = parseInt(elements.stopwatchHours.textContent, 10);

  const totalSecs = hours * 3600 + minutes * 60 + seconds;

  time.textContent = totalSecs;

  elements.resetButton.style.display = 'none';
  elements.saveStateButton.style.display = 'none';
  elements.restoreStateButton.style.display = 'none';

  stopStopwatch();

  if (soundsEnabled) {
    sounds.winSound.play();
  }

  popup.style.display = 'block';
  document.body.classList.add('no-scroll');

  closeButton.onclick = function () {
    popup.style.display = 'none';
    document.body.classList.remove('no-scroll');
  };

  window.onclick = function (event) {
    if (event.target == popup) {
      popup.style.display = 'none';
    }
  };
};

export const showClues = (data) => {
  const cols = elements.colsClues.querySelectorAll('.clue-col');

  for (let i = 0; i < cols.length; i++) {
    cols[i].textContent = data.cols[i].join('\n');
  }

  const rows = elements.rowsClues.querySelectorAll('.clue-row');

  for (let i = 0; i < rows.length; i++) {
    rows[i].innerHTML = data.rows[i].join('&nbsp;');
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

const startStopwatch = () => {
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
    classes: ['button', 'sound-button'],
    text: '♫',
  });

  elements.soundButton.addEventListener('click', () => {
    soundsEnabled = !soundsEnabled;
    elements.soundButton.classList.toggle('sound-off');
  });

  return elements.soundButton;
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
    text: 'save state',
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
    text: 'restore state',
  });

  elements.restoreStateButton.addEventListener('click', () => {
    const event = new CustomEvent('restoreState');
    document.dispatchEvent(event);
  });

  // elements.restoreStateButton.style.display = 'none';
  elements.restoreStateButton.style.display =
    (checkIfThereIsDataInLocalStorage('gameState') && 'block') || 'none';

  // elements.restoreStateButton.disabled = true;
  elements.restoreStateButton.disabled =
    !checkIfThereIsDataInLocalStorage('gameState');

  elements.restoreStateButton.addEventListener('click', () => {
    const event = new CustomEvent('restoreState');
    document.dispatchEvent(event);
  });

  return elements.restoreStateButton;
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
    const nonograms = document.body.querySelector('.nonogram-menu');
    nonograms.querySelectorAll('.nonogram').forEach((btn) => {
      btn.classList.remove('active');
      btn.removeAttribute('disabled');

      if (nonogramButton === btn) {
        btn.classList.add('active');
        btn.setAttribute('disabled', true);
      }
    });

    elements.resetButton.style.display = 'block';
    elements.saveStateButton.style.display = 'block';
    elements.restoreStateButton.style.display = 'block';

    console.log(nonogramButton);

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

export default drawGame;
