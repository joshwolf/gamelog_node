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
    getterMethods: {
      designers: function() { return _.map(this.Designers, function(designer) { return designer.name; })},
      mechanics: function() { return _.map(this.Mechanics, function(mechanic) { return mechanic.title; })},
      categories: function() { return _.map(this.Categories, function(category) { return category.title; })},
    },
    classMethods: {
	  	associate: function(models) {
        Game.belongsToMany(models.Designer, {through: 'GameDesigner'});
        Game.belongsToMany(models.Mechanic, {through: 'GameMechanic'});
        Game.belongsToMany(models.Category, {through: 'GameCategory'});
	  	},
    	getOrFindByBggId: function(bgg_id, done) {
        var m = require('../models');
		  	Game.findOrCreate({
		  			where: {bgg_id: bgg_id},
            include: [ m.Designer, m.Mechanic, m.Category ]
		  		})
	      	.spread(function(game, created) {
	      		if(created) {
	      			//get from BGG
      				bgg('thing', {id: bgg_id })
    					.then(function(results){
                console.log(results);
  							var models = require('../models');
    						bgg_game = results.items.item;
    						game.title = _.isArray(bgg_game.name) ? _.find(bgg_game.name,{'type':'primary'}).value : bgg_game.name.value;
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
    						game.save().then(function() {
                  if(done) {
                    done(game);
                  }
                });
    					});
	      		} else {
              if(done) {
                done(game);
              } else {
                game;
              }
            }
		  	});
		  },
      getByBggId: function(bgg_id, done) {
        var m = require('../models');
        Game.findOrCreate({
          where: {bgg_id: bgg_id},
          include: [ m.Designer, m.Category, m.Mechanic ]
        })
        .then(function(game) {
          if(done) {
            done(game);
          }
        })
      },
      findByTitle: function(title, exact, done) {
      	bgg('search', {'exact': exact, 'type': 'boardgame', 'query': title})
        .then(function(results) {
        	var games = results.items.item;
        	if(!_.isArray(games)) {
        		games = [games];
        	}
 	        if(done) {
	 	        done(games);
 	        }
        });
      }
    }
  });

  return Game;
};