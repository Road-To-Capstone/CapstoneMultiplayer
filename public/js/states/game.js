import Phaser from 'phaser';
import socketio from 'socket.io-client';
import Player from './../player';
import Missile from './../missile'

var map,layer, missileGroup, zombieGroup, singleMissile;
export default class GameState extends Phaser.State{
	constructor(){
		super();
	}
	preload(){
		this.doneLoading = 0; //this is 1 at the end of createOnConnection
		this.load.tilemap('BaseMap', './assets/BaseMap.json', null, Phaser.Tilemap.TILED_JSON)
		this.load.image('tiles', './assets/tiles.png')
		this.load.image('player', './assets/playerplaceholder.jpg')
		this.load.image('building', './assets/buildingplaceholder.jpg')
		this.load.image('missile', '/assets/missileplaceholder.png')
	}
	create(){
		this.setUpMap()
		//this.setupMissilesGroup()
		this.io = socketio.connect();
		this.io.on('connect', data=>{
			this.createOnConnection(data);
		});

		//singleMissile = new Missile(this)


	   
	}
	update(){
		if(this.doneLoading){
			const player = this.getPlayerById(this.io.id);
			this.io.emit('client:player-moved', {
				id:this.io.id,
				//posX: player.sprite.worldPosition.x,
				//posY: player.sprite.worldPosition.y,
				posX: player.sprite.x,
				posY: player.sprite.y
				//angle: player.sprite.angle
			});
			
			this.getPlayerById(this.io.id).update();

			this.topText.setText(`Your ID: ${this.io.id}
				${this.players.length} players
				posX: ${Math.floor(player.sprite.worldPosition.x)}
				posY: ${Math.floor(player.sprite.worldPosition.y)}
			`);
			if (this.input.activePointer.isDown) {
				this.getMissiles().melee(player.getX(), player.getY(), this.input.activePointer.x,this.input.activePointer.y)
				this.io.emit('client:missile-fired', this.getMissiles())
			}
		}
	}


	/* 
		SETUP FUNCTIONS
	*/
	setUpMap () {
		map = this.add.tilemap('BaseMap')
		map.addTilesetImage('Map tiles.tsx', 'tiles')
		layer = map.createLayer('Tile Layer 1')
		layer = map.createLayer('Tile Layer 2')
		layer = map.createLayer('Tile Layer 3')
		layer.resizeWorld()
	  }

	
	 

	/* 
		SOCKET HELPER FUNCTIONS
	*/
	createOnConnection(data){
		window.players = [];
		this.players = players;

		window.missiles = {};
		this.missiles = missiles;

		this.missiles = new Missile(this)
		window.io = this.io;//meafffdd

		this.socketCreateListeners();

		this.stage.backgroundColor = '#aaa';
		this.physics.startSystem(Phaser.Physics.ARCADE);

	
		this.topText= this.add.text(
	   		10, 
	   		10, 
	   		'', 
	   		{ font: "12px Arial", fill: "rgba(0, 0, 0, 0.64)" });
	   	
	    this.doneLoading = 1;
	}

	socketCreateListeners(){
		const me = this.getPlayerById(this.io.id);
		//load all existing players
	   	this.io.emit('client:give-me-players'); //ask for it
	   	this.io.on('server:all-players',data=>{ //the data is the players from the server side
	   		data.forEach(e=>{
	   			if(e.id != this.io.id) //this will prevent loading our player two times
	   			players.push(new Player(e.id, this, e.posX, e.posY, e.angle));
	   		});
	   	});
		   
		//load your player
	   	this.io.on('server:player-added',data=>{
			console.log(`New ${data.id} added to x: ${data.posX}, y: ${data.posY}`);
	   		players.push(new Player(data.id, this, data.posX, data.posY, data.angle));
	   	});

	   	this.io.on('server:player-disconnected',id=>{ //if a player has disconnected
	   		console.log(`Player ${id} disconnected`);
	   		for(let i=0; i<this.players.length; i++) //loop through all players
				if(this.players[i].id == id){ // found the player
					this.players[i].sprite.destroy();//phaser sprite destroy function
					this.players.splice(i,1); //unset from the players array
				}
		});

	   	this.io.on('server:player-moved',data=>{
	   		this.getPlayerById(data.id).setX(data.posX).setY(data.posY);
		});
		   
		this.io.on('server:missile-fired', data => {
			this.missiles = data;
		});
	}

	getPlayerById(id){
		for(let i=0;i<this.players.length;i++)
			if(this.players[i].id == id) return this.players[i];
	}

	getMissiles(){
		return this.missiles;
	}
}