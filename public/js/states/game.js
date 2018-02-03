import Phaser from 'phaser';
import socketio from 'socket.io-client';
import Player from './../player';
import Missile from './../missile'
import Zombie from './../zombie';
import {
	HealthBar
} from './../HealthBar.standalone'
import Building from './../building'

var map, layer, missileGroup, zombieGroup, nextFire = 0,
	cameraSet = false,
	buildingGroup,
	nextMissileCollision = 0,
	missileCollisionRate = 1000,
	zombiesCoolDown = 1000,
	zombiesAttack = 1000,
	text,
	song,
	healthPercent,
	weaponDamage = [20, 10, 20, 100, 20, 100],
	finalTranscript = "",
	transcriptArray = [],
	startShooting = false,
	startShootingTimer = 0,
	startShootingDuration = 5000;

//const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)


export default class GameState extends Phaser.State {
	constructor() {
		super();
	}

	init(playerName) {
		this.name = playerName;
	}

	preload() {
		this.doneLoading = 0; //this is 1 at the end of createOnConnection
		this.load.audio('bensound-happyrock', './assets/bensound-happyrock.mp3')
		this.load.tilemap('BaseMap', './assets/BaseMap.json', null, Phaser.Tilemap.TILED_JSON)
		this.load.image('tiles', './assets/tiles.png')
		
		this.load.image('building', './assets/buildingplaceholder.png')
		this.load.image('Melee', '/assets/missileplaceholder.png')
		this.load.image('Lazer', '/assets/Lazer.png')
		this.load.image('Machine Gun', '/assets/Machine Gun.png')
		this.load.image('Rocket Launcher', '/assets/Rocket Launcher.png')
		this.load.image('Chainsaw', '/assets/Chainsaw.png')
		this.load.image('Flame Thrower', '/assets/Flame Thrower.png')
		this.load.image('zombie', './assets/zombieplaceholder.png')
		//this.load.spritesheet('zombieattack', '/assets/zombieattackspritesheet.png',430,519,8)
		this.load.spritesheet('player', '/assets/playerspritesheet.png',24,32)
		this.load.spritesheet('zombiewalk', '/assets/zombiewalkspritesheet.png',430,519,10)
		this.load.spritesheet('zombiedeath', '/assets/zombiedeathspritesheet.png',629,526,12)
	}

	create() {
		//this.setUpMap()
		text = this.add.text(300, this.game.height - 55, "Melee | X ", {
			fill: '#ffffff'
		})
		text.fixedToCamera = true;

		healthPercent = this.add.text(20, this.game.height - 100, '100%', {
			fill: '#ffffff'
		});
		healthPercent.fixedToCamera = true;

		this.world.setBounds(0, 0, 1920, 1920)
		this.io = socketio.connect();
		this.io.on('connect', data => {
			this.createOnConnection(data);
		});

		this.LIGHT_RADIUS = 300;

		zombieGroup = this.add.group();
		missileGroup = this.add.group();
		buildingGroup = this.add.group();

		song = this.add.audio('bensound-happyrock');
		this.sound.setDecodedCallback(song, this.startMusic, this);

		this.spawnBuilding(652, 961)
		this.spawnBuilding(821, 1480)
		this.spawnBuilding(1400, 1003)

		this.shadowTexture = this.add.bitmapData(1920, 1920)

		var lightSprite = this.game.add.image(0,0, this.shadowTexture)

		lightSprite.blendMode = Phaser.blendModes.MULTIPLY

		recognition.continuous = true;
		recognition.lang = 'en-US'
		recognition.start();

		recognition.onresult = event => {
			for (let i = event.resultIndex; i<event.results.length;i++){
				const transcript = event.results[i][0].transcript
				if (event.results[i].isFinal) finalTranscript += transcript + " "
			}
			transcriptArray = finalTranscript.split(" ")
			finalTranscript = '';
		}
		
	}

