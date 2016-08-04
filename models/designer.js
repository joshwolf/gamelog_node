module.exports = function(sequelize, DataTypes) {
  var Designer = sequelize.define("Designer", {
    bgg_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['bgg_id'],
        unique: true
      }
    ],
    classMethods: {
      associate: function(models) {
        //Designer.belongsToMany(models.Game, {through: 'GameDesigner'});
      }
    }
  });

  return Designer;
};