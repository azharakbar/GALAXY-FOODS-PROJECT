var mongoose = require('mongoose')

var billSchema = mongoose.Schema({
	billId : {type : String , default: "PC0"},
	billDate : { type : Date } ,
	customer : { type : String , default : "NOT ASSIGNED"},
	name : { type : String , default : "NOT ASSIGNED"},
	orderId : { type : String , default : "NOT ASSIGNED"},
	billAmount : { type : Number , default : 0 } ,
	totalAmount : { type : Number , default : 0 } ,
	remAmount : { type : Number , default : 0 } ,
	lastPaidDate : { type : Date , default : null },
	status : { type : String , default : "NOT PAID"}
})

module.exports = mongoose.model('bill' , billSchema)