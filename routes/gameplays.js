var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var util = require('util');
var authConfig = require('../config/auth');
var session = require('express-session')
var jwt = require('jsonwebtoken');

function loggedIn(req, res, next) {
    if (session.user) {
        next();
    } else if (req.body.token) {
    	console.log(req.body.token);
		jwt.verify(req.body.token, authConfig.jwt.secret, function(err, decoded) {
		  if(decoded) {
		  	console.log(decoded);
		  	next();
		  } else {
		  	res.status(401).send('You must be logged in');
		  }
		});
    } else {
        res.status(401).send('You must be logged in');
    }
}

router.get('/all', function(req, res) {
	models.Gameplay.findAll().then(function(gameplays) { res.jsonp(gameplays); });
});

router.get('/:id', function(req, res) {
	models.Gameplay.find({where: {id: req.params.id}, include: [models.Game, {model: models.User, as: 'Creator'},{model: models.GameplayScore, as: 'Scores', include: [{model:models.User, as: 'Player'}]}]}).then(function(gameplay) { res.jsonp(gameplay); });
});

router.post('/new', loggedIn, function(req, res) {
	gameplay_data = req.body.data;
	if (gameplay_data.play_date && gameplay_data.scores) {
		var gameplay = models.Gameplay.create({
			play_date: gameplay_data.play_date,
			GameId: gameplay_data.game_id,
			CreatorId: gameplay_data.creator_id,
			scores: []
		}).then(function(gameplay) {
			_.forEach(gameplay_data.scores, function(score) {
				var gameplay_score = models.GameplayScore.create({
					points: score.points,
					PlayerId: score.player.id,
					GameplayId: gameplay.id
				})
			});
			gameplay.save();
		});
	}
});

router.get('/search/:title/:exact*?', function(req, res) {
	var exact = req.params.exact || 0;
	var games = models.Game.findByTitle(req.params.title, req.params.exact, function(games) { res.jsonp(games); });
})
module.exports = router;
