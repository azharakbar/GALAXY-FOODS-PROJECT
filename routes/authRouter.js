'use strict'
const 	express = require('express'),
		loginRouter = express.Router(),
		logoutRouter = express.Router(),
		authFailureRouter = express.Router(),
		passport = require('passport') ,
		config = require('../config/config'),
		authController = require('../controllers/auth')

config.passportConfig.pass(passport);

loginRouter.route('/')
	.post((req,res,next)=>{
		console.log("***LOGIN***")
		passport.authenticate('login', function(err, user, info) {
			if (err){ 
				return next(err); 
			}
			if ( !user ){ 
				return res.redirect('http://127.0.0.1:2017/loginFailure');
			}
			req.logIn(user, function(err) {
				if (err){
					return next(err);
				}
				var obj = authController.loginCtrl()
				req.session.token = obj.token ;	
				return res.json( obj ) ;
			});
		})(req, res, next);	
	})

logoutRouter.route('/')
	.post((req,res)=>{
		console.log(`***LOGOUT***`)   
		req.session.destroy()
		req.logout()
		var obj = authController.logoutCtrl()
		res.json( obj )
	})

authFailureRouter.route('/')
	.get((req,res)=>{
		console.log(`***LOGINFAILURE***`);
		var obj = authController.authFailureCtrl()
		res.json( obj );		
	})

module.exports.loginRouter = loginRouter
module.exports.logoutRouter = logoutRouter
module.exports.authFailureRouter = authFailureRouter