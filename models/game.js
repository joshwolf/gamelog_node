var util = require("util");
var globals = require('../lib/globals');
var _ = require('lodash');
var bgg = require('bgg')(globals.bgg_options);

module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define("Game", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false
    },
    bgg_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    year_published: DataTypes.INTEGER,
    image_thumbnail: DataTypes.STRING,
    image_full: DataTypes.STRING 
  }, {
  	indexes: [
  		{
  			fields: ['title']
  		},
  		{
  			fields: ['bgg_id'],
  			unique: true
  		}
  	]
  });
  Game.prototype.designers = function() { return _.map(this.Designers, function(designer) { return designer.name; })};
  Game.mechanics = function() { return _.map(this.Mechanics, function(mechanic) { return mechanic.title; })};
  Game.prototype.categories = function() { return _.map(this.Categories, function(category) { return category.title; })};
  Game.associate = function(models) {
    Game.belongsToMany(models.Designer, {through: 'GameDesigner'});
    Game.belongsToMany(models.Mechanic, {through: 'GameMechanic'});
    Game.belongsToMany(models.Category, {through: 'GameCategory'});
    Game.hasMany(models.Gameplay);
    Game.hasMany(models.WishlistItem);
  }
  Game.getOrFindByBggId = function(bgg_id, done) {
    var m = require('../models');
    Game.findOrCreate({
        where: {id: bgg_id},
        include: [ m.Designer, m.Mechanic, m.Category, m.Gameplay ]
      })
      .spread(function(game, created) {
        if(created || !game.title || 1 == 1) {
          //get from BGG
          bgg('thing', {id: bgg_id })
          .then(function(results){
            var models = require('../models');
            bgg_game = results.items.item;
            game.bgg_id = bgg_id;
            game.title = _.isArray(bgg_game.name) ? _.find(bgg_game.name,{'type':'primary'}).value : bgg_game.name.value;
            game.year_published = bgg_game.yearpublished.value || 1900;
            game.image_thumbnail = bgg_game.thumbnail;
            game.image_full = bgg_game.image;
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
              game.reload({include: [ m.Designer, m.Mechanic, m.Category, m.Gameplay ]}).then(function() {
                if(done) {
                  done(game);
                }
              });
            });
          });
        } else {
          if(done) {
            console.log(JSON.stringify(game.mechanics))
            done(game);
          } else {
            game;
          }
        }
    });
  }

  Game.getByBggId = function(bgg_id, done) {
    var m = require('../models');
    Game.findOrCreate({
      where: {id: bgg_id},
      include: [ m.Designer, m.Category, m.Mechanic ]
    })
    .then(function(game) {
      if(done) {
        done(game);
      }
    })
  }

  Game.findByTitle = function(title, exact, done) {
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

  Game.prototype.updateImage = function() {

  }
  return Game;
};