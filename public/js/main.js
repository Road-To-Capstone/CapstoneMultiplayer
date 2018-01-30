import 'pixi';
import 'p2';
import Phaser from 'phaser';


import config from './config';
import GameState from './states/game';

class game extends Phaser.Game{
	constructor(){
		const docElement = document.documentElement
		const width = docElement.clientWidth
		const height = docElement.clientHeight
	
		super(width,height,Phaser.AUTO);
		this.state.add('GameState',GameState);
		this.state.start('GameState');
	}
}


const newgame = new game();