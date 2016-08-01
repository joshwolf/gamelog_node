module.exports = function(sequelize, DataTypes) {
  var GameCategory = sequelize.define("GameCategory", {
    bgg_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    year_published: DataTypes.INTEGER,
    image_thumbnail: DataTypes.STRING    
  }, {
    classMethods: {
     /* associate: function(models) {
        Game.hasMany(models.Gameplay)
      }*/
    }
  });

  return GameCategory;
};