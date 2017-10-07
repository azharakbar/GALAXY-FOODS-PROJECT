'use strict'
const 	config = require('../config/config')

var isLoggedIn = (req, res, next)=>{
	if ( config.genConfig.debug || (req.isAuthenticated() && (req.session.token == req.body.token)) || (req.isAuthenticated() && (req.session.token == req.query.token))){
		return next();		
	} else {
		console.log("ERROR IN AUTHENTICATION")
		console.log(`req.isAuthenticated : ${req.isAuthenticated()}
		Session Token : ${req.session.token}
		Incoming Token: ${req.body.token}`)
		res.json({status : 'AUTH_ERROR'})
	}
}

module.exports = isLoggedIn