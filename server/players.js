const config = require('./config');
module.exports = new(class Players {
	constructor() {
		this.players = [];
	}
	add(id,name) {
		const newPlayer = {
			id: id,
			posX: config.game.start.x,
			posY: config.game.start.y,
			ammo: ["Infinity", 200, 100, 5, 100, 10],
			name: name
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
			if (e.id == id) { 
				Object.keys(json).forEach((k) => { 
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