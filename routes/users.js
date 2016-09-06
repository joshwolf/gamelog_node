'use strict';

var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var util = require('util');
var session = require('express-session')

function loggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send('You must be logged in');
    }
}

router.get('/me', loggedIn, function(req, res) {
	models.User.findById(req.session.user.id).then(function(user) { res.send(user) });
});

router.get('/:id', function(req, res) {
	var scoreInfo = [
		{ model: models.Game }
	]
	if(req.session.user) {
		scoreInfo.push(
			{ model: models.GameplayScore, as: 'Scores', include: [
				{ model: models.User, as: 'Player' }
			] }
		);
	}
	var	gameplays = [
		{
			model: models.GameplayScore, as: 'Scores', include: [
				{
					model: models.Gameplay,
					include: scoreInfo
				}
			]
		}
	];
	models.User.findOne({
		where: { id: req.params.id},
		include: gameplays
	}).then(function(user) { res.jsonp(user) });
});

router.get('/search/:name', function(req, res) {
	var games = models.User.findAll({ where: { full_name: { $like: '%' + req.params.name + '%' } } }).then(function(users) { res.jsonp(users) });
})

module.exports = router;
