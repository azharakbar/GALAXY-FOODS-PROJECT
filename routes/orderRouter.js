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

module.exports = orderRouter
