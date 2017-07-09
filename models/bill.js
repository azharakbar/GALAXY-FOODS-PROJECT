var mongoose = require('mongoose')

var billSchema = mongoose.Schema({
	billId : {type : String , default: "PC0"},
	customer : { type : String , default : "NOT ASSIGNED"},
	orderId : { type : String , default : "NOT ASSIGNED"},
	billDate : { type : Date } ,
	billAmount : { type : Number , default : 0 } ,
	prevCredit : { type : Number , default : 0 } ,
	totalAmount : { type : Number , default : 0 } ,
})

module.exports = mongoose.model('bill' , billSchema)