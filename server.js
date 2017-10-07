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
app.set('host' , config.genConfig.host )
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

app.use(session({'secret':config.genConfig.secret , resave:true , saveUninitialized:true}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/',express.static(__dirname+'/public'));


app.use ( '/' , indexRouter )

app.post('/testAPI/:name?',function(req,res){
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
	var newUrl = "http://"+app.settings.host+":"+app.settings.port+"/#!"+req.originalUrl ;
	res.redirect ( newUrl ) ;
})

app.listen ( app.settings.port , function(err){
	if(err)
		console.log("**ERROR CREATING SERVER**")
	else
		console.log(`SERVER LISTENING TO ${app.settings.host}:${app.settings.port}`)
})


