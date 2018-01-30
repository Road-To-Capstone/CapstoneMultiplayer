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

        
       
        console.log(this.mouseX)
        this.game.physics.arcade.moveToXY(this.sprite, this.mouseX, this.mouseY, 100)
        this.sprite.lifespan = 2000
	}
	
	update(){
    }
    
    melee (playerX, playerY, X,Y) {
       // console.log("hello melee")
		if (this.game.time.now > nextFire) {
		  nextFire = this.game.time.now + fireRate
		  /*zombieGroup.forEach((e) => {
			e.hasOverlapped = false
		  })*/
		  //var missile = this.sprite.getFirstDead()
		  this.sprite.reset(playerX, playerY)
		  this.game.physics.arcade.moveToXY(this.sprite, X,Y,100)
          this.sprite.lifespan = 2000
		}
      }
    /*  
    setMissileGroup(group){
        missileGroup = group;
    }

    getMissileGroup(){
        return missileGroup
    }*/
}
