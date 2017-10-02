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
		detailsForBill.remAmount = detailsForBill.billAmount
		billService.saveNewBill( detailsForBill )
		.then((response)=>{
			response.logObj = []
			let objToSave = {
				category : 'BILL' ,
				details : {
					type : 'NEW BILL GENERATION',
					billId : response.details.billId,
					amount : response.details.billAmount
				}
			}
			response.logObj.push( objToSave )
			objToSave = {
				category : 'TRANSACTION' ,
				details : {
					type : 'CREDIT',
					id : response.details.billId ,
					amount : response.details.billAmount ,
					name : response.details.name ,
					contact : response.details.customer
				}
			}
			response.logObj.push( objToSave )
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var cancelBill = function( billId ){
	return new Promise((resolve,reject)=>{
		billService.cancelBill( billId )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var updateCustomerData = function( customer , updateCustomerData ){
	billService.updateCustomerData( customer , updateCustomerData )
	.then((response)=>{
		console.log(`--- updateCustomerData of billController SXSFULLY COMPLETED ---`)
	},(err)=>{
		console.log(`--- ERROR DURING updateCustomerData of billController ${err.details} ---`)
	})
}

var genStkLossBill = function( name , customer , amount ){
	return new Promise((resolve,reject)=>{
		var detailsForBill = {}
		billService.totalBillCount()
		.then((response)=>{
			detailsForBill.billId = pad((response.details)+1)
			detailsForBill.billDate = new Date()
			detailsForBill.customer = customer
			detailsForBill.orderId = "LOSS OF STOCK"
			detailsForBill.billAmount = amount
			detailsForBill.remAmount = amount
			detailsForBill.name = name
			billService.saveNewBill( detailsForBill )
			.then((response)=>{
				resolve(response)
			},(err)=>{
				reject(err)
			})
		},(err)=>{
			reject(err)
		})
	})	
}

	var pad = function( num ){
		while ( num.toString().length < 5 )
			num = "0" + num ; 
		num = "PC"+num
		return num ;
	}

module.exports.billExists = billExists
module.exports.totalBills = totalBills
module.exports.billList = billList
module.exports.billPaymentStatus = billPaymentStatus
module.exports.billPay = billPay
module.exports.newBill = newBill
module.exports.cancelBill = cancelBill
module.exports.updateCustomerData = updateCustomerData
module.exports.genStkLossBill = genStkLossBill