var config = {}

config.ENV ={};
config.ENV.ISPROD = false;
config.ENV.SESSION_SECRET_KEY = 'secretPassw0rd';
config.ENV.KEYLEN = 64;
config.ENV.CRYPTO_ITERATION = 10000;
config.ENV.WEB_PORT = process.env.WEB_PORT || 80;
config.ENV.PASSWORD_REQ = /^\S*$/; // a string consisting only of non-whitespaces
// /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/; 
//must be at least 8 chars, 1 number, 1 upper and 1 lower case

config.DB = {};
config.DB.host = '127.0.0.1';
config.DB.user = 'root';
config.DB.password = 'Passw0rd';
config.DB.database = 'resturant';
config.DB.connectionLimit  = 10;
config.DB.queueLimit = 20;

module.exports = config;