'use strict';

var express = require('express');
var path = require('path');
var app = express();
var _ = require('lodash');
//var logger = require('morgan');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var session = require('express-session')
var models = require("./models");
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var configAuth = require('./config/auth');

//For testing
module.exports = app;

/* Route Imports */
var games = require('./routes/games');

var allowCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Authorization,Accept');

    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
};

app.use(allowCORS);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/frontend/public'));
app.use(passport.initialize());
app.use(passport.session());

//Facebook auth
passport.use(new Strategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
      // find the user in the database based on their facebook id
      models.User.findOrCreate({ where: {full_name: profile.displayName} })
        .spread(function(user, created) {
          //set all of the facebook information in our user model
          user.facebook_id = user.facebook_id || profile.id;
          user.updateFromFacebook(accessToken);
          session.current_user = user;
          return cb(null,user);
        });
  }
));


// Configure Passport authenticated session persistence.
//
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


app.set('port', process.env.PORT || 3000);


app.use('/game', games);
app.get(['/login/facebook','/login'],
  passport.authenticate('facebook', {}),
  function(req, res, next) {
    next();
  });

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login/boo' }),
  function(req, res, next) {
    // Successful authentication, redirect home.
    res.send(session.current_user);
    next();
  });

app.get('/logout', function(req, res, next) {
  req.logout();
  res.send({ success: true });
  next();
});

app.get('/', function(req, res, next) {
  res.send('hello');
  next();
});


models.sequelize.sync().then(function () {
  var server = app.listen(app.get('port'));
});
