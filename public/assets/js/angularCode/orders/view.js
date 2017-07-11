angular.module('viewOrderModule',['serviceModule','serviceModule2'])
.controller('viewOrderCtrl',function( $rootScope, $scope, $http, $state, $stateParams, user, toast){

	$('.modal').modal({})
	$rootScope.today = new Date();

	var getOrderList = function( showLoad ){
		return new Promise(function(resolve,reject){
			if ( showLoad || $stateParams.showLoading ){
				toast.setMsg("LOADING")
				showLoading();
			}
			$http({
				url : "/allOrders",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					if( showLoad || $stateParams.showLoading ){
						hideLoading();
					}
					resolve(response.data.result)
				} else {
					if( showLoad || $stateParams.showLoading ){
						hideLoading();
					}					
					toast.setMsg("!! ERROR GETTING ORDER LIST !!")
					reject ("ERROR1") 
				}
			},function(err){
				if( showLoad || $stateParams.showLoading ){
					hideLoading();
				}				
				toast.setMsg("!! ERROR GETTING ORDER LIST !!")
				reject ("ERROR2") 
			})
	})		
	}

	var postPickup = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/pickUpOrder",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "dataObj="+JSON.stringify(dataObj)+"&orderId="+$rootScope.selectedOrder.orderId+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("!! ORDER PICKUP UPDATED SUCCESSFULLY !!")
					resolve(response.data.status)
				} else {			
					toast.setMsg("!! ERROR IN UPDATING ORDER PICKUP !!")
					reject ("ERROR1") 
				}
			},function(err){
				toast.setMsg("!! ERROR IN UPDATING ORDER PICKUP !!")
				reject ("ERROR2") 
			})
	})		
	}


	var postReturn = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/returnOrder",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "dataObj="+JSON.stringify(dataObj)+"&orderId="+$rootScope.selectedOrder.orderId+"&custId="+$rootScope.selectedOrder.customer+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("!! ORDER RETURN UPDATED SUCCESSFULLY !!")
					resolve(response.data.status)
				} else {			
					toast.setMsg("!! ERROR IN UPDATING ORDER RETURN !!")
					reject ("ERROR1") 
				}
			},function(err){
				toast.setMsg("!! ERROR IN UPDATING ORDER RETURN !!")
				reject ("ERROR2") 
			})
	})		
	}	

	getOrderList( true )
	.then(function(res){
		$scope.orderList = res ;
		$scope.$apply() ;
	},function(err){
		showToast("error");
	})

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

	$scope.set= function(inComing,idx){
		$rootScope.selectedOrder = inComing
		$rootScope.idx = idx 
		console.log($rootScope.selectedOrder)
		$('#orderDetails').modal('open')
	}

	$scope.action = function(event,inComing,indx,id){
		event.stopPropagation();
		$rootScope.selectedOrder = inComing
		$rootScope.idx = indx 
		if ( id == "1" ){
			$('#pickUpConfirm').modal('open')
		} else if( id == "2" ){
			$('#returnConfirm').modal('open')
		}
	}

	$scope.no = function(){
		$('.modal').modal('close')
	}

	$scope.pickUp = function(){
		$('.modal').modal('close')
		var t = [] ;
		var x = {} ;
		for ( var i = 0 ; i < $rootScope.selectedOrder.items.length ; ++i ){
			x = {} ;
			x.barCode = $rootScope.selectedOrder.items[i].barCode 
			x.qty = $rootScope.selectedOrder.items[i].qty 
			t.push(x)
		}
		
		postPickup(t)
		.then(function(res){
			showToast("success")
			setTimeout(function(){ $state.reload(); } , 750);
		},function(err){
			showToast("error")
		})
	}

	$scope.return = function(){
		$('.modal').modal('close')
		$('.modal').modal('close')
		var t = [] ;
		var x = {} ;
		for ( var i = 0 ; i < $rootScope.selectedOrder.items.length ; ++i ){
			x = {} ;
			x.barCode = $rootScope.selectedOrder.items[i].barCode 
			x.qty = $rootScope.selectedOrder.items[i].qty 
			t.push(x)
		}
		
		postReturn(t)
		.then(function(res){
			showToast("success")
			setTimeout(function(){ $state.reload(); } , 750);
		},function(err){
			showToast("error")
		})		
	}
	
})