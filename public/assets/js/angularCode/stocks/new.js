angular.module('newItemModule',[])
.controller('newItemCtrl',function($scope,$rootScope){
	$rootScope.same = false ;
	$rootScope.valid = true ;
	$rootScope.temp = '' ;
	$scope.toUpper = function(modelName){
		if ( modelName === "itemBarCode"){
			$scope.itemBarCode = $scope.itemBarCode.toUpperCase() ;
		} else if ( modelName === "itemName" ){
			if ( $scope.itemBarCode === undefined || $scope.itemBarCode === "" ){
				$rootScope.same = true ;
			}
			$scope.itemName = $scope.itemName.toUpperCase() ;
			if ( $rootScope.same == true ){
				$scope.itemBarCode = $scope.itemName
			}
		}
	}
	$scope.checkNumber = function(modelName){
		var key = event.keyCode ;
		if ( (key >= 48 && key <= 57) || key == 8 || (key >= 96 && key <= 105))
			valid = true ;
		else 
			valid = false ;

		console.log("inside fn "+modelName)
		if ( modelName === "totalStock" ){
			console.log("inside 1")
			if ( !valid )
				$scope.totalStock = $rootScope.temp ;
			if ( valid && $scope.totalStock == undefined ){
				$rootScope.temp = '' ;
			}
			else if ( valid && $scope.totalStock.length >= 1 && $scope.totalStock != undefined ){
				$rootScope.temp = $scope.totalStock ;
			}
		} else if ( modelName === "stockInHand"){
			if ( !valid )
				$scope.stockInHand = $rootScope.temp ;
			if ( valid && $scope.stockInHand == undefined ){
				$rootScope.temp = '' ;
			}
			else if ( valid && $scope.stockInHand.length >= 1 && $scope.stockInHand != undefined ){
				$rootScope.temp = $scope.stockInHand ;
			}
		} else if ( modelName === "price"){
			if ( !valid )
				$scope.price = $rootScope.temp ;
			if ( valid && $scope.price == undefined ){
				$rootScope.temp = '' ;
			}
			else if ( valid && $scope.price.length >= 1 && $scope.price != undefined ){
				$rootScope.temp = $scope.price ;
			}
		}
	}
	$scope.rst = function(val){
		if(val === "same")
			$rootScope.same = false ;
		else if ( val === "valid")
			$rootScope.valid = true ;
	}

	$scope.submit = function(){
		if($scope.itemBarCode.length != undefined && $scope.itemName.length != undefined && $scope.price.length != undefined ){
			if($scope.itemBarCode.length >= 2 && $scope.itemName.length >= 2 && $scope.price.length >= 1 ){
				$scope.errorMsg = "ITEM SUCCESSFULLY ADDED"
				showToast("success");
			}
			else{
				$scope.errorMsg = "SOME VALUES ARE TOO SHORT" ;
				showToast("normal");
			}
		} else {
			$scope.errorMsg = "!! ERROR ADDING ITEM !!"
			showToast("error");
		} 
	}
})