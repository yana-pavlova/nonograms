import './styles/styles.scss';
import drawGame from './scripts/view.js';
import nonograms from './data/nonograms.json';

drawGame(nonograms, nonograms.easy);
