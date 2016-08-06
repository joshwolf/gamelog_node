module.exports = function(sequelize, DataTypes) {
  var GameplayScore = sequelize.define("GameplayScore", {
	score: DataTypes.INTEGER
	}, {
	  indexes: [
	    {
	      fields: ['score']
	    }
	  ],
	  classMethods: {
	  	associate: function(models) {
	  	}
	  }
	});
  return GameplayScore;
};