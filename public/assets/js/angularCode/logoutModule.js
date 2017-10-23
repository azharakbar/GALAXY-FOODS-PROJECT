angular.module('logoutModule',['ui.router','serviceModule','serviceModule2'])
.controller('logoutCtrl',function($rootScope,$state,$http,$stateParams,user,toast){
	$http({
		url : '/logout',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded'
		}
	})
	.then(function(response){
		user.clear() ;
		console.log($rootScope.fS)
		if ( $rootScope.fS !== 'login' && $rootScope.fS !== undefined ){
			localStorage.setItem( 'toGo' , $rootScope.fS )
		} else {
			localStorage.removeItem('toGo')
		}
		$rootScope.fS = undefined
        toast.setMsg("!! LOGGED OUT !!")
        showToast("error")
		$state.go('login')
	})
})