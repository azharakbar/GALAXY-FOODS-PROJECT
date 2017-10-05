var total = 0 ;
var prod = 0 ;
var mnth = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December' ] ;
function formatDate(str){
	    if ( str === null ){
		            return "-NA-" ;
		        }
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

function add(cr){
	    total += cr ;
}

function deduct(dr){
	    total -= dr ;
}

function getTotal(){
	    return total ;
}
