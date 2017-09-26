'use strict'
const 	express = require('express'),
		orderRouter = express.Router(),
		orderController = require('../controllers/orderController')

orderRouter.route('/total')
	.post((req,res)=>{
		orderController.totalOrders()
		.then(( response )=>{
			console.log(`... RETRIEVED TOTAL ORDER COUNT : ${response.details} ...`)
			res.json({status : 'SXS' , count : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING TOTAL ORDER COUNT RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

orderRouter.route('/list')
	.post((req,res)=>{
		orderController.orderList()
		.then(( response )=>{
			console.log(`... RETRIEVED ORDER LIST ...`)
			res.json({status : 'SXS' , result : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING ORDER LIST RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

orderRouter.route('/pickup')
	.post((req,res)=>{
		orderController.orderPickUp( req.body.dataObj , req.body.orderId )
		.then(( response )=>{
			console.log(`... ORDER PICKUP COMPLETE --> ${response.details.orderId} ...`)
			res.json({status : "SXS"})
		},( err )=>{
			console.log(`--- ERROR DURING ORDER DELIVERY ${err.details} ---`)
			res.json({status : 'ERROR'})
		})	
	})

orderRouter.route('/return')
	.post((req,res)=>{
		orderController.orderReturn( req.body.dataObj , req.body.orderId )
		.then(( response )=>{
			console.log(`... ORDER RETURN COMPLETE --> ${response.details.orderId} ...`)
			res.json({status : "SXS"})
		},( err )=>{
			console.log(`--- ERROR DURING ORDER RETURN ${err.details} ---`)
			res.json({status : 'ERROR'})
		})	
	})

orderRouter.route('/cancel')
	.post((req,res)=>{
		orderController.orderCancel( req.body.orderId )
		.then(( response )=>{
			console.log(`... ORDER CANCEL COMPLETE --> ${response.details.orderId} ...`)
			res.json({status : "SXS"})
		},( err )=>{
			console.log(`--- ERROR DURING ORDER CANCEL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})	
	})

module.exports = orderRouter
