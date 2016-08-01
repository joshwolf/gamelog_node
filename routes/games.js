var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();

var bgg_options = {
  timeout: 10000, // timeout of 10s (5s is the default)

  // see https://github.com/cujojs/rest/blob/master/docs/interceptors.md#module-rest/interceptor/retry
  retry: {
    initial: 100,
    multiplier: 2,
    max: 15e3
  }
}

var bgg = require('bgg')(bgg_options);

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