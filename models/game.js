var Sequelize = require('sequelize');
var gamelog_db = require('../lib/sequelize');

var Game = gamelog_db.sequelize.define('game', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT
})

Game.sync({force: true}).then(function () {
  // Table created
  return Game.create({
    title: 'Scythe',
    description: 'Hancock'
  });
});
