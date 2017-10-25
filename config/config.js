var localStrategy = require('passport-local').Strategy,
	  hat = require('hat'),
	  User = require('../models/user')

var genConfig = {
	TZ : 'Asia/Kolkata' ,
	secret : 'galaxygalaxy'	,
	host : '127.0.0.1',
	port : '2017',
	debug : 1
}

var dbConfig = {
	db : 'galaxy' , 
	dbUser : encodeURIComponent('galaxyadmin'),
	dbPwd : encodeURIComponent('map1802'),
	dbHost : '127.0.0.1',
	dbPort : '27017',
	authenticationDatabase : 'galaxy',
}

var passportConfig = {
	pass : function(passport){
		passport.serializeUser(function(user, done) {
			done(null, user.id);
		});

		passport.deserializeUser(function(id, done) {
			User.findById(id, function(err, user) {
				done(err, user);
			});
		});

		passport.use('login',new localStrategy({
			userNameField : 'username' ,
			passwordField : 'password',
			passReqToCallback : true
		},function(req,username,password,done){
			User.findOne({ 'username' :  username }, function(err, user) {
				if (err)
					return done(err);

				if (!user)
					return done(null, false); 

				if (!user.checkPassword(password))
					return done(null, false); 

				return done(null, user);
			});
		})
		)		
	}
}

var reportConfig = {
	'stockReport' : 'HkUNSVGn-' ,
	'trxnReport'  : 'BJZrr4G3Z' ,
	'deliNote'    : 'rJUkrNfhZ' ,
	'invoice'     : 'HyXetr73b'
}

module.exports = {
	'genConfig' : genConfig ,
	'dbConfig' : dbConfig ,
	'passportConfig' : passportConfig ,
	'reportConfig' : reportConfig ,
	//'connURI' : "mongodb://"+dbConfig.dbUser+":"+dbConfig.dbPwd+"@"+dbConfig.dbHost+":"+dbConfig.dbPort+"/"+dbConfig.db+"?authSource="+dbConfig.authenticationDatabase 
	 'connURI' : "mongodb://127.0.0.1:27017/galaxy"
}
