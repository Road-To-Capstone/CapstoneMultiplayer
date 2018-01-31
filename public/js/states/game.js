import Phaser from 'phaser';
import socketio from 'socket.io-client';
import Player from './../player';
import Missile from './../missile'
import Zombie from './../zombie';
import {
	HealthBar
} from './../HealthBar.standalone'
import Building from './../building'

var map,layer, missileGroup, zombieGroup, singleMissile, nextFire = 0, fireRate = 500, cameraSet = false, buildingGroup, nextMissileCollision = 0, missileCollisionRate = 1000, missileGroup;
export default class GameState extends Phaser.State{
	constructor(){
		super();
	}
	preload() {
		this.doneLoading = 0; //this is 1 at the end of createOnConnection
		// this.load.tilemap('BaseMap', './assets/BaseMap.json', null, Phaser.Tilemap.TILED_JSON)
		// this.load.image('tiles', './assets/tiles.png')
		this.load.image('player', './assets/playerplaceholder.jpg')
		this.load.image('building', './assets/buildingplaceholder.png')
		this.load.image('missile', '/assets/missileplaceholder.png')
		this.load.image('zombie', './assets/zombieplaceholder.png')
	}
	
	create() {
		//this.setUpMap()
		//this.setupMissilesGroup()

		this.world.setBounds(0, 0, 1920, 1920)

		this.io = socketio.connect();
		this.io.on('connect', data => {
			this.createOnConnection(data);
		});

		zombieGroup = this.add.group();
		missileGroup = this.add.group();

		this.spawnBuilding(652, 961)
		this.spawnBuilding(821, 1480)
		this.spawnBuilding(1400, 1003)
	}
	update(){
	
		if(this.doneLoading){
			if(!cameraSet){
				this.camera.follow(this.getPlayerById(this.io.id).sprite)
				this.setUpHealthBar()
				cameraSet = true;			
			}
			const player = this.getPlayerById(this.io.id);
			this.io.emit('client:player-moved', {
				id: this.io.id,
				//posX: player.sprite.worldPosition.x,
				//posY: player.sprite.worldPosition.y,
				posX: player.sprite.x,
				posY: player.sprite.y
				//angle: player.sprite.angle
			});

			this.physics.arcade.collide(player,  buildingGroup, ()=> {console.log("hello")}) //
			

			const missile = this.getMissileByPlayerId(this.io.id)

			//this.io.emit('client:missile-fired', {id: this.io.id, posX: this.missiles.sprite.x, posY: this.missiles.sprite.y, velocityX: this.missiles.sprite.body.velocity.x, velocityY: this.missiles.sprite.body.velocity.y})


			this.getPlayerById(this.io.id).update();

			this.topText.setText(`Your ID: ${this.io.id}
				${this.players.length} players
				posX: ${Math.floor(player.sprite.worldPosition.x)}
				posY: ${Math.floor(player.sprite.worldPosition.y)}
			`);
			if (this.input.activePointer.isDown && this.time.now > nextFire) {
				nextFire = this.time.now + fireRate;
				this.io.emit('client:ask-to-create-missile', {id: this.io.id, posX: player.sprite.x, posY: player.sprite.y})
				this.fire()
			}
			if (this.zombies.length < 2) {
				this.io.emit('client:ask-to-create-zombie');
			}

			if(!!this.zombies.length) {
			//	console.log('this.zombies', this.zombies);
				this.zombies.forEach(e => {
					// e.sprite.health -= 1;
					this.zombieAI(e);
					if(e.sprite.health === 0) this.io.emit('client:kill-this-zombie', e.id);
					this.physics.arcade.collide(e.sprite, zombieGroup);
				});

			}

			if (this.time.now > nextMissileCollision){
				nextMissileCollision = this.time.now + missileCollisionRate;
				this.zombies.forEach(z=> {
					z.sprite.hasOverlapped = true;
				})
			}

			/*console.log(this.zombies.length)
			for (var i = this.missiles.length;  i> 0 && i>this.missiles.length-10;i-=2){
			//	console.log(this.missiles)
				for (var j = 0; j<this.zombies.length;j++){
					if(this.missiles[i]){
						if(this.missiles[i].sprite.x){
							var distance = this.math.distance(this.missiles[i].sprite.x, this.missiles[i].sprite.y,
								this.zombies[j].sprite.x, this.zombies[j].sprite.y);
								console.log(distance)
							if (distance < 400){
								this.zombies[j].sprite.health -= 100;
								this.zombies[j].sprite.hasOverlapped = true
							}
							
						}
					//	console.log("missiles" ,this.missiles[i].sprite.x)
					}
				//	console.log("zombies" ,this.zombies[j].sprite.x)
				}
			}*/
			//this.physics.arcade.overlap(this.zombies, this.missiles, this.handleMissileCollision, null, this)
			
		}
	}


