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

module.exports.dateConverter1 = dateConverter1