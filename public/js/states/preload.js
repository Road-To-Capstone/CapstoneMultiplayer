import Phaser from 'phaser';

let map;
export default class Preload extends Phaser.State {
    constructor() {
        super();
    }

    preload() {
        this.load.image('logo', '../../assets/teamlogo.png');
        this.counter = 0;
    }

    create() {
        this.stage.backgroundColor = "#4488AA"
        let logo = this.add.sprite(400, 50, 'logo');
        logo.alpha = 0;
        this.add.tween(logo).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        this.add.text(400, 500, 'LOADING ', {font: '64pt Megrim', fill: 'black'});
    }
    
    update() {
        this.counter++
        if (this.counter > 150){
          this.state.start('MenuState')
        }
        //This is to load the Megrin font before it actually needs to be used
        if (this.counter%100 === 0){
          this.add.text(800, 500, '. ', {font: '64pt Megrim', fill: 'black'});
        }
        if (this.counter%100 === 10){
          this.add.text(800, 500, '. . ', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 20) {
            this.add.text(800, 500, '. . .', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 30) {
            this.add.text(800, 500, '. . . .', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 40) {
            this.add.text(800, 500, '. . . . .', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 50) {
            this.add.text(800, 500, '. . . . . .', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 60) {
            this.add.text(800, 500, '. . . . . . .', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 70) {
            this.add.text(800, 500, '. . . . . . . .', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 80) {
            this.add.text(800, 500, '. . . . . . . . .', {font: '64pt Megrim', fill: 'black'});
        }
        if(this.counter%100 === 90) {
            this.add.text(800, 500, '. . . . . . . . . .', {font: '64pt Megrim', fill: 'black'});
        }
    }
}