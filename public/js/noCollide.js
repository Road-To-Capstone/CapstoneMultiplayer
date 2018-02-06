import Phaser from 'phaser'


export default class NoCollide {
  constructor(game, x, y, option) {

    this.game = game

    this.sprite = this.game.add.sprite(0, 0, option);
    this.sprite.game.physics.arcade.enableBody(this.sprite);
    this.sprite.body.immovable = true;
    this.sprite.anchor.setTo(0.5, 0.5)
    this.sprite.x = x
    this.sprite.y = y

    switch (option) {
        case 'tombstone': 
          this.sprite.scale.setTo(0.15)
          break;
        case 'road':
          this.sprite.scale.setTo(2)
          break;
        case 'vroad':
          this.sprite.scale.setTo(2)
          break;
        case 'floor1'||'floor2':
          this.sprite.scale.setTo(2);
          break;
        default:
          this.sprite.scale.setTo(0.28)
          break;
    }
  }
}