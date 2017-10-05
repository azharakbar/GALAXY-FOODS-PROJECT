'use strict'

const 	Bill = require('../models/bill'),
		Order = require('../models/order'),
		Log = require('../models/log')

var stkService = function( startDate , endDate ){
	return new Promise((resolve,reject)=>{
		Log.find({$and:[{ createdDate : {$gte : startDate }},{ createdDate : {$lte : endDate }},{ category : { $eq : "STOCK" } }]})
		.then(function(logResponse){
				resolve ( { 'status' : true , 'details' : logResponse } )
			},function(err){
				reject ( { 'status' : false , 'details' : err } )
			})
	})
}
var trxnService = function( startDate , endDate ){
	return new Promise((resolve,reject)=>{
		Log.find({$and:[{ createdDate : {$gte : startDate }},{ createdDate : {$lte : endDate }},{ category : { $eq : "TRANSACTION" } }]})
		.then(function(logResponse){
				resolve ( { 'status' : true , 'details' : logResponse } )
			},function(err){
				reject ( { 'status' : false , 'details' : err } )
			})
	})
}
var deliService = function( orderId ){
	return new Promise((resolve,reject)=>{
		Order.findOne({ orderId : orderId })
		.then(function(orderResponse){
				resolve ( { 'status' : true , 'details' : orderResponse } )
			},function(err){
				reject ( { 'status' : false , 'details' : err } )
			})
	})
}
var billService = function( billId ){
	return new Promise((resolve,reject)=>{
		Bill.findOne({ billId : billId },'-_id')
		.then(function(billResponse){
			Log.find({$and:[{
				"category" : "TRANSACTION"
			},{
				"details.id" : { $eq : billId } 
			}]},
			'readableDate details.type details.paid details.status details.remAmount details.amount details.totalCredit -_id')
			.then(function(logResponse){
				var result = {
					billResponse : billResponse,
					logResponse : logResponse
				}
				resolve ( { 'status' : true , 'details' : result } )
			},function(err){
				reject ( { 'status' : false , 'details' : err } )	
			})
		},function(err){
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

module.exports.stkService  = stkService 
module.exports.trxnService = trxnService
module.exports.deliService = deliService
module.exports.billService = billService