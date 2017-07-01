'use strict'
const 	express = require('express') ,
		mongoose = require('mongoose') ,
		bodyParser = require('body-parser') ,
		passport = require('passport') ,
		logger = require('morgan') ,
		config = require('./config/config') ,
		bluebird = require('bluebird'),
		session = require('express-session'),
		cors = require('cors'),
		md5 = require('md5'),
		uniqid = require('uniqid')

// const port = config.genConfig.port ;

var app = express() ;

app.set('port' , config.genConfig.port )
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended : true }))
app.use(cors())

process.env.TZ = config.TZ 

mongoose.Promise = bluebird ;

mongoose.connect ( config.connURI , function(err){
	if ( err )
		console.log(err)
	else
		console.log(">> CONNEXN TO DATABASE ESTABLISHED")
})

config.passportConfig.pass(passport);

app.use(session({'secret':config.genConfig.secret , resave:false , saveUninitialized:true}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/',express.static(__dirname+'/public'));

app.post('/login' , passport.authenticate('local-login',{
	successRedirect : '/dash' , 
	failureRedirect : '/loginFailure'
}))

app.get('/dash',function(req,res){
	var obj = {
		status : 'authDone' ,
		username : 'GALAXY',
		token : md5(uniqid()) 
	}
	req.session.token = obj.token ;	
	res.json( obj ) ;
})

app.get('/loginFailure',function(req,res){
	var obj = {
		status : 'loginFailed' ,
	}
	res.json( obj ) ;
})

app.get('*',function(req,res){
	var newUrl = "http://localhost:2016/#!"+req.originalUrl ;
	res.redirect ( newUrl ) ;
})
app.listen ( app.settings.port , function(err){
	if(err)
		console.log("**ERROR CREATING SERVER**")
	else
		console.log(`SERVER LISTENING TO ${app.settings.port}`)
})