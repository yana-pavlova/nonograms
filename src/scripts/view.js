import { createElement, changeTheme } from '../utils/utils.js';
import {
  numberOfLevels,
  modeTypes,
  levelDifficulty,
} from '../data/constants.js';

export const elements = {
  board: null,
  levelTabs: null,
  levelButtons: [],
  nonogramMenuEasy: null,
  nonogramMenuMedium: null,
  nonogramMenuHard: null,
};

const drawGame = (nonograms) => {
  const fragment = document.createDocumentFragment();

  fragment.append(themeButtons());
  fragment.append(createLevelTabs());
  fragment.append(createNonogramMenu(nonograms));
  fragment.append(createBoard());

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

const createLevelTabs = () => {
  elements.levelTabs = createElement({ tag: 'nav', classes: ['level-menu'] });

  for (let i = 0; i < numberOfLevels; i++) {
    const level = createElement({
      tag: 'button',
      classes: ['button', 'level'],
      text: modeTypes[i],
    });
    level.dataset.level = levelDifficulty[i];
    level.dataset.mode = modeTypes[i];
    if (modeTypes[i] === 'easy') {
      level.disabled = true;
      level.classList.add('active');
    }
    elements.levelTabs.append(level);
    elements.levelButtons.push(level);
  }

  elements.levelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      elements.levelButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.removeAttribute('disabled');
      });
      button.classList.add('active');
      button.setAttribute('disabled', true);
      location.href = `${location.origin}#${button.dataset.mode}`;
      elements.board.replaceWith(createBoard(button.dataset.level));
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

    console.log(`nonogramMenu${level[0].toUpperCase() + level.slice(1)}`);

    const nonogramMenu = createElement({
      tag: 'nav',
      classes: ['nonogram-menu'],
    });

    // nonogramMenu.dataset.level = level;
    nonogramMenu.id = level;

    namesOfNonogramsOfOneLevel.forEach((name) => {
      const nonogram = createElement({
        tag: 'button',
        classes: ['button', 'nonogram'],
        text: name,
      });
      nonogram.dataset.nonogram = name;
      nonogramMenu.append(nonogram);
    });

    fragment.append(nonogramMenu);
  }

  return fragment;
};

const createBoard = (difficulty = 5) => {
  elements.board = createElement({
    tag: 'div',
    classes: ['board', `board-${difficulty}`],
  });

  for (let i = 0; i < difficulty ** 2; i++) {
    const cell = createElement({ tag: 'div', classes: ['cell'] });
    cell.addEventListener('click', () => cell.classList.toggle('active'));
    elements.board.append(cell);
  }

  return elements.board;
};

export default drawGame;
