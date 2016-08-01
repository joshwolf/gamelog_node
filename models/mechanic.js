module.exports = function(sequelize, DataTypes) {
  var Mechanic = sequelize.define("Mechanic", {
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
        Mechanic.belongsToMany(models.Game, {through: 'GameMechanic'});
      }
    }
  });

  return Mechanic;
};