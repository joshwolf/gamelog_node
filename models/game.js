module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define("Game", {
    bgg_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    year_published: DataTypes.INTEGER,
    image_thumbnail: DataTypes.STRING   
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
    	getOrFindByBggId: function(bgg_id) {
		  	Game.findOrCreate({ where: {bgg_id: bgg_id} }).then(function(game) {
		  		return game;
		  	});
		}
     /* associate: function(models) {
        Game.hasMany(models.Gameplay)
      }*/
    }
  });

  return Game;
};