angular.module('sideNavModule', ['serviceModule'])
.controller('sideNavCtrl', function($scope , user){
	$scope.userName = user.getName()
	$scope.role = user.getRole()
});

