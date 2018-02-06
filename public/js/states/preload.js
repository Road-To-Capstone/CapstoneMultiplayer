import Phaser from 'phaser';

let map;
export default class Preload extends Phaser.State {
    constructor() {
        super();
    }

    init(name) {
        this.name = name;
    }

    preload() {
        this.load.audio('bensound-ofeliasdream', './assets/bensound-ofeliasdream.mp3')
		this.load.audio('Action Radius', './assets/Action Radius.mp3')
		this.load.tilemap('BaseMap', './assets/BaseMap.json', null, Phaser.Tilemap.TILED_JSON)
		this.load.image('tiles', './assets/tiles.png')
		this.load.image('background', '/assets/background.png')
		this.load.image('building', './assets/buildingplaceholder.png')
		this.load.image('Melee', '/assets/Melee.png')
		this.load.image('Lazer', '/assets/Lazer.png')
		this.load.image('Machine Gun', '/assets/Machine Gun.png')
		this.load.image('Rocket Launcher', '/assets/Rocket Launcher.png')
		this.load.image('Chainsaw', '/assets/Chainsaw.png')
		this.load.image('Flame Thrower', '/assets/Flame Thrower.png')
		this.load.image('zombie', './assets/zombieplaceholder.png')
		this.load.image('building1', '../../assets/building1.png')
		this.load.image('building2', '../../assets/building2.png')
		this.load.image('building3', '../../assets/building3.png')
		this.load.image('tree1', '../../assets/tree1.png')
		//this.load.spritesheet('zombieattack', '/assets/zombieattackspritesheet.png',430,519,8)
		this.load.spritesheet('player', '/assets/playerspritesheet.png',24,32)
		this.load.spritesheet('zombiewalk', '/assets/zombiewalkspritesheet.png',430,519,10)
		this.load.spritesheet('zombiedeath', '/assets/zombiedeathspritesheet.png',629,526,12)
        this.load.image('loadingbackground', '../../assets/loadingbackground.jpg');
        this.load.image('logo', '../../assets/teamlogo.png');
        this.counter = 0;
    }

    create() {
        let background = this.add.sprite(8, 0, 'loadingbackground');
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
                this.state.start('GameState', true, false, this.name);
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