'use strict'

const 	itemService = require('../services/itemService'),
		logger = require('./logger')

var itemExists = function( barCode ){
	return new Promise((resolve,reject)=>{
		itemService.findItem( barCode )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var saveItem = function( details ){
	return new Promise((resolve,reject)=>{
		itemService.insertItem( details )
		.then((response)=>{
			let objToSave = {
				category : 'STOCK' ,
				details : {
					type : 'NEW ITEM ADDED',
					barCode : response.details.barCode ,
					name : response.details.name ,
					rentPrice : response.details.price ,
					costPrice : response.details.costPrice ,
					status : response.details.availableStock + " / " + response.totalStock
				}
			}
			logger.logSave( objToSave )
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var totalItems = function(){
	return new Promise((resolve,reject)=>{
		itemService.totalItemCount()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})	
}

var itemList = function(){
	return new Promise((resolve,reject)=>{
		itemService.getItemList()
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})		
}

var deleteItem = function( barCode ){
	return new Promise((resolve,reject)=>{
		itemService.delItem( barCode )
		.then((response)=>{
			var objToSave = {
				category : 'STOCK' ,
				details : {
					type : 'ITEM DELETION',
					barCode : barCode
				}
			}
			logger.logSave( objToSave )
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})	
}

var updateItem = function( itemForUpdate , updateData ){
	return new Promise((resolve,reject)=>{
		let objToSave = {
			category : 'STOCK' ,
			details : {
				type : 'ITEM UPDATE',
				changes : []
			}
		}
		let itemForLog = JSON.parse(JSON.stringify(itemForUpdate))
		if ( itemForUpdate.barCode !== updateData.barCode ){
			itemExists( updateData.barCode )
			.then((response)=>{
				if ( response.status ){
					resolve ( { status : !response.status , details : response.details } )
				} else {
					itemService.updateItem( itemForUpdate, updateData )
					.then((response)=>{
						objToSave.details.changes = logger.changesForLog ( itemForLog , response.details , ['name','barCode','price','costPrice','rentedStock','availableStock','totalStock'] )
						objToSave.status = response.details.availableStock + " / " + response.details.totalStock
						logger.logSave( objToSave )
						resolve(response)
					},(err)=>{
						reject(err)
					})		
				}			
			},(err)=>{
				reject(err)
			})
		} else {
			itemService.updateItem( itemForUpdate , updateData )			
			.then((response)=>{
				objToSave.details.changes = logger.changesForLog ( itemForLog , response.details , ['name','barCode','price','costPrice','rentedStock','availableStock','totalStock'] )
				objToSave.status = response.details.availableStock + " / " + response.details.totalStock
				logger.logSave( objToSave )
				resolve(response)
			},(err)=>{
				reject(err)
			})				
		}			
	})
}

module.exports.itemExists = itemExists
module.exports.saveItem = saveItem
module.exports.totalItems = totalItems
module.exports.itemList = itemList
module.exports.deleteItem = deleteItem
module.exports.updateItem = updateItem