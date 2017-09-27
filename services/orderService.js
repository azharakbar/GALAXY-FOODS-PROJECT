'use strict'

const Order = require('../models/order')

var saveNewOrder = function( detailsForOrder ){
	return new Promise((resolve,reject)=>{
		let order = new Order()
		for ( let key in detailsForOrder )
			order[key] = detailsForOrder[key]
		order.save()
		.then(( orderResponse )=>{
			resolve ( { 'status' : true , 'details' : orderResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var totalOrderCount = function(){
	return new Promise((resolve,reject)=>{
		Order.count()
		.then(( count )=>{
			resolve ( { 'status' : true , 'details' : count } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var getOrderList = function(){
	return new Promise((resolve,reject)=>{
		Order.find( {} , null , {sort : { status : -1 }} )
		.then(( orders )=>{
			resolve ( { 'status' : true , 'details' : orders } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var findPossessionDetails = function( barCodeForSearch ){
	return new Promise((resolve,reject)=>{
		var resObj = []
		var foundItemDetails = {}
		Order.find({status : { $eq: 'PICKED UP' } }, 'name customer items pickupDate returnDate -_id' )
		.then(function(orders){
			for( var i = 0 ; i < orders.length ; ++i ){
				for( var j = 0 ; j < orders[i].items.length ; ++j ){
					if ( orders[i].items[j].barCode === barCodeForSearch ){
						foundItemDetails = {} ;
						foundItemDetails.custName = orders[i].name ;
						foundItemDetails.custContact = orders[i].customer ;
						foundItemDetails.pickupDate = orders[i].pickupDate ;
						foundItemDetails.returnDate = orders[i].returnDate ;
						foundItemDetails.qty = orders[i].items[j].qty ;
						resObj.push( foundItemDetails )
					}
				}
			}
			resolve ( { 'status' : true , 'details' : resObj } )
		},function(err){
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var getOrderPrediction = function( _pickupDate , _returnDate ){
	return new Promise((resolve,reject)=>{
		Order.find( { $and : [
								{ status : { $in : [ "NOT DELIVERED" , "DELIVERED" ] } } ,
								{ $or : [
											{
												$and : [
														{ pickupDate : { $gte : _pickupDate } } ,
														{ pickupDate : { $lte : _returnDate } }
													   ]
											},
											{
												$and : [
														{ returnDate : { $gte : _pickupDate } } ,
														{ returnDate : { $lte : _returnDate } }
													   ]
											},
											{
												$and : [
														{ pickupDate : { $lte : _pickupDate } } ,
														{ returnDate : { $gte : _returnDate } }
													   ]
											}
										]
								}
							 ]
					})
		.then((predictedOrderList)=>{
			resolve ( { 'status' : true , 'details' : predictedOrderList } )
		},(err)=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var updateOrderStatus = function ( orderId , updateString ){
	return new Promise((resolve,reject)=>{
		Order.findOne({orderId : orderId})
		.then(function(order){
			order.status = updateString
			order.pickupDate = new Date()
			order.save()
			.then((orderResponse)=>{
				resolve ( { 'status' : true , 'details' : orderResponse } )
			},(err)=>{
				reject ( { 'status' : false , 'details' : err } )
			})
		})
	})
}

var updateCustomerData = function( customer , _updateCustomerData ){
	return new Promise((resolve,reject)=>{
		Order.find({ customer : customer})
		.then((orderList)=>{
			var promiseList = []
			promiseList.length = orderList.length
			for ( var i = 0 ; i < orderList.length ; ++i ){
				orderList[i].name = _updateCustomerData.name
				orderList[i].customer = _updateCustomerData.contact
				promiseList[i] = orderList[i].save()
			}
			Promise.all( promiseList )
			.then(()=>{
				resolve ( { 'status' : true , 'details' : 'updateCustomerData Completed' } )
			},(err)=>{
				reject ( { 'status' : false , 'details' : err } )
			})
		},(err)=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var updateItemData = function( barCode , updateItemData ){
	return new Promise((resolve,reject)=>{
		Order.find({})
		.then((orderList)=>{
			if ( orderList !== null && orderList !== undefined ){
				var promiseList = []
				var itemList = []
				promiseList.length = orderList.length
				for ( var i = 0 ; i < orderList.length ; ++i ){
					itemList = orderList[i].items
					orderList[i].items = []
					for ( var j = 0 ; j < itemList.length ; ++j ){
						if ( itemList[j].barCode !== barCode ){
							orderList[i].items.push( itemList[j] )
						} else {
							var newObj = {
								barCode : updateItemData.barCode,
								name : updateItemData.name,
								qty : itemList[j].qty,
								price : itemList[j].price
							}
							orderList[i].items.push(newObj)
						}
					}
					promiseList[i] = orderList[i].save()
				}
				Promise.all( promiseList )
				.then(()=>{
					resolve ( { 'status' : true , 'details' : 'updateItemData Completed' } )
				},(err)=>{
					reject ( { 'status' : false , 'details' : err } )
				})
			} else {
				resolve ( { 'status' : true , 'details' : 'updateItemData Completed' } )
			}
		},(err)=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

module.exports.saveNewOrder = saveNewOrder
module.exports.totalOrderCount = totalOrderCount
module.exports.getOrderList = getOrderList
module.exports.findPossessionDetails = findPossessionDetails
module.exports.getOrderPrediction = getOrderPrediction
module.exports.updateOrderStatus = updateOrderStatus
module.exports.updateCustomerData = updateCustomerData
module.exports.updateItemData = updateItemData