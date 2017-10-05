angular.module('sideNavModule', ['serviceModule'])
.controller('sideNavCtrl', function( $rootScope , $scope , $state , user){
	$scope.userName = user.getName()
	$scope.role = user.getRole()

	

	$scope.ref = function(){
		$state.reload() ;
	}

	$rootScope.humburger = function(){
		$rootScope.showSideNav = !($rootScope.showSideNav)
	}

	$rootScope.hideSideNav = function(){
		$rootScope.showSideNav = false
	}
});

