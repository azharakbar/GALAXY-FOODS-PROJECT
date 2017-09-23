'use strict'
const 	loggerService = require('../services/loggerService'),
		dateConverter = require('./dateConverter').dateConverter1

var logSave = ( logObjToSave ) => {
	logObjToSave.readableDate = dateConverter(new Date())
	loggerService( logObjToSave )
	.then(()=>{
		console.log("LOGGED")
	},()=>{
		console.log("ERROR IN LOGGING")
	})
}

var changesForLog = ( initialObj , updatedObj , watchList ) => {
	let changes = [] 
	for ( let key in initialObj ){
		if ( (initialObj[key] !== updatedObj[key]) && (watchList.indexOf(key) !== -1) ){
			changes.push({
				"param" : key ,
				"old" : initialObj[key],
				"new" : updatedObj[key]
			})
		}
	}
	return changes
}

module.exports.logSave = logSave
module.exports.changesForLog = changesForLog