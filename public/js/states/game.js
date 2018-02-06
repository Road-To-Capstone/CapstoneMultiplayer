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
	startShootingDuration = 5000,
	playerGroup,
	playerCreated = false,
	scoreTrack = 0;

//const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)


export default class GameState extends Phaser.State {
	constructor() {
		super();
	}

	init(playerName) {
		this.name = playerName;
	}

	preload() {
		this.doneLoading = 0; //this is 1 at the end of createOnConnection
		this.load.audio('bensound-ofeliasdream', './assets/bensound-ofeliasdream.mp3')
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
	}

	create() {
		//this.setUpMap()
		this.player = undefined;
		text = this.add.text(300, this.game.height - 55, "Melee | X ", {
			fill: '#ffffff'
		})
		text.fixedToCamera = true;

		this.background = this.add.tileSprite(0, 0, 1920, 1920, 'background')

		this.world.setBounds(0, 0, 1920, 1920)
		this.io = socketio().connect();
		this.io.on('connect', data => {
			this.createOnConnection(data);
		});

		this.LIGHT_RADIUS = 300;

		playerGroup = this.add.group();
		zombieGroup = this.add.group();
		missileGroup = this.add.group();
		buildingGroup = this.add.group();
		

		song = this.add.audio('bensound-ofeliasdream');
		this.sound.setDecodedCallback(song, this.startMusic, this);

		this.spawnBuilding(652, 961, 'building1');
		this.spawnBuilding(821, 1480, 'building2');
		this.spawnBuilding(1400, 1003, 'building3');
		this.spawnBuilding(100, 100, 'tree1');


		this.shadowTexture = this.add.bitmapData(1920, 1920)

		var lightSprite = this.game.add.image(0, 0, this.shadowTexture)

		lightSprite.blendMode = Phaser.blendModes.MULTIPLY

		recognition.continuous = true;
		recognition.lang = 'en-US'
		recognition.start();

		recognition.onresult = event => {
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript
				if (event.results[i].isFinal) finalTranscript += transcript + " "
			}
			transcriptArray = finalTranscript.split(" ")
			finalTranscript = '';
		}
		this.addRain();

		healthPercent = this.add.text(20, this.game.height - 100, '100%', {
			fill: '#ffffff'
		});
		healthPercent.fixedToCamera = true;

		scoreTrack = this.add.text(100, this.game.height - 100, 'SCORE: 0', {
			fill: '#ffffff'
		});

