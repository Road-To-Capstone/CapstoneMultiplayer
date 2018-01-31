const config = require('./config'); 
module.exports = new (class Missiles{
	constructor(){
		this.missiles = [];
	}
	add(id, posX, posY){
		const newMissile = {id, posX, posY};
		this.missiles.push(newMissile);
		if (this.missiles.length > 10){
			this.missiles.shift()
			this.missiles.shift()
		}
		return newMissile;
	}
	get(id){
		for(let i=0; i<this.missiles.length; i++)
			if(this.missiles[i].id == id) return this.missiles[i];
		return this.missiles;
	}
	set(data){
		this.missiles = data;
    }/*
	delete(id){
		for(let i=0; i<this.missiles.length; i++)
			if(this.missiles[i].id == id) this.missiles.splice(i,1);
	}*/
});