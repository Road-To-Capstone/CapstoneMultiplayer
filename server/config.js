const path = require('path');
module.exports = {
	port: process.env.PORT || 3000,
	publicDir: path.join(__dirname, '../public'),
	game: {
		start: {
			x: 400,
			y: 400
		}
	}
}