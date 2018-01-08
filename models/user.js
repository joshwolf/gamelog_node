var _ = require('lodash');
var authConfig = require('../config/auth');
var FB = require('fb'),
    fb = new FB.Facebook({appId: authConfig.facebookAuth.clientID, appSecret: authConfig.facebookAuth.clientSecret});
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define("User", {
		facebook_id: DataTypes.BIGINT,
		first_name: DataTypes.STRING,
		last_name: DataTypes.STRING,
		full_name: DataTypes.STRING,
		email: DataTypes.STRING,
		profile_pic: DataTypes.STRING,
		is_admin: DataTypes.BOOLEAN
		}, {
		getterMethods: {
			initials: function()  { if(!this.first_name) { return ''; } return (this.first_name.slice(0,1) + (this.last_name || '').slice(0,1)).toUpperCase(); },
			wishlist: function()  { return _.map(this.WishlistItems, function(item) { return item.GameId; }); }
		},
	  	indexes: [
	  		{
	  			fields: ['full_name'],
	  			unique: true
	  		}
	  	],
	});

  	User.associate = function(models) {
        User.hasMany(models.GameplayScore, { as: 'Scores', foreignKey: 'PlayerId' });
        User.hasMany(models.WishlistItem);
  	}

	User.prototype.updateFromFacebook = function(accessToken) {
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
	}

	User.prototype.getToken = function() {
		var payload = { 'sub': this.id, 'iat': Date.now()};
		var token = jwt.sign(payload, authConfig.jwt.secret, {'issuer': 'gamelog'});
		return token;
	}

	User.prototype.getFriends = function(accessToken) {
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

	User.prototype.getRecentOpponents = function() {
		console.log(models);
		models.GameplayScore.findAll({
			where: {
				Player: this
			}
		}).then(function(scores) {
			console.log(scores);
			return _.map(gameplays, (score) => score.Gameplay);
		});
	}
	return User;
}

