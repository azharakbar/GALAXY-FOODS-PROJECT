    function t(str){
        return str.toUpperCase();
    }
    
function convertDate(string){
	var mnth = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December' ] ;
	var convertedDate = '' 
	convertedDate = string.getDate() 
	convertedDate += ' '
	convertedDate += mnth[string.getMonth()]
	convertedDate += ' '
	convertedDate += string.getFullYear()		
	return convertedDate 
}