'use strict'

//FORMAT dd.MM.YYYY
var dateConverter1 = function(string){
	let convertedDate = ''
	if ( string.getDate() >= 1 && string.getDate() <= 9 )
		convertedDate = '0' 
	convertedDate += string.getDate() 
	convertedDate += '.'
	if ( string.getMonth() >= 0 && string.getMonth() <= 8 )
		convertedDate += '0'	
	convertedDate += (string.getMonth()+1)
	convertedDate += '.'
	convertedDate += string.getFullYear()		
	return convertedDate 	
}

//RESET DATE TO 12AM
var dateReset = function(string){
	string.setHours(0)
	string.setMinutes(0)
	string.setSeconds(0)
	return string
}

module.exports.dateConverter1 = dateConverter1
module.exports.dateReset = dateReset