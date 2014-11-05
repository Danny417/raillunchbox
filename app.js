var express = require('express'),
	crypto = require('crypto'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	expressSession = require('express-session'),
	passport = require('passport'),
	passportLocal = require('passport-local'),
	path = require('path'),
	helper = require('./utility'),
	config = require('./config'),
	db = require('./datastore');
var app = express();

// configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// use middleware
app.use('/resources', express.static(path.join(__dirname, '/resources')));
app.use(bodyParser.urlencoded({extended: false})); //to get handle on res.body
app.use(bodyParser.json({extended: false}));
app.use(cookieParser());
app.use(expressSession({ 
	secret: process.env.SESSION_SECRET || config.ENV.SESSION_SECRET_KEY, //set session secret key so people can't guess session id 
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(function(username, password, done) { //middleware get called before route to /login
	db.queryByCol('employee', {key:'username', value:username}, function(err, result) {
		if(err || result.length == 0) {
			done(err, null);
		} else {
			// TODO: check result to make sure it only have 1 record
			var key = crypto.pbkdf2Sync(password, result[0].salt, result[0].iteration, result[0].keyBytes).toString('base64');
			if(key === result[0].token) {
				// TODO: update user last login and ip address
				done(null, result[0]); 
			} else {
				done(null, null);
			}
		}	
	});
})); 
passport.serializeUser(function(user, done) { //it only needs id for re-seriailze
	done(null, user.id);
});
passport.deserializeUser(function(id, done) {
	db.queryById('employee', id, function(err, result) {
		if(err) { 
			done(err, null);
		} else {			
			// TODO: check result to make sure it only have 1 record
			done(null, result[0]);			
		}
	});
});

// define routes
app.use(require('./main-routes'));
//app.use('/book', require('./book-routes'));

var server = app.listen(config.ENV.WEB_PORT, function() {
	helper.log('INFO', 'listening to port '+config.ENV.WEB_PORT);
});

