'use strict'
const 	express = require('express'),
		billRouter = express.Router(),
		billController = require('../controllers/billController'),
		custController = require('../controllers/custController')

billRouter.route('/total')
	.post((req,res)=>{
		billController.totalBills()
		.then(( response )=>{
			console.log(`... RETRIEVED TOTAL BILL COUNT : ${response.details} ...`)
			res.json({status : 'SXS' , count : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING TOTAL BILL COUNT RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

billRouter.route('/list')
	.post((req,res)=>{
		billController.billList()
		.then(( response )=>{
			console.log(`... RETRIEVED BILL LIST ...`)
			res.json({status : 'SXS' , result : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING BILL LIST RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

billRouter.route('/pay')
	.post((req,res)=>{		
		billController.billExists( req.body.billId )
		.then(( response )=>{
			if ( !response.status ){
				console.log(`... BILL NOT FOUND : ${req.body.billId} ...`)
				res.json({status : 'ERROR'})
			} else { 
				return billController.billPaymentStatus( response.details.billId )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR BILL REDUNDANCY ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			if ( response.status ){
				return billController.billPay( response.details , req.body )
			} else {
				console.log(`--- BILL PAYMENT ALREADY COMPLETED ${req.body.billId } --> ${response.details} ---`)
				res.json({status : 'ERROR'})
			}
		},( err )=>{
			console.log(`--- ERROR DURING BILL STATUS CHECK ${req.body.billId } --> ${err} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			console.log(`... BILL PAYMENT SXSFUL : ${response.details.billId} --> ${response.details.totalPaid} --> ${response.details.status} ...`)
			return custController.reduceCredit( response.details.customer , req.body.paid , response.logObj )
		},( err )=>{
			console.log(`--- ERROR DURING BILL PAYMENT ${err} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			console.log(`... CUSTOMER DEBIT SXSFUL : ${response.details.name} --> ${response.details.contact} --> ${response.details.credit} ...`)
			res.json({status : 'SXS'})
		},( err )=>{
			console.log(`--- ERROR DURING UPDATING CUSTOMER DEBIT ${err} ---`)
			res.json({status : 'ERROR'})
		})		
	})

billRouter.route('/save')
	.post((req,res)=>{
		let incomingDataObj = JSON.parse( req.body.finalObj )
		billController.newBill( incomingDataObj.billSchema )
	})


module.exports = billRouter