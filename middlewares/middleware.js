'use strict'
const 	config = require('../config/config')

var isLoggedIn = (req, res, next)=>{
	if ( !config.genConfig.debug ){
		console.log(`${req.isAuthenticated()}     token: ${req.session.token}`)
	} else {
		console.log("** IN DEBUG MODE **")
	}
	console.log(`INCOMING IP : ${req.ip}`)
	if ( config.genConfig.debug || (req.isAuthenticated() && (req.session.token == req.body.token))){
		return next();		
	} else {
		console.log("ERROR IN AUTHENTICATION")
		console.log(`req.isAuthenticated : ${req.isAuthenticated()}
		Session Token : ${req.session.token}
		Incoming Token: ${req.body.token}`)
		res.redirect('/');
	}
}

module.exports = isLoggedIn