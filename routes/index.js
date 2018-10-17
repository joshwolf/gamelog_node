'use strict';

var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var passport = require('passport');
var nconf = require ('nconf')
var cookie = require('cookie')
var jwt = require('jsonwebtoken');
var authConfig = require('../config/auth');
var { generateToken, sendToken } = require('../lib/token.utils');
var dateFormat = require('dateFormat')

/* Route Imports */
var games = require('./games');
var gameplays = require('./gameplays');
var users = require('./users');
var wishlistitems = require('./wishlistitems');

nconf.argv()
   .env()
   .file({ file: 'config/env.json' });

var appHost = nconf.get('GAMELOG_HOST');

router.use(function(req, res, next) {
  // .. some logic here .. like any other middleware
  next();
});

router.get('/.well-known/acme-challenge/:content', function (req, res, next) {
		res.send('gQqF2p71zSqFlJsi8aSvZFIwwaGLWBiKQ-q9vwhYauk.dwzy1GrPOQfLqcVavYsbBQfh3_KtWa6-8kwnIJfSL7s')
	})

router.get('/alive', function (req, res, next) {
		res.send('OK');
	})

router.use('/api/games', games);
router.use('/api/gameplays', gameplays);
router.use('/api/users', users);
router.use('/api/wishlistitems', wishlistitems);

router.route('/auth/facebook')
    .post(passport.authenticate('facebook-token', {session: false}), function(req, res, next) {
        if (!req.user) {
            return res.send(401, 'User Not Authenticated');
        }
        req.auth = {
            id: req.user.id
        };

        next();
    }, generateToken, sendToken);

router.get(['/login/facebook','/login'],
	passport.authenticate('facebook', {}),
	function(req, res, next) {
		res.redirect('/');
	});

router.get('/login/facebook/return',
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

router.get('/logout', function(req, res, next) {
	req.logout();
	req.session.destroy();
	var next_url = req.cookies.url || '/';
	res.redirect(next_url);
});

router.get('/gameplay/:id', function(req, res) {
	if(req.headers['user-agent'].indexOf('facebookexternalhit') > -1) {
		models.Gameplay.find(
			{ where: {id: req.params.id},
				include:
					[models.Game,
					{model: models.User, as: 'Creator'},
					{model: models.GameplayScore, as: 'Scores', include: [{model:models.User, as: 'Player'}]}]
			}).then(function(gameplay) {
			if(gameplay) {
				var og_data = {
					"title" : gameplay.getFacebookPostTitle(),
					"type" : "website",
					"image" : (gameplay.Game.image_full.indexOf('http') == 0 ? "" : "http:") + gameplay.Game.image_full,
					"description" : "Played on " + dateFormat(gameplay.play_date, "shortDate") + ". " + _.chain(gameplay.Scores).orderBy('rank').map(function(score) { return score.Player.full_name + ": " + score.points; }).join(', '),
					"url" : "http://games.greenlightgo.com/gameplay/" + gameplay.id
				}
				res.render('opengraph', { "og_data" : og_data });
			} else {
				res.send('No such gameplay');
			}
		});
	} else {
		res.sendFile(__basedir + '/public/app/home.html')
	}
});

router.get('/*', function(req, res, next) {
	//make sure we're on the right domain

	if(req.headers.host != appHost) {
		res.redirect(nconf.get('GAMELOG_ROOT_URL'));
	}
	if(req.session && req.session.token) {
		res.setHeader('Set-Cookie',cookie.serialize('user', JSON.stringify(req.session.user), {
			path: '/',
			maxAge: 60 * 60 * 24 * 60 // 60 days
		}));
		res.setHeader('Set-Cookie',cookie.serialize('token', req.session.token, {
			path: '/',
			maxAge: 60 * 60 * 24 * 60 // 60 days
		}));
	}
	var cookies = cookie.parse(req.headers.cookie || '');
	var payload = jwt.decode(cookies.token, authConfig.jwt.secret);
	var now = new Date();

	if (payload && (now > payload.exp)) {
		res.setHeader('Set-Cookie', cookie.serialize('token', null));
	}

	res.sendFile(__basedir + '/public/app/home.html')
});

module.exports = router;