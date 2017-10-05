'use strict'

const	reportService = require('../services/reportService'),
		dateConverter = require('./dateConverter'),
		reportConfig  = require('../config/config').reportConfig

var dataObj = {
	template : { shortid : undefined },
	options : {
		preview : true
	}
}
var options = {
	uri : "http://127.0.0.1:1802/api/report" ,
	method : 'POST'
}

var incData = {} ;

var genStockReport = function( incData ){
	return new Promise((resolve,reject)=>{
		var startDate = dateConverter.dateReset( new Date( incData.startDate ) , "dayStart" )
		incData.startDate = dateConverter.dateConverter1( new Date( incData.startDate ) )

		var endDate = dateConverter.dateReset( new Date( incData.endDate ) , "dayEnd" )
		incData.endDate = dateConverter.dateConverter1( new Date( incData.endDate ) )

		reportService.stkService( startDate , endDate )
		.then((response)=>{
			incData.stkItems = response.details
			dataObj.template.shortid = reportConfig.stockReport
			dataObj.data = incData
			options.json = dataObj
			resolve(options)
		},(err)=>{
			reject(err)
		})
	})
}
var genTransactionReport = function( incData ){
	return new Promise((resolve,reject)=>{
		var startDate = dateConverter.dateReset( new Date( incData.startDate ) , "dayStart" )
		incData.startDate = dateConverter.dateConverter1( new Date( incData.startDate ) )

		var endDate = dateConverter.dateReset( new Date( incData.endDate ) , "dayEnd" )
		incData.endDate = dateConverter.dateConverter1( new Date( incData.endDate ) )

		reportService.trxnService( startDate , endDate )
		.then((response)=>{
			incData.stkItems = response.details
			dataObj.template.shortid = reportConfig.trxnReport
			dataObj.data = incData
			options.json = dataObj
			resolve(options)
		},(err)=>{
			reject(err)
		})
	})
}
var genDeliveryNote = function( orderId ){
	return new Promise((resolve,reject)=>{
		reportService.deliService( orderId )
		.then((response)=>{
			for ( let key in response.details )
				incData[key] = response.details[key]
			dataObj.data = incData
			dataObj.template.shortid = reportConfig.deliNote
			options.json = dataObj
			resolve(options)
		},(err)=>{
			reject(err)
		})
	})
}
var genInvoice = function( billId ){
	return new Promise((resolve,reject)=>{
		reportService.billService( billId )
		.then((response)=>{
			for ( let key in response.details.billResponse )
				incData[key] = response.details.billResponse[key]
			dataObj.data = {'incData' : incData , 'logData' : response.details.logResponse}
			dataObj.template.shortid = reportConfig.invoice
			options.json = dataObj
			resolve(options)
		},(err)=>{
			reject(err)
		})
	})
}

module.exports.genStockReport = genStockReport
module.exports.genTransactionReport = genTransactionReport
module.exports.genDeliveryNote = genDeliveryNote
module.exports.genInvoice = genInvoice
