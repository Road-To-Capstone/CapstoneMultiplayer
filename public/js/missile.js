import Phaser from 'phaser';

var nextFire = 300, fireRate = 500, missileGroup;
export default class Missile{
	constructor(game, x, y, angle){
        this.game = game;

        missileGroup = this.game.add.group()
        missileGroup.enableBody = true
        missileGroup.physicsBodyType = Phaser.Physics.ARCADE
    
        missileGroup.createMultiple(50, 'missile')
        missileGroup.setAll('checkWorldBounds', true)
        missileGroup.setAll('outOfBoundsKill', true)
        missileGroup.setAll('anchor.x', 0.5)
        missileGroup.setAll('anchor.y', 0.5)
        missileGroup.setAll('scale.x', 0.3)
        missileGroup.setAll('scale.y', 0.3)

    
        
		


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
		  var missile = missileGroup.getFirstDead()
		  missile.reset(playerX, playerY)
		  this.game.physics.arcade.moveToXY(missile, X,Y,100)
		  missile.lifespan = 2000
		}
      }
      
    setMissileGroup(group){
        missileGroup = group;
    }

    getMissileGroup(){
        return missileGroup
    }
}
