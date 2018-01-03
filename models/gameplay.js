var _ = require('lodash');
var gamelogUtils = require('../lib/gamelogUtils');

module.exports = function(sequelize, DataTypes) {
  var Gameplay = sequelize.define("Gameplay", {
			play_date: DataTypes.DATE
		}, {
		  indexes: [
				{
				  fields: ['play_date']
				}
		  ]
		});
	Gameplay.associate = function(models) {
		Gameplay.hasMany(models.GameplayScore, {as: 'Scores'});
		Gameplay.belongsTo(models.User, {as: 'Creator'});
		Gameplay.belongsTo(models.Game);
	}
  Gameplay.prototype.getFacebookPostTitle = function() {
		var winners = _.map(_.filter(this.Scores, { rank:1 }), function(score) { return score.Player.full_name; });
		return gamelogUtils.humanizeList(winners) + ' won a game of ' + this.Game.title + '!';
	}
  return Gameplay;
};