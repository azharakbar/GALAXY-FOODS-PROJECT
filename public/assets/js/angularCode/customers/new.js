angular.module('newCustModule',['serviceModule'])
.controller('newCustCtrl',function($scope,$rootScope,$http,$location,user){
	var valid = true ;
	$rootScope.temp = ''
	$scope.errorMsg=""

	$scope.toUpper = function(){
		if(event.which != 8)
			$scope.custName=$scope.custName.toUpperCase();	
	}
	$scope.checkNumber = function(){
		var key = event.keyCode ;
		if ( (key >= 48 && key <= 57) || key == 8 || (key >= 96 && key <= 105))
			valid = true ;
		else 
			valid = false ;
		if ( !valid ){
			this.custContact = $rootScope.temp ;
		}
		if ( valid && this.custContact == undefined ){
			$rootScope.temp = '' ;
		}
		else if ( valid && this.custContact.length >= 1 && this.custContact != undefined ){
			$rootScope.temp = this.custContact ;
		}
	}

	$scope.submit=function(){
		if ( $scope.custName != undefined && $scope.custContact != undefined ){
			if ( $scope.custName.length >= 2 && $scope.custContact.length >= 7 ){
				$rootScope.newCustFormError = false ;
				var tkn = user.getToken()
				console.log("OUTGOINING REQ =="+'name='+$scope.custName+'&contact='+$scope.custContact+'&token='+tkn)
				$http({
					url : '/newCustomer' ,
					method : 'POST' ,
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					},
					data: 'name='+$scope.custName+'&contact='+$scope.custContact+'&token='+tkn
				})
				.then(function(response){
					console.log(response.data)
					if ( response.data.status === "SXS" ){
						$scope.errorMsg = "USER SUCCESSFULLY ADDED"
						$scope.custName="" 
						$scope.custContact="" 
						$rootScope.temp="" 
						$('#custName').focus()
						showToast("success");
						$location.path('/dashboard')
					} else if ( response.data.status === "REDUNDANT" ){
						$scope.errorMsg = "USER ALREADY EXISTS"
						showToast("normal");		
					} else {
						$scope.errorMsg = "!! ERROR ADDING USER !!"
						showToast("error");
					}
					$location.path('/new_customer')	
				},function(err){
					$scope.errorMsg = "!! ERROR ADDING USER !!"
					showToast("error");
				})
				return ;
			} else {
				if ( $scope.custName.length < 2 ){
					$rootScope.newCustFormError = true ;
					$scope.errorMsg = "NAME TOO SHORT"
				} else if ( $scope.custContact.length < 7 ) {
					$rootScope.newCustFormError = true ;
					$scope.errorMsg = "CONTACT NUMBER TOO SHORT"
				}
			}
		} else {
			$rootScope.newCustFormError = true ;
			$scope.errorMsg = "!! ERROR ADDING USER !!"
		}
		showToast("error");
	}

})