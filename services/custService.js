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
		customer.name = detailsForInsert.name
		customer.contact = detailsForInsert.contact
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
		console.log("in service")
		Customer.remove( {contact : contactToDelete} )
		.then(( custDelResponse )=>{
			console.log(`exiting service ${custDelResponse}`)
			resolve ( { 'status' : true , 'details' : custDelResponse } )
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