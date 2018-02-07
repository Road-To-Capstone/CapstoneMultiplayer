import Phaser from 'phaser';
import axios from 'axios';

let glow;
export default class ScoreBoard extends Phaser.State {
    constructor() {
        super();
    }

    preload() {

    }

    create() {
        this.counter = 0;
        this.blink = false;
        this.stage.backgroundColor = "black";
        this.colorArray = ['#FB3B69', '#66FC20', '#60FA19', '#59F810', '#51F207', '#4BDE06', '#46CE07', '#41BE07', '#3CB007', '#37A106']
        this.add.text(315, 30, 'SCORE BOARD', {
            font: '60pt Megrim',
            fill: 'white'
        })

        axios.get('/api/score')
        .then(res => res.data)
        .then(data => {
            data = data.sort((a,b) => {
                return b.score - a.score;
            });
            data = data.slice(0, 10);
            data.forEach((e,i) => {
                if(i === 0) {
                    this.add.text(290 + 2, 150 + i * 50 + 2, (i+1), {font: '24pt Megrim', fill: '#F70707'})
                    this.add.text(345 + 2, 150 + i * 50 + 2, e.name, {font: '24pt Megrim', fill: '#F70707'})
                    this.add.text(800 + 2, 150 + i * 50 + 2, e.score, {font: '24pt Megrim', fill: '#F70707'})
                }
                this.add.text(290, 150 + i * 50, (i+1), {font: '24pt Megrim', fill: this.colorArray[i]})
                this.add.text(345, 150 + i * 50, e.name, {font: '24pt Megrim', fill: this.colorArray[i]})
                this.add.text(800, 150 + i * 50, e.score, {font: '24pt Megrim', fill: this.colorArray[i]})
            });
        });
        this.add.text(20+1, 600+1, 'Play Again', {font: '30pt Megrim', fill: 'white'});
        this.add.text(20, 600, 'Play Again', {font: '30pt Megrim', fill: '#6F454F'});
        this.enter = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    }

    update() {
        if(!this.counter) {
            this.blink = true;
            glow = this.add.text(315-2, 30-2, 'SCORE BOARD', {
                font: '60pt Megrim',
                fill: '#6F454F'
            })

        }

        if(this.blink) {
            this.counter++;
        }

        if(this.counter > 15) {
            this.blink = false;
            this.counter = 0;
            glow.destroy();
        }

        if (this.enter.isDown) {
            location.reload();
        }
    }
}