'use strict'

const Customer = require('../models/customer')

var findCustomer = function( contactToSearch ){ 
	return new Promise((resolve,reject)=>{
		Customer.findOne( {contact : contactToSearch} )
		.then(( custResponse )=>{
			if ( custResponse ){
				resolve ( { 'status' : true , 'details' : custResponse } )
			} else {
				resolve ( { 'status' : false , 'details' : null } )
			}
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } ) 
		})
	})
}

var insertCustomer = function( detailsForInsert ){
	return new Promise((resolve,reject)=>{
		let customer = new Customer()
		for ( let key in detailsForInsert )
			customer[key] = detailsForInsert[key]
		customer.save()
		.then(( custResponse )=>{
			resolve ( { 'status' : true , 'details' : custResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

var totalCustomerCount = function(){
	return new Promise((resolve,reject)=>{
		Customer.count()
		.then(( count )=>{
			resolve ( { 'status' : true , 'details' : count } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})	
}

var getCustomerList = function(){
	return new Promise((resolve,reject)=>{
		Customer.find( {} , null , {sort : { credit : -1 }} )
		.then(( customers )=>{
			resolve ( { 'status' : true , 'details' : customers } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})	
}

var delCustomer = function( contactToDelete ){
	return new Promise((resolve,reject)=>{
		Customer.remove( {contact : contactToDelete} )
		.then(( custDelResponse )=>{
			resolve ( { 'status' : true , 'details' : custDelResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})		
	})
}

var updateCustomer = function( customerForUpdate , updateData ){
	return new Promise((resolve,reject)=>{
		customerForUpdate.name = updateData.name
		customerForUpdate.contact = updateData.contact
		customerForUpdate.save()
		.then(( custResponse )=>{
			resolve ( { 'status' : true , 'details' : custResponse } )
		},( err )=>{
			reject ( { 'status' : false , 'details' : err } )
		})
	})
}

module.exports.findCustomer = findCustomer 
module.exports.insertCustomer = insertCustomer
module.exports.totalCustomerCount = totalCustomerCount
module.exports.getCustomerList = getCustomerList
module.exports.delCustomer = delCustomer
module.exports.updateCustomer = updateCustomer