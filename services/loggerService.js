const Log = require('../models/log')

var loggerService = ( logObjToSave ) => {
	return new Promise((resolve,reject)=>{
		var logObj = new Log() 
		logObj.category = logObjToSave.category
		logObj.details = logObjToSave.details
		logObj.readableDate = logObjToSave.readableDate
		logObj.save()
		.then(()=>{
			resolve({ 'status' : 'SXS' })
		},()=>{
			reject({ 'status' : 'ERR' })
		})
	})
}

module.exports = loggerService