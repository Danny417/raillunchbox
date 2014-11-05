var express = require('express'),
	passport = require('passport'),
	passportLocal = require('passport-local'),
	crypto = require('crypto'),
	helper = require('./utility'),
	config = require('./config'),
	db = require('./datastore');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('main', {
		isAuthenticated: req.isAuthenticated(),
		user: req.user
	});
}); 
/*
router.get('/login', function(req, res) {
	if(!req.isAuthenticated()) {
		res.render('login', {msg:''});
	} else {
		res.redirect('/');
	}
});*/

router.post('/', function(req, res) {
	passport.authenticate('local', function(err, user, info) {
		if(err) {
			helper.log('ERROR', err);
			return res.render('main', {msg:'系統內部出錯,請聯絡管理員',type:'danger'});
		}
		if(!user) {
			helper.log('INFO', 'User login failed.');
			return res.render('main', {msg:'使用名稱或密碼錯誤',type:'warning'});
		}
		req.logIn(user, function(err) {
			if(err) {
				helper.log('ERROR', err);
				return res.render('main', {msg:'系統內部出錯,請聯絡管理員',type:'danger'});
			}
			return res.redirect('/'); //TODO : redirect to order page
		});
	})(req, res);
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/register', function(req, res) {
	if(req.isAuthenticated()) {
		req.logout();
	} res.render('register', {msg:''});
});

router.post('/register', function(req, res) {
	if(!req.body.username || !req.body.password || !req.body.email) {
		res.render('register', {msg:'Not enough information.', type:'warning'});
	} else if(!config.ENV.PASSWORD_REQ.test(req.body.password)) {
		res.render('register', {msg:'Password does not meet the requirement.', type:'warning'});
	} else {
		var salt = crypto.randomBytes(config.ENV.KEYLEN).toString('base64');
		var key = crypto.pbkdf2Sync(req.body.password, salt, config.ENV.CRYPTO_ITERATION, config.ENV.KEYLEN);
		
		var user = {
			username:req.body.username,
			email:req.body.email,
			token:key.toString('base64'),
			salt:salt,keyBytes:config.ENV.KEYLEN,
			iteration:config.ENV.CRYPTO_ITERATION
		};
		db.insert('employee', [user], function(err, response) {
			if(err) {
				helper.log('DEBUG', err.code);
				if(err.code == 'ER_DUP_ENTRY') {
					res.render('register', {msg:'Username or email has been used.',type:'warning'}); // TODO: need to send message of duplicate user account or email
				} else {
					res.send(err.toString()); // TODO: need to redirect to an error page
				}
			} else {
				res.render('register', {msg:'Your request has been submitted.',type:'info'});
			}
		});
	}
});
module.exports = router;
