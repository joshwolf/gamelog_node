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
    ]
  });

  return Designer;
};