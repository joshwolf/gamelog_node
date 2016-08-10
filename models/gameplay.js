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
	  		Gameplay.belongsTo(models.User, {as: 'Creator'});
	  		Gameplay.belongsTo(models.Game);
	  	}
	  }
	});
  return Gameplay;
};