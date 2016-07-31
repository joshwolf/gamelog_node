var _ = require('lodash');
var gamelog_db = require('../lib/sequelize');

var bgg_options = {
  timeout: 10000, // timeout of 10s (5s is the default)

  // see https://github.com/cujojs/rest/blob/master/docs/interceptors.md#module-rest/interceptor/retry
  retry: {
    initial: 100,
    multiplier: 2,
    max: 15e3
  }
}
var Game = require('../models/game.js');
var bgg = require('bgg')(bgg_options);

exports.getGame = function(req, res) {
	bgg('thing', {type: 'boardgame', id: req.params.id })
	  .then(function(results){
	    res.jsonp(results);
	  });
}