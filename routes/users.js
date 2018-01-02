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
	models.User.findOne({ where: { id: req.session.user.id }, include: [{ model: models.WishlistItem, attributes: ['GameId'] }]}).then(function(user) { res.send(user) });
});

router.get('/:id', function(req, res) {
	var scoreInfo = [
		{ model: models.Game }
	]
	if(req.session.user) {
		if(req.query.deep) {
			scoreInfo[0].include = [ { model: models.Mechanic }, { model: models.Category }, { model: models.Designer } ]
		}
		scoreInfo.push(
			{ model: models.GameplayScore, as: 'Scores', include: [
				{ model: models.User, as: 'Player' }
			] }
		);
	}
	var	gameplays = 
		{
			model: models.GameplayScore, as: 'Scores', include: [
				{
					model: models.Gameplay,
					include: scoreInfo
				}
			]
		}
	var	wishlistitems = 
		{
			model: models.WishlistItem, include: [
				{
					model: models.Game
				}
			]
		}
	models.User.findOne({
		where: { id: req.params.id},
		include: [ gameplays, wishlistitems ]
	}).then(function(user) { res.jsonp(user) });
});

router.get('/search/:name', function(req, res) {
	var games = models.User.findAll({ where: { full_name: { $like: '%' + req.params.name + '%' } } }).then(function(users) { res.jsonp(users) });
})

module.exports = router;
