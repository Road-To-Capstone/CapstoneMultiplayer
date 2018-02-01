import Phaser from 'phaser';

export default class Missile {
    constructor(game, x, y, mouseX, mouseY, itemName, id) {
        this.game = game;
        this.mouseX = mouseX
        this.mouseY = mouseY
        this.itemName = itemName
        this.id = id;
        this.missleSpeed = 100;

        this.sprite = this.game.add.sprite(0, 0, 'missile');
        this.game.physics.arcade.enableBody(this.sprite);
        this.sprite.physicsBodyType = Phaser.Physics.ARCADE
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.checkWorldBounds = true
        this.sprite.outOfBoundsKill = true;
        switch (itemName) {
            case 'Melee':
                this.sprite.scale.setTo(0.25, 0.25);
                this.sprite.lifespan = 250;
                this.missleSpeed = 100;
                break;
            case 'Machine Gun':
                this.sprite.scale.setTo(0.15, 0.15);
                this.sprite.lifespan = 2000;
                this.missleSpeed = 200;
                break;
            case 'Flame Thrower':
                this.sprite.scale.setTo(0.5, 0.5);
                this.sprite.lifespan = 1000
                this.missleSpeed = 150;
                break;
            case 'Rocket Launcher':
                this.sprite.scale.setTo(0.7, 0.7);
                this.sprite.lifespan = 1000;
                this.missleSpeed = 500;
                break;
            case 'Chainsaw':
                this.sprite.scale.setTo(0.25, 0.25);
                this.sprite.lifespan = 650;
                this.missleSpeed = 100;
                break;
            case 'Lazer':
                this.sprite.scale.setTo(0.1, 0.1);
                this.sprite.lifespan = 10000;
                this.missleSpeed = 500;
                break;
            default:
                this.sprite.scale.setTo(0.25, 0.25);
                this.sprite.lifespan = 250;
                this.missleSpeed = 100;
                break;
        }
        this.sprite.x = x;
        this.sprite.y = y;

        this.game.physics.arcade.moveToXY(this.sprite, this.mouseX, this.mouseY, this.missleSpeed)
    }

    update() {}

    set(x, y, velocityX, velocityY, itemName) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.body.velocity.x = velocity.x;
        this.sprite.body.velocity.y = velocity.y;
    }
}