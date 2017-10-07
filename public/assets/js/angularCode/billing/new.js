angular.module('newBillModule',['pickadate','serviceModule','serviceModule2'])
.controller('newBillCtrl',function( $rootScope , $scope , $state , $stateParams , $http , $timeout , user , toast ){

	$('.modal').modal() ;

	var lostItem = {} ;
	$scope.lostList = [] ;

	$scope.todayDate = new Date();
	$rootScope.todayDate = $scope.todayDate

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
				url : '/bill/total',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" )
					resolve(response.data.count+1)
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
				url : '/bill/save',
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
					toast.setMsg("** ERROR IN SAVING BILL **")
					reject("ERROR1")
				}
			},function(err){
				reject(err)
			})
		})
	}	

	var saveNewLostBill = function( dataObj ){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/item/loss',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "dataObj="+JSON.stringify(dataObj)+"&custId="+$scope.customerData.contact+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("!! BILL SAVED & STOCKS UPDATED SUCCESSFULLY !!")
					resolve(response.data.status)
				}
				else{
					toast.setMsg("** ERROR IN SAVING BILL **")
					reject("ERROR1")
				}
			},function(err){
				toast.setMsg("** ERROR IN SAVING BILL **")
				reject(err)
			})
		})
	}	

	var getCustomerList = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/customer/list',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" )
					resolve(response.data.result)
				else{
					toast.setMsg("** ERROR IN GETTING CUSTOMER LIST **")
					reject("ERROR1")
				}
			},function(err){
				reject("ERROR2")
			})
		})
	}	

	var getItemList = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/item/list',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					resolve(response.data)
				}
				else{
					toast.setMsg("** ERROR IN GETTING ITEM LIST **")
					reject("ERROR1")
				}
			},function(err){
				reject("ERROR2")
			})
		})
	}	


	$scope.expandSearch = function(){
			$('#search').animate( { width:"250px" } )
			$('#search').focus()
	}

	$scope.compressSearch = function(){
		$('#search').animate( { width:"0px" } )
	}

	$scope.searchFocus = function(){
		$('#buttonSet').fadeOut()
		$('.tableRow').animate({'height':48})
	}

	$scope.set= function(inComing,index){
		$rootScope.customer = inComing
		$rootScope.index = index
		getItemList()
		.then(function(response){
			$scope.itemList = response.result
			$scope.content = 3 
			$scope.$apply()
		},function(err){
			showToast("error")
		})		
	}
	
	$scope.setItem= function(inComing,index){
		$rootScope.item = inComing
		$rootScope.index = index ;
		$('#lostItemConfirm').modal('open')
	}

	$scope.enrollItem = function(){
		if ( $scope.qty > $rootScope.item.totalStock || $scope.qty === undefined ){
			$('#maxVal').removeClass('shake')
			$('#maxVal').addClass('shake')
		} else {
			lostItem.barCode = $rootScope.item.barCode
			lostItem.name = $rootScope.item.name
			lostItem.costPrice = $rootScope.item.costPrice 
			lostItem.qty = $scope.qty 

			var flag = 0 ;
			for ( var i = 0 ; i < $scope.lostList.length ; ++i ){
				if ( $scope.lostList[i].barCode === lostItem.barCode ){
					$scope.lostList[i].qty = $scope.qty
					flag = 1 ;
					break ;
				}
			}
			if ( !flag )
				$scope.lostList.push( lostItem )
			flag = 0 ;
			lostItem = {} ;
			$scope.qty = 1 ;
			$('.modal').modal('close')
		}

	}

	$scope.delThisItem = function( index ){
		$('#item'+index).removeClass('fadeInLeft')
		$('#item'+index).addClass('fadeOutRight')
		setTimeout(function() { $scope.lostList.splice(index,1); $scope.$apply(); }, 750 );
	}

	$scope.content = 1

	$scope.proceed = function(){
		getCustomerList()
		.then(function(response){
			$scope.content = 2 
			$scope.titleMsg = "PICK CUSTOMER TO GENERATE BILL"
			$scope.list = response
			$scope.$apply()
		},function(err){
			showToast("error")
		})	
	}

	$scope.generate = function(){
		var orderTotal = 0 ; 
		for ( var i = 0 ; i < $scope.lostList.length ; ++i ){
			orderTotal += ( $scope.lostList[i].costPrice * $scope.lostList[i].qty )
		}

		var lostObj = {
			customer : $rootScope.customer,
			dates : {
				issueDate : $rootScope.todayDate
			},
			orderId : "LOSS OF STOCK" , 
			orders : $scope.lostList ,
			orderTotal : orderTotal
		}	
		$state.go('new_bill',{ orderDetails : lostObj } )		
	}

	getBillCount()
	.then(function(response){
		$scope.billNo = pad( response )
		$scope.$apply()
	},function(err){
		showToast("error")
	})	

	if ( $stateParams.orderDetails.orderId === "LOSS OF STOCK" ){
		$scope.loss = 1 ;
		$scope.customerData = $stateParams.orderDetails.customer;
		$scope.dateData = $stateParams.orderDetails.dates;
		$scope.orderId = $stateParams.orderDetails.orderId;
		$scope.orderData = $stateParams.orderDetails.orders;
		$scope.orderTotal = $stateParams.orderDetails.orderTotal;
		$scope.grandTotal = Math.round($scope.orderTotal)

		$scope.set = function(id){
			$scope.content = id ;
			$scope.$apply() ;
		}
	} else if ( $stateParams.orderDetails.orderId != "NOT DEFINED" ){
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
		if ( $scope.orderId != "LOSS OF STOCK")
			$state.go('view_order')
		else
			$state.go('dashboard')
	}

	$scope.back = function(Type){
		if ( Type === 1 ){
			$scope.content = 2 
			$scope.lostList = [] 
			$scope.lostItem = {} 
			$scope.$apply()
		}
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
				billAmount : Math.round($scope.orderTotal)
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
				eveLoxn : $scope.eventData.eveLoxn, 
				evePurpose : $scope.eventData.evePurpose
			},
			customerSchema : {
				customer : $scope.customerData.contact , 
				totalAmount	: $scope.grandTotal
			}

		}

		saveNewBill( finalObj )
		.then(function(response){
			toast.setMsg("!! BILL SAVED SUCCESSFULLY !!")
			showToast("success")
			$state.go('new_order')
		},function(err){
			showToast("error")
		})	
	}


	$scope.saveLostBill = function(){
		$('.modal').modal('close')
		var list = [] ;
		var x = {} ;
		for ( var i = 0 ; i < $scope.orderData.length ; ++i ){
			x = {} ;
			x.barCode = $scope.orderData[i].barCode ;
			x.costPrice = $scope.orderData[i].costPrice ;
			x.qty = $scope.orderData[i].qty ;
			x.name = $scope.orderData[i].name ;
			list.push(x) ;
		}

/*		var finalObj = {
			billSchema : {
				billId : $scope.billNo ,
				billDate : $scope.dateData.issueDate ,
				customer : $scope.customerData.contact ,
				name : $scope.customerData.name,
				orderId :  $scope.orderId ,
				billAmount : Math.round($scope.orderTotal)
			},
			lostItems : list ,
			customerSchema : {
				customer : $scope.customerData.contact , 
				totalAmount	: $scope.grandTotal
			}

		}*/

		var obj = {
			lostItems : list,
			autoGen : false
		}		
		saveNewLostBill( obj )
		.then(function(response){
			showToast("success")
			$timeout(function(){				
				$state.go( 'view_bill' )
			},1000)
		},function(err){
			showToast("error")
		})	
	}	

})