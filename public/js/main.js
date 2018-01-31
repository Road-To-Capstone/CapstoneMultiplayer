import 'pixi';
import 'p2';
import Phaser from 'phaser';
import config from './config';
import GameState from './states/game';
import GameOver from './gameOver';

class game extends Phaser.Game{
	constructor(){
		const docElement = document.documentElement
		const width = docElement.clientWidth
		const height = docElement.clientHeight
	
		super(width,height,Phaser.AUTO);
		this.state.add('GameState', GameState);
		this.state.add('GameOver', GameOver);
		// this.state.start('GameOver');
		this.state.start('GameState');
	}
}


const newgame = new game();