const mongoose = require('mongoose'),
      md5   = require('md5');

var accountSchema = mongoose.Schema({
	username : String ,
	pwd : String ,
	token : String 
})

accountSchema.methods.checkPassword = function(password){
	var x = this.pwd ;
	var y = md5(password)
	if ( x === y )
		return true ;
	else
		return false ;
}

module.exports = mongoose.model('account',accountSchema)