	update() {
		if (this.doneLoading) {
			
			
			let voiceRecCommand = transcriptArray.shift()
			startShooting = this.pewCommand(voiceRecCommand) 
			if (startShootingTimer < this.time.now){
				startShooting = false;
			}

			
			console.log("voiceRecCommand is", voiceRecCommand)
			
			if (!cameraSet) {
				this.camera.follow(this.getPlayerById(this.io.id).sprite)
				this.setUpHealthBar()
				cameraSet = true;
			}
			const player = this.getPlayerById(this.io.id);
			this.io.emit('client:player-moved', {
				id: this.io.id,
				posX: player.sprite.x,
				posY: player.sprite.y
			});

			this.updateShadowTexture(player);

			this.zombies.forEach((z) => {
				this.io.emit('client:zombie-moved', {
					id: z.id,
					posX: z.sprite.x,
					posY: z.sprite.y
				})
			});

			this.physics.arcade.overlap(player.sprite, zombieGroup, this.handleCollideZombie, null, this);
			this.physics.arcade.collide(player.sprite, buildingGroup);

			this.getPlayerById(this.io.id).update();
			this.topText.setText(`Your ID: ${this.io.id}
				${this.players.length} players
				posX: ${Math.floor(player.sprite.worldPosition.x)}
				posY: ${Math.floor(player.sprite.worldPosition.y)}
			`);
			if ((startShooting|| this.input.activePointer.isDown) && (this.time.now > nextFire && player.sprite.ammo[player.sprite.ammoIndex] > 0)) {
				nextFire = this.time.now + player.sprite.selectedFireRate;
				this.io.emit('client:ask-to-create-missile', {
					id: this.io.id,
					posX: player.sprite.x,
					posY: player.sprite.y,
					itemName: player.sprite.selectedItem
				})
			}
			if (this.zombies.length < 2) {
				this.io.emit('client:ask-to-create-zombie');
			}

			if (!!this.zombies.length) {
				this.zombies.forEach(e => {
					this.zombieAI(e);
					if (e.sprite.health === 0) {
						this.io.emit('client:kill-this-zombie', e.id);
						player.sprite.score += 1000;
						player.giveAmmo();
						var zombieDeath = this.add.sprite(e.sprite.x,e.sprite.y,'zombiedeath');
						zombieDeath.anchor.setTo(0.5, 0.5);
						zombieDeath.scale.setTo(0.12,0.12);
				
						var animatedDeath = zombieDeath.animations.add('zombiedeath',[4,5,6,3,8,9,10,7,0,1,2,11,11,11,11,11,11,11,11,11]  ,6, false);
						animatedDeath.killOnComplete = true;
						
						zombieDeath.animations.play('zombiedeath');
				}
					this.physics.arcade.collide(e.sprite, zombieGroup);
					this.physics.arcade.collide(e.sprite, buildingGroup);
				});

			}

			if (this.time.now > nextMissileCollision) {
				nextMissileCollision = this.time.now + missileCollisionRate;
				this.zombies.forEach(z => {
					z.sprite.hasOverlapped = true;
				})
			}

			this.physics.arcade.overlap(zombieGroup, missileGroup, this.handleMissileCollision, null, this)
			this.setHealthBarPercent();
			this.world.bringToTop(text.setText(player.sprite.selectedItem + " | " + player.sprite.ammo[player.sprite.ammoIndex]))

			if (player.sprite.playerHealth <= 0) {
				this.io.emit('client:game-over', player.id);
				this.players.forEach((e, i) => {
					if(e.id === player.id) {
						e.sprite.destroy();
						this.players.splice(i, 1);
					}
				});
				this.state.start('GameOver', true, false, player.sprite.score, this.name);
			}
		}
	}

	/* 
		SETUP FUNCTIONS
	*/
	setUpMap() {
		map = this.add.tilemap('BaseMap')
		map.addTilesetImage('Map tiles.tsx', 'tiles')
		layer = map.createLayer('Tile Layer 1')
		layer.resizeWorld()
	}

	startMusic() {
		song.loopFull(0.2);
	}

	updateShadowTexture(player) {
		this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)'; //this number controls the outside darkness
		this.shadowTexture.context.fillRect(0, 0, 1920, 1920);
	
		// Draw circle of light with a soft edge
		var gradient = this.shadowTexture.context.createRadialGradient(
			player.sprite.x, player.sprite.y, this.LIGHT_RADIUS * 0.01,
			player.sprite.x, player.sprite.y, this.LIGHT_RADIUS);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
	
		this.shadowTexture.context.beginPath();
		this.shadowTexture.context.fillStyle = gradient;
		this.shadowTexture.context.arc(player.sprite.x, player.sprite.y,
			this.LIGHT_RADIUS, 0, Math.PI*2);
		this.shadowTexture.context.fill();
	
