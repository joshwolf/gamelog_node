module.exports = function(sequelize, DataTypes) {
  var GameplayScore = sequelize.define("GameplayScore", {
	points: DataTypes.INTEGER
	}, {
	  indexes: [
	    {
	      fields: ['points']
	    }
	  ],
	  classMethods: {
	  	associate: function(models) {
	  		GameplayScore.belongsTo(models.User, {as: 'Player'});
	  	}
	  }
	});
  return GameplayScore;
};