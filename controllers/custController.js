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

var reduceCredit = function( paidCustomer , paidAmout , objToSave ){
	return new Promise((resolve,reject)=>{
		customerExists( paidCustomer )
		.then((custResponse)=>{
			var newCredit = custResponse.details.credit - parseInt( paidAmout )
			var objForUpdate = {
				credit : newCredit
			}
			custService.updateCustomer( custResponse.details , objForUpdate )
			.then((response)=>{
				objToSave.details.name = response.details.name
				objToSave.details.contact = response.details.contact
				objToSave.details.totalCredit = response.details.credit
				logger.logSave( objToSave )
				resolve(response)
			},(err)=>{
				reject(response)
			})
		},(err)=>{
			reject(err)
		})
	})
}

var newOrder = function( detailsForCustomer , objToSave ){
	return new Promise((resolve,reject)=>{
		customerExists( detailsForCustomer.customer )
		.then((custResponse)=>{
			var newCredit = custResponse.details.credit + parseInt( objToSave[0].details.amount )
			var newOrders = custResponse.details.orders + 1 
			var objForUpdate = {
				credit : newCredit ,
				orders : newOrders
			}
			custService.updateCustomer( custResponse.details , objForUpdate )
			.then((response)=>{	
				objToSave[0].details.name = response.details.name
				objToSave[1].details.totalCredit = response.details.credit
				for ( var i = 0 ; i < objToSave.length ; ++i )
					logger.logSave ( objToSave[i]) 
				resolve(response)
			},(err)=>{
				reject(response)
			})			
		},(err)=>{
			reject( err )
		})
	})
}

var cancelOrder = function( contact , refundAmt ){
	return new Promise((resolve,reject)=>{
		custService.cancelBill( contact , refundAmt )
		.then((response)=>{
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
module.exports.updateCustomer = updateCustomer
module.exports.reduceCredit = reduceCredit
module.exports.newOrder = newOrder
module.exports.cancelOrder = cancelOrder
