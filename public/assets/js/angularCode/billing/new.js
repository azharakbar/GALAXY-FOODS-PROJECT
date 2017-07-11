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

	var saveNewBill = function(dataObj){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/saveBill',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "finalObj="+JSON.stringify(dataObj)+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" )
					resolve(response.data.status)
				else{
					console.log("RESPONSE = ")
					console.log(response)
					toast.setMsg("** ERROR IN SAVING BILL **")
					reject("ERROR1")
				}
			},function(err){
				console.log(err)
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
		$('.modal').modal('close')
		var list = [] ;
		var x = {} ;
		for ( var i = 0 ; i < $scope.orderData.length ; ++i ){
			x = {} ;
			x.barCode = $scope.orderData[i].barCode ;
			x.price = $scope.orderData[i].price ;
			x.qty = $scope.orderData[i].qty ;
			x.name = $scope.orderData[i].name ;
			list.push(x) ;
		}
		var finalObj = {
			billSchema : {
				billId : $scope.billNo ,
				billDate : $scope.dateData.issueDate ,
				customer : $scope.customerData.contact ,
				name : $scope.customerData.name,
				orderId :  $scope.orderId ,
				billAmount : $scope.orderTotal 
			},
			orderSchema : {
				orderId : $scope.orderId,
				issueDate : $scope.dateData.issueDate,
				pickupDate : $scope.dateData.pickupDate,
				returnDate : $scope.returnDate,
				customer : $scope.customerData.contact,
				name : $scope.customerData.name,
				items : list ,
				billId : $scope.billNo,
			},
			customerSchema : {
				customer : $scope.customerData.contact , 
				totalAmount	: $scope.grandTotal
			}

		}
		// console.log("FINAL OBJ")
		// console.log(finalObj)

		saveNewBill( finalObj )
		.then(function(response){
			toast.setMsg("!! BILL SAVED SUCCESSFULLY !!")
			showToast("success")
			$state.go('new_order')
		},function(err){
			console.log(err)
			showToast("error")
		})	
	}

})