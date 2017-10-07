'use strict'

const	express = require('express'),
		reportRouter = express.Router(),
		request = require('request'),
		reportController = require('../controllers/reportController')

reportRouter.route('/stockReport')
	.get((req,res)=>{
		reportController.genStockReport( JSON.parse( req.query.data ) )
		.then((dataInput)=>{
			request(dataInput).pipe(res)
		},(err)=>{
			console.log(`ERROR DURING STOCK-REPORT GENERATION ${err}`)
			res.send("REPORT COULDN'T BE GENERATED....PLS CONTACT ADMINISTRATOR")
		})
	})

reportRouter.route('/transactionReport')
	.get((req,res)=>{
		reportController.genTransactionReport( JSON.parse( req.query.data ) )
		.then((dataInput)=>{
			request(dataInput).pipe(res)
		},(err)=>{
			console.log(`ERROR DURING TRANSACTION-REPORT GENERATION ${err}`)
			res.send("REPORT COULDN'T BE GENERATED....PLS CONTACT ADMINISTRATOR")
		})
	})

reportRouter.route('/deliveryNote')
	.get((req,res)=>{
		reportController.genDeliveryNote( req.query.orderId )
		.then((dataInput)=>{
			request(dataInput).pipe(res)
		},(err)=>{
			console.log(`ERROR DURING DELIVERY-NOTE GENERATION ${err}`)
			res.send("REPORT COULDN'T BE GENERATED....PLS CONTACT ADMINISTRATOR")
		})
	})

reportRouter.route('/invoice')
	.get((req,res)=>{
		reportController.genInvoice( req.query.billId )
		.then((dataInput)=>{
			request(dataInput).pipe(res)
		},(err)=>{
			console.log(`ERROR DURING BILL GENERATION ${err}`)
			res.send("REPORT COULDN'T BE GENERATED....PLS CONTACT ADMINISTRATOR")
		})
	})


module.exports = reportRouter