	/* 
		SETUP FUNCTIONS
	*/
	setUpMap() {
		map = this.add.tilemap('BaseMap')
		map.addTilesetImage('Map tiles.tsx', 'tiles')
		layer = map.createLayer('Tile Layer 1')
		layer = map.createLayer('Tile Layer 2')
		layer = map.createLayer('Tile Layer 3')
		layer.resizeWorld()
	}

	setUpHealthBar() {
		this.myHealthBar = new HealthBar(this.game, {
			x: 145,
			y: this.game.height - 40
		})
		this.myHealthBar.setFixedToCamera(true)
	}

	spawnBuilding (x, y) {
		var building = new Building(this.game,x,y)
		return building;
	  }

	//Testing for single zombie to show up
	// setUpZombie() {
	// 	this.zombie = new Zombie(this, 0, 0);
	// }

	makeZombies(id, x, y) {
		this.zombie = new Zombie(id, this, x, y);
		this.zombies.push(this.zombie);
		zombieGroup.add(this.zombie.sprite)
	}

	fire(posX, posY) {
		this.missile = new Missile(this, posX, posY, this.input.activePointer.x, this.input.activePointer.y)
		this.missiles.push(this.missile);
		missileGroup.add(this.missile.sprite)
	}

	/*render() {
		this.debug.cameraInfo(game.camera,32,32)
	}*/

	/* 
		SOCKET HELPER FUNCTIONS
	*/
	createOnConnection(data) {
		//Zombies
		window.zombies = [];
		this.zombies = zombies;

		window.players = [];
		this.players = players;

		window.missiles = [];
		this.missiles = missiles;

		window.io = this.io; //meafffdd

		this.socketCreateListeners();

		this.stage.backgroundColor = '#aaa';
		this.physics.startSystem(Phaser.Physics.ARCADE);

	
		this.topText= this.add.text(
	   		10, 
	   		10, 
	   		'', 
			   { font: "12px Arial", fill: "rgba(0, 0, 0, 0.64)" });
			   
	   	
	    this.doneLoading = 1;
	}

	socketCreateListeners() {
		const me = this.getPlayerById(this.io.id);

		//load all existing players
		this.io.emit('client:give-me-players'); //ask for it
		this.io.emit('client:give-me-zombies'); //ask for zombies  

		this.io.on('server:all-players', data => { //the data is the players from the server side
			data.forEach(e => {
				if (e.id != this.io.id) //this will prevent loading our player two times
					players.push(new Player(e.id, this, e.posX, e.posY, e.angle));
			});
		});

		this.io.on('server:all-zombies', data => {
			// console.log('=====server all-zombies', data, this.zombies);
			// this.zombies = [...data];
			data.forEach(newZombie => {
				this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY);
			})
			// this.zombies.forEach(zombie => {
			// 	this.makeZombies(zombie.id, zombie.posX, zombie.posY);
			// });
		})

