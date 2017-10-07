angular.module('newItemModule',['serviceModule','serviceModule2'])
.controller('newItemCtrl',function($scope,$rootScope,$http,$state,user,toast){
	$rootScope.same = false ;
	$rootScope.valid = true ;
	$rootScope.temp = '' ;
	var first = 1 
	$('#itemBarCode').focus()
	first = 1
	$scope.toUpper = function(modelName){
		if ( first == 1 ){
			$scope.itemBarCode = "" 
			first = 0
			return ;
		}		
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
		if ( first == 1 ){
			$scope.itemBarCode = "" 
			first = 0
			return ;
		}		
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
		} else if ( modelName === "availableStock"){
			if ( !valid ){
				$scope.availableStock = $rootScope.temp ;
			} else if ( valid && $scope.availableStock == undefined ){
				$rootScope.temp = '' ;
			} else if ( valid && $scope.availableStock.length >= 1 && $scope.availableStock != undefined ){
				$rootScope.temp = $scope.availableStock ;
			}
		} else if ( modelName === "price"){
			if ( !valid ){
				$scope.price = $rootScope.temp ;
			} else if ( valid && $scope.price == undefined ){
				$rootScope.temp = '' ;
			} else if ( valid && $scope.price.length >= 1 && $scope.price != undefined ){
				$rootScope.temp = $scope.price ;
			}
		} else if ( modelName === "costPrice"){
			if ( !valid ){
				$scope.costPrice = $rootScope.temp ;
			} else if ( valid && $scope.costPrice == undefined ){
				$rootScope.temp = '' ;
			} else if ( valid && $scope.costPrice.length >= 1 && $scope.costPrice != undefined ){
				$rootScope.temp = $scope.costPrice ;
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
		if($scope.itemBarCode != undefined && $scope.itemName != undefined && $scope.price != undefined && $scope.costPrice != undefined ){
			if($scope.itemBarCode.length >= 2 && $scope.itemName.length >= 2 && $scope.price.length >= 1 && $scope.costPrice.length >= 1){
				if ( $scope.availableStock != undefined && $scope.availableStock != '' ){
					if ( $scope.totalStock != undefined && $scope.totalStock != '' ){
						if ( $scope.totalStock < $scope.availableStock ){
							toast.setMsg("!! AVAILABLE STOCK CANT BE MORE THAN TOTAL STOCK !!")
							showToast("error")
							return ;
						}
					} else {
						toast.setMsg("** ENTER BOTH STOCK VALUES **")
						showToast("error")
						return ;
					}
				}
				toast.setMsg("LOADING")
				showLoading();
				var data = "barCode=" + $scope.itemBarCode + "&name=" + $scope.itemName + "&price=" + $scope.price + "&costPrice=" + $scope.costPrice
				if ( $scope.availableStock != undefined && $scope.availableStock != '' )
					data += "&availableStock="+$scope.availableStock ;
				if ( $scope.totalStock != undefined && $scope.totalStock != '' )
					data += "&totalStock="+$scope.totalStock ;
				data += "&token="+user.getToken()
				post(data)
				.then(function(res){
					showToast("success");
				},function(err){
					showToast("error")
					if ( err == "authErr" ){
						$state.go('logout')
					}
				})
			}
			else{
				toast.setMsg("SOME VALUES ARE TOO SHORT")
				showToast("normal");
			}
		} else {
			toast.setMsg("!! ERROR ADDING ITEM !!")
			showToast("error");
		} 
	}

	var post = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : '/item/new',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : dataObj
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("ITEM SUCCESSFULLY ADDED")
					$scope.itemBarCode = "" 
					$scope.itemName = "" 
					$scope.price = "" 
					$scope.availableStock = "" 
					$scope.totalStock = "" 
					$scope.costPrice = ""
					$rootScope.same = false ;
					$rootScope.valid = true ;
					$rootScope.temp = '' ;
					$('#itemBarCode').focus()
					resolve("SUCCESS")
				} else if ( response.data.status === "AUTH_ERROR" ){
					toast.setMsg("** AUTHENTICATION ERROR **")
					reject("authErr")
				} else {
					if (response.data.status === "REDUNDANT") {
						toast.setMsg("ITEM WITH NEW BARCODE ALREADY EXISTS")
					} else if ( response.data.status === "STOCK VALUE ERROR" ){
						toast.setMsg("!! AVAILABLE STOCK CANT BE MORE THAN TOTAL STOCK !!")
					} else {
						toast.setMsg("!! ERROR ADDING ITEM !!")
					}
					reject ("ERROR1") 
					reject ("ERROR1") 
				}
			},function(err){
				toast.setMsg("!! ERROR ADDING ITEM !!")
				reject ("ERROR2") 
			})
	})
	}
})
