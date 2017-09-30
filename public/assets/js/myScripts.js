var showToast = function(type) {
    var x = document.getElementById("snackbar")
	setTimeout(function(){ x.className = x.className.replace("loading", ""); });
    x.className = type;
    setTimeout(function(){ x.className = x.className.replace(type, ""); }, 3000);
}

var showLoading = function(){
	var x = document.getElementById("snackbar")
	x.className = "ldg"
}

var hideLoading = function(){
	var x = document.getElementById("snackbar")
	x.className = "ldgHide"
	setTimeout(function(){ x.className = x.className.replace("ldgHide", ""); }, 1500);	
}

var checkWidth = function(){
/*    	if ( $('#slide-out').hasClass('expanded')){
    			$('#slide-out').removeClass('expanded')
    			$('#slide-out').addClass('shrunk')
    			$('#slide-out').animate({
    				'width' : '0',
    			})
    			tr1()
    	} else {
    			$('#slide-out').removeClass('shrunk')
    			$('#slide-out').addClass('expanded')
    			$('#slide-out').animate({
    				'width' : '250'
    			})
    			tr2()    			
    	}*/

}
