import Phaser from 'phaser'


export default class Building {
  constructor(game, x, y, option) {
    this.game = game
    this.sprite = this.game.add.sprite(0, 0, option, 100);
    this.sprite.game.physics.arcade.enableBody(this.sprite);
    this.sprite.body.immovable = true;
    this.sprite.anchor.setTo(0.5, 0.5)
    if(option.indexOf('house')) {
      this.sprite.scale.setTo(0.8)
    }else {
      this.sprite.scale.setTo(0.7)
    }
    this.sprite.x = x
    this.sprite.y = y

  }
}