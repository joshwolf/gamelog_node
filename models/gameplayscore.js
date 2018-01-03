module.exports = function(sequelize, DataTypes) {
  var GameplayScore = sequelize.define("GameplayScore", {
		points: DataTypes.FLOAT,
		rank: DataTypes.INTEGER
	}, {
	  indexes: [
	    {
	      fields: ['points']
	    }
	  ]
	});
	GameplayScore.associate = function(models) {
		GameplayScore.belongsTo(models.User, {as: 'Player'});
		GameplayScore.belongsTo(models.Gameplay);
	}
  return GameplayScore;
};