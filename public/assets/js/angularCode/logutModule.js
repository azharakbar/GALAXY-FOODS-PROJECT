angular.module('logoutModule',['ui.router','serviceModule'])
.controller('logoutCtrl',function($rootScope,$state,$http,user){
	$http({
		url : '/logout',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded'
		}
	})
	.then(function(response){
		console.log(response.data)
		user.clear() ;
		$rootScope.error = "LOGGED OUT" ;
		$state.go('login')	
	})
})