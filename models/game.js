var util = require("util");
var globals = require('../lib/globals');
var _ = require('lodash');
var bgg = require('bgg')(globals.bgg_options);

module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define("Game", {
    bgg_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    year_published: DataTypes.INTEGER,
    image_thumbnail: DataTypes.STRING   
  }, {
  	indexes: [
  		{
  			fields: ['title']
  		},
  		{
  			fields: ['bgg_id'],
  			unique: true
  		}
  	],
    classMethods: {
	  	associate: function(models) {
	  		Game.belongsToMany(models.Category, {through: 'GameCategory'});
	  		Game.belongsToMany(models.Mechanic, {through: 'GameMechanic'});
	  		Game.belongsToMany(models.Designer, {through: 'GameDesigner'});
	  	},
    	getOrFindByBggId: function(bgg_id) {
		  	Game.findOrCreate({ where: {bgg_id: bgg_id} })
	      	.spread(function(game, created) {
	      		if(created || !created) {
	      			//get from BGG
      				bgg('thing', {type: 'boardgame', id: bgg_id })
  					.then(function(results){
						var models = require('../models');
  						bgg_game = results.items.item;
  						game.title = _.find(bgg_game.name,{'type':'primary'}).value;
  						game.year_published = bgg_game.yearpublished.value || 1900;
  						game.image_thumbnail = bgg_game.thumbnail;
  						_.forEach(bgg_game.link, function(link) {
  							switch(link.type) {
  								case 'boardgamecategory':
  									models.Category.findOrCreate({ where: {bgg_id: link.id, title: link.value}})
  										.spread(function(category, created) {
  											game.addCategory(category);
  										});
  									break;
  								case 'boardgamemechanic':
  									models.Mechanic.findOrCreate({ where: {bgg_id: link.id, title: link.value}})
  										.spread(function(mechanic, created) {
  											game.addMechanic(mechanic);
  										});
  									break;
  								case 'boardgamedesigner':
  									models.Designer.findOrCreate({ where: {bgg_id: link.id, name: link.value}})
  										.spread(function(designer, created) {
  											game.addDesigner(designer);
  										});
  									break;
  							}
  						});
  						game.save();
  					});
	      		}
		  	});
		}
    }
  });

  return Game;
};