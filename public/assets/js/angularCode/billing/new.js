angular.module('newBillModule',['pickadate','serviceModule','serviceModule2'])
.controller('newBillCtrl',function( $rootScope , $scope , $state , $stateParams , $http , user , toast ){

	$('.modal').modal() ;

	if ( $stateParams.orderDetails.orderId != "NOT DEFINED" )
		$scope.showBill = true ;
	else
		$scope.showBill = false ;

	var monthNames = ["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"];

	var pad = function( num ){
		while ( num.toString().length < 5 )
			num = "0" + num ; 
		num = "PC"+num
		return num ;
	}

	var getBillCount = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/totalBills',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" )
					resolve(response.data.count)
				else{
					toast.setMsg("** ERROR IN GETTING BILL NUMBER **")
					reject("ERROR1")
				}
			},function(err){
				reject(err)
			})
		})
	}

	$scope.content = 1

	getBillCount()
	.then(function(response){
		$scope.billNo = pad( response )
		$scope.$apply()
	},function(err){
		console.log(err)
		showToast("error")
	})	

	if ( $stateParams.orderDetails.orderId != "NOT DEFINED" ){
		$scope.customerData = $stateParams.orderDetails.customer;
		$scope.dateData = $stateParams.orderDetails.dates;
		$scope.eventData = $stateParams.orderDetails.event;
		$scope.orderId = $stateParams.orderDetails.orderId;
		$scope.orderData = $stateParams.orderDetails.orders;
		$scope.orderTotal = $stateParams.orderDetails.orderTotal;
		$scope.grandTotal = Math.round($scope.orderTotal + $scope.customerData.credit)

		$scope.set = function(id){
			$scope.content = id ;
			$scope.$apply() ;
		}
	}

	$scope.no = function(){
		$('.modal').modal('close')
	}

	$scope.cancel = function(){
		$('.modal').modal('close')
		$state.go('new_order')
	}

	$scope.saveBill = function(){

	}

})