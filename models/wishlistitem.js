var _ = require('lodash');
var gamelogUtils = require('../lib/gamelogUtils');

module.exports = function(sequelize, DataTypes) {
  var WishlistLitem = sequelize.define("WishlistLitem", {
	}, {
	  classMethods: {
		associate: function(models) {
			WishlistLitem.belongsTo(models.User);
			WishlistLitem.belongsTo(models.Game);
		}
	  }
	});
  return WishlistLitem;
};