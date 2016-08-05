'use strict';

var express = require('express');
var path = require('path');
var app = express();
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var logger = require('morgan');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var session = require('express-session')
var models = require("./models");
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var authConfig = require('./config/auth');
var cookie = require('cookie');
var util = require('util');

//For testing
module.exports = app;

/* Route Imports */
var games = require('./routes/games');
var users = require('./routes/users');

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
app.use(express.static(__dirname + '/public/app'));
app.use('/bower_components', express.static(__dirname + '/public/bower_components'));
app.use(passport.initialize());
app.use(passport.session());

//Facebook auth
passport.use(new Strategy({
    clientID: authConfig.facebookAuth.clientID,
    clientSecret: authConfig.facebookAuth.clientSecret,
    callbackURL: authConfig.facebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
      // find the user in the database based on their facebook id
      models.User.findOrCreate({ where: {full_name: profile.displayName} })
        .spread(function(user, created) {
          //set all of the facebook information in our user model
          user.facebook_id = user.facebook_id || profile.id;
          user.updateFromFacebook(accessToken);
          session.user = user;
          session.token = user.getToken();
          done(null,user);
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

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

app.set('port', process.env.PORT || 3000);


app.use('/api/game', games);
app.use('/api/user', users);
app.get(['/login/facebook','/login'],
  passport.authenticate('facebook', {}),
  function(req, res, next) {
    next();
  });

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login/boo' }),
  function(req, res, next) {
    // Successful authentication, redirect home.
    next();
  });

app.get('/logout', function(req, res) {
  req.logout();
  session.user = null;
  res.redirect('/');
});

app.get('/*', function(req, res) {
  if(session.token) {
    res.setHeader('Set-Cookie', cookie.serialize('token', session.token, {
      maxAge: 60 * 60 * 24 * 60 // 60 days
    }));
  }
  var cookies = cookie.parse(req.headers.cookie || '');
  var payload = jwt.decode(cookies.token, authConfig.jwt.secret);
  var now = new Date();

  if (now > payload.exp) {
    res.setHeader('Set-Cookie', cookie.serialize('token', null));
  }

  res.sendFile(__dirname + '/public/app/index.html')
});

models.sequelize.sync().then(function () {
  var server = app.listen(app.get('port'));
});
