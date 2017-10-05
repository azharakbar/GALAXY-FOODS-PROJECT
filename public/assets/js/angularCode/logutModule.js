angular.module('logoutModule',['ui.router','serviceModule','serviceModule2'])
.controller('logoutCtrl',function($rootScope,$state,$http,user,toast){
	$http({
		url : '/logout',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded'
		}
	})
	.then(function(response){
		user.clear() ;
        toast.setMsg("!! LOGGED OUT !!")
        showToast("error")
		$state.go('login')	
	})
})