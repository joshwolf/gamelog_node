'use strict';

var _ = require('lodash');
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var util = require('util');
var session = require('express-session')

function loggedIn(req, res, next) {
    if (session.user) {
        next();
    } else {
        res.status(401).send('You must be logged in');
    }
}

router.get('/me', loggedIn, function(req, res) {
	models.User.findById(session.user.id).then(function(user) { res.send(user) });
});

router.get('/:id'), loggedIn, function(req, res) {
	res.send(null);
}

module.exports = router;
