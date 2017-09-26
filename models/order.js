var mongoose = require('mongoose')

var orderSchema = mongoose.Schema({
	orderId : { type : String , default : "0" },
	issueDate : { type : Date } ,
	pickupDate : { type : Date } ,
	returnDate : { type : Date } ,			
	customer : { type : String , default : "NOT ASSIGNED" },
	name : { type : String , default : "NOT ASSIGNED" },
	items : { type : Array , default : [] },
	billId : {type : String , default: "PC0" },
	status : { type : String , default : "NOT DELIVERED" },
	eveLoxn : { type : String , default : "" },
	evePurpose : { type : String , default : "" }
})

module.exports = mongoose.model('order',orderSchema)