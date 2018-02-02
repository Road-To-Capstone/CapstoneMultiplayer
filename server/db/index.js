const Sequelize = require('sequelize');
const db = new Sequelize(
    process.env.DATABASE_URL ||
    'postgres://localhost:5432/deathRoad', {
    logging: false
  }
)

const Score = db.define('Score', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    score: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Score;