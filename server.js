//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING
//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING//TRIALING
'use strict'
const 	express = require('express') ,
		mongoose = require('mongoose') ,
		bodyParser = require('body-parser') ,
		cookieParser = require('cookie-parser'),
		passport = require('passport') ,
		logger = require('morgan') ,
		config = require('./config/config') ,
		bluebird = require('bluebird'),
		session = require('express-session'),
		cors = require('cors'),
		md5 = require('md5'),
		uniqid = require('uniqid'),
		request = require('request'),
		Customer = require('./models/customer'),
		Item = require('./models/item'),
		Order = require('./models/order'),
		Bill = require('./models/bill'),
		Log = require('./models/log')

var app = express() ;

app.set('port' , config.genConfig.port )
// app.use(logger('dev'))	
app.enable('trust proxy')
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended : true }))
app.use(cors())

process.env.TZ = config.TZ 

mongoose.Promise = bluebird ;

console.log(` 
	** SERVER RESTARTED @ ${new Date()} **
	`)

mongoose.connect ( config.connURI , function(err){
	if ( err )
		console.log(err)
	else
		console.log(">> CONNEXN TO DATABASE ESTABLISHED")
})

config.passportConfig.pass(passport);

app.use(session({'secret':config.genConfig.secret , resave:true , saveUninitialized:true}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/',express.static(__dirname+'/public'));

app.post('/login', function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('http://127.0.0.1:2016/loginFailure'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
    var obj = {
        status : 'authDone' ,
        username : 'GALAXY',
        role : 'ADMINISTRATOR' ,
        token : md5(uniqid()) 
    }
    req.session.token = obj.token ;	
    console.log("SUPER HERE")
	var objToSave = {
		category : 'AUTHENTICATION' ,
		details : {
			type : 'LOGIN',
			username : 'GALAXY' ,
		}
	}
	logSave( objToSave )    
    return res.json( obj ) ;
    });
  })(req, res, next);
});

app.get('/loginFailure',function(req,res){
	console.log(`In LOGINFAILURE : Content-Type: ${req.headers['Content-Type']}`);
	var obj = {
		status : 'loginFailed' ,
	}
	res.json(obj);
})

app.post('/logout',function(req,res){
    console.log(`IN LOGOUT POST req.isAuthenticated()=${req.isAuthenticated()}`)
    var obj = { status : 'logOutSuccess' } ;
	var objToSave = {
		category : 'AUTHENTICATION' ,
		details : {
			type : 'LOGOUT',
			username : 'GALAXY' ,
		}
	}
	logSave( objToSave )        
    req.session.destroy();
    req.logout() ;
	res.json( obj ) ;
})

app.get('/check',function(req,res){
    res.json({status:req.isAuthenticated()})
})

