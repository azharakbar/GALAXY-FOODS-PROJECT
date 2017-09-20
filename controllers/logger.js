const 	loggerService = require('../services/loggerService')
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

module.exports = logSave