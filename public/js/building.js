import Phaser from 'phaser'


export default class Building{
  constructor (game, x, y, width, height) {
    super(game, x, y, 'building')
    this.game.physics.arcade.enableBody(this)
    this.anchor.setTo(0.5, 0.5)
    this.scale.setTo(0.5, 0.5)
    this.x = this.game.width / 2 + 300
    this.y = this.game.height / 2 + 300
    this.body.immovable = true
    this.body.moves = false
    this.body.collideWorldBounds = true
  }
}

export default building
