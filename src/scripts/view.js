import { createElement } from '../utils/utils.js';
import { numberOfLevels, modeTypes } from '../data/constants.js';

export const elements = {
  levelMenu: null,
};

const drawGame = (parent) => {
  const fragment = document.createDocumentFragment();
  fragment.append(createMenu());
  fragment.append(createBoard());

  parent.append(fragment);
};

const createMenu = () => {
  elements.levelMenu = createElement({ tag: 'nav', classes: ['level-menu'] });

  for (let i = 0; i < numberOfLevels; i++) {
    const level = createElement({
      tag: 'button',
      classes: ['button', 'level'],
      text: modeTypes[i],
    });
    level.dataset.level = i;
    if (modeTypes[i] === 'easy') {
      level.disabled = true;
      level.classList.add('active');
    }
    elements.levelMenu.append(level);
  }

  elements.levelButtons = elements.levelMenu.querySelectorAll('.level');

  return elements.levelMenu;
};

const createBoard = (difficulty = 5) => {
  const board = createElement({
    tag: 'div',
    classes: ['board', `board-${difficulty}`],
  });

  for (let i = 0; i < difficulty ** 2; i++) {
    const cell = createElement({ tag: 'div', classes: ['cell'] });
    board.append(cell);
  }

  return board;
};

export default drawGame;
