var config = require('./config.js');
var utility = {};

utility.log = function(type, msg) {
	if(!type || !msg) return;
	if(type == 'DEBUG' && config.ENV.ISPROD) return;
	
	var log = (new Date()).toString() + '\n['+type+'] '+
				(msg.stack || JSON.stringify(msg) || msg);
	console.log(log);	
	// TODO: write the log into the next line of log file
	// if the file is too big, create a new log file with a increment number at end of name
}

utility.splitKeyValue = function(map) {
	var keys = [];
	var values = [];

	for (var key in map) {
	   if (!map.hasOwnProperty(key)) {
		  continue;
	   }
	   keys.push(key);
	   values.push(map[key]);
	}
	return {'keys' : keys, 'values' : values};
}

utility.isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

module.exports = utility;