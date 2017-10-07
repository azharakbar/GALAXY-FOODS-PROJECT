angular.module('newCustModule',['serviceModule','serviceModule2'])
.controller('newCustCtrl',function($scope,$rootScope,$http,$location,user,toast){
	var valid = true ;
	$rootScope.temp = ''
	var first = 1 
	$('#custName').focus()
	first = 1
	$scope.custName = "" 
	$scope.toUpper = function(){
		if ( first == 1 ){
			$scope.custName = "" 
			first = 0
			return ;
		}
		if(event.which != 8)
			$scope.custName=$scope.custName.toUpperCase();	
	}
	$scope.checkNumber = function(){
		if ( first == 1 ){
			$scope.custName = "" 
			first = 0
			return ;
		}		
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

	$scope.submit=function(){
		if ( $scope.custName != undefined && $scope.custContact != undefined ){
			if ( $scope.custName.length >= 2 && $scope.custContact.length >= 7 ){
				$rootScope.newCustFormError = false ;
				$http({
					url : '/customer/new' ,
					method : 'POST' ,
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					},
					data: 'name='+$scope.custName+'&contact='+$scope.custContact+'&token='+user.getToken()
				})
				.then(function(response){
					if ( response.data.status === "SXS" ){
						toast.setMsg("USER SUCCESSFULLY ADDED")
						$scope.custName="" 
						$scope.custContact="" 
						$rootScope.temp="" 
						$('#custName').focus()
						showToast("success");
						$location.path('/dashboard')
					} else if ( response.data.status === "REDUNDANT" ){
						toast.setMsg("USER ALREADY EXISTS")
						showToast("normal");		
					} else {
						toast.setMsg("!! ERROR ADDING USER !!")
						showToast("error");
					}
					$location.path('/new_customer')	
				},function(err){
					toast.setMsg("!! ERROR ADDING USER !!")
					showToast("error");
				})
				return ;
			} else {
				if ( $scope.custName.length < 2 ){
					$rootScope.newCustFormError = true ;
					toast.setMsg("NAME TOO SHORT")
				} else if ( $scope.custContact.length < 7 ) {
					$rootScope.newCustFormError = true ;
					toast.setMsg("CONTACT NUMBER TOO SHORT")
				}
			}
		} else {
			$rootScope.newCustFormError = true ;
			toast.setMsg("!! ERROR ADDING USER !!")
		}
		showToast("error");
	}

})