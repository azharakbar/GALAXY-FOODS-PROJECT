var total = 0 ;
var prod = 0 ;
var mnth = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December' ] ;
function formatDate(str){
	var convertedDate = ''
	var string = new Date(str);
	if ( string.getDate() >= 1 && string.getDate() <= 9 )
		convertedDate = '0' 
	convertedDate += string.getDate() 
	convertedDate += ' '
	convertedDate += mnth[string.getMonth()];
	convertedDate += ' '
	convertedDate += string.getFullYear()		
	return convertedDate 	
}

function mult(val1,val2){
    prod = val1*val2 ;
    total += prod ;
    return (val1*val2) ;
}

function getTotal(){
    return total ;
}