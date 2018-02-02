import 'pixi';
import 'p2';
import Phaser from 'phaser';
import config from './config';
import GameState from './states/game';
import GameOver from './states/gameOver';
import MenuState from './states/menu';
import ScoreBoard from './states/scoreboard';

class game extends Phaser.Game {
	constructor() {
		const docElement = document.documentElement
		const width = docElement.clientWidth
		const height = docElement.clientHeight
	
		super(width,height,Phaser.AUTO);
		this.state.add('GameOver', GameOver);
		this.state.add('GameState', GameState);
		this.state.add('MenuState', MenuState);
		this.state.add('ScoreBoard', ScoreBoard);
		this.state.start('MenuState');
	}
}


const newgame = new game();