module.exports = function(sequelize, DataTypes) {
  var Gameplay = sequelize.define("Gameplay", {
	play_date: DataTypes.DATE
	}, {
	  indexes: [
	    {
	      fields: ['play_date']
	    }
	  ],
	  classMethods: {
	  	associate: function(models) {
	  		Gameplay.hasMany(models.GameplayScore, {as: 'Score'});
	  	}
	  }
	});
  return Gameplay;
};