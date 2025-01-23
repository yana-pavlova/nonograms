import nonograms from '../data/nonograms.json';
import drawGame from './view.js';

const initGame = () => {
  drawGame(nonograms);
};

export default initGame;
