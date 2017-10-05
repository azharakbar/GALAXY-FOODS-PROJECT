window.host = "10.70.7.80"
window.port = "2017"

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
