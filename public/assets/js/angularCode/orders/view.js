angular.module('viewOrderModule',['cfp.hotkeys','serviceModule','serviceModule2'])
.controller('viewOrderCtrl',function( $rootScope, $scope, hotkeys, $http, $state, $stateParams, user, toast){

	$('.modal').modal({})
	$rootScope.today = new Date();
	$scope.lostFlag = 0 ;
	$scope.errorFlag = []

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

	var postLoss = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/item/loss",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "dataObj="+JSON.stringify(dataObj)+"&custId="+$rootScope.selectedOrder.customer+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					window.setTimeout(function(){
						toast.setMsg("!! BILL GENERATED FOR LOST STOCK !!")
						resolve(response.data.status)
					},3000)
				} else {			
					window.setTimeout(function(){
						toast.setMsg("!! ERROR IN BILL GENERATION FOR LOST STOCK !!")
						reject ("ERROR1") 
					},3000)
				}
			},function(err){
				window.setTimeout(function(){
					toast.setMsg("!! ERROR IN BILL GENERATION FOR LOST STOCK !!")
					reject ("ERROR2") 
				},3000)
			})
	})		
	}		


	$scope.deliverNote = function(){
		var loxn = "http://"+window.host+":"+window.port+"/report/deliveryNote?orderId="+$rootScope.selectedOrder.orderId ;
		var win = window.open(loxn,"_blank","width=700,height=700");
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

	$scope.set= function(inComing,idx,open=true){
		$rootScope.selectedOrder = inComing
		$rootScope.idx = idx 
		if( open )
			$('#orderDetails').modal('open')
	}

	$scope.action = function(event,inComing,idx,id){
		event.stopPropagation();
		$scope.set( inComing , idx , false )
		if ( id == "1" ){
			$('#pickUpConfirm').modal('open')
		} else if( id == "2" ){
			$rootScope.qtyReturnedList = [] 
			$rootScope.qtyReturnedList.length = $rootScope.selectedOrder.items.length
			$rootScope.qtyReturnedList.fill(0)
			$scope.errorFlag.length = $rootScope.selectedOrder.items.length	
			$scope.errorFlag.fill( false )
			$('#returnCheck').modal('open')
			// $('#returnConfirm').modal('open')
		} else if ( id == "3" ){
			$('#returnConfirm').modal('open')
		}
	}

	$scope.no = function(){
		$('.modal').modal('close')
		// $('#cancelConfirm #pickUpConfirm #returnConfirm #orderDetails').modal('close')
		// $('#orderDetails').modal('close')
		// $('#pickUpConfirm').modal('close')
		// $('#returnConfirm').modal('close')
		// $('#cancelConfirm').modal('close')
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
		var t = [] ;
		var x = {} ;
		for ( var i = 0 ; i < $rootScope.selectedOrder.items.length ; ++i ){
			x = {} ;
			x.barCode = $rootScope.selectedOrder.items[i].barCode 
			x.qty = $rootScope.selectedOrder.items[i].qty - $rootScope.qtyReturnedList[i]
			t.push(x)
		}
		
		postReturn(t)
		.then(function(res){
			showToast("success")
			if( $scope.lostFlag ){
				t = []
				x = {}
				for ( var i = 0 ; i < $rootScope.selectedOrder.items.length ; ++i ){
					if ( $rootScope.qtyReturnedList[i] > 0 ){
						x = {} ;
						x.barCode = $rootScope.selectedOrder.items[i].barCode 
						x.qty = $rootScope.qtyReturnedList[i] 
						t.push(x)
					}
				}
				var obj = {
					lostItems : t,
					autoGen : true
				}
				postLoss( obj )
				.then(function(res){
					// window.setTimeout(function(){
						showToast("success")
						$state.go( $state.current ,{ showLoading : false } )
					// },3000)
				},function(err){
					// window.setTimeout(function(){
						$state.go( $state.current ,{ showLoading : false } )
						showToast("error")
					// },3000)
				})
				$scope.lostFlag = 0 
			} else {
				$state.go( $state.current ,{ showLoading : false } )
			}
		},function(err){
			showToast("error")
		})
	}

	$scope.stkLost = function( indx , qtyReturned , flag ){
		if ( !flag )
			$scope.errorFlag[indx] = true
		else
			$scope.errorFlag[indx] = false
		$rootScope.qtyReturnedList[indx] = qtyReturned
		for ( var i = 0 ; i < $rootScope.qtyReturnedList.length ; ++i )
			if ( $rootScope.qtyReturnedList[i] ){
				$scope.lostFlag = 1 ;
				return
			}
				$scope.lostFlag = 0 ;
	}
	
	$scope.chk = function(){
		$('#returnConfirm').modal('open')
	}
})