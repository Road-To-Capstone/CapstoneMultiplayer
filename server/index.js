const config = require('./config');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const db = require('./db');
const bodyParser = require('body-parser');


const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

app.use('/', express.static(config.publicDir));

db.sync({force:true}).then(() => {
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use('/api', require('./api'));

server.listen(process.env.PORT || config.port, () => {
	console.log(`Listening on ${process.env.PORT || config.port}`);
});

// Sockets
const players = require('./players.js');
const missiles = require('./missiles.js');
const zombies = require('./zombies.js');

io.sockets.on('connection', socket => {
	socket.on('client:give-me-players', () => {
		socket.emit('server:all-players', players.getAllPlayers());
	});

	socket.on('client:player-moved', data => {
		socket.broadcast.emit('server:player-moved', players.get(socket.id));
		players.set(data.id, {
			posX: data.posX,
			posY: data.posY,
			ammo: data.ammo,
			name: data.name
		});
	});

	socket.on('client:game-over', id => {
		players.delete(id);
		console.log(`player ${id} game-over`)
		socket.broadcast.emit('server:game-over', id);
	})

	socket.on('client:zombie-moved', data => {
		socket.broadcast.emit('server:zombie-moved', zombies.get(data.id));
		zombies.set(data.id, {
			posX: data.posX,
			posY: data.posY,
			playerId: data.playerId
		});
	});

	socket.on('disconnect', () => {
		players.delete(socket.id);
		io.emit('server:player-disconnected', socket.id);
	});

	socket.on('client:missile-fired', (data) => { 

		socket.broadcast.emit('server:missile-moved', missiles.get(socket.id));
		missiles.set(data.id, {
			posX: data.posX,
			posY: data.posY,
			velocityX: data.velocityX,
			velocityY: data.velocityY,
			itemName: data.itemName
		})
	});
	socket.on('client:give-me-zombies', () => {
		let allZombies = zombies.get();
		socket.emit('server:all-zombies', allZombies);
	})

	socket.on('client:ask-to-create-zombie', (playerId) => {
		let boss = false;
		if(zombies.getKillCount()%20 === 19) boss = true;
		if (zombies.getLength() < 10) {
			let newZombie = zombies.add(newZombieId(), playerId, boss);
			io.emit('server:zombie-added', newZombie);
		}
		return;
	})

	socket.on('client:ask-to-create-player', (data) => {
		let newPlayer = players.add(data.id, data.name);
		io.emit('server:player-added', newPlayer)
	})

	socket.on('client:ask-to-create-missile', (data) => {
		let newMissile = missiles.add(data.id, data.posX, data.posY, data.itemName, data.toX, data.toY, data.damage);
		io.emit('server:missile-added', newMissile);
	});

	socket.on('client:kill-this-zombie', id => {
		zombies.delete(id);
		zombies.setKillCount();
		io.emit('server:kill-this-zombie', id);
	})

});

//creating new zombie id
function newZombieId() {
	let id = new Date();
	return id.getTime();
}

//500 error middleware
app.use(function (err, req, res, next) {
	console.error(err);
	console.error(err.stack);
	res.status(err.status || 500).send(err.message || 'Internal server error.');
});