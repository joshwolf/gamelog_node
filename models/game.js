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
  		}
  	],
    classMethods: {
     /* associate: function(models) {
        Game.hasMany(models.Gameplay)
      }*/
    }
  });

  return Game;
};