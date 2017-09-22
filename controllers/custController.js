'use strict'

const 	custService = require('../services/custService'),
		logger = require('./logger')

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
			logger.logSave( objToSave )
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
		custService.delCustomer( contact )
		.then((response)=>{
			let objToSave = {
				category : 'CUSTOMER' ,
				details : {
					type : 'CUSTOMER DELETION',
					contact : contact
				}
			}
			logger.logSave( objToSave )
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})	
}

var updateCustomer = function( customerForUpdate , updateData ){
	return new Promise((resolve,reject)=>{
		let objToSave = {
			category : 'CUSTOMER' ,
			details : {
				type : 'CUSTOMER UPDATE',
				changes : []
			}
		}
		let customerForLog = JSON.parse(JSON.stringify(customerForUpdate))
		if ( customerForUpdate.contact !== updateData.contact ){
			customerExists( updateData.contact )
			.then((response)=>{
				if ( response.status ){
					resolve ( { status : !response.status , details : response.details } )
				} else {
					custService.updateCustomer( customerForUpdate, updateData )
					.then((response)=>{
						objToSave.details.changes = logger.changesForLog ( customerForLog , updateData , ['name','contact'] )
						logger.logSave( objToSave )
						resolve(response)
					},(err)=>{
						reject(err)
					})		
				}			
			},(err)=>{
				reject(err)
			})
		} else {
			custService.updateCustomer( customerForUpdate , updateData )			
			.then((response)=>{
				objToSave.details.changes = logger.changesForLog ( customerForLog , updateData , ['name','contact'] )
				logger.logSave( objToSave )
				resolve(response)
			},(err)=>{
				reject(err)
			})				
		}			
	})
}

module.exports.customerExists = customerExists
module.exports.saveCustomer = saveCustomer  
module.exports.totalCustomers = totalCustomers
module.exports.customerList = customerList
module.exports.deleteCustomer = deleteCustomer
module.exports.updateCustomer = updateCustomer