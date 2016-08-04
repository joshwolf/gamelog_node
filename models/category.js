module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define("Category", {
	bgg_id: DataTypes.INTEGER,
	title: DataTypes.STRING
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
	  classMethods: {
	  	associate: function(models) {
	  		//Category.belongsToMany(models.Game, {through: 'GameCategory'});
	  	}
	  }
	});
  return Category;
};