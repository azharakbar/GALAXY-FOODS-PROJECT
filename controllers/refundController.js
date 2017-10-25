'use strict'

const	refundService = require('../services/refundService'),
        logger = require('./logger')

let refundList = () => {
	return new Promise((resolve,reject)=>{
		refundService.getRefundList()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

let newRefund = ( detailsForRefund ) => {
	return new Promise((resolve,reject)=>{
		refundService.saveNewRefund( detailsForRefund )
		.then((response)=>{
			response.logObj = []
			let objToSave = {
				category : 'REFUND' ,
				details : {
					type : 'NEW REFUND GENERATION',
					refundId : response.details.refundId,
					amount : response.details.amount
				}
			}
			logger.logSave( objToSave )
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}


module.exports = {
    'refundList' : refundList,
    'newRefund' : newRefund
}