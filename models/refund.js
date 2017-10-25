const mongoose = require('mongoose')

let refundSchema = mongoose.Schema({
    refundId : { type : String , default : "NOT ASSIGNED" },
    name : String,
    issueDate : { type : Date , default : Date.now },
    amount : { type : Number , default : 0 },
    status : { type : String , default : "ISSUED" },
    billCancelDate : Date,
    paymentDate : Date
})

module.exports = mongoose.model('refund' , refundSchema )