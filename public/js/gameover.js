import Phaser from 'phaser';

let shadowText, map;
export default class GameOver extends Phaser.State {
    constructor() {
        super();
    }

    preload() {
        this.load.tilemap('BaseMap', './assets/BaseMap.json', null, Phaser.Tilemap.TILED_JSON);
        this.selected = 0;
        this.selectArray = ['PLAY AGAIN', 'SCORE BOARD'];
        // this.moveCounter = 0;
	    this.isGlowing = false;
	    // this.glowCounter = 0;
	    this.shadowX = 430;
        this.shadowY = 400;
    }

    create() {
        this.setUpMap();
        this.add.text(254, 50, 'GAME OVER', {font: '72pt Megrim', fill: 'white'});
        this.add.text(254, 126, `YOUR SCORE: ${500}`, {font: '84pt Megrim', fill: '#cc00cc'});
        this.add.text(430, 400, this.selectArray[this.selected], {font: '42pt Megrim', fill: '#5C804B'});
        shadowText = this.add.text(this.shadowX, this.shadowY, 'PLAY AGAIN', {font: '42pt Megrim', fill: '#66FB21'});
        this.add.text(430, 475, 'SCORE BOARD', {font: '42pt Megrim', fill: '#5C804B'});

        this.enter = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.kup = this.input.keyboard.addKey(Phaser.Keyboard.W);
        // this.dright = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.sdown = this.input.keyboard.addKey(Phaser.Keyboard.S);
        // this.aleft = this.input.keyboard.addKey(Phaser.Keyboard.A);
    }

    setUpMap() {
		map = this.add.tilemap('BaseMap');
    }
    
    update() {
        //Selecting options
        if (this.kup.isDown){
            if (this.selectArray[this.selected] !== 'PLAY AGAIN'){
                this.selected--;
                shadowText.destroy();
                this.shadowY -= 75;
                shadowText = this.add.text(this.shadowX, this.shadowY, this.selectArray[this.selected], {font: '42pt Megrim', fill: '#66FB21'});
            } else {
                return;
            }
        }

        if (this.sdown.isDown){
            if (this.selectArray[this.selected] !== 'SCORE BOARD'){
                this.selected++;
                shadowText.destroy();
                this.shadowY += 75;
                shadowText = this.add.text(this.shadowX, this.shadowY, this.selectArray[this.selected], {font: '42pt Megrim', fill: '#66FB21'});
            }
            else {
                return;
            }
        }

        //Start mode
        if (this.enter.isDown){
            let selection = this.selectArray[this.selected];
            if (selection === 'PLAY AGAIN'){
                this.state.start('GameState');
            } else if (selection === 'SCORE BOARD'){
                // game.add.text(465, 530, 'CANNOT SEE HIGH SCORES YET', {font: '14pt Megrim', fill: '#5C804B'})
                // this.state.start('HighScore')
                console.log('SCORE BOARD REACHED');
            }
        }
    }
}