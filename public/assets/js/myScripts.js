var showToast = function(type) {
    var x = document.getElementById("snackbar")
	setTimeout(function(){ x.className = x.className.replace("loading", ""); });
    x.className = type;
    setTimeout(function(){ x.className = x.className.replace(type, ""); }, 3000);
}

var showLoading = function(){
	console.log("Here")
	var x = document.getElementById("snackbar")
	x.className = "ldg"
	// setTimeout(function(){ x.className = x.className.replace("ldg", ""); }, 3000);
}

var hideLoading = function(){
	var x = document.getElementById("snackbar")
	x.className = "ldgHide"
	setTimeout(function(){ x.className = x.className.replace("ldgHide", ""); }, 3000);	
}