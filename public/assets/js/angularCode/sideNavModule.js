angular.module('sideNavModule', ['serviceModule'])
.controller('sideNavCtrl', function($scope , $state , user){
	$scope.userName = user.getName()
	$scope.role = user.getRole()

	$scope.ref = function(){
		$state.reload() ;
	}
});

