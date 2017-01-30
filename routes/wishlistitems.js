'use strict';

var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var session = require('express-session');

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

router.get('/add/:game_id', loggedIn, function(req, res) {
	models.WishlistLitem.findOrCreate({ where: { UserId: req.session.user.id, GameId: req.params.game_id }})
		.spread(function(wishlistItem, created) {
			if(req.session.user.wishlist.indexOf(wishlistItem.GameId) == -1 ) {
				req.session.user.wishlist.push(wishlistItem.GameId);
			}
			res.jsonp(req.session.user);
		});
});

router.get('/remove/:game_id', loggedIn, function(req, res) {
	models.WishlistLitem.destroy({ where: { UserId: req.session.user.id, GameId: req.params.game_id }})
		.then(function(r) {
			res.jsonp(r);
		});
})

module.exports = router;
