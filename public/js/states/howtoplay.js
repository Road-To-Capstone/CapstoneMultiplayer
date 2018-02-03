import Phaser from 'phaser';

let map;
export default class HowToPlay extends Phaser.State {
    constructor() {
        super();
    }

    preload() {
        this.load.image('mouse', '../../assets/mouseicon.png');
        this.load.image('wasdkey', '../../assets/howtomove.png');
        this.load.image('bkey', '../../assets/bkey.png');
        this.counter = 0;
    }

    create() {
        this.add.text(430, 50, 'How To Play', {font: '50pt Megrim', fill: 'white'});
        this.stage.backgroundColor = "black";
        let mouse = this.add.sprite(800, 150, 'mouse');
        mouse.scale.setTo(0.5, 0.5);
        let bkey = this.add.sprite(515, 200, 'bkey');
        bkey.scale.setTo(0.45, 0.45);
        this.add.text(450, 450, 'Click b to switch weapons', {font: '25pt Megrim', fill: 'white'});
        let keys = this.add.sprite(50, 200, 'wasdkey');
        keys.scale.setTo(0.75);
        this.add.text(900, 450, 'Right click to shoot!', {font: '25pt Megrim', fill: 'white'});
        this.add.text(25, 600, 'Press Enter', {font: '35pt Megrim', fill: '#5C804B'});
        this.enter = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    }
    
    update() {
        if (this.enter.isDown){
            this.state.start('MenuState');
         }
    }
}