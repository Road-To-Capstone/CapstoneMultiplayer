'use strict'
import Phaser from 'phaser'

export default class zombie {
  constructor(id, game, x, y, playerId, boss) {
    this.id = id;
    this.game = game;
    this.playerId = playerId

    this.sprite = this.game.add.sprite(50, 0, 'zombiewalk');
    this.game.physics.arcade.enableBody(this.sprite);
    this.sprite.body.fixedRotation = true;
    this.sprite.anchor.setTo(0.5, 0.5);

    if(boss) {
      this.sprite.scale.setTo(0.6);
      this.sprite.health = 1000;
    } else {
      this.sprite.scale.setTo(0.12, 0.12);
      this.sprite.health = 100;
    }
    this.sprite.checkWorldBounds = true
    this.sprite.body.collideWorldBounds = true;

    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.SPEED = 110; // Invader speed pixels/second
    this.sprite.TURN_RATE = 10; // turn rate in degrees/frame
    this.sprite.hasOverlapped = false;
    this.sprite.rotations = 0;
    this.sprite.isRightFacing = true;


    this.sprite.animations.add('zombiewalk');
    this.sprite.animations.play('zombiewalk',10, true)
  }

  update() {
  }

  damage(dmg) {
    if (!this.sprite.hasOverlapped) {
      this.sprite.health -= dmg;
      this.sprite.hasOverlapped = true;
    }
  }

  set(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setZombieX(x) {
    this.sprite.x = x;
    return this;
  }
  setZombieY(y) {
    this.sprite.y = y;
    return this;
  }
}