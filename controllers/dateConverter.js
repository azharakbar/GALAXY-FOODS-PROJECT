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
var dateReset = function(string , type){
	var v1 = 0 ,
		v2 = 0
	if ( type === "dayStart" ){
		v1  = 0
		v2 = 0
	} else if ( type === "dayEnd" ){
		v1 = 23
		v2 = 59
	}
	string.setHours(v1)
	string.setMinutes(v2)
	string.setSeconds(v2)
	return string
}

module.exports.dateConverter1 = dateConverter1
module.exports.dateReset = dateReset