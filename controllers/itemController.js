'use strict'

const 	itemService = require('../services/itemService'),
	 	orderController = require('./orderController'),
	 	custController = require('./custController'),
	 	billController = require('./billController'),
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
					status : response.details.availableStock + " / " + response.details.totalStock
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
						objToSave.details.barCode = response.details.barCode
						objToSave.details.name = response.details.name
						objToSave.details.changes = logger.changesForLog ( itemForLog , response.details , ['name','barCode','price','costPrice','rentedStock','availableStock','totalStock'] )
						objToSave.status = response.details.availableStock + " / " + response.details.totalStock
						logger.logSave( objToSave )
						orderController.updateItemData( itemForLog.barCode , updateData )
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
				objToSave.details.barCode = response.details.barCode
				objToSave.details.name = response.details.name
				objToSave.details.changes = logger.changesForLog ( itemForLog , response.details , ['name','barCode','price','costPrice','rentedStock','availableStock','totalStock'] )
				objToSave.status = response.details.availableStock + " / " + response.details.totalStock
				logger.logSave( objToSave )
				orderController.updateItemData( itemForLog.barCode , updateData )
				resolve(response)
			},(err)=>{
				reject(err)
			})				
		}			
	})
}

var findDetails = function( barCode ){
	return new Promise((resolve,reject)=>{
		orderController.findDetails( barCode )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var forecastAvailability = function( pickupDate , returnDate ){
	return new Promise((resolve,reject)=>{
		itemService.getItemList()
		.then((itemListResponse)=>{
			orderController.findOrdersForecast( pickupDate , returnDate )
			.then((orderListResponse)=>{
				var resArray = []
				resArray.length = itemListResponse.details.length
				resArray.fill(0)
				for  (var i = 0 ; i < orderListResponse.details.length ; ++i ){
					for ( var j = 0 ; j < orderListResponse.details[i].items.length ; ++j ){
						for ( var k = 0 ; k < itemListResponse.details.length ; ++k ){
							if( orderListResponse.details[i].items[j].barCode === itemListResponse.details[k].barCode ){
								resArray[k] += orderListResponse.details[i].items[j].qty
							}
						}
					}
				}
				for ( var i = 0 ; i < itemListResponse.details.length ; ++i ){
					resArray[i] = itemListResponse.details[i].totalStock - resArray[i]
				}
				resolve ( { status : true , details : { items : itemListResponse.details , forecastAvailability : resArray } } )
			},(err)=>{
				reject(err)
			})
		},(err)=>{
			reject(err)	
		})
	})
}

var deliverStock = function( barCode , qty ){
	return new Promise((resolve,reject)=>{
		itemService.deliverStock( barCode , qty )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})
}

var returnStock = function( barCode , qty ){
	return new Promise((resolve,reject)=>{
		itemService.returnStock( barCode , qty )
		.then((response)=>{
			resolve(response)
		},(err)=>{
			reject(err)
		})
	})	
}

var reduceStock = function( dataObj , customer , autoGen ){
	return new Promise((resolve,reject)=>{
		var objToSave = {}
		var lostItemsList = dataObj.lostItems
		var totalAmount = 0
		let updateItemsForLoss = []
		updateItemsForLoss.length = lostItemsList.length

		for ( var i = 0 ; i < lostItemsList.length ; ++i ){
			updateItemsForLoss[i] = 
			itemService.reduceStock ( lostItemsList[i].barCode , lostItemsList[i].qty , autoGen )
			.then((response)=>{
				totalAmount += response.details.amount
				objToSave = {
					category : 'STOCK' ,
					details : {
						type : 'LOST',
						barCode : response.details.barCode ,
						name : response.details.name ,
						qty : response.details.lastVal ,
						status : response.details.availableStock + " / " + response.details.totalStock
					}
				}
				console.log(`... UPDATED STOCK OF ${response.details.name} --> ${response.details.lastVal} ..`)
				logger.logSave( objToSave )
			},(err)=>{
				reject ( err )
			})			
		}
		Promise.all( updateItemsForLoss )
		.then(()=>{
			custController.increaseCredit ( customer , totalAmount )
			.then((custResponse)=>{
				billController.genStkLossBill ( custResponse.details.name , custResponse.details.contact , totalAmount )
				.then((billResponse)=>{
					objToSave = {
						category : 'TRANSACTION' ,
						details : {
							type : 'CREDIT',
							id : billResponse.details.billId ,
							amount : billResponse.details.billAmount ,
							totalCredit : custResponse.details.credit ,
							name : billResponse.details.name ,
							contact : billResponse.details.customer
						}
					}
					console.log(`... GENERATED BILL FOR STOCK LOSS : ${billResponse.details.billId} ---> ${billResponse.details.name} ...`)
					logger.logSave( objToSave )					
					resolve( objToSave )
				},(err)=>{
					console.log(`... ERROR DURING BILL GENERATION FOR STOCK LOSS ${err} ...`)
					reject(err)
				})
			},(err)=>{
				console.log(`... ERROR DURING CUSTOMER UPDATE FOR STOCK LOSS ${err} ...`)
				reject(err)
			})
		},(err)=>{
			console.log(`... ERROR DURING UPDATING STOCK LOSS ${err} ...`)
			reject(err)
		})
	})
}

module.exports.itemExists = itemExists
module.exports.saveItem = saveItem
module.exports.totalItems = totalItems
module.exports.itemList = itemList
module.exports.deleteItem = deleteItem
module.exports.updateItem = updateItem
module.exports.findDetails = findDetails
module.exports.forecastAvailability = forecastAvailability
module.exports.deliverStock = deliverStock
module.exports.returnStock = returnStock
module.exports.reduceStock = reduceStock