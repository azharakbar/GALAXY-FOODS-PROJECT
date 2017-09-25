'use strict'
const 	express = require('express'),
		custRouter = express.Router(),
		custController = require('../controllers/custController')

custRouter.route('/new')
	.post((req,res)=>{
		custController.customerExists( req.body.contact )
		.then(( response )=>{
			if ( response.status ){
				console.log(`... CUSTOMER REDUNDANCY : ${response.details.contact} --> ${response.details.name} ...`)
				return res.json({status : 'REDUNDANT'})
			} else { 
				let detailsForNewCust = {}
				detailsForNewCust.name = req.body.name
				detailsForNewCust.contact = req.body.contact
				return custController.saveCustomer( detailsForNewCust )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR CUSTOMER REDUNDANCY ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			console.log(`... CUSTOMER INSERTED SXSFULLY : ${response.details.name} --> ${response.details.contact} ...`)
			res.json({status : 'SXS'})
		},( err )=>{
			console.log("check2")
			console.log(`--- ERROR DURING SAVING CUSTOMER ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

custRouter.route('/total')
	.post((req,res)=>{
		custController.totalCustomers()
		.then(( response )=>{
			console.log(`... RETRIEVED TOTAL CUSTOMER COUNT : ${response.details} ...`)
			res.json({status : 'SXS' , count : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING TOTAL CUSTOMER COUNT RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

custRouter.route('/list')
	.post((req,res)=>{
		custController.customerList()
		.then(( response )=>{
			console.log(`... RETRIEVED CUSTOMER LIST ...`)
			res.json({status : 'SXS' , result : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING CUSTOMER LIST RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

custRouter.route('/delete/:contact')
	.delete((req,res)=>{
		custController.customerExists( req.params.contact )
		.then(( response )=>{
			if ( !response.status ){
				console.log(`... CUSTOMER NOT FOUND : ${req.params.contact} ...`)
				res.json({status : 'ERROR'})
			} else { 
				return custController.deleteCustomer( req.params.contact )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR CUSTOMER ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			console.log(`... CUSTOMER DELETED SXSFULLY : ${req.params.contact} ...`)
			res.json({status : 'SXS'})
		},( err )=>{
			console.log(`--- ERROR DURING DELETING CUSTOMER ${err.details} ---`)
			res.json({status : 'ERROR'})
		})		
	})

custRouter.route('/update/:contact')
	.put((req,res)=>{
		custController.customerExists( req.params.contact )
		.then(( response )=>{
			if ( !response.status ){
				console.log(`... CUSTOMER NOT FOUND : ${req.params.contact} ...`)
				res.json({status : 'ERROR'})
			} else { 
				return custController.updateCustomer( response.details , req.body )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR CUSTOMER ${err} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			if ( response.status ){
				console.log(`... CUSTOMER UPDATED SXSFULLY ...`)
				res.json({status : 'SXS'})
			} else {
				console.log(`... CUSTOMER REDUNDANCY FOUND WITH NEW DETAIL: ${response.details.contact} --> ${response.details.name} ...`)
				res.json({status : 'REDUNDANT'})				
			}
		},( err )=>{
			console.log(`--- ERROR DURING UPDATING CUSTOMER ${err} ---`)
			res.json({status : 'ERROR'})
		})	
	})

module.exports = custRouter