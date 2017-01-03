'use strict';

require('newrelic');

var express = require('express');
var nconf = require('nconf');
var path = require('path');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var server = require('http').Server(app);
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var models = require("./models");
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var authConfig = require('./config/auth');
var cookie = require('cookie');
var util = require('util');
var dateFormat = require('dateformat');

//For testing
module.exports = app;


// Config
nconf.argv()
   .env()
   .file({ file: 'config/env.json' });

/* Route Imports */
var games = require('./routes/games');
var gameplays = require('./routes/gameplays');
var users = require('./routes/users');

var app = express();

app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public/app'));
app.use('/bower_components', express.static(__dirname + '/public/bower_components'));
app.set('view engine', 'pug');

var redisClient  = redis.createClient(nconf.get('REDIS_PORT'), nconf.get('REDIS_SERVER'));
if (nconf.get('REDIS_AUTH')) {
	redisClient.auth(nconf.get('REDIS_AUTH'));
}

var appHost = nconf.get('GAMELOG_HOST');

app.use(session({
		secret: 'secretstash',
		// create new redis store.
		store: new redisStore({ host: nconf.get('REDIS_SERVER'), port: nconf.get('REDIS_PORT'), client: redisClient,ttl :  (60 * 60 * 24 * 14)}),
		saveUninitialized: false,
		resave: false,
		secure: false
}));

app.use(passport.session());

//Facebook auth
passport.use(new FacebookStrategy({
		clientID: nconf.get('GAMELOG_FB_APP_ID'),
		clientSecret: nconf.get('GAMELOG_FB_APP_SECRET'),
		callbackURL: nconf.get('GAMELOG_FB_CALLBACK_URL'),
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {
			// find the user in the database based on their facebook id
			models.User.findOrCreate({ where: {full_name: profile.displayName} })
				.spread(function(user, created) {
					//set all of the facebook information in our user model
					user.facebook_id = user.facebook_id || profile.id;
					user.updateFromFacebook(accessToken);
					req.session.token = user.getToken();
					done(null,user);
				});
	}
));


// Configure Passport authenticated session persistence.
//f
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
		done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
		models.User.findById(id, function(err, user) {
				done(err, user);
		});
});

app.set('port', process.env.PORT || 8888);

app.get('/r', function(req, res) {
	res.redirect('calshow://');
})

app.use('/api/games', games);
app.use('/api/gameplays', gameplays);
app.use('/api/users', users);
app.get(['/login/facebook','/login'],
	passport.authenticate('facebook', {}),
	function(req, res, next) {
		res.redirect('/');
	});

app.get('/login/facebook/return',
	passport.authenticate('facebook', { failureRedirect: '/login/boo' }),
	function(req, res, next) {
		if(req.user) {
			req.logIn(req.user, function(err) {
				req.session.user = req.user;
				if(req.cookies.next_url) {
					res.redirect(req.cookies.next_url);
				} else {
					// Successful authentication, redirect home.
					next();
				}
			});
			next();
		}
	});

app.get('/logout', function(req, res) {
	req.logout();
	req.session.destroy();
	var next_url = req.cookies.url || '/';
	res.redirect(next_url);
});

app.get('/gameplay/:id', function(req, res) {
	if(req.headers['user-agent'].indexOf('facebookexternalhit') > -1) {
		models.Gameplay.find({where: {id: req.params.id}, order: ['rank'], include: [models.Game, {model: models.User, as: 'Creator'},{model: models.GameplayScore, as: 'Scores', include: [{model:models.User, as: 'Player'}]}]}).then(function(gameplay) {
			if(gameplay) {
				var og_data = {
					"title" : gameplay.getFacebookPostTitle(),
					"type" : "website",
					"image" : "http:" + gameplay.Game.image_thumbnail.replace('_t',''),
					"description" : "Played on " + dateFormat(gameplay.play_date, "shortDate") + ". " + _.map(gameplay.Scores, function(score) { return score.Player.full_name + ": " + score.points; }).join(', '),
					"url" : "http://games.greenlightgo.com/gameplay/" + gameplay.id
				}
				res.render('opengraph', { "og_data" : og_data });
			} else {
				res.send('No such gameplay');
			}
		});
	} else {
		res.sendFile(__dirname + '/public/app/home.html')
	}
});

app.get('/*', function(req, res) {
	//make sure we're on the right domain

	if(req.headers.host != appHost) {
		res.redirect((req.connection.encrypted ? 'https://' : 'http://') + appHost);
	}
	if(req.session && req.session.token) {
		res.cookie('user', req.session.user,  {
			path: '/',
			maxAge: 60 * 60 * 24 * 60 // 60 days
		});
		res.cookie('token', req.session.token,  {
			path: '/',
			maxAge: 60 * 60 * 24 * 60 // 60 days
		});
	}
	var cookies = cookie.parse(req.headers.cookie || '');
	var payload = jwt.decode(cookies.token, authConfig.jwt.secret);
	var now = new Date();

	if (payload && (now > payload.exp)) {
		res.setHeader('Set-Cookie', cookie.serialize('token', null));
	}

	res.sendFile(__dirname + '/public/app/home.html')
});

models.sequelize.sync().then(function () {
	var server = app.listen(app.get('port'));
});
