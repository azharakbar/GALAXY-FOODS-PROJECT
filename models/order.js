var mongoose = require('mongoose')

var orderSchema = mongoose.Schema({
	orderId : { type : String , default : "0" },
	customer : { type : String , default : "NOT ASSIGNED"},
	items : { type : Array , default : [] },
	billId : {type : String , default: "PC0"}	
})

module.exports = mongoose.model('order',orderSchema)