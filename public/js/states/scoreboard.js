import Phaser from 'phaser';
import axios from 'axios';

export default class ScoreBoard extends Phaser.State {
    constructor() {
        super();
    }

    preload() {

    }

    create() {
        this.colorArray = ['#ff33ff', '#66FC20', '#60FA19', '#59F810', '#51F207', '#4BDE06', '#46CE07', '#41BE07', '#3CB007', '#37A106']
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
                this.add.text(345, 150 + i * 50, e.name, {font: '24pt Megrim', fill: this.colorArray[i]})
                this.add.text(800, 150 + i * 50, e.score, {font: '24pt Megrim', fill: this.colorArray[i]})
                if(i === 9) {
                    this.add.text(20, 150 + i * 50, 'Back', {font: '42pt Megrim', fill: '#5C804B'});
                }
            });
        });
        this.enter = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    }

    update() {
        if (this.enter.isDown) {
            location.reload();
        }
    }
}