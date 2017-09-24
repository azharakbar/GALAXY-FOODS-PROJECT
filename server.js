'use strict'
const 	express = require('express') ,
		mongoose = require('mongoose') ,
		bodyParser = require('body-parser') ,
		cookieParser = require('cookie-parser'),
		passport = require('passport') ,
		logger = require('morgan') ,
		bluebird = require('bluebird'),
		session = require('express-session'),
		cors = require('cors'),

		request = require('request'),
		
		config = require('./config/config') ,
		Customer = require('./models/customer'),
		Item = require('./models/item'),
		Order = require('./models/order'),
		Bill = require('./models/bill'),
		Log = require('./models/log')

var app = express() ;

const indexRouter = require('./routes/indexRouter')

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

// config.passportConfig.pass(passport);

app.use(session({'secret':config.genConfig.secret , resave:true , saveUninitialized:true}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/',express.static(__dirname+'/public'));


app.use ( '/' , indexRouter )
// app.use('/test', isLoggedIn, indexRouter )

app.get('/check',function(req,res){
    res.json({status:req.isAuthenticated()})
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
						id : billResponse.billId ,
						amount : billResponse.billAmount ,
						totalCredit : custResponse.credit ,
						name : billResponse.name ,
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
	var v = 0 ;
	for ( var i = 0 ; i < items.length ; ++i ){
		updateItemsForStock[i] = 
		Item.findOne({ barCode : items[i].barCode })
		.then(function(item){
			// var v = items[cnt++].qty ;
			for ( var j = 0 ; j < items.length ; ++j )
				if ( items[j].barCode == item.barCode )
					v = items[j].qty 			
			item.totalStock = item.totalStock - v
			item.availableStock = item.availableStock - v
			item.lastVal = v
			item.save()
			.then(function(rslt){
				var objToSave = {
					category : 'STOCK' ,
					details : {
						type : 'LOST',
						// orderId : req.body.orderId ,
						barCode : rslt.barCode ,
						name : rslt.name ,
						qty : rslt.lastVal ,
						status : rslt.availableStock + " / " + rslt.totalStock 
					}
				}		
				logSave( objToSave )				
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
			.then(function(custResponse){
				bill.save()
				.then(function(billResponse){
					objToSave = {
						category : 'TRANSACTION' ,
						details : {
							type : 'CREDIT',
							id : billResponse.billId ,
							amount : billResponse.billAmount ,
							totalCredit : custResponse.credit ,
							name : billResponse.name ,
							contact : billResponse.customer
						}
					}
					logSave( objToSave )					
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
	var v = 0 ;
	for ( var i = 0 ; i < list.length ; ++i ){
		updateItemsForPickup[i] = 
		Item.findOne({ barCode : list[i].barCode })
		.then(function(item){
			// var v = list[cnt++].qty ;
			for ( var j = 0 ; j < list.length ; ++j )
				if ( list[j].barCode == item.barCode )
					v = list[j].qty
			item.availableStock = item.availableStock - v
			item.rentedStock = item.rentedStock + v
			item.lastVal = v 
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
						qty : rslt.lastVal ,
						status : rslt.availableStock + " / " + rslt.totalStock 
					}
				}		
				logSave( objToSave )
				console.log(`PICKED UP ${item.name}`)
			},function(err){
				console.log("error in item save")
			})
		},function(err){
			console.log("error in item findOne")
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
	console.log(`DataObj = ${req.body.dataObj}`)
	var list = JSON.parse(req.body.dataObj)
	console.log(`List = ${list}`)
	var updateItemsForReturn = [] ;
	updateItemsForReturn.length = list.length
	var cnt = 0 ;
	var v = 0 ;
	for ( var i = 0 ; i < list.length ; ++i ){
		updateItemsForReturn[i] = 
		Item.findOne({ barCode : list[i].barCode })
		.then(function(item){
			// var v = list[cnt++].qty ;
			for ( var j = 0 ; j < list.length ; ++j )
				if ( list[j].barCode == item.barCode )
					v = list[j].qty 
			console.log(`SELECTED ${item.name}
				VALUE TO BE DEALT WITH v = ${v}
				BEFORE VALUES:
				AVAILABLE STOCK = ${item.availableStock}
				RENTED STOCK = ${item.rentedStock}`)
			item.availableStock = item.availableStock + v
			item.rentedStock = item.rentedStock - v
			item.lastVal = v
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
						qty : rslt.lastVal ,
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

app.post('/cancelOrder' , isLoggedIn , function(req,res){
	console.log(`CANCEL ORDER API ... orderId = ${req.body.orderId}`)
	var amt = 0 ;
	var refundAmt = 0;
	Order.findOne({orderId : req.body.orderId})
	.then(function(order){
		if ( order !== null ){
			order.status = "ORDER CANCELLED"
			order.save()
			.then(function(orderResponse){
				var objToSave = {
					category : 'ORDER' ,
					details : {
						type : 'ORDER CANCELLATION',
						number : orderResponse.orderId,
						name : orderResponse.name,
						contact : orderResponse.customer
					}
				}
				logSave( objToSave )
				Bill.findOne({ billId : orderResponse.billId })
				.then(function(bill){
					if ( bill !== null )
						console.log(`FOUND BILL ${orderResponse.billId}`)
					else
						console.log(`NOT FOUND BILL ${orderResponse.billId}`)
					amt = bill.billAmount
					refundAmt = bill.remAmount - bill.billAmount
					console.log(`BILL DETAILS : ${bill.billId}   ${bill.billAmount}    ${bill.totalPaid}`)
					if ( refundAmt )
						bill.status = "CANCELLED & REFUNDED"
					else
						bill.status = "CANCELLED"
					bill.lastPaidDate = new Date()
					bill.save()
					.then(function(billResponse){
						var objToSave = {
							category : 'BILL' ,
							details : {
								type : 'BILL CANCELLATION',
								number : billResponse.billId,
								name : orderResponse.name,
								contact : orderResponse.customer
							}
						}
						logSave( objToSave )						
						Customer.findOne({ contact : billResponse.customer })
						.then(function(customer){
								if ( customer !== null )
									console.log(`FOUND CUSTOMER ${billResponse.customer}`)
								else
									console.log(`NOT FOUND CUSTOMER ${billResponse.customer}`)
								console.log(`CUSTOMER DETAILS B4 : ${customer.orders}   ${customer.credit}`)							
							customer.orders -= 1 ;
							customer.credit -= amt 
							console.log(`CUSTOMER DETAILS A4 : ${customer.orders}   ${customer.credit}`)							
							customer.save()
							.then(function(custResponse){
								if ( refundAmt ){
									var objToSave = {
										category : 'TRANSACTION' ,
										details : {
											type : 'CNL',
											id : billResponse.billId,
											amount : -amt,
											totalCredit : custResponse.credit,
											name : custResponse.name,
											contact : orderResponse.customer
										}
									}
									logSave( objToSave )	
								}	
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
			},function(err){
				res.json({status : 'ERROR'})
			})
		} else {
			res.json({status : 'NO ORDER FOUND'})
		}
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
	var incData = {} ;
	if ( req.query.data !== undefined )
		incData = JSON.parse( req.query.data ) ;
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
		if ( req.query.type === '1' || req.query.type === '2'){
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
		}
		// console.log(`x = ${x}`)
		// console.log(`y = ${y}`)
		if ( req.query.type === '1' ){	
			Log.find({$and:[{ createdDate : {$gte : x }},{ createdDate : {$lte : y}},{ category : { $eq : "STOCK" } }]})
			.then(function(rslt){
				incData.stkItems = rslt
				dataObj.template.shortid = "B1yDqRVwW"
				dataObj.data = incData
				options.json = dataObj
				request(options).pipe(res)			
				},function(err){
					incData.stkItems = { status : "ERROR" }
				})
		} else if ( req.query.type === '2' ){
			Log.find({$and:[{ createdDate : {$gte : x }},{ createdDate : {$lte : y}},{ category : { $eq : "TRANSACTION" } }]})
			.then(function(rslt){
				incData.stkItems = rslt
				dataObj.template.shortid = "H1e0jWYdZ"
				dataObj.data = incData
				options.json = dataObj
				request(options).pipe(res)			
				},function(err){
					incData.stkItems = { status : "ERROR" }
				})
		} else if ( req.query.type === '3' ){
			Order.findOne({ orderId : req.query.orderId })
			.then(function(rslt){
				incData.orderId = rslt.orderId
				incData.name = rslt.name
				incData.contact = rslt.customer
				incData.dateOfIssue = rslt.issueDate
				incData.dateOfDelivery = rslt.pickupDate
				incData.dateOfReturn = rslt.returnDate
				incData.stkItems = rslt.items
				console.log(`incData = ${incData}`)
				console.log(rslt)
				console.log(rslt.orderId)
				dataObj.data = incData
				dataObj.template.shortid = "Hkx4iKs9b"
				options.json = dataObj
				request(options).pipe(res)			
				},function(err){
					incData.stkItems = { status : "ERROR" }
				})
		}
		console.log("here in report")
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
	var newUrl = "http://localhost:2017/#!"+req.originalUrl ;
	res.redirect ( newUrl ) ;
})

app.listen ( app.settings.port , function(err){
	if(err)
		console.log("**ERROR CREATING SERVER**")
	else
		console.log(`SERVER LISTENING TO ${app.settings.port}`)
})


function isLoggedIn(req, res, next) {
/*	if ( !config.genConfig.debug )
    	console.log(`${req.isAuthenticated()}     token: ${req.session.token}`)
    else
    	console.log("** IN DEBUG MODE **")*/

    //console.log(`INCOMING IP : ${req.ip}`)

    if ( config.genConfig.debug || (req.isAuthenticated() && (req.session.token == req.body.token)))
        return next();
    console.log("ERROR IN AUTHENTICATION")
    console.log(`req.isAuthenticated : ${req.isAuthenticated()}
    	Session Token : ${req.session.token}
    	Incoming Token: ${req.body.token}`)
    res.redirect('/');
}