		scoreTrack.fixedToCamera = true;
	}

	update() {
		if (this.doneLoading && playerCreated) {
		
			let voiceRecCommand = transcriptArray.shift()
			startShooting = this.pewCommand(voiceRecCommand)
			if (startShootingTimer < this.time.now) {
				startShooting = false;
			}
			//console.log("voiceRecCommand is", voiceRecCommand)

			if (!cameraSet) {
				this.camera.follow(this.getPlayerById(this.io.id).sprite)
				this.setUpHealthBar()
				cameraSet = true;
			}
			const player = this.getPlayerById(this.io.id);
			if(voiceRecCommand) this.switchWeapon(voiceRecCommand, player);

			this.io.emit('client:player-moved', {
				id: this.io.id,
				posX: player.sprite.x,
				posY: player.sprite.y,
				ammo: player.sprite.ammo
			});
			
			scoreTrack.setText(`SCORE: ${player.sprite.score}`)

			this.updateShadowTexture(player);

			this.zombies.forEach((z) => {
				if (z.playerId === this.io.id){
					this.io.emit('client:zombie-moved', {
						id: z.id,
						posX: z.sprite.x,
						posY: z.sprite.y,
						playerId: z.playerId
					})
				}
			});

			this.physics.arcade.overlap(player.sprite, zombieGroup, this.handleCollideZombie, null, this);
			this.physics.arcade.collide(player.sprite, buildingGroup);

			this.getPlayerById(this.io.id).update();
			this.topText.setText(`Your ID: ${this.io.id}
				${this.players.length} players
				posX: ${Math.floor(player.sprite.worldPosition.x)}
				posY: ${Math.floor(player.sprite.worldPosition.y)}
			`);
			healthPercent.setText(`${(player.sprite.playerHealth / player.sprite.playerMaxHealth) * 100}%`);
			if ((startShooting || this.input.activePointer.isDown) && (this.time.now > nextFire && player.sprite.ammo[player.sprite.ammoIndex] > 0)) {
				nextFire = this.time.now + player.sprite.selectedFireRate;
				this.io.emit('client:ask-to-create-missile', {
					id: this.io.id,
					posX: player.sprite.x,
					posY: player.sprite.y,
					itemName: player.sprite.selectedItem,
					toX: this.input.activePointer.worldX,
					toY: this.input.activePointer.worldY,
					damage: weaponDamage[player.sprite.ammoIndex]
				})
			}
		if (this.zombies.length < 2) {
				this.io.emit('client:ask-to-create-zombie', this.io.id);
			}

			if (!!this.zombies.length) {
				this.zombies.forEach(e => {
					this.zombieAI(e);
					if (e.sprite.health === 0) {
						this.io.emit('client:kill-this-zombie', e.id);
						player.sprite.score += 1000;
						player.giveAmmo();
						var zombieDeath = this.add.sprite(e.sprite.x, e.sprite.y, 'zombiedeath');
						zombieDeath.anchor.setTo(0.5, 0.5);
						zombieDeath.scale.setTo(0.12, 0.12);

						var animatedDeath = zombieDeath.animations.add('zombiedeath', [4, 5, 6, 3, 8, 9, 10, 7, 0, 1, 2, 11, 11, 11, 11, 11, 11, 11, 11, 11], 6, false);
						animatedDeath.killOnComplete = true;
						let distance =Phaser.Math.distance(player.sprite.x, player.sprite.y, e.sprite.x, e.sprite.y);
						if(distance > 275) {
							zombieDeath.kill()
						}

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
					if (e.id === player.id) {
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
			this.LIGHT_RADIUS, 0, Math.PI * 2);
		this.shadowTexture.context.fill();

		// This just tells the engine it should update the texture cache
		this.shadowTexture.dirty = true;
	}

	addRain() {

		let rainParticle = this.add.bitmapData(15, 50);

		rainParticle.ctx.rect(0, 0, 15, 50);
		rainParticle.ctx.fillStyle = '#9cc9de';
		rainParticle.ctx.fill();

		this.emitter = this.add.emitter(this.world.centerX, -300, 400);

		this.emitter.width = this.game.world.width;
		this.emitter.angle = 10;

		this.emitter.makeParticles(rainParticle);

		this.emitter.minParticleScale = 0.1;
		this.emitter.maxParticleScale = 0.3;

		this.emitter.setYSpeed(600, 1000);
		this.emitter.setXSpeed(-5, 5);

		this.emitter.minRotation = 0;
		this.emitter.maxRotation = 0;

		this.emitter.start(false, 1600, 5, 0);

	}

	pewCommand(speech) {

		if (speech === 'pew' || speech === 'q' || speech === 'Q' || speech === 'cute' || speech === 'shoot') {
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

	spawnBuilding(x, y, option) {
		this.building = new Building(this.game, x, y, option)
		buildingGroup.add(this.building.sprite);
	}

	makeZombies(id, x, y, playerId, boss) {
		this.zombie = new Zombie(id, this, x, y, playerId, boss);
		this.zombies.push(this.zombie);
		zombieGroup.add(this.zombie.sprite)
	}

	makePlayer(id,x,y,ammo){
		this.player = new Player(id, this, x, y, ammo)
	//	console.log("players is", this.players)
		this.players.push(this.player)
		playerGroup.add(this.player.sprite)
		playerCreated = true;
	}

	switchWeapon(voice, player) {
		let voiceTemp = voice.toLowerCase();
		if(voiceTemp === 'melee') {
			this.switchWeaponHelper(0, player);
		} else if(voiceTemp === 'machine') {
			this.switchWeaponHelper(1, player);
		} else if(voiceTemp === 'flame') {
			this.switchWeaponHelper(2, player);
		} else if(voiceTemp === 'rocket') {
			this.switchWeaponHelper(3, player);
		} else if(voiceTemp === 'chain') {
			this.switchWeaponHelper(4, player);
		} else if(voiceTemp === 'lazer') {
			this.switchWeaponHelper(5, player);
		} else {
			return;
		}
	}

	switchWeaponHelper(index, player) {
		player.sprite.selectedItem = player.sprite.items[index];
		player.sprite.ammoIndex = index;
		player.sprite.fireRateIndex = index;
		player.sprite.selectedFireRate = player.sprite.fireRates[index];
	}

	fire(posX, posY, itemName, id, toX, toY, damage) {
		this.missile = new Missile(this, posX, posY, toX, toY, itemName, id, damage)
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
			console.log("new missile dmg is", missile.damage)
			zombie.health -= missile.damage;
			currentPlayer.sprite.score += 100;
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
		/*this.io.emit('client:give-me-players'); //ask for it
		this.io.emit('client:give-me-zombies'); //ask for zombies  */
		this.io.emit('client:ask-to-create-player', this.io.id)
		this.io.emit('client:give-me-players');
		this.io.emit('client:give-me-zombies');
		console.log("this.players for real is, ", this.players)

		/*this.io.on('server:new-player', data => {

		})*/

		this.io.on('server:all-players', data => { //the data is the players from the server side
			if (data.length>0){
				data.forEach(e => {
					if (e.id != this.io.id) //this will prevent loading our player two times
						this.players.push(new Player(e.id, this, e.posX, e.posY, e.angle));
				});
			}
		});

		this.io.on('server:all-zombies', data => {
			if (data.length>0){
				data.forEach(newZombie => {
					this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY, newZombie.playerId, newZombie.boss);
				})
			}
		})

		//load your player
	/*	this.io.on('server:player-added', data => {
			players.push(new Player(data.id, this, data.posX, data.posY, data.angle));
		});*/

		this.io.on('server:player-disconnected', id => { //if a player has disconnected
			this.players.forEach((e, i) => {
				if (e.id === id) {
					e.sprite.destroy();
					this.players.splice(i, 1);
				}
			});
		});

		this.io.on('server:player-moved', data => {
			if (this.getPlayerById(data.id)){
				this.getPlayerById(data.id).setX(data.posX).setY(data.posY).setAmmo(data.ammo);
			}
		});

		this.io.on('server:game-over', id => {
			this.players.forEach((e, i) => {
				if (e.id === id) {
					e.sprite.destroy();
					this.players.splice(i, 1);
				}
			});
		})

		this.io.on('server:zombie-moved', data => { //data is an object with {id: z.id, posX: z.sprite.x, posY: z.sprite.y}
			if (this.getZombieById(data.id)){
				this.getZombieById(data.id).set(data.posX, data.posY);
			}
		});

		this.io.on('server:missile-moved', data => { //data is {posX: data.posX, posY: data.posY, velocityX: data.velocityX, velocityY: data.velocityY}
			this.getMissileByPlayerId(data.id).set(data.posX, data.posY, data.velocityX, data.velocityY, data.itemName)
		});

		this.io.on('server:missile-fired', data => {
			this.missiles = data;
		});

		this.io.on('server:zombie-added', newZombie => {
			this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY, newZombie.playerId, newZombie.boss);
		});

		this.io.on('server:kill-this-zombie', id => {
			this.zombies.forEach((z, i) => {
				if (z.id === id) {
					z.sprite.destroy();
					this.zombies.splice(i, 1);
				}
			});
		})

		this.io.on('server:missile-added', newMissile => {
			this.fire(newMissile.posX, newMissile.posY, newMissile.itemName, newMissile.id, newMissile.toX, newMissile.toY, newMissile.damage)
		});

		this.io.on('server:player-added', newPlayer => {
			console.log("newPlayer.id is", newPlayer.id)
			this.makePlayer(newPlayer.id, newPlayer.posX, newPlayer.posY, newPlayer.ammo)
		})

		this.io.on('server:update-single-player-players', updatedPlayers => {
			console.log("updatedPlayers for you is: " , updatedPlayers)
			this.players = updatedPlayers;
		})

		this.io.on('server:update-players', updatedPlayers => {
			console.log("updatedPlayers for others is: " , updatedPlayers)
			this.players = updatedPlayers;
		})
	}


	getPlayerById(id) {
		return this.players.find(p => p.id === id);
	}

	getMissileByPlayerId(id) {
		return missiles.find(m => m.id === id);
	}

	getZombieById(id) {
		return zombies.find(z => z.id === id);
	}

	zombieAI(zombie) {
		let mindex = this.findClosestPlayer(zombie);
		this.physics.arcade.moveToXY(
			zombie.sprite,
			this.players[mindex].sprite.position.x,
			this.players[mindex].sprite.position.y,
			zombie.sprite.SPEED
		)

		if (zombie.sprite.body.velocity.x <= 0 && zombie.sprite.isRightFacing) {
			zombie.sprite.scale.x *= -1;
			zombie.sprite.isRightFacing = false;
		} else if (zombie.sprite.body.velocity.x > 0 && !zombie.sprite.isRightFacing) {
			zombie.sprite.scale.x *= -1;
			zombie.sprite.isRightFacing = true;
		}
	}

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
		}
	}
}