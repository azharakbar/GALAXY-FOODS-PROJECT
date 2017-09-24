'use strict'

const 	billService = require('../services/billService'),
		logger = require('./logger')

var billExists = function( billId ){
	return new Promise((resolve,reject)=>{
		billService.findBill( billId )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var totalBills = function(){
	return new Promise((resolve,reject)=>{
		billService.totalBillCount()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})	
}

var billList = function(){
	return new Promise((resolve,reject)=>{
		billService.getBillList()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})		
}

var billPaymentStatus = function( billId ){
	return new Promise((resolve,reject)=>{
		billService.billStatusCheck( billId )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var billPay = function( billForPayment , paymentData ){
	return new Promise((resolve,reject)=>{
		let objToSave  = {
			category : "TRANSACTION",
			details : {
				type : "DEBIT" ,
				id : billForPayment.billId ,
				paid : Math.round( parseFloat(paymentData.paid) )
			}
		}
		billForPayment.totalPaid += Math.round( parseFloat(paymentData.paid) )
		billForPayment.remAmount -= Math.round( parseFloat(paymentData.paid) )
		if ( billForPayment.remAmount < 1 ){
			billForPayment.remAmount = 0 
			billForPayment.status = "PAID"
		}
		else{
			billForPayment.status = "ADVANCE PAYMENT"
		}
		billForPayment.lastPaidDate = new Date()	
		billService.billPayment( billForPayment )
		.then((response)=>{
			if ( response.details.status === "PAID" )
				objToSave.details.status = "BILL SETTLED"
			else{
				objToSave.details.status = "PAYMENT REMAINING"
				objToSave.details.remAmount = response.details.remAmount
			}
			response.logObj = objToSave
			resolve(response)
		},(err)=>{
			reject(err)
		})			
	})
}

var newBill = function( detailsForBill ){
	return new Promise((resolve,reject)=>{
		billService.saveNewBill( detailsForBill )
		.then((response)=>{
			//INSERT LOGGING HERE
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

module.exports.billExists = billExists
module.exports.totalBills = totalBills
module.exports.billList = billList
module.exports.billPaymentStatus = billPaymentStatus
module.exports.billPay = billPay
module.exports.newBill = newBill