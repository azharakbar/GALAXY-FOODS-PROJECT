const mongoose = require('mongoose'),
      md5   = require('md5');

var accountSchema = mongoose.Schema({
	username : String ,
	pwd : String ,
	token : String 
})

accountSchema.methods.checkPassword = function(password){
	if ( this.pwd === md5(password) )
		return true ;
	else
		return false ;
}

module.exports = mongoose.model('account',accountSchema)