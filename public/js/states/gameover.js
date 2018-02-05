import Phaser from 'phaser';
import axios from 'axios';

let shadowText, map;
export default class GameOver extends Phaser.State {
    constructor() {
        super();
    }

    init(score, name) {
        this.score = score;
        this.name = name;
    }

    preload() {
        this.load.tilemap('BaseMap', './assets/BaseMap.json', null, Phaser.Tilemap.TILED_JSON);
        this.selected = 0;
        this.selectArray = ['PLAY AGAIN', 'SCORE BOARD'];
        this.isGlowing = false;
        this.shadowX = 430;
        this.shadowY = 400;
    }

    create() {
        this.setUpMap();
        this.add.text(254, 50, 'GAME OVER', {
            font: '72pt Megrim',
            fill: 'white'
        });
        this.add.text(100, 126, `${this.name} SCORE: ${this.score}`, {
            font: '84pt Megrim',
            fill: '#cc00cc'
        });
        this.add.text(430, 400, this.selectArray[this.selected], {
            font: '42pt Megrim',
            fill: '#5C804B'
        });
        shadowText = this.add.text(this.shadowX, this.shadowY, 'PLAY AGAIN', {
            font: '42pt Megrim',
            fill: '#66FB21'
        });
        this.add.text(430, 475, 'SCORE BOARD', {
            font: '42pt Megrim',
            fill: '#5C804B'
        });

        this.enter = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.kup = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.sdown = this.input.keyboard.addKey(Phaser.Keyboard.S);
        axios.post('/api/score-post', {
                name: this.name,
                score: this.score
            })
            .then(res => res.data)
            .then(result => console.log('axios =========', result));
    }

    setUpMap() {
        map = this.add.tilemap('BaseMap');
    }

    update() {
        //Selecting options
        if (this.kup.isDown) {
            if (this.selectArray[this.selected] !== 'PLAY AGAIN') {
                this.selected--;
                shadowText.destroy();
                this.shadowY -= 75;
                shadowText = this.add.text(this.shadowX, this.shadowY, this.selectArray[this.selected], {
                    font: '42pt Megrim',
                    fill: '#66FB21'
                });
            } else {
                return;
            }
        }

        if (this.sdown.isDown) {
            if (this.selectArray[this.selected] !== 'SCORE BOARD') {
                this.selected++;
                shadowText.destroy();
                this.shadowY += 75;
                shadowText = this.add.text(this.shadowX, this.shadowY, this.selectArray[this.selected], {
                    font: '42pt Megrim',
                    fill: '#66FB21'
                });
            } else {
                return;
            }
        }

        //Start mode
        if (this.enter.isDown) {
            let selection = this.selectArray[this.selected];
            if (selection === 'PLAY AGAIN') {
                location.reload();
            } else if (selection === 'SCORE BOARD') {
                this.state.start('ScoreBoard');
            }
        }
    }
}