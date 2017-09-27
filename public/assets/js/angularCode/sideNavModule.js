angular.module('sideNavModule', ['serviceModule'])
.controller('sideNavCtrl', function( $rootScope , $scope , $state , user){
	$scope.userName = user.getName()
	$scope.role = user.getRole()

	$scope.ref = function(){
		$state.reload() ;
	}

	$scope.humburger = function(){
		$rootScope.setSideNavVisibility()
	}

	$('.dropdown-content').click(function(){
		$rootScope.setSideNavVisibility(false)
	})
});

