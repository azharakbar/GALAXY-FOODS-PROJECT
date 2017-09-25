'use strict'
const 	express = require('express'),
		itemRouter = express.Router(),
		itemController = require('../controllers/itemController')

itemRouter.route('/new')
	.post((req,res)=>{
		if ( parseFloat(req.body.availableStock) > parseFloat(req.body.totalStock) ){
			return res.json({status : "STOCK VALUE ERROR"})
		}
		itemController.itemExists( req.body.barCode )
		.then(( response )=>{
			if ( response.status ){
				console.log(`... ITEM REDUNDANCY : ${response.details.barCode} --> ${response.details.name} ...`)
				res.json({status : 'REDUNDANT'})
			} else { 
				let detailsForNewItem = {}
				detailsForNewItem.barCode = req.body.barCode
				detailsForNewItem.name = req.body.name
				detailsForNewItem.price = req.body.price
				detailsForNewItem.costPrice = req.body.costPrice
				if ( req.body.totalStock !== undefined ){
					detailsForNewItem.totalStock = req.body.totalStock
					if ( req.body.availableStock !== undefined ){
						detailsForNewItem.availableStock = req.body.availableStock 
						detailsForNewItem.rentedStock = parseInt(req.body.totalStock) - parseInt(req.body.availableStock)
					}
				}				
				return itemController.saveItem( detailsForNewItem )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR ITEM REDUNDANCY ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			console.log(`... ITEM INSERTED SXSFULLY : ${response.details.barCode} --> ${response.details.name} ...`)
			res.json({status : 'SXS'})
		},( err )=>{
			console.log(`--- ERROR DURING SAVING ITEM ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

itemRouter.route('/total')
	.post((req,res)=>{
		itemController.totalItems()
		.then(( response )=>{
			console.log(`... RETRIEVED TOTAL ITEM COUNT : ${response.details} ...`)
			res.json({status : 'SXS' , count : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING TOTAL ITEM COUNT RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

itemRouter.route('/list')
	.post((req,res)=>{
		itemController.itemList()
		.then(( response )=>{
			console.log(`... RETRIEVED ITEM LIST ...`)
			res.json({status : 'SXS' , result : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING ITEM LIST RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

itemRouter.route('/details/:barCode')
	.post((req,res)=>{
		itemController.itemExists( req.params.barCode )
		.then(( response )=>{
			if ( !response.status ){
				console.log(`... ITEM NOT FOUND : ${req.params.barCode} ...`)
				res.json({status : 'ERROR'})
			} else { 
				return itemController.findDetails( req.params.barCode )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR ITEM ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			console.log(`... ITEM DETAILS RETRIEVED SXSFULLY : ${req.params.barCode} ...`)
			res.json({status : 'SXS' , result : response.details })
		},( err )=>{
			console.log(`--- ERROR DURING ITEM DETAILS RETRIEVAL ${err.details} ---`)
			res.json({status : 'ERROR'})
		})		
	})

itemRouter.route('/delete/:barCode')
	.delete((req,res)=>{
		itemController.itemExists( req.params.barCode )
		.then(( response )=>{
			if ( !response.status ){
				console.log(`... ITEM NOT FOUND : ${req.params.barCode} ...`)
				res.json({status : 'ERROR'})
			} else { 
				return itemController.deleteItem( req.params.barCode )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR ITEM ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			console.log(`... ITEM DELETED SXSFULLY : ${req.params.barCode} ...`)
			res.json({status : 'SXS'})
		},( err )=>{
			console.log(`--- ERROR DURING DELETING ITEM ${err.details} ---`)
			res.json({status : 'ERROR'})
		})		
	})

itemRouter.route('/update/:barCode')
	.put((req,res)=>{
		if ( parseFloat(req.body.availableStock) > parseFloat(req.body.totalStock) ){
			return res.json({status : "STOCK VALUE ERROR"})
		}
		itemController.itemExists( req.params.barCode )
		.then(( response )=>{
			if ( !response.status ){
				console.log(`... ITEM NOT FOUND : ${req.params.barCode} ...`)
				res.json({status : 'ERROR'})
			} else { 
				return itemController.updateItem( response.details , req.body )
			}
		},( err )=>{
			console.log(`--- ERROR DURING CHECKING FOR ITEM ${err} ---`)
			res.json({status : 'ERROR'})
		})
		.then(( response )=>{
			if ( response.status ){
				console.log(`... ITEM UPDATED SXSFULLY ...`)
				res.json({status : 'SXS'})
			} else {
				console.log(`... ITEM REDUNDANCY FOUND WITH NEW DETAIL: ${response.details.barCode} --> ${response.details.name} ...`)
				res.json({status : 'REDUNDANT'})				
			}
		},( err )=>{
			console.log(`--- ERROR DURING UPDATING ITEM ${err} ---`)
			res.json({status : 'ERROR'})
		})	
	})

itemRouter.route('/forecastList')
	.post((req,res)=>{
		var pickupDate = new Date(req.body.pickupDate)
		var returnDate = new Date(req.body.returnDate)
		itemController.forecastAvailability( pickupDate , returnDate )
		.then(( response )=>{
			console.log(`... RETRIEVED FORECASTED ITEM LIST ...`)
			res.json({status : 'SXS' , result : response.details})
		},( err )=>{
			console.log(`--- ERROR DURING FORECASTING ITEMS ${err.details} ---`)
			res.json({status : 'ERROR'})
		})
	})

module.exports = itemRouter