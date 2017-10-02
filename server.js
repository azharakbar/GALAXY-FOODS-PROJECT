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

mongoose.connect ( config.connURI , {
	useMongoClient : true
})
.then((response)=>{
	console.log(">> CONNEXN TO DATABASE ESTABLISHED")
},(err)=>{
	console.log(err)
})

// config.passportConfig.pass(passport);

app.use(session({'secret':config.genConfig.secret , resave:true , saveUninitialized:true}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/',express.static(__dirname+'/public'));


app.use ( '/' , indexRouter )

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
				for ( let key in rslt )
					incData[key] = rslt[key]
				dataObj.data = incData
				dataObj.template.shortid = "Hkx4iKs9b"
				options.json = dataObj
				request(options).pipe(res)			
				},function(err){
					incData.items = { status : "ERROR" }
				})
		} else if ( req.query.type === '4' ){
			Bill.findOne({ billId : req.query.billId },'-_id')
			.then(function(billResponse){
				Log.find({$and:[{
					"category" : "TRANSACTION"
				},{
					"details.id" : { $eq : req.query.billId}
				}]},
				'readableDate details.type details.paid details.status details.remAmount details.amount details.totalCredit -_id')
				.then(function(logResponse){
					incData.history = []
					for ( let key in billResponse )
						incData[key] = billResponse[key]
					dataObj.data = {'incData' : incData , 'logData' : logResponse}
					dataObj.template.shortid = "SJe4TwTsW"
					options.json = dataObj
					request(options).pipe(res)							
				},(err)=>{
					res.send("error while rendering report")
				})
			},(err)=>{
				res.send("error while rendering report")
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


app.get('/reset',(req,res)=>{
/*	Order.find({})
	.then((response)=>{
		for ( var i = 0 ; i < response.length ; ++i ){
			response[i].status = "NOT DELIVERED"
			response[i].save()
		}
	})*/
	console.log("****RESET API****")
	Order.remove({})
	.then(()=>{})
	Bill.remove({})
	.then(()=>{})
	Item.find({})
	.then((response)=>{
		for ( var i = 0 ; i < response.length ; ++i ){
			response[i].rentedStock = 0
			response[i].availableStock = response[i].totalStock	
			response[i].save()
		}
	})
	Customer.find({})
	.then((response)=>{
		for ( var i = 0 ; i < response.length ; ++i ){
			response[i].credit = 0
			response[i].orders = 0
			response[i].save()
		}			
	})
	res.send("ok")
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

