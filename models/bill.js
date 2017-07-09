var mongoose = require('mongoose')

var billSchema = mongoose.Schema({
	billId : {type : String , default: "PC0"},
	billDate : { type : Date } ,
	customer : { type : String , default : "NOT ASSIGNED"},
	orderId : { type : String , default : "NOT ASSIGNED"},
	billAmount : { type : Number , default : 0 } ,
	prevCredit : { type : Number , default : 0 } ,
	totalAmount : { type : Number , default : 0 } ,
})

module.exports = mongoose.model('bill' , billSchema)