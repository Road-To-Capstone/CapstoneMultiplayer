import Phaser from 'phaser';

var nextFire = 300, fireRate = 500;
export default class Missile{
	constructor(game, x, y, mouseX, mouseY){
        this.game = game;
        this.mouseX = mouseX
        this.mouseY = mouseY

        this.sprite = this.game.add.sprite(0, 0, 'missile');
        this.game.physics.arcade.enableBody(this.sprite);
        this.sprite.physicsBodyType = Phaser.Physics.ARCADE
    

        this.sprite.checkWorldBounds = true
        this.sprite.outOfBoundsKill = true;
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.scale.setTo(0.3, 0.3);

        this.sprite.x = x;
        this.sprite.y = y;

        
    
        this.game.physics.arcade.moveToXY(this.sprite, this.mouseX, this.mouseY, 100)
        this.sprite.lifespan = 2000
	}
	
	update(){
    }
    
}
