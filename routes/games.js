var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var util = require('util');
var auth = require('../config/auth');
var session = require('express-session')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
console.log(Op);

router.get('/:id', function(req, res) {
	if(req.params.id.indexOf(',') > 0) {
		var game_ids = req.params.id.split(',');
		models.Game.findAll({ where: { id: { [Op.in]: game_ids }}, include: [ models.Designer, models.Mechanic, models.Category, models.Gameplay ]})
			.then(function(games) { res.jsonp(games); })
	} else {
		models.Game.getOrFindByBggId(req.params.id, function(game) { res.jsonp(game); });
	}
});

router.get('/plays/:id', function(req, res) {
	models.Gameplay.findAll({ where: { GameId: req.params.id }, include: [models.Game, {model: models.User, as: 'Creator'},{model: models.GameplayScore, as: 'Scores', include: [{model:models.User, as: 'Player'}]}]}).then(function(gameplays) { res.jsonp(gameplays); });
});

router.get('/search/:title/:exact*?', function(req, res) {
	var exact = req.params.exact || 0;
	var games = models.Game.findByTitle(req.params.title, req.params.exact, function(games) { res.jsonp(games); });
});
module.exports = router;
