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
								{ status : { $in : [ "NOT PICKED UP" , "PICKED UP" ] } } ,
								{ $or : [
											{
												$and : [
														{ pickupDate : { $gt : _pickupDate } } ,
														{ pickupDate : { $lt : _returnDate } }
													   ]
											},
											{
												$and : [
														{ returnDate : { $gt : _pickupDate } } ,
														{ returnDate : { $lt : _returnDate } }
													   ]
											},
											{
												$and : [
														{ pickupDate : { $lt : _pickupDate } } ,
														{ returnDate : { $gt : _returnDate } }
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

module.exports.saveNewOrder = saveNewOrder
module.exports.totalOrderCount = totalOrderCount
module.exports.getOrderList = getOrderList
module.exports.findPossessionDetails = findPossessionDetails
module.exports.getOrderPrediction = getOrderPrediction