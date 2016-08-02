var _ = require('lodash');
var configAuth = require('../config/auth');
var FB = require('fb'),
    fb = new FB.Facebook({appId: configAuth.facebookAuth.clientID, appSecret: configAuth.facebookAuth.clientSecret});

module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define("User", {
		facebook_id: DataTypes.BIGINT,
		first_name: DataTypes.STRING,
		last_name: DataTypes.STRING,
		full_name: DataTypes.STRING,
		email: DataTypes.STRING,
		profile_pic: DataTypes.STRING
		}, {
	  	indexes: [
	  		{
	  			fields: ['full_name'],
	  			unique: true
	  		}
	  	],
  	    instanceMethods: {
			updateFromFacebook: function(accessToken) {
				FB.setAccessToken(accessToken);
				var user = this;
				FB.api(this.facebook_id.toString(), {}, function (res) {
				  if(!res || res.error) {
				    console.log(!res ? 'error occurred' : res.error);
				    return;
				  }
				  user.first_name = res.first_name;
				  user.last_name = res.last_name;
				  user.full_name = res.name;
				  user.email = res.email;
				  user.profile_pic = 'http://graph.facebook.com/' + user.facebook_id.toString() + '/picture';
				  user.save();
				});
				return user;
			},
			getFriends: function(accessToken) {
				FB.setAccessToken(accessToken);
				FB.api(this.facebook_id.toString() + '/friends', {}, function (res) {
					_.each(res.data, function(friend) {
						 User.findOrCreate({ where: {full_name: friend.name} })
				        .spread(function(user, created) {
				          //set all of the facebook information in our user model
				          user.facebook_id = friend.id;
				          user.updateFromFacebook(accessToken);
				        });
					})
				});
			}
		},
		classMethods: {
		}
	});

	return User;
}

