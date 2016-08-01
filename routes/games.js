var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/:id', function(req, res) {
	var game = models.Game.getOrFindByBggId(req.params.id);
	res.jsonp(game);
	/*
	bgg('thing', {type: 'boardgame', id: req.params.id })
	  .then(function(results){
	    res.jsonp(results);
	  });*/
});

module.exports = router;