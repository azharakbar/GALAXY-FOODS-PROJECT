'use strict'

const 	orderService = require('../services/orderService'),
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

module.exports.orderExists = orderExists
module.exports.newOrder = newOrder
module.exports.totalOrders = totalOrders
module.exports.orderList = orderList
module.exports.findDetails = findDetails
module.exports.findOrdersForecast = findOrdersForecast