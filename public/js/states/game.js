import Phaser from 'phaser';
import socketio from 'socket.io-client';
import Player from './../player';
import Missile from './../missile'
import Zombie from './../zombie';
import {
	HealthBar
} from './../HealthBar.standalone'
import Building from './../building'
import NoCollide from './../noCollide'

var map, layer, missileGroup, zombieGroup, nextFire = 0,
	cameraSet = false,
	buildingGroup,
	nextMissileCollision = 0,
	missileCollisionRate = 1000,
	zombiesCoolDown = 1000,
	zombiesAttack = 1000,
	text,
	song,
	bossSong,
	healthPercent,
	weaponDamage = [20, 10, 20, 100, 20, 100],
	finalTranscript = '',
	transcriptArray = [],
	startShooting = false,
	startShootingTimer = 0,
	startShootingDuration = 5000,
	playerGroup,
	playerCreated = false,
	bossPlaying = false,
	scoreTrack = 0;


const recognition = (navigator.userAgent.includes('Chrome')) ? new(window.SpeechRecognition || window.webkitSpeechRecognition) : null;


export default class GameState extends Phaser.State {
	constructor() {
		super();
	}

	init(playerName) {
		this.name = playerName;
	}

	preload() {
		this.doneLoading = 0; //this is 1 at the end of createOnConnection
	}

	create() {
		this.player = undefined;

		this.background = this.add.tileSprite(0, 0, 1920, 1920, 'background')
		this.setUpMap()

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
		bossSong = this.add.audio('Action Radius');
		this.sound.setDecodedCallback(song, this.startMusic, this);
		this.sound.setDecodedCallback(bossSong, this.startMusic, this);

		this.setUpBuilding();
		
		this.shadowTexture = this.add.bitmapData(1920, 1920)

		var lightSprite = this.game.add.image(0, 0, this.shadowTexture)

		lightSprite.blendMode = Phaser.blendModes.MULTIPLY

		if (navigator.userAgent.includes('Chrome')) {
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
		}


		this.addRain();

		healthPercent = this.add.text(20, this.game.height - 100, '100%', {
			fill: '#ffffff'
		});
		healthPercent.fixedToCamera = true;

		scoreTrack = this.add.text(100, this.game.height - 100, 'SCORE: 0', {
			fill: '#ffffff'
		});

		text = this.add.text(300, this.game.height - 55, "Melee | X ", {
			fill: '#ffffff'
		})
		text.fixedToCamera = true;

		scoreTrack.fixedToCamera = true;

		this.doneLoading = 1;
	}

