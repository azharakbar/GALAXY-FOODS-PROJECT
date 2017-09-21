'use strict'

const 	custService = require('../services/custService'),
		logSave = require('./logger')

var customerExists = function( contact ){
	return new Promise((resolve,reject)=>{
		custService.findCustomer( contact )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var saveCustomer = function( details ){
	return new Promise((resolve,reject)=>{
		custService.insertCustomer( details )
		.then((response)=>{
			let objToSave = {
				category : 'CUSTOMER' ,
				details : {
					type : 'NEW CUSTOMER ADDED',
					custName : response.details.name ,
					custContact : response.details.contact
				}
			}			
			logSave( objToSave )
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var totalCustomers = function(){
	return new Promise((resolve,reject)=>{
		custService.totalCustomerCount()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})	
}

var customerList = function(){
	return new Promise((resolve,reject)=>{
		custService.getCustomerList()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})		
}

var deleteCustomer = function( contact ){
	return new Promise((resolve,reject)=>{
		console.log("in ctrlr")
		custService.delCustomer( contact )
		.then((response)=>{
			let objToSave = {
				category : 'CUSTOMER' ,
				details : {
					type : 'CUSTOMER DELETION',
					contact : req.params.contact
				}
			}
			logSave( objToSave )
			console.log(`exiting ctrlr ${response}`)
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})	
}

module.exports.customerExists = customerExists
module.exports.saveCustomer = saveCustomer  
module.exports.totalCustomers = totalCustomers
module.exports.customerList = customerList
module.exports.deleteCustomer = deleteCustomer