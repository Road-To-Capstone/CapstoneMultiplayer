const config = require('./config'); 
module.exports = new (class Zombies{
	constructor(){
		this.zombies = [];
	}
	add(id,roomNo){
		this.zombies.push({id,
			posX: config.game.start.x,
			posY: config.game.start.y
		});
	}
	get(id){
		for(let i=0; i<this.zombies.length; i++)
			if(this.zombies[i].id == id) return this.zombies[i];
		return this.zombies;
	}
	set(id, json){
		this.zombies = this.zombies.map((e)=>{
			if(e.id == id){ //search the player with a specified id
				Object.keys(json).forEach((k)=>{ //loop through all values that need to be modified
					e[k] = json[k]; 
				});
			}
			return e;
		});
	}
	delete(id){
		for(let i=0; i<this.zombies.length; i++)
			if(this.zombies[i].id == id) this.zombies.splice(i,1);
	}
});