angular.module('updateCustomerModule',['serviceModule','serviceModule2'])
.controller('updateCustomer',function($rootScope,$scope,$state,$stateParams,$http,user,toast){
	$scope.customer = $stateParams.customer ;
	if ( $scope.customer.name === "NAME NOT DEFINED")
		$state.go('dashboard')

	$scope.toUpper = function(){
		if(event.which != 8)
			$scope.custName=$scope.custName.toUpperCase();	
	}

	$scope.checkNumber = function(){
		var key = event.keyCode ;
		if ( (key >= 48 && key <= 57) || key == 8 || (key >= 96 && key <= 105) || key == 110 || key == 190)
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
	$scope.rst = function(val){
		if ( val === "valid")
			$rootScope.valid = true ;
		else if ( val === "temp")
			$rootScope.temp = '' ;
	}	

	$scope.submit = function(){
		if(!checkEquality()){
			if ( $scope.custName != undefined && $scope.custContact != undefined ){
				if ( $scope.custName.length >= 2 && $scope.custContact.length >= 7 ){
					$rootScope.updateCustForm = false ;
					toast.setMsg("LOADING")
					showLoading();
					var data = "name=" + $scope.custName + "&contact=" + $scope.custContact+'&token='+user.getToken()
					console.log(data)
					update(data)
					.then(function(res){
						showToast("success");
						$state.go('view_customer',{ showLoading:false } )
						// setTimeout(function() { $state.go('view_customer') ; }, 500);
					},function(err){
						console.log("from main err= "+err)
						showToast("error");
					})
				} else {
					if ( $scope.custName.length < 2 ){
						$rootScope.updateCustForm = true ;
						toast.setMsg("NAME TOO SHORT")
					} else if ( $scope.custContact.length < 7 ) {
						$rootScope.updateCustForm = true ;
						toast.setMsg("CONTACT NUMBER TOO SHORT")
					}
				}
			} else {
				$rootScope.updateCustForm = true ;
				toast.setMsg("!! ERROR ADDING USER !!")
			}
			showToast("error");
		} else {
			toast.setMsg("!! THERE ARENT ANY CHANGES TO UPDATE !!")
			showToast("error")
			return ;
		}
	}

	var checkEquality = function(){
		if (
				$stateParams.customer.name == $scope.custName &&
				$stateParams.customer.contact == $scope.custContact  
			) return true ;
		else  return false ;
	}

	var update = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/customer/update/"+$stateParams.customer.contact,
				method : 'PUT',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : dataObj
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("CUSTOMER SUCCESSFULLY UPDATED")
					resolve("SUCCESS")
				} else {
					if (response.data.status === "REDUNDANT") {
						toast.setMsg("CUSTOMER WITH NEW CONTACT NUMBER ALREADY EXISTS")
					} else {
						toast.setMsg("!! ERROR UPDATING CUSTOMER !!")
					}
					reject ("ERROR1") 
				}
			},function(err){
				toast.setMsg("!! ERROR UPDATING CUSTOMER !!")
				reject ("ERROR2") 
			})
	})
	}
})