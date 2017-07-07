angular.module('newItemModule',['serviceModule'])
.controller('newItemCtrl',function($scope,$rootScope,$http,user,$state){
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
		if ( (key >= 48 && key <= 57) || key == 8 || (key >= 96 && key <= 105) || key == 110 || key == 190 )
			valid = true ;
		else 
			valid = false ;

		if ( modelName === "totalStock" ){
			if ( !valid ){
				$scope.totalStock = $rootScope.temp ;
			} else if ( valid && $scope.totalStock == undefined ){
				$rootScope.temp = '' ;
			} else if ( valid && $scope.totalStock.length >= 1 && $scope.totalStock != undefined ){
				$rootScope.temp = $scope.totalStock ;
			}
		} else if ( modelName === "stockInHand"){
			if ( !valid ){
				$scope.stockInHand = $rootScope.temp ;
			} else if ( valid && $scope.stockInHand == undefined ){
				$rootScope.temp = '' ;
			} else if ( valid && $scope.stockInHand.length >= 1 && $scope.stockInHand != undefined ){
				$rootScope.temp = $scope.stockInHand ;
			}
		} else if ( modelName === "price"){
			if ( !valid ){
				$scope.price = $rootScope.temp ;
			} else if ( valid && $scope.price == undefined ){
				$rootScope.temp = '' ;
			} else if ( valid && $scope.price.length >= 1 && $scope.price != undefined ){
				$rootScope.temp = $scope.price ;
			}
		}
	}
	$scope.rst = function(val){
		if(val === "same")
			$rootScope.same = false ;
		else if ( val === "valid")
			$rootScope.valid = true ;
		else if ( val === "temp")
			$rootScope.temp = '' ;
	}

	$scope.submit = function(){
		if($scope.itemBarCode != undefined && $scope.itemName != undefined && $scope.price != undefined ){
			if($scope.itemBarCode.length >= 2 && $scope.itemName.length >= 2 && $scope.price.length >= 1 ){
				if ( $scope.stockInHand != undefined && $scope.stockInHand != '' ){
					if ( $scope.totalStock != undefined && $scope.totalStock != '' ){
						if ( $scope.totalStock < $scope.stockInHand ){
							$scope.errorMsg = "!! AVAILABLE STOCK CANT BE MORE THAN TOTAL STOCK !!"
							showToast("error")
							return ;
						}
					} else {
						$scope.errorMsg = "** ENTER BOTH STOCK VALUES **"
						showToast("error")
						return ;
					}
				}
				$scope.errorMsg = "LOADING"
				showLoading();
				var data = "barcode=" + $scope.itemBarCode + "&name=" + $scope.itemName + "&price=" + $scope.price
				if ( $scope.stockInHand != undefined && $scope.stockInHand != '' )
					data += "&stockInHand="+$scope.stockInHand ;
				if ( $scope.totalStock != undefined && $scope.totalStock != '' )
					data += "&totalStock="+$scope.totalStock ;
				data += "&token="+user.getToken()
				console.log(data)
				post(data)
				.then(function(res){
					showToast("success");
				},function(err){
					console.log("from main err= "+err)
					showToast("error");
				})
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

	var post = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : '/newItem',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : dataObj
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					$scope.errorMsg = "ITEM SUCCESSFULLY ADDED"
					$scope.itemBarCode = "" 
					$scope.itemName = "" 
					$scope.price = "" 
					$scope.stockInHand = "" 
					$scope.totalStock = "" 
					resolve("SUCCESS")
				} else {
					if (response.data.status === "REDUNDANT") {
						$scope.errorMsg = "ITEM ALREADY EXISTS"
					} else {
						$scope.errorMsg = "!! ERROR ADDING ITEM !!"
					}
					reject ("ERROR1") 
				}
			},function(err){
				$scope.errorMsg = "!! ERROR ADDING ITEM !!"
				reject ("ERROR2") 
			})
	})
	}
})
