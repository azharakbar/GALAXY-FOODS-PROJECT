angular.module('viewOrderModule',['serviceModule','serviceModule2'])
.controller('viewOrderCtrl',function( $rootScope, $scope, $http, $state, user, toast){




	$scope.expandSearch = function(){
		$('#search').animate( { width:"250px" } )
		$('#search').focus()
	}

	$scope.compressSearch = function(){
		$('#search').animate( { width:"0px" } )
	}

	$scope.searchFocus = function(){
		$('#buttonSet').fadeOut()
	}

	$scope.set= function(inComing){
		$rootScope.order = inComing
		// $rootScope.roundedAmount = Math.round($rootScope.bill.remAmount)
	}
	
})