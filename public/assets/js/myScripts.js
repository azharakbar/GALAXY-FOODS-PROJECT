var showToast = function(type) {
    var x = document.getElementById("snackbar")
    x.className = type;
    setTimeout(function(){ x.className = x.className.replace(type, ""); }, 3000);
}