		// This just tells the engine it should update the texture cache
		this.shadowTexture.dirty = true;
	}

	pewCommand(speech){
		
		if (speech === 'pew' || speech === 'q' || speech === 'Q' || speech === 'cute' || speech === 'shoot')
		{	
			startShootingTimer = this.time.now + startShootingDuration;
			return true
		}
		return startShooting || false;
	}

	setHealthBarPercent() {
		this.myHealthBar.setPercent(this.players[0].sprite.playerHealth)
	}

	setUpHealthBar() {
		this.myHealthBar = new HealthBar(this.game, {
			x: 145,
			y: this.game.height - 40
		})
		this.myHealthBar.setFixedToCamera(true)
	}

	spawnBuilding(x, y) {
		this.building = new Building(this.game, x, y)
		buildingGroup.add(this.building.sprite);
	}

	makeZombies(id, x, y) {
		this.zombie = new Zombie(id, this, x, y);
		this.zombies.push(this.zombie);
		zombieGroup.add(this.zombie.sprite)
	}

	fire(posX, posY, itemName, id) {
		this.missile = new Missile(this, posX, posY, this.input.activePointer.worldX, this.input.activePointer.worldY, itemName, id)
		this.missiles.push(this.missile);
		missileGroup.add(this.missile.sprite)
		zombieGroup.forEach((e) => {
			e.hasOverlapped = false
		})
		this.getPlayerById(this.io.id).consumeAmmo()

	}

	handleMissileCollision(zombie, missile) {
		if (!zombie.hasOverlapped) {
			zombie.hasOverlapped = true
			let currentPlayer = this.getPlayerById(this.io.id);
			zombie.health -= weaponDamage[currentPlayer.sprite.ammoIndex];
			currentPlayer.sprite.score += 100;
			//console.log('current Player====', currentPlayer.sprite.score);
		}
	}

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


		this.topText = this.add.text(
			10,
			10,
			'', {
				font: "12px Arial",
				fill: "rgba(0, 0, 0, 0.64)"
			});


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
			data.forEach(newZombie => {
				this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY);
			})
		})

		//load your player
		this.io.on('server:player-added', data => {
			players.push(new Player(data.id, this, data.posX, data.posY, data.angle));
		});

		this.io.on('server:player-disconnected', id => { //if a player has disconnected
			this.players.forEach((e, i) => {
				if(e.id === id) {
					e.sprite.destroy();
					this.players.splice(i, 1);
				}
			});
		});

		this.io.on('server:player-moved', data => {
			this.getPlayerById(data.id).setX(data.posX).setY(data.posY);
		});

		this.io.on('server:game-over', id => {
			this.players.forEach((e, i) => {
				if(e.id === id) {
					e.sprite.destroy();
					this.players.splice(i, 1);
				}
			});
		})

		this.io.on('server:zombie-moved', data => { //data is an object with {id: z.id, posX: z.sprite.x, posY: z.sprite.y}
			this.getZombieById(data.id).set(data.posX, data.posY);
		});

		this.io.on('server:missile-moved', data => { //data is {posX: data.posX, posY: data.posY, velocityX: data.velocityX, velocityY: data.velocityY}
			this.getMissileByPlayerId(data.id).set(data.posX, data.posY, data.velocityX, data.velocityY, data.itemName)
		});

		this.io.on('server:missile-fired', data => {
			this.missiles = data;
		});

		this.io.on('server:zombie-added', newZombie => {
			this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY);
		});

		this.io.on('server:kill-this-zombie', id => {
			this.zombies.forEach((z, i) => {
				if(z.id === id) {
					z.sprite.destroy();
					this.zombies.splice(i, 1);
				}
			});
		})

		this.io.on('server:missile-added', newMissile => {
			this.fire(newMissile.posX, newMissile.posY, newMissile.itemName, newMissile.id)
		});
	}

	getPlayerById(id) {
		return this.players.find(p => p.id === id);
	}

	getMissileByPlayerId(id) {
		return this.missiles.find(m => m.id === id);
	}

	getZombieById(id) {
		return this.zombies.find(z => z.id === id);
	}

	zombieAI(zombie) {
		let mindex = this.findClosestPlayer(zombie);
		this.physics.arcade.moveToXY(zombie.sprite,this.players[mindex].sprite.position.x ,this.players[mindex].sprite.position.y, zombie.sprite.SPEED)
		/*var targetAngle = this.math.angleBetween(
			zombie.sprite.position.x, zombie.sprite.position.y,
			this.players[mindex].sprite.position.x, this.players[mindex].sprite.position.y // this needs to be player x and y that updates dynamically
		)*/
		 
		if(zombie.sprite.body.velocity.x <=0 && zombie.sprite.isRightFacing) {
			zombie.sprite.scale.x *= -1;
			zombie.sprite.isRightFacing = false;
		 }
		 else if (zombie.sprite.body.velocity.x > 0 && !zombie.sprite.isRightFacing) {
			zombie.sprite.scale.x *= -1;
		  	zombie.sprite.isRightFacing = true;
		 }
	 
/*
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
		}*/
		//this.updateVelocity(zombie.sprite.SPEED, zombie.sprite.SPEED, zombie)
	}
	/*updateVelocity(xVelocity, yVelocity, zombie) {
		zombie.sprite.body.velocity.x = xVelocity
		zombie.sprite.body.velocity.y = yVelocity
	}*/

	findClosestPlayer(zombie) {
		let minSet = {
				dist: 1920
			},
			distance, playerPosX, playerPoxY;
		this.players.forEach((p, i) => {
			playerPosX = p.sprite.position.x;
			playerPoxY = p.sprite.position.y;
			distance = Math.sqrt(Math.pow(playerPosX - zombie.sprite.position.x, 2) +
				Math.pow(playerPoxY - zombie.sprite.position.y, 2));
			if (distance < minSet.dist) {
				minSet['index'] = i;
				minSet['dist'] = distance;
			}
		})
		return minSet.index ? minSet.index : 0;
	}

	handleCollideZombie(player, zombie) {
		if (this.time.now > zombiesCoolDown) {
			zombiesCoolDown = zombiesAttack + this.time.now
			player.playerHealth -= 10;
		
			//console.log(zombie.sprite);
			/*zombie.animations.add('zombieattack')
			zombie.animations.play('zombieattack',2)*/
		}
	}
}