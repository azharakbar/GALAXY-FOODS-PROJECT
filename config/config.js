const localStrategy = require('passport-local').Strategy,
	  hat = require('hat'),
	  User = require('../models/user')

var genConfig = {
	TZ : 'Asia/Kolkata' ,
	secret : 'galaxygalaxy'	,
	port : '2017'
}

var dbConfig = {
	db : 'galaxy' , 
	dbUser : 'galaxyadmin',
	dbPwd : 'map1802',
	dbHost : '127.0.0.1',
	dbPort : '27017',
	authorizationDatabase : 'galaxy',
}

var passportConfig = {
	pass : function(passport){
		passport.serializeUser(function(user,done){
			done(null,user.id);
		})
		passport.deserializeUser(function(id,done){
			User.findById(id,function(err,user){
				if(!err)
					done(null,user)
			})
		})

		passport.use('local-login',new localStrategy({
			userNameField : 'username' ,
			passwordField : 'password',
			passReqToCallback : true
		},function(req,username,password,done){
			User.findOne({'username':username})
			.then(function(user){
				if(!user){
					return done(null,false)
				}
				else{
					if(!user.checkPassword(password)){
						return done(null,false)
					}
					else{
						req.session.token = hat() ;
						req.session.username = user.username ;
						console.log(`TOKEN SET TO >>>> ${req.session.token}`)
						return done(null,user)
					}
				}
			},function(err){
				return done(err)
			})
		})
		)		
	}
}

module.exports = {
	'genConfig' : genConfig ,
	'dbConfig' : dbConfig ,
	'passportConfig' : passportConfig ,
	'connURI' : "mongodb://"+dbConfig.dbUser+":"+dbConfig.dbPwd+"@"+dbConfig.dbHost+":"+dbConfig.dbPort+"/"+dbConfig.db+"?authSource="+dbConfig.authorizationDatabase 
}