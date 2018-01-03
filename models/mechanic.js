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
    ]
  });

  return Mechanic;
};