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
		Item = require('./models/item')

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
