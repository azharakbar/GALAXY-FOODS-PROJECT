'use strict'

const Refund = require('../models/refund')

let getRefundList = () => {
	return new Promise((resolve,reject)=>{
		Refund.find( {} , null , {sort : { status : -1 }} )
		.then(( refunds )=>{
			resolve ( { 'status' : true , 'details' : refunds } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

let saveNewRefund = ( detailsForRefund ) => {
	return new Promise((resolve,reject)=>{
		let refund = new Refund()
		for ( let key in detailsForRefund )
			refund[key] = detailsForRefund[key]
		refund.save()
		.then(( refundResponse )=>{
			resolve ( { 'status' : true , 'details' : refundResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

module.exports = {
    'getRefundList' : getRefundList,
    'saveNewRefund' : saveNewRefund
}