	update() {
		if (this.doneLoading && playerCreated) {
			const player = this.getPlayerById(this.io.id);
			
			this.updateShadowTexture(player);

			let voiceRecCommand = transcriptArray.shift()
			startShooting = this.pewCommand(voiceRecCommand)
			if (startShootingTimer < this.time.now) {
				startShooting = false;
			}

			if (!cameraSet) {
				this.camera.follow(this.getPlayerById(this.io.id).sprite)
				this.setUpHealthBar()
				cameraSet = true;
			}
			
			if (voiceRecCommand) this.switchWeapon(voiceRecCommand, player);

			this.io.emit('client:player-moved', {
				id: this.io.id,
				posX: player.sprite.x,
				posY: player.sprite.y,
				ammo: player.sprite.ammo,
				name: player.sprite.name
			});

			scoreTrack.setText(`SCORE: ${player.sprite.score}`)

			this.zombies.forEach((z) => {
				if (z.playerId === this.io.id) {
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
			this.players.forEach(p=>{
				p.updateTextPos();
			});
			this.topText.setText(`Your ID: ${this.io.id}
				${this.players.length} players
				posX: ${Math.floor(player.sprite.x)}
				posY: ${Math.floor(player.sprite.y)}
			`);
			healthPercent.setText(`${(player.sprite.playerHealth / player.sprite.playerMaxHealth) * 100}%`);
			if ((startShooting || this.input.activePointer.isDown) && (this.time.now > nextFire && player.sprite.ammo[player.sprite.ammoIndex] > 0)) {
				nextFire = this.time.now + player.sprite.selectedFireRate;
				player.consumeAmmo();
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
			if (this.zombies.length < 15) {
				this.io.emit('client:ask-to-create-zombie', this.io.id);
			}

			if (this.zombies.length > 0) {
				this.zombies.forEach(e => {
					if (e.sprite && e.sprite.alive){
						this.zombieAI(e);
						if (e.sprite.health <= 0  && e.sprite.alive) {
							this.io.emit('client:kill-this-zombie', e.id);
							player.giveAmmo();
							player.giveAmmo();
							var zombieScale = 0.12
							if (e.boss){
								zombieScale = 0.5
							}
							var zombieDeath = this.add.sprite(e.sprite.x, e.sprite.y, 'zombiedeath');
							zombieDeath.anchor.setTo(0.5, 0.5);
							zombieDeath.scale.setTo(zombieScale, zombieScale);
	
							var animatedDeath = zombieDeath.animations.add('zombiedeath', [4, 5, 6, 3, 8, 9, 10, 7, 0, 1, 2, 11, 11, 11, 11, 11, 11, 11, 11, 11], 6, false);
							animatedDeath.killOnComplete = true;
							let distance = Phaser.Math.distance(player.sprite.x, player.sprite.y, e.sprite.x, e.sprite.y);
							if (distance > 275) {
								zombieDeath.kill()
							}
	
							zombieDeath.animations.play('zombiedeath');
							e.sprite.kill();
						}
						this.physics.arcade.collide(e.sprite, zombieGroup);
						this.physics.arcade.collide(e.sprite, buildingGroup);
					}
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
	    ===============
		SPAWN FUNCTIONS
		===============
	*/
	bossIncoming(){
		var thePlayer = this.getPlayerById(this.io.id)
		var bossIncomingText = this.add.sprite(200, 200, 'bossincoming');
		bossIncomingText.anchor.setTo(0.5, 0.5);
		bossIncomingText.scale.setTo(0.6, 0.7);
		bossIncomingText.x = this.game.width/2;
		bossIncomingText.y = this.game.height/2-200;
		bossIncomingText.fixedToCamera = true;

		var animatedBossText = bossIncomingText.animations.add('bossincoming', [0,1,0,1,0,1], 1, false);
		animatedBossText.killOnComplete = true;
		animatedBossText.fixedToCamera = true;

		bossIncomingText.animations.play('bossincoming');
	}

	spawnNoCollide(x, y, option) {
		this.noCollide = new NoCollide(this.game, x, y, option)
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

	makePlayer(id,x,y,ammo,name){
		this.player = new Player(id, this, x, y, ammo,name)
		this.players.push(this.player)
		playerGroup.add(this.player.sprite)
		playerCreated = true;
	}

	fire(posX, posY, itemName, id, toX, toY, damage) {
		this.missile = new Missile(this, posX, posY, toX, toY, itemName, id, damage)
		this.missiles.push(this.missile);
		missileGroup.add(this.missile.sprite)
		zombieGroup.forEach((e) => {
			e.hasOverlapped = false
		})
	}

	/* 
	    ===============
		UPDATE FUNCTIONS
		===============
	*/

	startMusic() {
		song.loopFull(0.2);
		if (!bossPlaying) {
			bossSong.pause()
			song.loopFull(0.2);
		} else {
			song.pause()
			bossSong.loopFull(0.1)
		}
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

	switchWeapon(voice, player) {
		let voiceTemp = voice.toLowerCase();
		if (voiceTemp === 'melee') {
			this.switchWeaponHelper(0, player);
		} else if (voiceTemp === 'machine') {
			this.switchWeaponHelper(1, player);
		} else if (voiceTemp === 'flame') {
			this.switchWeaponHelper(2, player);
		} else if (voiceTemp === 'rocket') {
			this.switchWeaponHelper(3, player);
		} else if (voiceTemp === 'chain') {
			this.switchWeaponHelper(4, player);
		} else if (voiceTemp === 'lazer') {
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

	/* 
	    ===============
		COLLISION FUNCTIONS
		===============
	*/

	handleMissileCollision(zombie, missile) {
		if (!zombie.hasOverlapped) {
			zombie.hasOverlapped = true
			let currentPlayer = this.getPlayerById(this.io.id);
			zombie.health -= missile.damage;
			if (missile.id === currentPlayer.sprite.id){
				currentPlayer.sprite.score += weaponDamage[currentPlayer.sprite.ammoIndex];
			}
		}
	}

	/* 
	    ===============
		SOCKET HELPER FUNCTIONS
		===============
	*/
	createOnConnection(data) {
		window.zombies = [];
		this.zombies = zombies;

		window.players = [];
		this.players = players;

		window.missiles = [];
		this.missiles = missiles;

		window.io = this.io;

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
		this.topText.fixedToCamera = true;
	}

	socketCreateListeners() {
		const me = this.getPlayerById(this.io.id);

		//load all existing players
		this.io.emit('client:ask-to-create-player', {id : this.io.id, name: this.name})
		this.io.emit('client:give-me-players');
		this.io.emit('client:give-me-zombies');

		this.io.on('server:all-players', data => { //the data is the players from the server side
			if (data.length > 0) {
				data.forEach(e => {
					if (e.id != this.io.id) //this will prevent loading our player two times
						this.players.push(new Player(e.id, this, e.posX, e.posY, e.ammo, e.name));
				});
			}
		});

		this.io.on('server:all-zombies', data => {
			if (data.length > 0) {
				data.forEach(newZombie => {
					this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY, newZombie.playerId, newZombie.boss);
				})
			}
		})

		this.io.on('server:player-disconnected', id => { //if a player has disconnected
			this.players.forEach((e, i) => {
				if (e.id === id) {
					e.removeText();
					e.sprite.destroy();
					this.players.splice(i, 1);
				}
			});
		});

		this.io.on('server:player-moved', data => {
			if (this.getPlayerById(data.id)){
				this.getPlayerById(data.id).setX(data.posX).setY(data.posY).setAmmo(data.ammo).setName(data.name);
			}
		});

		this.io.on('server:game-over', id => {
			this.players.forEach((e, i) => {
				if (e.id === id) {
					e.removeText();
					e.sprite.destroy();
					this.players.splice(i, 1);
				}
			});
		})

		this.io.on('server:zombie-moved', data => { //data is an object with {id: z.id, posX: z.sprite.x, posY: z.sprite.y}
			if (this.getZombieById(data.id)) {
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
			if (newZombie.boss) {
				bossPlaying = true;
				this.startMusic()
				this.bossIncoming();
			}
			this.makeZombies(newZombie.id, newZombie.posX, newZombie.posY, newZombie.playerId, newZombie.boss);
		});

		this.io.on('server:kill-this-zombie', id => {
			this.zombies.forEach((z, i) => {
				if (z.id === id) {
					if (z.boss) {
						bossPlaying = false;
						this.startMusic();
					}
					z.sprite.destroy();
					this.zombies.splice(i, 1);
				}
			});
		})

		this.io.on('server:missile-added', newMissile => {
			this.fire(newMissile.posX, newMissile.posY, newMissile.itemName, newMissile.id, newMissile.toX, newMissile.toY, newMissile.damage)
		});

		this.io.on('server:player-added', newPlayer => {
			this.makePlayer(newPlayer.id, newPlayer.posX, newPlayer.posY, newPlayer.ammo, newPlayer.name)
		})

		this.io.on('server:update-single-player-players', updatedPlayers => {
			this.players = updatedPlayers;
		})

		this.io.on('server:update-players', updatedPlayers => {
			this.players = updatedPlayers;
		})
	}

	/* 
	    ===============
		SERVER DATA RETRIEVAL/UPDATE FUNCTIONS
		===============
	*/

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

	/* 
	    ===============
		SETUP FUNCTIONS
		===============
	*/

	setUpMap() {
		//horizontal road
		this.spawnNoCollide(100, 400, 'road')
		this.spawnNoCollide(450, 400, 'road')
		this.spawnNoCollide(800, 400, 'road')
		this.spawnNoCollide(1150, 400, 'road')
		this.spawnNoCollide(1500, 400, 'road')
		this.spawnNoCollide(1850, 400, 'road')

		this.spawnNoCollide(100, 800, 'road')
		this.spawnNoCollide(450, 800, 'road')
		this.spawnNoCollide(800, 800, 'road')
		this.spawnNoCollide(1150, 800, 'road')
		this.spawnNoCollide(1500, 800, 'road')
		this.spawnNoCollide(1850, 800, 'road')

		this.spawnNoCollide(100, 1200, 'road')
		this.spawnNoCollide(450, 1200, 'road')
		this.spawnNoCollide(800, 1200, 'road')
		this.spawnNoCollide(1150, 1200, 'road')
		this.spawnNoCollide(1500, 1200, 'road')
		this.spawnNoCollide(1850, 1200, 'road')

		this.spawnNoCollide(100, 1600, 'road')
		this.spawnNoCollide(450, 1600, 'road')
		this.spawnNoCollide(800, 1600, 'road')
		this.spawnNoCollide(1150, 1600, 'road')
		this.spawnNoCollide(1500, 1600, 'road')
		this.spawnNoCollide(1850, 1600, 'road')

		//vertical road
		this.spawnNoCollide(211, 100, 'vroad')
		this.spawnNoCollide(211, 450, 'vroad')
		this.spawnNoCollide(211, 800, 'vroad')
		this.spawnNoCollide(211, 1150, 'vroad')
		this.spawnNoCollide(211, 1500, 'vroad')
		this.spawnNoCollide(211, 1850, 'vroad')

		this.spawnNoCollide(630, 100, 'vroad')
		this.spawnNoCollide(630, 450, 'vroad')
		this.spawnNoCollide(630, 800, 'vroad')
		this.spawnNoCollide(630, 1150, 'vroad')
		this.spawnNoCollide(630, 1500, 'vroad')
		this.spawnNoCollide(630, 1850, 'vroad')

		this.spawnNoCollide(1313, 100, 'vroad')
		this.spawnNoCollide(1313, 450, 'vroad')
		this.spawnNoCollide(1313, 800, 'vroad')
		this.spawnNoCollide(1313, 1150, 'vroad')
		this.spawnNoCollide(1313, 1500, 'vroad')
		this.spawnNoCollide(1313, 1850, 'vroad')

		//tombstones
		this.spawnNoCollide(126, 891, 'tombstone')
		this.spawnNoCollide(340, 1300, 'tombstone')
		this.spawnNoCollide(80, 1800, 'tombstone')
		this.spawnNoCollide(135, 315, 'tombstone')
		this.spawnNoCollide(800, 900, 'tombstone')
		this.spawnNoCollide(1000, 1350, 'tombstone')
		this.spawnNoCollide(1250, 1700, 'tombstone')
		this.spawnNoCollide(1450, 950, 'tombstone')
		this.spawnNoCollide(1806, 650, 'tombstone');

		//trees
		this.spawnNoCollide(20, 20, 'tree1');
		this.spawnNoCollide(136, 20, 'tree1');
		this.spawnNoCollide(136, 301, 'tree1');
		this.spawnNoCollide(1766, 66, 'tree1');
		this.spawnNoCollide(1493, 66, 'tree1');
		this.spawnNoCollide(1629, 110, 'tree1');
		this.spawnNoCollide(1479, 280, 'tree1');
		this.spawnNoCollide(1766, 240, 'tree1');
		this.spawnNoCollide(715, 461, 'tree1');
		this.spawnNoCollide(755, 461, 'tree1');
		this.spawnNoCollide(795, 461, 'tree1');
		this.spawnNoCollide(835, 461, 'tree1');
		this.spawnNoCollide(875, 461, 'tree1');
		this.spawnNoCollide(915, 461, 'tree1');
		this.spawnNoCollide(955, 461, 'tree1');
		this.spawnNoCollide(995, 461, 'tree1');
		this.spawnNoCollide(1035, 461, 'tree1');
		this.spawnNoCollide(1075, 461, 'tree1');
		this.spawnNoCollide(1115, 461, 'tree1');
		this.spawnNoCollide(1155, 461, 'tree1');
		this.spawnNoCollide(1195, 461, 'tree1');
		this.spawnNoCollide(1235, 461, 'tree1');

		this.spawnNoCollide(715, 317, 'tree1');
		this.spawnNoCollide(755, 317, 'tree1');
		this.spawnNoCollide(795, 317, 'tree1');
		this.spawnNoCollide(835, 317, 'tree1');
		this.spawnNoCollide(875, 317, 'tree1');
		this.spawnNoCollide(915, 317, 'tree1');
		this.spawnNoCollide(955, 317, 'tree1');
		this.spawnNoCollide(995, 317, 'tree1');
		this.spawnNoCollide(1035, 317, 'tree1');
		this.spawnNoCollide(1075, 317, 'tree1');
		this.spawnNoCollide(1115, 317, 'tree1');
		this.spawnNoCollide(1155, 317, 'tree1');
		this.spawnNoCollide(1195, 317, 'tree1');
		this.spawnNoCollide(1235, 317, 'tree1');

		this.spawnNoCollide(60, 201, 'tree1');
		this.spawnNoCollide(73, 1371, 'tree1');


		//floor1
		this.spawnNoCollide(340, 262, 'floor1');
		this.spawnNoCollide(490, 262, 'floor1');

		this.spawnNoCollide(340, 662, 'floor1');
		this.spawnNoCollide(490, 662, 'floor1');

		this.spawnNoCollide(1426, 540, 'floor1');
		this.spawnNoCollide(1552, 540, 'floor1');
		this.spawnNoCollide(1650, 540, 'floor1');

		//cars 
		this.spawnNoCollide(190, 376, 'car1');
		this.spawnNoCollide(190, 650, 'car1');
		this.spawnNoCollide(613, 660, 'car1');
		this.spawnNoCollide(613, 1800, 'car1');
		this.spawnNoCollide(613, 1000, 'car1');
		this.spawnNoCollide(613, 1600, 'car1');
		this.spawnNoCollide(613, 200, 'car1');
		this.spawnNoCollide(1296, 500, 'car1');
		this.spawnNoCollide(1296, 200, 'car1');
		this.spawnNoCollide(1296, 900, 'car1');

		this.spawnNoCollide(236, 866, 'car2');
		this.spawnNoCollide(236, 1700, 'car2');
		this.spawnNoCollide(236, 700, 'car2');
		this.spawnNoCollide(236, 50, 'car2');
		this.spawnNoCollide(658, 50, 'car2');
		this.spawnNoCollide(658, 1000, 'car2');
		this.spawnNoCollide(658, 1100, 'car2');
		this.spawnNoCollide(1341, 900, 'car2');
		this.spawnNoCollide(1341, 1500, 'car2');
		this.spawnNoCollide(1341, 50, 'car2');

		this.spawnNoCollide(913, 374, 'car3');
		this.spawnNoCollide(1600, 374, 'car3');
		this.spawnNoCollide(1700, 374, 'car3');
		this.spawnNoCollide(100, 374, 'car3');
		this.spawnNoCollide(170, 774, 'car3');
		this.spawnNoCollide(576, 774, 'car3');
		this.spawnNoCollide(676, 774, 'car3');
		this.spawnNoCollide(1000, 774, 'car3');
		this.spawnNoCollide(1600, 774, 'car3');
		this.spawnNoCollide(1700, 774, 'car3');
		this.spawnNoCollide(300, 1174, 'car3');
		this.spawnNoCollide(400, 1174, 'car3');
		this.spawnNoCollide(500, 1174, 'car3');	
		this.spawnNoCollide(600, 1174, 'car3');
		this.spawnNoCollide(400, 1574, 'car3');
		this.spawnNoCollide(1600, 1574, 'car3');
		this.spawnNoCollide(1800, 1574, 'car3');
		this.spawnNoCollide(789, 1574, 'car3');
		this.spawnNoCollide(168, 1574, 'car3');

		this.spawnNoCollide(940, 420, 'car4');
		this.spawnNoCollide(450, 420, 'car4');
		this.spawnNoCollide(1060, 420, 'car4');
		this.spawnNoCollide(1600, 420, 'car4');
		this.spawnNoCollide(50, 420, 'car4');
		this.spawnNoCollide(50, 820, 'car4');
		this.spawnNoCollide(150, 820, 'car4');
		this.spawnNoCollide(250, 820, 'car4');
		this.spawnNoCollide(1579, 820, 'car4');
		this.spawnNoCollide(1679, 820, 'car4');
		this.spawnNoCollide(345, 1220, 'car4');
		this.spawnNoCollide(445, 1220, 'car4');
		this.spawnNoCollide(645, 1220, 'car4');
		this.spawnNoCollide(345, 1220, 'car4');
		this.spawnNoCollide(345, 1220, 'car4');
	}

	setUpBuilding() {
		this.spawnBuilding(358, 256, 'building1');
		this.spawnBuilding(358, 661, 'building2');
		this.spawnBuilding(989, 1393, 'house1');
		this.spawnBuilding(1544, 530, 'house2');
	}

	setUpHealthBar() {
		this.myHealthBar = new HealthBar(this.game, {
			x: 145,
			y: this.game.height - 40
		})
		this.myHealthBar.setFixedToCamera(true)
	}

}