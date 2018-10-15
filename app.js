'use strict';

require('newrelic');

var compression = require('compression')
var express = require('express');
var router = express.Router();
var nconf = require('nconf');
var path = require('path');
var _ = require('lodash');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var server = require('http').Server(app);
var session = require('express-session');
var redis = require('redis');
var redisSession = require('node-redis-session');
var models = require("./models");
var passport = require('passport');
var util = require('util');
var dateFormat = require('dateformat');
var cors = require('cors');
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');

var routes = require('./routes/index')

global.__basedir = path.resolve(__dirname);

// Config
nconf.argv()
   .env()
   .file({ file: 'config/env.json' });

var app = express();

app.use(compression());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public/app'));
app.use('/bower_components', express.static(__dirname + '/public/bower_components'));
app.set('view engine', 'pug');

var redisClient;

if(process.env.REDIS_URL != undefined) {
	console.log(process.env.REDIS_URL);
	redisClient = redis.createClient(process.env.REDIS_URL);
//	app.use(redisSession({ redisClient: redisClient }));
}

app.use(passport.session());

app.use('/', routes);


passport.use(new FacebookStrategy({
		clientID: nconf.get('GAMELOG_FB_APP_ID'),
		clientSecret: nconf.get('GAMELOG_FB_APP_SECRET'),
		callbackURL: nconf.get('GAMELOG_FB_CALLBACK_URL'),
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {
			// find the user in the database based on their facebook id
			models.User.findOrCreate({ where: {full_name: profile.displayName} , include: [{ model: models.WishlistItem, attributes: ['GameId'] }] })
				.spread(function(user, created) {
					//turn wishlist into array of game id's
					//set all of the facebook information in our user model
					user.facebook_id = user.facebook_id || profile.id;
					user.updateFromFacebook(accessToken);
					req.session.token = user.getToken();
					done(null,user);
				});
	}
));

passport.use(new FacebookTokenStrategy({
		clientID: nconf.get('GAMELOG_FB_APP_ID'),
		clientSecret: nconf.get('GAMELOG_FB_APP_SECRET'),
		callbackURL: nconf.get('GAMELOG_FB_CALLBACK_URL'),
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {
			// find the user in the database based on their facebook id
			models.User.findOrCreate({ where: {full_name: profile.displayName} , include: [{ model: models.WishlistItem, attributes: ['GameId'] }] })
				.spread(function(user, created) {
					//turn wishlist into array of game id's
					//set all of the facebook information in our user model
					user.facebook_id = user.facebook_id || profile.id;
					user.updateFromFacebook(accessToken);
					req.session.token = user.getToken();
					done(null,user);
				});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
	models.User.findById(id, function(err, user) {
		done(err, user);
	});
});

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};

app.use(cors(corsOption));


module.exports = app;
