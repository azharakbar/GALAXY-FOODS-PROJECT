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
		Customer = require('./models/customer'),
		Item = require('./models/item'),
		Order = require('./models/order'),
		Bill = require('./models/bill')

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
			console.log("THERE'S NOBODY")
			var customer = new Customer() ;
			customer.name = req.body.name
			customer.contact = req.body.contact
			customer.createdDate = new Date() 
			customer.save()
			.then(function(){
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
	Customer.find({})
	.then(function(users){
		res.json({status : 'SXS' , result : users})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/newItem',isLoggedIn,function(req,res){
	console.log(req.body);
	Item.findOne({barCode:req.body.barcode})
	.then(function(item){
		if ( item ){
			res.json({status : 'REDUNDANT'})
		}
		else{
			console.log("THERE'S NOTHING")
			var item = new Item() ;
			item.barCode = req.body.barcode 
			item.name = req.body.name 
			item.price = req.body.price
			if ( req.body.totalStock != undefined ){
				item.totalStock = req.body.totalStock
				if ( req.body.stockInHand != undefined ){
					item.availableStock = req.body.stockInHand 
					item.rentedStock = parseInt(req.body.totalStock) - parseInt(req.body.stockInHand)
				}
			}
			item.save()
			.then(function(){
				res.json({status : 'SXS'})
			},function(err){
				res.json({status : 'ERROR'})
			})
		}
	},function(err){
		res.json({status : 'ERROR'})
	})
})

// app.post('/totalItems',isLoggedIn,function(req,res){
app.post('/totalItems',function(req,res){
	Item.count()
	.then(function(num){
		res.json({status : 'SXS' , count : num})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

// app.post('/allItems',isLoggedIn,function(req,res){
app.post('/allItems',function(req,res){
	Item.find({})
	.then(function(users){
		res.json({status : 'SXS' , result : users})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.put('/updateItem/:barCode',isLoggedIn,function(req,res){
	Item.findOne({barCode:req.params.barCode})
	.then(function(item){
			if ( req.body.barcode === req.params.barCode ){
				item.barCode = req.body.barcode 
				item.name = req.body.name 
				item.price = req.body.price
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
				.then(function(){
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
							.then(function(){
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
		res.json({status : 'SXS'})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.put('/updateCustomer/:contact',isLoggedIn,function(req,res){
	Customer.findOne({contact:req.params.contact})
	.then(function(customer){
			if ( req.body.contact === req.params.contact ){
				customer.name = req.body.name 
				customer.contact = req.body.contact 
				customer.save()
				.then(function(){
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
						.then(function(){
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
	Item.find({})
	.then(function(items){
		res.json({status : 'SXS' , result : items})
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

	var custContact = dataForCustomerSchema.customer
	var cr = parseFloat(dataForBillSchema.billAmount)

	Customer.findOne( { contact:custContact } )
	.then( function(cust){
		cust.orders += 1 ;
		cust.credit += cr

		cust.save()
		.then(function(response){
			bill.save()
			.then(function(response){
				order.save()
				.then(function(response){
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

app.post('/allBills',isLoggedIn,function(req,res){
	Bill.find({})
	.then(function(bills){
		res.json({status : 'SXS' , result : bills})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

app.post('/payBill',isLoggedIn,function(req,res){
	Bill.findOne({billId : req.body.billId})
	.then(function(bill){
		bill.remAmount -= Math.round(parseInt(req.body.paid))
		console.log(`Rem amount = ${bill.remAmount}`)
		if ( bill.remAmount < 1 ){
			bill.remAmount = 0 ;
			bill.status = "PAID"
		}
		else
			bill.status = "ADVANCE PAYMENT"
		bill.lastPaidDate = new Date()
		bill.save()
		.then(function(){
			Customer.findOne({contact : bill.customer})
			.then(function(cust){
				cust.credit -= parseInt(req.body.paid)
				cust.save()
				.then(function(){
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

// app.post('/allOrders',function(req,res){
app.post('/allOrders',isLoggedIn,function(req,res){
	Order.find({})
	.then(function(bills){
		res.json({status : 'SXS' , result : bills})
	},function(err){
		res.json({status : 'ERROR'})
	})
})

// app.post('/pickUpOrder',function(req,res){
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
			item.save()
			.then(function(){
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
			.then(function(){
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
	var list = JSON.parse(req.body.dataObj)
	var updateItemsForReturn = [] ;
	updateItemsForReturn.length = list.length
	var cnt = 0 ;
	for ( var i = 0 ; i < list.length ; ++i ){
		updateItemsForReturn[i] = 
		Item.findOne({ barCode : list[i].barCode })
		.then(function(item){
			var v = list[cnt++].qty ;
			item.availableStock = item.availableStock + v
			item.rentedStock = item.rentedStock - v
			item.save()
			.then(function(){
				console.log(`REURNED ${item.name}`)
			},function(err){
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
			.then(function(){
				Customer.findOne({contact: req.body.custId})
				.then(function(customer){
					customer.orders = customer.orders - 1
					customer.save()
					.then(function(){
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

// app.post('/stockDetails/:itemId',isLoggedIn,function(req,res){
app.post('/stockDetails/:itemId',function(req,res){
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
    console.log(`${req.isAuthenticated()}     token: ${req.session.token}`)
    if (req.isAuthenticated() && (req.session.token == req.body.token))
        return next();
    console.log("ERROR IN AUTHENTICATION")
    console.log(`req.isAuthenticated : ${req.isAuthenticated()}
    	Session Token : ${req.session.token}
    	Incoming Token: ${req.body.token}`)
    res.redirect('/');
}
