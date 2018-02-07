import Phaser from 'phaser';

export default class TitleMenu extends Phaser.State {
    constructor() {
        super();
    }
    preload() {
        this.load.image('logo', './assets/deathtorontologo.png')
        this.load.image('playbutton', './assets/playbutton.png')
        this.load.image('howToPlayButton', './assets/howtoplaybutton.png')
    }

    create() {
        this.stage.backgroundColor = "#000"

        var playNowButton = this.add.sprite((this.game.width / 2) - 20, this.game.height - 120, 'playbutton')
        playNowButton.anchor.setTo(0.5, 0.5);
        playNowButton.scale.setTo(0.5, 0.5);
        playNowButton.inputEnabled = true;
        playNowButton.events.onInputDown.add(this.listener, this)

        var HowToPlayButton = this.add.sprite((this.game.width / 2) - 20, this.game.height - 50, 'howToPlayButton')
        HowToPlayButton.anchor.setTo(0.5, 0.5);
        HowToPlayButton.scale.setTo(0.5, 0.5);
        HowToPlayButton.inputEnabled = true;
        HowToPlayButton.events.onInputDown.add(this.HowToPlaylistener, this)

        var Logo = this.add.sprite(this.game.width / 2, this.game.height / 2-50, 'logo')
        Logo.anchor.setTo(0.5, 0.5);
        Logo.scale.setTo(1, 1);
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