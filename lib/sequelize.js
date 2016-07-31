var Sequelize = require("sequelize");

//ORM
var sequelize = new Sequelize('gamelog', 'gamelog', 'i am a gamer', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

exports.sequelize = sequelize;