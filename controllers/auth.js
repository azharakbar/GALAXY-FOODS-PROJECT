'use strict'

const 	logger = require('./logger'),
		md5 = require('md5'),
		uniqid = require('uniqid')

let loginCtrl = ()=>{
	let objToSave = {
		category : 'AUTHENTICATION' ,
		details : {
			type : 'LOGIN',
			username : 'GALAXY' ,
		}
	}
	logger.logSave( objToSave )
	
	let objForResp = {
		status : 'authDone' ,
		username : 'GALAXY',
		role : 'ADMINISTRATOR' ,
		token : md5(uniqid()) 
	}
	return objForResp
}

let logoutCtrl = ()=>{
	var objToSave = {
		category : 'AUTHENTICATION' ,
		details : {
			type : 'LOGOUT',
			username : 'GALAXY' ,
		}
	}
	logger.logSave( objToSave )
	
	var objForResp = { 
		status : 'logOutSuccess' 
	}
	return objForResp
}

let authFailureCtrl = ()=>{
	var objForResp = {
		status : 'loginFailed'
	}
	return objForResp
}

module.exports.loginCtrl = loginCtrl
module.exports.logoutCtrl = logoutCtrl
module.exports.authFailureCtrl = authFailureCtrl