		//load your player
		this.io.on('server:player-added', data => {
			//console.log(`New ${data.id} added to x: ${data.posX}, y: ${data.posY}`);
			players.push(new Player(data.id, this, data.posX, data.posY, data.angle));
		});

		this.io.on('server:player-disconnected', id => { //if a player has disconnected
			console.log(`Player ${id} disconnected`);
			for (let i = 0; i < this.players.length; i++) //loop through all players
				if (this.players[i].id == id) { // found the player
					this.players[i].sprite.destroy(); //phaser sprite destroy function
					this.players.splice(i, 1); //unset from the players array
				}
		});

		this.io.on('server:player-moved', data => {
			this.getPlayerById(data.id).setX(data.posX).setY(data.posY);
		});

		this.io.on('server:missile-fired', data => {
			// console.log("data is ", data)
			this.missiles = data;
		});

		this.io.on('server:zombie-added', newZombie => {
			this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY);
		});

		this.io.on('server:kill-this-zombie', id => {
			console.log(`Zombie ${id} died`);
			for(let i = 0; i < this.zombies.length; i++) {
				if(this.zombies[i].id === id) {
					this.zombies[i].sprite.destroy();
					this.zombies.splice(i, 1);
				}
			}
		})

		this.io.on('server:missile-added', newMissile => {
			this.fire(newMissile.posX, newMissile.posY)
		});
	}

	getPlayerById(id) {
		for (let i = 0; i < this.players.length; i++)
			if (this.players[i].id == id) return this.players[i];
	}

	getMissileByPlayerId(id) {
		for (let i = 0; i < this.missiles.length; i++)
			if (this.missiles[i].id == id) return this.missiles[i];
	}

	zombieAI(zombie) {
		// console.log('this.players=====', this.players[0]);
		let mindex = this.findClosestPlayer(zombie);
		var targetAngle = this.math.angleBetween(
			zombie.sprite.position.x, zombie.sprite.position.y,
			this.players[mindex].sprite.position.x, this.players[mindex].sprite.position.y // this needs to be player x and y that updates dynamically
		  )
	  
		  // Gradually (this.TURN_RATE) aim the Invader towards the target angle
		  if (zombie.sprite.rotation !== targetAngle) {
		  // Calculate difference between the current angle and targetAngle
			var delta = targetAngle - zombie.sprite.rotation

			// Keep it in range from -180 to 180 to make the most efficient turns.
			if (delta > Math.PI) delta -= Math.PI * 2
			if (delta < -Math.PI) delta += Math.PI * 2

			if (delta > 0) {
				// Turn clockwise
				zombie.sprite.angle += zombie.sprite.TURN_RATE
			} else {
				// Turn counter-clockwise
				zombie.sprite.angle -= zombie.sprite.TURN_RATE
			}

			// Just set angle to target angle if they are close
			if (Math.abs(delta) < this.math.degToRad(zombie.sprite.TURN_RATE)) {
				zombie.sprite.rotation = targetAngle
			}
		}
		this.updateVelocity(Math.cos(zombie.sprite.rotation) * zombie.sprite.SPEED, Math.sin(zombie.sprite.rotation) * zombie.sprite.SPEED, zombie)
	}
	updateVelocity(xVelocity, yVelocity, zombie) {
		zombie.sprite.body.velocity.x = xVelocity
		zombie.sprite.body.velocity.y = yVelocity
	  }

	findClosestPlayer(zombie) {
		let minSet = {dist: 1920}, distance, playerPosX, playerPoxY;
		for(let i = 0; i < this.players.length; i++) {
			playerPosX = players[i].sprite.position.x;
			playerPoxY = players[i].sprite.position.y;
			distance = Math.sqrt(Math.pow(playerPosX - zombie.sprite.position.x, 2)
				+ Math.pow(playerPoxY - zombie.sprite.position.y, 2));
			if(distance < minSet.dist) {
				minSet['index'] = i;
				minSet['dist'] = distance;
			}
		}
		return minSet.index? minSet.index: 0;
	}
}