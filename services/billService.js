'use strict'

const Bill = require('../models/bill')

var findBill = function( billToSearch ){
	return new Promise((resolve,reject)=>{
		Bill.findOne( {billId : billToSearch} )
		.then(( billResponse )=>{
			if ( billResponse ){
				resolve ( { 'status' : true , 'details' : billResponse } )
			} else {
				resolve ( { 'status' : false , 'details' : null } )
			}
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var billStatusCheck = function( billToSearch ){
	return new Promise((resolve,reject)=>{
		Bill.findOne( {billId : billToSearch} )
		.then(( billResponse )=>{
			if ( billResponse.status !== "PAID" && billResponse.status.indexOf('CANCEL') == -1	 ){
				resolve ( { 'status' : true , 'details' : billResponse } )
			} else {
				resolve ( { 'status' : false , 'details' : billResponse.status } )
			}
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var saveNewBill = function( detailsForBill ){
	return new Promise((resolve,reject)=>{
		let bill = new Bill()
		for ( let key in detailsForBill )
			bill[key] = detailsForBill[key]
		bill.save()
		.then(( billResponse )=>{
			resolve ( { 'status' : true , 'details' : billResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var totalBillCount = function(){
	return new Promise((resolve,reject)=>{
		Bill.count()
		.then(( count )=>{
			resolve ( { 'status' : true , 'details' : count } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var getBillList = function(){
	return new Promise((resolve,reject)=>{
		Bill.find( {} , null , {sort : { status : -1 }} )
		.then(( bills )=>{
			resolve ( { 'status' : true , 'details' : bills } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var billPayment = function( billForPayment ){
	return new Promise((resolve,reject)=>{
		billForPayment.save()
		.then(( billResponse )=>{
			resolve ( { 'status' : true , 'details' : billResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var cancelBill = function( billToCancel ){
	return new Promise((resolve,reject)=>{
		var refundAmt = 0
		Bill.findOne({ billId : billToCancel })
		.then((billResponse)=>{
			refundAmt = billResponse.remAmount - billResponse.billAmount
			billResponse.status = refundAmt ? "CANCELLED & REFUNDED" : "CANCELLED"
			billResponse.lastPaidDate = new Date()
			billResponse.save()
			.then((billResponse)=>{
				resolve ( { 'status' : true , 'details' : billResponse } )
			},(err)=>{
				reject ( { 'status' : false , 'details' : err } )
			})
		},(err)=>{
			reject(err)
		})
	})
}

var updateCustomerData = function( customer , updateCustomerData ){
	return new Promise((resolve,reject)=>{
		Bill.find({ customer : customer})
		.then((billList)=>{
			var promiseList = []
			promiseList.length = billList.length
			for ( var i = 0 ; i < billList.length ; ++i ){
				billList[i].name = updateCustomerData.name
				billList[i].customer = updateCustomerData.contact
				promiseList[i] = billList[i].save()
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

module.exports.findBill = findBill
module.exports.billStatusCheck = billStatusCheck
module.exports.totalBillCount = totalBillCount
module.exports.getBillList = getBillList
module.exports.billPayment = billPayment
module.exports.saveNewBill = saveNewBill
module.exports.cancelBill = cancelBill
module.exports.updateCustomerData = updateCustomerData
