'use strict'

const 	orderService = require('../services/orderService'),
		custController = require('./custController'),
		itemController = require('./itemController'),
		billController = require('./billController'),
	 	dateConverter = require('./dateConverter'),
		logger = require('./logger')

var orderExists = function( billId ){
	return new Promise((resolve,reject)=>{
		orderService.findOrder( orderId )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var newOrder = function( detailsForOrder , logObj ){
	return new Promise((resolve,reject)=>{
		detailsForOrder['pickupDate'] = dateConverter.dateReset( new Date( detailsForOrder['pickupDate'] ) )
		detailsForOrder['returnDate'] = dateConverter.dateReset( new Date( detailsForOrder['returnDate'] ) )
		orderService.saveNewOrder( detailsForOrder )
		.then((response)=>{
			let objToSave = {
				category : 'ORDER' ,
				details : {
					type : 'NEW ORDER PLACEMENT',
					number : response.details.orderId,
					itemCount : response.details.items.length,
					name : response.details.name,
					contact : response.details.customer
				}
			}
			logObj[0].details.orderId = response.details.orderId
			logObj.push( objToSave )
			response.logObj = logObj
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var totalOrders = function(){
	return new Promise((resolve,reject)=>{
		orderService.totalOrderCount()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var orderList = function(){
	return new Promise((resolve,reject)=>{
		orderService.getOrderList()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var findDetails = function( barCode ){
	return new Promise((resolve,reject)=>{
		orderService.findPossessionDetails( barCode )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var findOrdersForecast = function( pickupDate , returnDate ){
	return new Promise((resolve,reject)=>{
		dateConverter.dateReset( pickupDate )
		dateConverter.dateReset( returnDate )
		orderService.getOrderPrediction( pickupDate , returnDate )
		.then((response)=>{
			resolve( response )
		},(err)=>{
			reject ( err )
		})
	})
}

var orderPickUp = function( dataObj , orderId ){
	return new Promise((resolve,reject)=>{
		let list = JSON.parse ( dataObj )
		let updateItemsForPickup = [] ;
		var objToSave = {}
		updateItemsForPickup.length = list.length
		let v = 0 ;
		for ( var i = 0 ; i < list.length ; ++i ){
			updateItemsForPickup[i] =
			itemController.deliverStock( list[i].barCode , list[i].qty )
			.then((response)=>{
				objToSave = {
					category : 'STOCK' ,
					details : {
						type : 'DELIVERY',
						orderId : orderId ,
						barCode : response.details.barCode ,
						name : response.details.name ,
						qty : response.details.lastVal ,
						status : response.details.availableStock + " / " + response.details.totalStock
					}
				}
				console.log(`... DELIVERED ${response.details.name} --> ${response.details.lastVal} --> ${orderId} ..`)
				logger.logSave( objToSave )
			},(err)=>{
				reject ( err )
			})
		}
		Promise.all( updateItemsForPickup )
		.then(()=>{
			orderService.updateOrderStatus( orderId , "DELIVERED" )
			.then((response)=>{
				objToSave = {
					category : "ORDER",
					details : {
						type : "ORDER DELIVERY",
						number : response.details.orderId,
						itemCount : response.details.items.length,
						name : response.details.name,
						contact : response.details.customer
					}
				}
				logger.logSave( objToSave )
				console.log(`... ORDER DELIVERED TO ${response.details.name} --> ${response.details.customer} ...`)
				resolve( response )
			},(err)=>{
				reject(err)
			})
		},(err)=>{
			res.json({status : 'ERROR'})
		})
	})
}

var orderReturn = function( dataObj , orderId ){
	return new Promise((resolve,reject)=>{
		let list = JSON.parse ( dataObj )
		let updateItemsForReturn = [] ;
		var objToSave = {}
		updateItemsForReturn.length = list.length
		let v = 0 ;
		for ( var i = 0 ; i < list.length ; ++i ){
			updateItemsForReturn[i] =
			itemController.returnStock( list[i].barCode , list[i].qty )
			.then((response)=>{
				objToSave = {
					category : 'STOCK' ,
					details : {
						type : 'RETURN',
						orderId : orderId ,
						barCode : response.details.barCode ,
						name : response.details.name ,
						qty : response.details.lastVal ,
						status : response.details.availableStock + " / " + response.details.totalStock
					}
				}
				console.log(`... RETURNED ${response.details.name} --> ${response.details.lastVal} --> ${orderId} ..`)
				logger.logSave( objToSave )
			},(err)=>{
				reject ( err )
			})
		}
		Promise.all( updateItemsForReturn )
		.then(()=>{
			orderService.updateOrderStatus( orderId , "RETURNED" )
			.then((response)=>{
				objToSave = {
					category : "ORDER",
					details : {
						type : "ORDER RETURN",
						number : response.details.orderId,
						itemCount : response.details.items.length,
						name : response.details.name,
						contact : response.details.customer
					}
				}
				logger.logSave( objToSave )
				console.log(`... ORDER RETURNED FROM ${response.details.name} --> ${response.details.customer} ...`)
				resolve( response )
			},(err)=>{
				reject(err)
			})
		},(err)=>{
			res.json({status : 'ERROR'})
		})
	})
}

var orderCancel = function( orderId ){
	return new Promise((resolve,reject)=>{
		var objToSave = {}
		orderService.updateOrderStatus( orderId , "CANCELLED" )
		.then((orderResponse)=>{
			objToSave = {
				category : "ORDER",
				details : {
					type : "ORDER CANCELLATION",
					number : orderResponse.details.orderId,
					name : orderResponse.details.name,
					contact : orderResponse.details.customer
				}
			}
			logger.logSave( objToSave )
			console.log(`... ORDER CANCELLED : ${orderResponse.details.orderId} ...`)
			billController.cancelBill( orderResponse.details.billId )
			.then((billResponse)=>{
				objToSave = {
					category : 'BILL' ,
					details : {
						type : 'BILL CANCELLATION',
						number : billResponse.details.billId,
						name : billResponse.details.name,
						contact : billResponse.details.customer
					}
				}
				logger.logSave( objToSave )
				console.log(`... BILL CANCELLED : ${billResponse.details.billId} --> ${billResponse.details.name} ...`)
				custController.cancelOrder( billResponse.details.customer , billResponse.details.billAmount )
				.then((response)=>{
					objToSave = {
						category : 'TRANSACTION' ,
						details : {
							type : 'CNL',
							id : billResponse.details.billId,
							amount : -(billResponse.details.billAmount),
							totalCredit : response.details.credit,
							name : response.details.name,
							contact : response.details.contact
						}
					}
					logger.logSave( objToSave )
					console.log(`... ORDER CANCELLED FROM ${response.details.name} --> ${response.details.contact} ...`)
					response.details.orderId = orderResponse.details.orderId
					resolve( response )
				},(err)=>{
					reject(err)
				})
			},(err)=>{
				reject(err)
			})
		},(err)=>{
			reject(err)
		})
	})
}

var updateCustomerData = function( customer , updateCustomerData ){
	orderService.updateCustomerData( customer , updateCustomerData )
	.then((response)=>{
		console.log(`--- updateCustomerData of orderController SXSFULLY COMPLETED ---`)
	},(err)=>{
		console.log(`--- ERROR DURING updateCustomerData of orderController ${err.details} ---`)
	})
}

var updateItemData = function( barCode , updateItemData ){
/*	console.log("in ctrlt")
		for ( let key in updateItemData )
			console.log(`${key} --> ${updateItemData[key]}`)*/
	orderService.updateItemData( barCode , updateItemData	 )
	.then((response)=>{
		console.log(`--- updateItemData of orderController SXSFULLY COMPLETED ---`)
	},(err)=>{
		console.log(`--- ERROR DURING updateItemData of orderController ${err.details} ---`)
	})
}

module.exports.orderExists = orderExists
module.exports.newOrder = newOrder
module.exports.totalOrders = totalOrders
module.exports.orderList = orderList
module.exports.findDetails = findDetails
module.exports.findOrdersForecast = findOrdersForecast
module.exports.orderPickUp = orderPickUp
module.exports.orderReturn = orderReturn
module.exports.orderCancel = orderCancel
module.exports.updateCustomerData = updateCustomerData
module.exports.updateItemData = updateItemData
