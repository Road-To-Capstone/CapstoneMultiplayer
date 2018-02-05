const config = require('./config');
module.exports = new(class Players {
	constructor() {
		this.players = [];
	}
	add(id) {
		const newPlayer = {
			id: id,
			posX: config.game.start.x,
			posY: config.game.start.y
		};
		this.players.push(newPlayer);
		return newPlayer
	}
	get(id) {
		for (let i = 0; i < this.players.length; i++)
			if (this.players[i].id == id) return this.players[i];
		return this.players;
	}
	getAllPlayers() {
		return this.players;
	}
	set(id, json) {
		this.players = this.players.map((e) => {
			if (e.id == id) { //search the player with a specified id
				Object.keys(json).forEach((k) => { //loop through all values that need to be modified
					e[k] = json[k];
				});
			}
			return e;
		});
	}
	delete(id) {
		for (let i = 0; i < this.players.length; i++)
			if (this.players[i].id == id) this.players.splice(i, 1);
	}
});