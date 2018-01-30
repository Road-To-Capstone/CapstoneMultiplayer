const config = require('./config'); 
module.exports = new (class Missiles{
	constructor(){
		this.missiles = {};
	}
	get(){
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