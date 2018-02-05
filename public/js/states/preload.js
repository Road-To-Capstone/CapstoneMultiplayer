import Phaser from 'phaser';

let map;
export default class Preload extends Phaser.State {
    constructor() {
        super();
    }

    preload() {
        this.load.image('background', '../../assets/loadingbackground.jpg');
        this.load.image('logo', '../../assets/teamlogo.png');
        this.counter = 0;
    }

    create() {
        let background = this.add.sprite(8, 0, 'background');
        background.scale.setTo(1.55);
        let logo = this.add.sprite(400, 50, 'logo');
        logo.alpha = 0;
        this.add.tween(logo).to({
            alpha: 1
        }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        this.add.text(400, 580, 'LOADING ', {
            font: '50pt Megrim',
            fill: 'black'
        });
    }

    update() {
        this.counter++
            if (this.counter > 350) {
                this.state.start('HowToPlay')
            }
        if (this.counter % 100 === 0) {
            this.add.text(700, 580, '. ', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 10) {
            this.add.text(700, 580, '. . ', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 20) {
            this.add.text(700, 580, '. . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 30) {
            this.add.text(700, 580, '. . . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 40) {
            this.add.text(700, 580, '. . . . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 50) {
            this.add.text(700, 580, '. . . . . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 60) {
            this.add.text(700, 580, '. . . . . . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 70) {
            this.add.text(700, 580, '. . . . . . . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 80) {
            this.add.text(700, 580, '. . . . . . . . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
        if (this.counter % 100 === 90) {
            this.add.text(700, 580, '. . . . . . . . . .', {
                font: '50pt Megrim',
                fill: 'black'
            });
        }
    }
}