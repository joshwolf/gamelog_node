module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define("User", {
		facebook_id: DataTypes.BIGINT,
		name: DataTypes.STRING,
		profile_pic: DataTypes.STRING
	});

	return User;
}

