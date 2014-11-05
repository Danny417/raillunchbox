var express = require('express'),
	passport = require('passport'),
	passportLocal = require('passport-local'),
	bodyParser = require('body-parser'),
	helper = require('./utility'),
	config = require('./config'),
	db = require('./datastore');
var router = express.Router();

router.get('/', function(req, res) {
	if(!req.isAuthenticated()) {
		res.render('login', {msg:'Please login to book an EV.', type:'warning'});
	} else {
		res.render('book', {msg:''});
	}
}); 

router.post('/', function(req, res) {
	passport.authenticate('local', function(err, user, info) {
		if(err) {
			helper.log('ERROR', err);
			return res.render('login', {msg:'Error has occured. Please contact the system administrator.',type:'danger'});
		}
		if(!user) {
			helper.log('INFO', 'User login failed.');
			return res.render('login', {msg:'Incorrect username or password.',type:'warning'});
		}
		req.logIn(user, function(err) {
			if(err) {
				helper.log('ERROR', err);
				return res.render('login', {msg:'Error has occured. Please contact the system administrator.',type:'danger'});
			}
			res.render('book', {msg:''});
		});
	})(req, res); 
});

router.post('/reserve', function(req, res) {
	if(!req.isAuthenticated()) {
		res.render('login', {msg:'Please login to book an EV.', type:'warning'});
	} else {
		console.log(req.body);
		res.send({msg:"An vehicle is reserved."});
	}
});

module.exports = router;
