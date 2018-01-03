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
	  ]
	});
  return Category;
};