import Phaser from 'phaser';
import {
	HealthBar
} from './HealthBar.standalone'

var itemCount = 0;
var itemSwitchCooldown = 500;
var lastSwitch = 0;
var maxAmmo = [Infinity, 200, 100, 5, 100, 10]
var ammoToAdd = [Infinity, 10, 5, 1, 5, 1]

export default class Player {
	constructor(id, game, x, y, angle) {
		this.id = id;
		this.game = game;

		this.sprite = this.game.add.sprite(0, 0, 'player', 100);
		this.game.physics.arcade.enable(this.sprite);


		this.sprite.anchor.setTo(0.5, 0.5)
		this.sprite.scale.setTo(0.15, 0.15)
		this.sprite.checkWorldBounds = true
		this.sprite.body.collideWorldBounds = true;
		this.sprite.inputEnabled = true;
		this.sprite.id = id;
		this.sprite.x = x;
		this.sprite.y = y;
		this.sprite.angle = angle;
		this.sprite.body.allowRotation = false;
		this.sprite.score = 0;

		this.sprite.controls = {
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
			down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
			selectItem: this.game.input.keyboard.addKey(Phaser.Keyboard.B)
		}


		this.sprite.items = ['Melee', 'Machine Gun', 'Flame Thrower', 'Rocket Launcher', 'Chainsaw', 'Lazer']
		this.sprite.selectedItem = 'Melee'
		this.sprite.ammo = [Infinity, 200, 100, 5, 100, 10]
		this.sprite.ammoIndex = 0
		this.sprite.fireRates = [500, 100, 250, 1000, 200, 1250]
		this.sprite.selectedFireRate = 500
		this.sprite.fireRateIndex = 0

		this.sprite.playerSpeedY = 100
		this.sprite.playerSpeedX = 200

		this.sprite.playerHealth = 100
		this.sprite.playerMaxHealth = 100
	}

	update() {
		// Handle Player controls
		if (this.sprite.controls.up.isDown) {
			this.sprite.body.velocity.y = -this.sprite.playerSpeedY
			// this.sprite.y -= this.sprite.playerSpeedY
		}
		if (this.sprite.controls.down.isDown) {
			this.sprite.body.velocity.y = this.sprite.playerSpeedY
			// this.sprite.y += this.sprite.playerSpeedY
		}
		if (this.sprite.controls.left.isDown) {
			this.sprite.body.velocity.x = -this.sprite.playerSpeedX
			// this.sprite.x -= this.sprite.playerSpeedX
		}
		if (this.sprite.controls.right.isDown) {
			this.sprite.body.velocity.x = this.sprite.playerSpeedX
			// this.sprite.x += this.sprite.playerSpeedX
		}
		if (!this.sprite.controls.right.isDown && !this.sprite.controls.left.isDown) {
			this.sprite.body.velocity.x = 0
		}
		if (this.sprite.controls.right.isDown && this.sprite.controls.left.isDown) {
			this.sprite.body.velocity.x = 0
		}
		if (!this.sprite.controls.down.isDown && !this.sprite.controls.up.isDown) {
			this.sprite.body.velocity.y = 0
		}
		if (this.sprite.controls.down.isDown && this.sprite.controls.up.isDown) {
			this.sprite.body.velocity.y = 0
		}
		if (this.sprite.controls.selectItem.isDown) {
			if(lastSwitch < this.game.time.now){
				itemCount++;
				this.sprite.selectedItem = this.sprite.items[itemCount % this.sprite.items.length]
				this.sprite.ammoIndex = itemCount % this.sprite.items.length
				this.sprite.fireRateIndex = itemCount % this.sprite.fireRates.length
				this.sprite.selectedFireRate = this.sprite.fireRates[this.sprite.fireRateIndex]
				lastSwitch = this.game.time.now + itemSwitchCooldown;
			}
			
		}
	}
	setX(x) {
		this.sprite.x = x;
		return this;
	}
	setY(y) {
		this.sprite.y = y;
		return this;
	}
	setAngle(deg) {
		this.sprite.angle = deg;
		return this;
	}

	getX(x) {
		return this.sprite.x
	}
	getY(y) {
		return this.sprite.y
	}

	consumeAmmo() {
		--this.sprite.ammo[this.sprite.ammoIndex]
	}

	giveAmmo() {
		var randomNumber = Math.floor(Math.random() * 5)+1
		if (this.sprite.ammo[randomNumber]+ammoToAdd[randomNumber]< maxAmmo[randomNumber])
			this.sprite.ammo[randomNumber] += ammoToAdd[randomNumber]
		console.log(randomNumber)
	}
}