app.post('/newCustomer',isLoggedIn,function(req,res){
	Customer.findOne({contact:req.body.contact})
	.then(function(cust){
		if ( cust ){
			res.json({status : 'REDUNDANT'})
		}
		else{
			var customer = new Customer() ;
			customer.name = req.body.name
			customer.contact = req.body.contact
			customer.createdDate = new Date() 
			customer.save()
			.then(function(){
				var objToSave = {
					category : 'CUSTOMER' ,
					details : {
						type : 'NEW CUSTOMER ADDED',
						custName : req.body.name ,
						custContact : req.body.contact
					}
				}
				logSave( objToSave )
				res.json({status : 'SXS'})
			},function(err){
				res.json({status : 'ERROR'})
			})
		}
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/totalCustomers',isLoggedIn,function(req,res){
	Customer.count()
	.then(function(num){
		res.json({status : 'SXS' , count : num})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/allCustomers',isLoggedIn,function(req,res){
	Customer.find({},null,{sort : { credit : -1 }})
	.then(function(users){
		res.json({status : 'SXS' , result : users})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/newItem',isLoggedIn,function(req,res){
	if ( parseFloat(req.body.stockInHand) > parseFloat(req.body.totalStock) ){
		res.json({status : "STOCK VALUE ERROR"})
		return ;
	}	
	Item.findOne({barCode:req.body.barcode})
	.then(function(item){
		if ( item ){
			res.json({status : 'REDUNDANT'})
		}
		else{
			var item = new Item() ;
			item.barCode = req.body.barcode 
			item.name = req.body.name 
			item.price = req.body.price
			item.costPrice = req.body.costPrice
			if ( req.body.totalStock != undefined ){
				item.totalStock = req.body.totalStock
				if ( req.body.stockInHand != undefined ){
					item.availableStock = req.body.stockInHand 
					item.rentedStock = parseInt(req.body.totalStock) - parseInt(req.body.stockInHand)
				}
			}
			item.save()
			.then(function(rslt){
				var objToSave = {
					category : 'STOCK' ,
					details : {
						type : 'NEW ITEM ADDED',
						barCode : rslt.barCode ,
						name : rslt.name ,
						rentPrice : rslt.price ,
						costPrice : rslt.costPrice ,
						status : rslt.availableStock + " / " + rslt.totalStock
					}
				}
				logSave( objToSave )				
				res.json({status : 'SXS'})
			},function(err){
				res.json({status : 'ERROR'})
			})
		}
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/totalItems',isLoggedIn,function(req,res){
	Item.count()
	.then(function(num){
		res.json({status : 'SXS' , count : num})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/allItems',isLoggedIn,function(req,res){
	Item.find({})
	.then(function(users){
		res.json({status : 'SXS' , result : users})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.put('/updateItem/:barCode',isLoggedIn,function(req,res){
	if ( parseFloat(req.body.stockInHand) > parseFloat(req.body.totalStock) ){
		res.json({status : "STOCK VALUE ERROR"})
		return ;
	}
	Item.findOne({barCode:req.params.barCode})
	.then(function(item){
			var itemForLog = {}
			var arr = [ 'price' , 'name' , 'barCode' , 'costPrice' , 'rentedStock' , 'availableStock' , 'totalStock' ]
			for ( var x in arr ){
				itemForLog[arr[x]] = item[arr[x]]
			}
			if ( req.body.barcode === req.params.barCode ){
				item.barCode = req.body.barcode 
				item.name = req.body.name 
				item.price = req.body.price
				item.costPrice = req.body.costPrice
				if ( req.body.totalStock !== undefined && req.body.totalStock !== ''){
					item.totalStock = req.body.totalStock
					if ( req.body.stockInHand !== undefined && req.body.stockInHand !== ''){
						item.availableStock = req.body.stockInHand 
					} else {
						item.availableStock = 0 ;
					}
				} else { 
					item.totalStock = 0 
				}
				item.rentedStock = parseInt(item.totalStock) - parseInt(item.availableStock)
				item.save()
				.then(function(rslt){
					var logObjToSave = {
						category : 'STOCK' ,
						details : {
							type : 'ITEM UPDATE',
							changes : [],
							status : rslt.availableStock + " / " + rslt.totalStock
						}
					}
					var keyList = Object.keys(itemForLog)
/*					for ( var x in keyList ){
						if ( rslt[keyList[x]] !== itemForLog[keyList[x]] ){
							logObjToSave.details[keyList[x]] = {
								old : itemForLog[keyList[x]] ,
								new : rslt[keyList[x]]
							}
						}
					}*/

					for ( var x in keyList ){
						if ( rslt[keyList[x]] !== itemForLog[keyList[x]] ){
							logObjToSave.details.changes.push({
								param : keyList[x] ,
								old : itemForLog[keyList[x]] ,
								new : rslt[keyList[x]]
							})
						}
					}

					if ( !( 'barCode' in logObjToSave.details ) )
						logObjToSave.details.barCode = item.barCode
					if ( !( 'name' in logObjToSave.details ) )
						logObjToSave.details.name = item.name
					logSave ( logObjToSave )
					res.json({status : 'SXS'})
				},function(err){
					res.json({status : 'ERROR'})
				})
			} else {
				Item.findOne({barCode:req.body.barcode})
				.then(function(item2){
						if ( item2 ){
							res.json({status : 'REDUNDANT'})
						} else {
							item.barCode = req.body.barcode 
							item.name = req.body.name
							item.price = req.body.price
							item.costPrice = req.body.costPrice
							if ( req.body.totalStock != undefined ){
								item.totalStock = req.body.totalStock
								if ( req.body.stockInHand != undefined ){
									item.availableStock = req.body.stockInHand 
								} else {
									item.availableStock = 0 ;
								}
							} else { 
								item.totalStock = 0 
							}
							if ( item.availableStock && item.totalStock )
								item.rentedStock = parseInt(item.totalStock) - parseInt(item.availableStock)
							else
								item.rentedStock = 0 ;
							item.save()
							.then(function(rslt){
								var logObjToSave = {
									category : 'STOCK' ,
									details : {
										type : 'ITEM UPDATE',
										changes : [],
										status : rslt.availableStock + " / " + rslt.totalStock
									}
								}
								var keyList = Object.keys(itemForLog)
/*								for ( var x in keyList ){
									if ( rslt[keyList[x]] !== itemForLog[keyList[x]] ){
										logObjToSave.details[keyList[x]] = {
											old : itemForLog[keyList[x]] ,
											new : rslt[keyList[x]]
										}
									}
								}	*/

								for ( var x in keyList ){
									if ( rslt[keyList[x]] !== itemForLog[keyList[x]] ){
										logObjToSave.details.changes.push({
											param : keyList[x] ,
											old : itemForLog[keyList[x]] ,
											new : rslt[keyList[x]]
										})
									}
								}
								if ( !( 'barCode' in logObjToSave.details ) )
									logObjToSave.details.barCode = item.barCode
								if ( !( 'name' in logObjToSave.details ) )
									logObjToSave.details.name = item.name											
								logSave ( logObjToSave )								
								res.json({status : 'SXS'})
							},function(err){
								res.json({status : 'ERROR'})
							})
						}
				},function(err){
					res.json({status : 'ERROR'})
				})
			}
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.delete('/deleteItem/:barCode',isLoggedIn,function(req,res){
	Item.remove({barCode:req.params.barCode})
	.then(function(item){
		var objToSave = {
			category : 'STOCK' ,
			details : {
				type : 'ITEM DELETION',
				barCode : req.params.barCode
			}
		}
		logSave( objToSave )		
		res.json({status : 'SXS'})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.put('/updateCustomer/:contact',isLoggedIn,function(req,res){
	var logObjToSave = {
		category : 'CUSTOMER' ,
		details : {
			type : 'CUSTOMER UPDATE',
		}
	}
	Customer.findOne({contact:req.params.contact})
	.then(function(customer){
			var customerForLog = {}
			var arr = [ 'name' , 'contact' ]
			for ( var x in arr ){
				customerForLog[arr[x]] = customer[arr[x]]
			}
			if ( req.body.contact === req.params.contact ){
				customer.name = req.body.name 
				customer.contact = req.body.contact 
				customer.save()
				.then(function(rslt){
					var keyList = Object.keys(customerForLog)
					for ( var x in keyList ){
						if ( rslt[keyList[x]] !== customerForLog[keyList[x]] ){
							logObjToSave.details[keyList[x]] = {
								old : customerForLog[keyList[x]] ,
								new : rslt[keyList[x]]
							}
						}
					}					
					logSave ( logObjToSave )					
					res.json({status : 'SXS'})
				},function(err){
					res.json({status : 'ERROR'})
				})
			} else {
				Customer.findOne({contact:req.body.contact})
				.then(function(customer2){
					if ( customer2 ){
						res.json({status : 'REDUNDANT'})
					} else {
						customer.name = req.body.name 
						customer.contact = req.body.contact 					
						customer.save()
						.then(function(rslt){
							var keyList = Object.keys(customerForLog)
							for ( var x in keyList ){
								if ( rslt[keyList[x]] !== customerForLog[keyList[x]] ){
									logObjToSave.details[keyList[x]] = {
										old : customerForLog[keyList[x]] ,
										new : rslt[keyList[x]]
									}
								}
							}					
							logSave ( logObjToSave )							
							res.json({status : 'SXS'})
						},function(err){
							res.json({status : 'ERROR'})
						})
					}
				},function(err){
					res.json({status : 'ERROR'})
				})
			}
		})
})

app.delete('/deleteCustomer/:contact',isLoggedIn,function(req,res){
	Customer.remove({contact:req.params.contact})
	.then(function(item){
		var objToSave = {
			category : 'CUSTOMER' ,
			details : {
				type : 'CUSTOMER DELETION',
				contact : req.params.contact
			}
		}
		logSave( objToSave )	
		res.json({status : 'SXS'})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/testAPI/:name?',isLoggedIn,function(req,res){
	// var re = new RegExp(req.params.name, 'i')
	// Customer.find({ name: re },'name contact -_id')
	// Customer.find({ "name": { "$regex": req.params.name, "$options": "i" } },'name contact -_id')
	Customer.find( )
	.then(function(customers){
		console.log(customers)
		res.json ({ status : 'SXS' , result:customers })
	},function(err){
		res.json ({ status : 'ERROR' })
	})

	
})

app.post('/allItemsNew',isLoggedIn,function(req,res){
	var resObj = {} ;
	var resArray = [] ;

	var pickUpNew = new Date(req.body.pickupDate)
	var retNew = new Date(req.body.returnDate)
	pickUpNew.setHours(0)
	pickUpNew.setMinutes(0)
	pickUpNew.setSeconds(0)
	retNew.setHours(0)
	retNew.setMinutes(0)
	retNew.setSeconds(0)	
	console.log(`PickUp New = ${pickUpNew}`)
	console.log(`Return New = ${retNew}`)
	Item.find({})
	.then(function(items){
		resArray.length = items.length ;
		resArray.fill(0)
		Order.find( { $and : [ 
								{ status : { $in : [ "NOT PICKED UP" , "PICKED UP" ] } } ,
								{ $or : [
											{
												$and : [
														{ pickupDate : { $gt : pickUpNew} } ,
														{ pickupDate : { $lt : retNew } }
													   ]
											},
											{
												$and : [
														{ returnDate : { $gt : pickUpNew } } ,
														{ returnDate : { $lt : retNew } }
													   ]
											},
											{
												$and : [
														{ pickupDate : { $lt : pickUpNew } } ,
														{ returnDate : { $gt : retNew } }
													   ]												
											}
								     	] 
								}
							 ] 
					} )
		.then(function(orders){
			console.log(orders)

			for  (var i = 0 ; i < orders.length ; ++i ){
				for ( var j = 0 ; j < orders[i].items.length ; ++j ){
					for ( var k = 0 ; k < items.length ; ++k ){
						if( orders[i].items[j].barCode === items[k].barCode ){
							resArray[k] += orders[i].items[j].qty
						}
					}
				}
			}
			console.log (`resArray Before : ${resArray} `) ;
			for ( var i = 0 ; i < items.length ; ++i )
				resArray[i] = items[i].totalStock - resArray[i] 
			console.log (`resArray After : ${resArray} `) ;
			res.json({status : 'SXS' , result : {items: items , daysAvailability : resArray} })
		},function(err){
			console.log(err)
			res.json({status : 'ERROR'})	
		})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/totalOrders',isLoggedIn,function(req,res){
	Order.count()
	.then(function(num){
		res.json({status : 'SXS' , count : num+1})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/totalBills',isLoggedIn,function(req,res){
	Bill.count()
	.then(function(num){
		res.json({status : 'SXS' , count : num+1})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/saveBill' , isLoggedIn , function(req,res){
	var finalObj = JSON.parse(req.body.finalObj)
	var dataForBillSchema = finalObj.billSchema ;
	var dataForOrderSchema = finalObj.orderSchema ;
	var dataForCustomerSchema = finalObj.customerSchema ;

	var bill = new Bill() ;
	var order = new Order() ;

	bill.billId = dataForBillSchema.billId
	bill.billDate = dataForBillSchema.billDate
	bill.customer = dataForBillSchema.customer
	bill.orderId = dataForBillSchema.orderId
	bill.billAmount = dataForBillSchema.billAmount
	bill.remAmount = bill.billAmount
	bill.name = dataForBillSchema.name

	order.orderId = dataForOrderSchema.orderId
	order.issueDate = dataForOrderSchema.issueDate
	order.pickupDate = dataForOrderSchema.pickupDate
	order.returnDate = dataForOrderSchema.returnDate
	order.customer = dataForOrderSchema.customer
	order.items = dataForOrderSchema.items
	order.billId = dataForOrderSchema.billId
	order.name = dataForOrderSchema.name
	order.eveLoxn = dataForOrderSchema.eveLoxn
	order.evePurpose = dataForOrderSchema.evePurpose

	var custContact = dataForCustomerSchema.customer
	var cr = parseFloat(dataForBillSchema.billAmount)

	Customer.findOne( { contact:custContact } )
	.then( function(cust){
		cust.orders += 1 ;
		cust.credit += cr

		cust.save()
		.then(function(custResponse){
			bill.save()
			.then(function(billResponse){
				var objToSave = {
					category : 'BILL' ,
					details : {
						type : 'NEW BILL GENERATION',
						billId : billResponse.billId,
						orderId : dataForOrderSchema.orderId ,
						name :  custResponse.name ,
						contact : custResponse.contact ,
						amount : billResponse.billAmount
					}
				}
				logSave( objToSave )
				objToSave = {
					category : 'TRANSACTION' ,
					details : {
						type : 'CREDIT',
						billNumber : billResponse.billId ,
						amount : billResponse.billAmount ,
						totalCredit : custResponse.credit ,
						customer : billResponse.name ,
						contact : billResponse.customer
					}
				}
				logSave( objToSave )
				order.save()
				.then(function(orderResponse){
					var objToSave = {
						category : 'ORDER' ,
						details : {
							type : 'NEW ORDER PLACEMENT',
							number : orderResponse.orderId,
							itemCount : orderResponse.items.length,
							name : orderResponse.name,
							contact : orderResponse.customer
						}
					}
					logSave( objToSave )					
					console.log({status : 'SXS'})
					res.json({status : 'SXS'})
				},function(err){
					console.log({status : 'ERROR IN ADDING ORDER'})			
					res.json({status : 'ERROR IN ADDING ORDER'})			
				})
			},function(err){
				console.log({status : 'ERROR IN ADDING BILL'})		
				res.json({status : 'ERROR IN ADDING BILL'})		
			})
		},function(err){
			console.log({status : 'ERROR IN UPDATING CUSTOMER'})	
			res.json({status : 'ERROR IN UPDATING CUSTOMER'})	
		})

	},function(err){
		console.log({status : 'ERROR IN CUSTOMER SCHEMA'})
		res.json({status : 'ERROR IN CUSTOMER SCHEMA'})
	})

})

app.post('/saveLostBill' , isLoggedIn , function(req,res){
	var finalObj = JSON.parse(req.body.finalObj)
	var dataForBillSchema = finalObj.billSchema ;
	var dataForCustomerSchema = finalObj.customerSchema ;
	var items = finalObj.lostItems 

	var updateItemsForStock = [] ;
	updateItemsForStock.length = items.length

	var bill = new Bill() ;

	bill.billId = dataForBillSchema.billId
	bill.billDate = dataForBillSchema.billDate
	bill.customer = dataForBillSchema.customer
	bill.orderId = dataForBillSchema.orderId
	bill.billAmount = dataForBillSchema.billAmount
	bill.remAmount = bill.billAmount
	bill.name = dataForBillSchema.name

	var custContact = dataForCustomerSchema.customer
	var cr = parseFloat(dataForBillSchema.billAmount)

	var cnt = 0 ;
	for ( var i = 0 ; i < items.length ; ++i ){
		updateItemsForStock[i] = 
		Item.findOne({ barCode : items[i].barCode })
		.then(function(item){
			var v = items[cnt++].qty ;
			item.totalStock = item.totalStock - v
			item.availableStock = item.availableStock - v
			item.save()
			.then(function(){
				console.log(`UPDATED STOCK ${item.name}`)
			},function(err){
			})
		},function(err){
			reject(err)
		})
	}
	Promise.all( updateItemsForStock )
	.then ( function(response){
		Customer.findOne( { contact:custContact } )
		.then( function(cust){
			cust.credit += cr

			cust.save()
			.then(function(response){
				bill.save()
				.then(function(response){
					console.log({status : 'SXS'})
					res.json({status : 'SXS'})
				},function(err){
					console.log({status : 'ERROR IN ADDING BILL'})		
					res.json({status : 'ERROR IN ADDING BILL'})		
				})
			},function(err){
				console.log({status : 'ERROR IN UPDATING CUSTOMER'})	
				res.json({status : 'ERROR IN UPDATING CUSTOMER'})	
			})

		},function(err){
			console.log({status : 'ERROR IN CUSTOMER SCHEMA'})
			res.json({status : 'ERROR IN CUSTOMER SCHEMA'})
		})
	},function(err){
		console.log({status : 'ERROR IN ITEMS SCHEMA'})
		res.json({status : 'ERROR IN ITEMS SCHEMA'})
	})

})

app.post('/allBills',isLoggedIn,function(req,res){
	Bill.find({},null,{sort:{ status : 1 }})
	.then(function(bills){
		res.json({status : 'SXS' , result : bills})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/payBill',isLoggedIn,function(req,res){
	var logObjToSave  = {
			category : "TRANSACTION",
			details : {
				category : "DEBIT" ,
				id : req.body.billId ,
				paid : parseFloat(req.body.paid)
			}
	} 
	Bill.findOne({billId : req.body.billId})
	.then(function(bill){
		bill.remAmount -= Math.round( parseInt(req.body.paid) )
		if ( bill.remAmount < 1 ){
			bill.remAmount = 0 ;
			bill.status = "PAID"
		}
		else{
			bill.status = "ADVANCE PAYMENT"
		}
		bill.lastPaidDate = new Date()
		if ( bill.status === "PAID" )
			logObjToSave.details.status = "BILL SETTLED"
		else{
			logObjToSave.details.status = "PAYMENT REMAINING"
			logObjToSave.details.remAmount = bill.remAmount
		}
		bill.save()
		.then(function( billResponse ){
			Customer.findOne({contact : bill.customer})
			.then(function(cust){
				cust.credit -= parseInt(req.body.paid)
				cust.save()
				.then(function( custResponse ){
					logObjToSave.details.name = custResponse.name 
					logObjToSave.details.contact = custResponse.contact
					logSave(logObjToSave)
					res.json({status : 'SXS'})
				},function(err){
					res.json({status : 'ERROR'})
				})
			},function(err){
				res.json({status : 'ERROR'})
			})
		},function(err){
			res.json({status : 'ERROR'})
		})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/allOrders',isLoggedIn,function(req,res){
	Order.find({} , null , { sort : { status : 1 } })
	.then(function(bills){
		res.json({status : 'SXS' , result : bills})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/pickUpOrder',isLoggedIn,function(req,res){
	var list = JSON.parse(req.body.dataObj)
	var updateItemsForPickup = [] ;
	updateItemsForPickup.length = list.length
	var cnt = 0 ;
	for ( var i = 0 ; i < list.length ; ++i ){
		updateItemsForPickup[i] = 
		Item.findOne({ barCode : list[i].barCode })
		.then(function(item){
			var v = list[cnt++].qty ;
			item.availableStock = item.availableStock - v
			item.rentedStock = item.rentedStock + v
			item.timesOrdered = item.timesOrdered + 1
			item.save()
			.then(function(rslt){
				var objToSave = {
					category : 'STOCK' ,
					details : {
						type : 'DELIVERY',
						orderId : req.body.orderId ,
						barCode : rslt.barCode ,
						name : rslt.name ,
						qty : v ,
						status : rslt.availableStock + " / " + rslt.totalStock 
					}
				}
				logSave( objToSave )					
				console.log(`PICKED UP ${item.name}`)
			},function(err){
			})
		},function(err){
			reject(err)
		})
	}
	Promise.all( updateItemsForPickup )
	.then(function(response){
		Order.findOne({orderId : req.body.orderId})
		.then(function(order){
			order.status = "PICKED UP"
			order.pickupDate = new Date()
			order.save()
			.then(function(orderResponse){
				var logObjToSave = {
				    category : "ORDER",
				    details : {
				      type : "ORDER DELIVERY",
				      number : orderResponse.orderId,
				      itemCount : orderResponse.items.length,
				      name : orderResponse.name,
				      contact : orderResponse.customer
				    }
				}
				logSave ( logObjToSave )				
				res.json({status : "SXS"})
			},function(err){
				res.json({status : 'ERROR'})
			})
		},function(err){
			res.json({status : 'ERROR'})
		})
	},function(err){
		res.json({status : 'ERROR'})
	})
	
})


app.post('/returnOrder',isLoggedIn,function(req,res){
	console.log("IN RETURN API")	
	var list = JSON.parse(req.body.dataObj)
	var updateItemsForReturn = [] ;
	updateItemsForReturn.length = list.length
	var cnt = 0 ;
	for ( var i = 0 ; i < list.length ; ++i ){
		updateItemsForReturn[i] = 
		Item.findOne({ barCode : list[i].barCode })
		.then(function(item){
			var v = list[cnt++].qty ;
			console.log(`SELECTED ${item.name}
				VALUE TO BE DEALT WITH v = ${v}
				BEFORE VALUES:
				AVAILABLE STOCK = ${item.availableStock}
				RENTED STOCK = ${item.rentedStock}`)
			item.availableStock = item.availableStock + v
			item.rentedStock = item.rentedStock - v
			console.log(`
				AFTER VALUES:
				AVAILABLE STOCK = ${item.availableStock}
				RENTED STOCK = ${item.rentedStock}`)			
			item.save()
			.then(function(rslt){
				var objToSave = {
					category : 'STOCK' ,
					details : {
						type : 'RETURN',
						orderId : req.body.orderId ,
						barCode : rslt.barCode ,
						name : rslt.name ,
						qty : v ,
						status : rslt.availableStock + " / " + rslt.totalStock 
					}
				}
				logSave( objToSave )								
				console.log(`REURNED ${item.name}`)
			},function(err){
				reject(err)
			})
		},function(err){
			reject(err)
		})
	}
	Promise.all( updateItemsForReturn )
	.then(function(response){
		Order.findOne({orderId : req.body.orderId})
		.then(function(order){
			order.status = "ORDER RETURNED"
			order.returnDate = new Date() 
			order.save()
			.then(function(orderResponse){
				Customer.findOne({contact: req.body.custId})
				.then(function(customer){
					customer.orders = customer.orders - 1
					customer.save()
					.then(function(custResponse){
						var logObjToSave = {
						    category : "ORDER",
						    details : {
						      type : "ORDER RETURN",
						      orderId : orderResponse.orderId,
						      itemCount : orderResponse.items.length,
						      name : custResponse.name,
						      contact : custResponse.contact
						    }
						}
						logSave ( logObjToSave )
						res.json({status : "SXS"})
					},function(err){
						res.json({status : "ERROR"})
					})
				},function(err){
					res.json({status : "ERROR"})
				})
			},function(err){
				res.json({status : 'ERROR'})
			})
		},function(err){
			res.json({status : 'ERROR'})
		})
	},function(err){
		res.json({status : 'ERROR'})
	})
	
})

app.post('/stockDetails/:itemId',isLoggedIn,function(req,res){
	console.log(req.params.itemId)
	var resObj = [] ;
	var x = {} ;
	Order.find({status : { $eq: 'PICKED UP' } }, 'name customer items pickupDate returnDate -_id' )
	.then(function(orders){
		console.log(orders)
		var cnt = 0 ;
		for( var i = 0 ; i < orders.length ; ++i ){
			for( var j = 0 ; j < orders[i].items.length ; ++j ){
				if ( orders[i].items[j].barCode === req.params.itemId ){
					x = {} ;
					x.custName = orders[i].name ;
					x.custContact = orders[i].customer ;
					x.pickupDate = orders[i].pickupDate ;
					x.returnDate = orders[i].returnDate ;
					x.qty = orders[i].items[j].qty ;
					resObj.push(x)
				}
			}
		}
		res.json({status : "SXS" , result : resObj})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.get('/report' , isLoggedIn , function(req,res){
	var mnth = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December' ] ;
	var shortid = req.query.shortid ;
	var incData = JSON.parse( req.query.data ) ;
	var dataObj = {
		template : { shortid : shortid },
		// data : incData ,
		options : {
			preview : true
		}
	}	
	var options = {
		uri : "http://127.0.0.1:1802/api/report" ,
		method : 'POST'
		// json : data 
	}	

		// console.log ( 'BEFORE CONVERTING')
		// console.log ( incData ) ;
		var x = new Date( incData.startDate )
		// var t1 = incData.startDate
		incData.startDate = x.getDate() 
		incData.startDate += ' '
		incData.startDate += mnth[x.getMonth()]
		incData.startDate += ' '
		incData.startDate += x.getFullYear()
		var y = new Date( incData.endDate )
		// var t2 = incData.endDate
		incData.endDate = y.getDate() 
		incData.endDate += ' '
		incData.endDate += mnth[y.getMonth()]
		incData.endDate += ' '
		incData.endDate += y.getFullYear()	
		x.setHours(0)
		x.setMinutes(0)
		x.setSeconds(0)
		y.setHours(0)
		y.setMinutes(0)
		y.setSeconds(0)			
		// console.log(`x = ${x}`)
		// console.log(`y = ${y}`)
		if ( req.query.type === '1' ){	
			console.log("i am in 1")
			Log.find({$and:[{ createdDate : {$gte : x }},{ createdDate : {$lte : y}},{ category : { $eq : "STOCK" } }]})
			.then(function(rslt){
				incData.stkItems = rslt
				dataObj.data = incData
				options.json = dataObj
				request(options).pipe(res)			
				},function(err){
					incData.stkItems = { status : "ERROR" }
				})
		} else if ( req.query.type === '2' ){
			console.log("i am in 2")
			Log.find({$and:[{ createdDate : {$gte : x }},{ createdDate : {$lte : y}},{ category : { $eq : "TRANSACTION" } }]})
			.then(function(rslt){
				incData.stkItems = rslt
				dataObj.data = incData
				options.json = dataObj
				request(options).pipe(res)			
				},function(err){
					incData.stkItems = { status : "ERROR" }
				})
		}


})	

app.get('/logs',function(req,res){
	Log.find({},null,{sort:{createdDate : -1}})
	.then(function(result){
		res.send(result)
	},function(err){
		res.send(err)
	})
})

app.get('*'  , function(req,res){
	var newUrl = "http://localhost:2016/#!"+req.originalUrl ;
	res.redirect ( newUrl ) ;
})

app.listen ( app.settings.port , function(err){
	if(err)
		console.log("**ERROR CREATING SERVER**")
	else
		console.log(`SERVER LISTENING TO ${app.settings.port}`)
})


function isLoggedIn(req, res, next) {
	if ( !config.genConfig.debug )
    	console.log(`${req.isAuthenticated()}     token: ${req.session.token}`)
    else
    	console.log("** IN DEBUG MODE **")
    if ( config.genConfig.debug || (req.isAuthenticated() && (req.session.token == req.body.token)))
        return next();
    console.log("ERROR IN AUTHENTICATION")
    console.log(`req.isAuthenticated : ${req.isAuthenticated()}
    	Session Token : ${req.session.token}
    	Incoming Token: ${req.body.token}`)
    res.redirect('/');
}

var logSave = ( logObjToSave ) => {
	var logObj = new Log() 
	logObj.category = logObjToSave.category
	logObj.details = logObjToSave.details
	logObj.readableDate = readableDateFunc(new Date())
	logObj.save()
	.then(()=>{
		console.log("LOGGED")
	},()=>{
		console.log("ERROR IN LOGGING")
	})
}

var readableDateFunc = function(string){
	var convertedDate = ''
	if ( string.getDate() >= 1 && string.getDate() <= 9 )
		convertedDate = '0' 
	convertedDate += string.getDate() 
	convertedDate += '.'
	if ( string.getMonth() >= 0 && string.getMonth() <= 8 )
		convertedDate += '0'	
	convertedDate += (string.getMonth()+1)
	convertedDate += '.'
	convertedDate += string.getFullYear()		
	return convertedDate 	
}