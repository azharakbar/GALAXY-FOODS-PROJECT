'use strict'

const Item = require('../models/item')

var findItem = function( barCodeToSearch ){ 
	return new Promise((resolve,reject)=>{
		Item.findOne( {barCode : barCodeToSearch} )
		.then(( itemResponse )=>{
			if ( itemResponse ){
				resolve ( { 'status' : true , 'details' : itemResponse } )
			} else {
				resolve ( { 'status' : false , 'details' : null } )
			}
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } ) 
		})
	})
}

var insertItem = function( detailsForInsert ){
	return new Promise((resolve,reject)=>{
		let item = new Item()
		for ( let key in detailsForInsert )
			item[key] = detailsForInsert[key]
		item.save()
		.then(( itemResponse )=>{
			resolve ( { 'status' : true , 'details' : itemResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var totalItemCount = function(){
	return new Promise((resolve,reject)=>{
		Item.count()
		.then(( count )=>{
			resolve ( { 'status' : true , 'details' : count } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})	
}

var getItemList = function(){
	return new Promise((resolve,reject)=>{
		Item.find( {} )
		.then(( items )=>{
			resolve ( { 'status' : true , 'details' : items } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})	
}

var delItem = function( itemToDelete ){
	return new Promise((resolve,reject)=>{
		Item.remove( {barCode : itemToDelete} )
		.then(( itemDelResponse )=>{
			resolve ( { 'status' : true , 'details' : itemDelResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})		
	})
}

var updateItem = function( itemForUpdate , updateData ){
	return new Promise((resolve,reject)=>{
		for ( let key in updateData )
			itemForUpdate[key] = updateData[key]
		if ( updateData.totalStock !== undefined && updateData.totalStock !== ''){
			itemForUpdate.totalStock = parseInt(updateData.totalStock)
			if ( updateData.availableStock !== undefined && updateData.availableStock !== ''){
				itemForUpdate.availableStock = parseInt(updateData.availableStock) 
				itemForUpdate.rentedStock = itemForUpdate.totalStock - itemForUpdate.availableStock
			} else {
				itemForUpdate.availableStock = 0 ;
				itemForUpdate.rentedStock = 0
			}
		} else { 
			itemForUpdate.totalStock = 0 
			itemForUpdate.rentedStock = 0
		}
		itemForUpdate.save()
		.then(( itemResponse )=>{
			resolve ( { 'status' : true , 'details' : itemResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}


module.exports.findItem = findItem 
module.exports.insertItem = insertItem
module.exports.totalItemCount = totalItemCount
module.exports.getItemList = getItemList
module.exports.delItem = delItem
module.exports.updateItem = updateItem