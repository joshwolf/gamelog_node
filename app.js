'use strict';

var express = require('express');
var path = require('path');
var app = express();
var _ = require('lodash');
var logger = require('morgan');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
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

app.use(logger('dev'));
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
    // asynchronous
          console.log(profile);

        // find the user in the database based on their facebook id
        models.User.findOrCreate({ where: {facebook_id: profile.id} })
          .spread(function(user, created) {
            console.log(JSON.stringify(user));
            // set all of the facebook information in our user model
            user.facebook_id = profile.id; // set the users facebook id                   
            user.name = profile.displayName;
            user.profile_pic = profile.profileUrl;
            console.log(JSON.stringify(user));
            // save our user to the database
            user.save(function(err) {
                if (err)
                    throw err;

                // if successful, return the new user
                return done(null, user);
            });
        });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


app.set('port', process.env.PORT || 3000);


app.use('/game', games);
app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['user_friends'] }));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });



models.sequelize.sync().then(function () {
  var server = app.listen(app.get('port'));
});
