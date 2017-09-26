angular.module('viewOrderModule',['cfp.hotkeys','serviceModule','serviceModule2'])
.controller('viewOrderCtrl',function( $rootScope, $scope, hotkeys, $http, $state, $stateParams, user, toast){

	$('.modal').modal({})
	$rootScope.today = new Date();

	hotkeys.bindTo($scope)
	.add({
		combo : 'n' ,
		description : 'NEW ORDER' ,
		callback : function(){
			$state.go('new_order')
		}
	})
	.add({
		combo : 'alt+s' ,
		description : 'SEARCH' ,
		callback : function(){
			$scope.expandSearch()
		}		
	})	

	var getOrderList = function( showLoad ){
		console.log("here in getOrderList")
		console.log ( $stateParams )
		if ( $stateParams.showLoading ){
			toast.setMsg("LOADING")
			showLoading();
		}
		return new Promise(function(resolve,reject){
			$http({
				url : "/order/list",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					if( $stateParams.showLoading ){
						hideLoading();
					}
					resolve(response.data.result)
				} else {
					if( $stateParams.showLoading ){
						hideLoading();
					}					
					toast.setMsg("!! ERROR GETTING ORDER LIST !!")
					reject ("ERROR1") 
				}
			},function(err){
				if( $stateParams.showLoading ){
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
				url : "/order/pickup",
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

	var postCancel = function( ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/order/cancel",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "orderId="+$rootScope.selectedOrder.orderId+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("!! ORDER CANCELLED SUCCESSFULLY !!")
					resolve(response.data.status)
				} else {			
					toast.setMsg("!! ERROR IN CANCELLING ORDER !!")
					reject ("ERROR1") 
				}
			},function(err){
				toast.setMsg("!! ERROR IN CANCELLING ORDER !!")
				reject ("ERROR2") 
			})
	})		
	}	


	var postReturn = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/order/return",
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


	$scope.deliverNote = function(){
		var loxn = "http://localhost:2016/report?type=3&orderId="+$rootScope.selectedOrder.orderId ;
		console.log(loxn)
/*		var dataObj = {
			startDate : $scope.startDate
		};*/

/*		if ( $scope.reportOpt == "stkReport" ){
			loxn += "shortid=B1yDqRVwW&type=1&data=" ;
		}
		else{
			loxn += "shortid=H1e0jWYdZ&type=2&data=" ;
		}
		loxn += JSON.stringify(dataObj) ;*/
		// var win = window.open(loxn);
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

	$scope.searchBlur = function(){
		if ( event.keyCode === 27 && ($scope.search == "" || $scope.search == undefined ) ){
			$('#search').blur()
		}
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
		// $('.modal').modal('close')
		// $('#cancelConfirm #pickUpConfirm #returnConfirm #orderDetails').modal('close')
		$('#orderDetails').modal('close')
		$('#pickUpConfirm').modal('close')
		$('#returnConfirm').modal('close')
		$('#cancelConfirm').modal('close')
	}

	$scope.cancelOrder = function( step ){
		if ( !step ){
			$('#cancelConfirm').modal('open')
		} else { 
			$scope.no()
			postCancel()
			.then(function(res){
				showToast("success")
				$state.go( $state.current ,{ showLoading : false } )
				// setTimeout(function(){ $state.reload(); } , 750 )
			})
		}
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
			$state.go( $state.current ,{ showLoading : false } )
			// setTimeout(function(){ $state.reload(); } , 750);
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
			$state.go( $state.current ,{ showLoading : false } )
			// setTimeout(function(){ $state.reload(); } , 750);
		},function(err){
			showToast("error")
		})		
	}
	
})