angular.module('dashModule',['serviceModule'])
.controller('dashCtrl',function($scope,user){
	$scope.name = user.getName() ;
})