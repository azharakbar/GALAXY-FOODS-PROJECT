const mongoose = require('mongoose') ;

var customerSchema =  mongoose.Schema({
	name : String ,
	contact : String ,
	createdDate : { type: Date, default: Date.now },
	credit : { type: Number , default: 0 },
	orders : { type: Number , default: 0 }
});

customerSchema.post('save',function(){
	// console.log(this)
})

module.exports = mongoose.model('customer',customerSchema)