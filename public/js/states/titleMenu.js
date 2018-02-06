import Phaser from 'phaser';

export default class TitleMenu extends Phaser.State {
    constructor() {
        super();
    }
    preload() {
        this.load.image('logo', './assets/Logo.png')
        this.load.image('playbutton', './assets/playnowbutton.png')
        this.load.image('howToPlayButton', './assets/howtoplaybutton.png')
    }

    create() {
        this.stage.backgroundColor = "#4488AA"

        var playNowButton = this.add.sprite(this.game.width / 2, this.game.height - 50, 'playbutton')
        playNowButton.anchor.setTo(0.5, 0.5);
        playNowButton.scale.setTo(0.5, 0.5);
        playNowButton.inputEnabled = true;
        playNowButton.events.onInputDown.add(this.listener, this)

        var HowToPlayButton = this.add.sprite(this.game.width / 2, this.game.height - 50, 'howToPlayButton')
        playNowButton.anchor.setTo(0.5, 0.5);
        playNowButton.scale.setTo(0.5, 0.5);
        playNowButton.inputEnabled = true;
        playNowButton.events.onInputDown.add(this.HowToPlaylistener, this)

        var Logo = this.add.sprite(this.game.width / 2, this.game.height - 50, 'logo')
        playNowButton.anchor.setTo(0.5, 0.5);
        playNowButton.scale.setTo(0.5, 0.5);
    }

    update() {

    }

    listener() {
        this.state.start('MenuState');
    }

    HowToPlaylistener() {
        this.state.start('HowToPlay');
    }
}