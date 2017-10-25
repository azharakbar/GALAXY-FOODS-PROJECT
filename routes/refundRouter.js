'use strict'
const 	express = require('express'),
		refundRouter = express.Router(),
        refundController = require('../controllers/refundController')

refundRouter.route('/list')
    .get((req,res)=>{
		refundController.refundList()
		.then(( response )=>{
			console.log(`... RETRIEVED REFUND LIST ...`)
			res.json({status : 'SXS' , result : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING REFUND LIST RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
    })

refundRouter.route('/new')
    .post((req,res)=>{
		refundController.newRefund( JSON.parse( req.body.refundData)  )
		.then(( response )=>{
			console.log(`... NEW REFUND ITEM ADDED SXSFULLY ...`)
			res.json({status : 'SXS' , result : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING ADDING NEW REFUND ITEM ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
    })
        
module.exports = refundRouter