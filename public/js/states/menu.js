import Phaser from 'phaser';

var text, textToUpdate = "",
    shouldHandleKeyDown = true,
    deleteButton;
export default class MenuState extends Phaser.State {
    constructor() {
        super();
    }
    preload() {
        this.load.image('inputfield', './assets/inputField.png')
        this.load.image('playbutton', './assets/playbutton.png')
        this.load.image('logo', './assets/deathtorontologo.png')
    }

    create() {
        this.stage.backgroundColor = "#313131"
        this.add.text(this.game.width / 2, this.game.height / 2 + 100, "Enter Player Name").anchor.set(0.5)
        var inputField = this.add.sprite(this.game.width / 2, this.game.height / 2 + 150, 'inputfield')
        inputField.anchor.setTo(0.5, 0.5)
        inputField.scale.setTo(1, 0.5)

        var Logo = this.add.sprite((this.game.width / 2) + 20, 250, 'logo')
        Logo.anchor.setTo(0.5, 0.5);
        Logo.scale.setTo(1, 1);

        var playNowButton = this.add.sprite(this.game.width / 2, this.game.height - 50, 'playbutton')
        playNowButton.anchor.setTo(0.5, 0.5);
        playNowButton.scale.setTo(0.5, 0.5);
        playNowButton.inputEnabled = true;
        playNowButton.events.onInputDown.add(this.listener, this)

        text = this.add.text(this.game.width / 2 - inputField.width / 2, this.game.height / 2 + 170 - inputField.height / 2, textToUpdate, {
            boundsAlignH: "center"
        })
        text.setTextBounds(0, 0, inputField.width, inputField.height)
        window.addEventListener('keypress', function (event) {
            shouldHandleKeyDown = false;
            var key = event.keyCode || event.which;
            textToUpdate = textToUpdate + String.fromCharCode(key).toUpperCase();
        });
        deleteButton = this.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE)
    }

    update() {
        if (shouldHandleKeyDown) {
            shouldHandleKeyDown = false;
            text.setText(textToUpdate)
        }
        if (deleteButton.isDown) {
            shouldHandleKeyDown = false;
            textToUpdate = textToUpdate.slice(0, -1);
            text.setText(textToUpdate)
        }
        document.onkeyup = function () {
            shouldHandleKeyDown = true;
        }

    }

    listener() {
        this.stage.backgroundColor = '#000'
        this.state.start('Preload', true, false, textToUpdate);
    }
}