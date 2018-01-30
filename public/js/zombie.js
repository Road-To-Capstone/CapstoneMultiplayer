import Phaser from 'phaser'

export default class zombie {
  constructor (id, game, x, y) {
    this.id = id;
    this.game = game;

    this.sprite = this.game.add.sprite(50, 0, 'zombie');
    this.game.physics.arcade.enableBody(this.sprite);

    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.scale.setTo(0.06, 0.06);
    this.sprite.checkWorldBounds = true
    this.sprite.body.collideWorldBounds = true;

    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.SPEED = 200; // Invader speed pixels/second
    this.sprite.TURN_RATE = 10; // turn rate in degrees/frame
    this.sprite.health = 100;
    this.sprite.hasOverlapped = false;
  }

  update () {
  }

  setZombieX(x){
    this.sprite.x = x;
    return this;
  }
  setZombieY(y){
    this.sprite.y = y;
    return this;
  }
}
