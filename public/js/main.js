import 'pixi';
import 'p2';
import Phaser from 'phaser';
import config from './config';
import GameState from './states/game';
import GameOver from './states/gameOver';
import MenuState from './states/menu';
import ScoreBoard from './states/scoreboard';
import Preload from './states/preload';
import HowToPlay from './states/howtoplay';
import TitleMenu from './states/titleMenu';

class game extends Phaser.Game {
	constructor() {
		const docElement = document.documentElement
		const width = docElement.clientWidth
		const height = docElement.clientHeight

		super(width, height, Phaser.AUTO);
		this.state.add('GameOver', GameOver);
		this.state.add('GameState', GameState);
		this.state.add('MenuState', MenuState);
		this.state.add('ScoreBoard', ScoreBoard);
		this.state.add('Preload', Preload);
		this.state.add('HowToPlay', HowToPlay);
		this.state.add('TitleMenu', TitleMenu);
		this.state.start('TitleMenu');
	}
}


const newgame = new game();