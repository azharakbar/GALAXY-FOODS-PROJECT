const mongoose = require('mongoose')

var logSchema =  mongoose.Schema({
	createdDate : { type: Date, default: Date.now },
	readableDate : String ,
	category : String,
	details : Object
});


module.exports = mongoose.model('log',logSchema)