var nconf = require('nconf');
var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var util = require('util');
var authConfig = require('../config/auth');
var session = require('express-session')
var jwt = require('jsonwebtoken');
var initCacher = require('sequelize-redis-cache');
var redis = require('redis');

var redisClient  = redis.createClient(nconf.get('REDIS_PORT'), nconf.get('REDIS_SERVER'));
if (nconf.get('REDIS_AUTH')) {
	redisClient.auth(nconf.get('REDIS_AUTH'));
}

var cacher = initCacher(models.sequelize, redisClient);

var gameplayCache = cacher('Gameplay')
  .ttl(5);

function loggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else if (req.body.token) {
		jwt.verify(req.body.token, authConfig.jwt.secret, function(err, decoded) {
		  if(decoded) {
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

router.post('/new', loggedIn, function(req, res) {
	gameplay_data = req.body.data;
	if (gameplay_data.play_date && gameplay_data.scores) {
		//create any new users
		var new_users = _.filter(gameplay_data.scores, (score) => !score.player.id);
		return models.sequelize.transaction(function (t) {
			var promises = [];
			_.each(gameplay_data.scores, function(score) {
				if(!score.player.id) {
					var newPromise =  models.User.findOrCreate({ where: {
							full_name: score.player.full_name, 
							first_name: score.player.first_name,
							last_name: score.player.last_name
						},transaction: t})
						.spread(function(user) { score.player = user; });
					promises.push(newPromise);
				}
			});
			return Promise.all(promises);
		})
		.then(function(result) {
			var gameplay = models.Gameplay.create({
				play_date: gameplay_data.play_date,
				GameId: gameplay_data.game_id,
				CreatorId: gameplay_data.creator_id,
				Scores: _.map(gameplay_data.scores, function(score) { return { points: score.points, rank: score.rank, PlayerId: score.player.id }; })
			}, { include: {model: models.GameplayScore, as: 'Scores'}})
			.then(function(gameplay) {
				gameplay.save().then(function(gameplay) { gameplay.reload({ include: [{model: models.GameplayScore, as: 'Scores', include: [{model: models.User, as: 'Player'}] }] }).then(function(scores) { res.jsonp(gameplay); }); });
			});
		})
		.catch(function(error) { console.log(error); });
	}
});

router.get('/search/:title/:exact*?', function(req, res) {
	var exact = req.params.exact || 0;
	var games = models.Game.findByTitle(req.params.title, req.params.exact, function(games) { res.jsonp(games); });
});

router.get('/my/recent', loggedIn, function(req, res) {
	var time_ago = new Date() - (180 * 24 * 60 * 60 * 1000);
	models.User.findById(req.session.user.id).then(function(user) {
		user.getScores({
			include: [ {
				model: models.Gameplay,
				where: {
					play_date: { $gt: time_ago }
				},
				order: [['play_date','DESC']],
				include: [ 
					{
						model: models.GameplayScore, as: 'Scores', include: [ {
							model: models.User, as: 'Player'
						}]
					},
					{
						model: models.Game, as: 'Game', include: [ { model: models.Category, as: 'Categories' }, { model: models.Mechanic, as: 'Mechanics' }, { model: models.Designer, as: 'Designers' }]
					}
				]
			} ]
		})
		.then(function(scores) { res.jsonp(scores); });
	});
});

router.get('/recent', function(req,res) {
	var time_ago = new Date() - (180 * 24 * 60 * 60 * 1000);
	var included_models = [{
		model: models.Game
	}];
	if (req.session.user) {
		included_models.push(
			{
				model: models.GameplayScore, as: 'Scores', include: [ {
					model: models.User, as: 'Player'
				}]
			}
		);
	}
	models.Gameplay.findAll({
		where: {
			play_date: { $gt: time_ago }
		},
		order: [['play_date','DESC']],
		include: included_models
	})
	.then(function(row) {
		res.send(row); // sequelize db object
	});
});


router.get('/:id', function(req, res) {
	models.Gameplay.find({where: {id: req.params.id}, include: [models.Game, {model: models.User, as: 'Creator'},{model: models.GameplayScore, as: 'Scores', include: [{model:models.User, as: 'Player'}]}]})
		.then(function(gameplay) {
			res.jsonp(gameplay);
		});
});

module.exports = router;
