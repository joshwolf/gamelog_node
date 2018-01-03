var _ = require('lodash');
var gamelogUtils = require('../lib/gamelogUtils');

module.exports = function(sequelize, DataTypes) {
  var WishlistItem = sequelize.define("WishlistItem", {
	}, {
	});
	WishlistItem.associate = function(models) {
		WishlistItem.belongsTo(models.User);
		WishlistItem.belongsTo(models.Game);
	}
  return WishlistItem;
};