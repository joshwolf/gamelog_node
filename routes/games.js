var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var util = require('util');
var auth = require('../config/auth');
var session = require('express-session')

router.get('/:id', function(req, res) {
	models.Game.getOrFindByBggId(req.params.id, function(game) { res.jsonp(game); });
});

router.get('/plays/:id', function(req, res) {
	models.Gameplay.findAll({ where: { GameId: req.params.id }}).then(function(gameplays) { res.jsonp(gameplays); });
});

router.get('/search/:title/:exact*?', function(req, res) {
	var exact = req.params.exact || 0;
	var games = models.Game.findByTitle(req.params.title, req.params.exact, function(games) { res.jsonp(games); });
})
module.exports = router;
