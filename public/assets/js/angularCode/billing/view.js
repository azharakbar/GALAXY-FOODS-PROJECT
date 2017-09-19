angular.module('viewBillModule',['cfp.hotkeys','serviceModule','serviceModule2'])
.controller('viewBillCtrl',function( $rootScope,$scope,hotkeys,$http,$state,$stateParams,user,toast ){
	$('.modal').modal();

	hotkeys.bindTo($scope)
	.add({
		combo : 'n' ,
		description : 'NEW BILL' ,
		callback : function(){
			$state.go('new_bill')
		}
	})
	.add({
		combo : 'alt+s' ,
		description : 'SEARCH' ,
		callback : function(){
			$scope.expandSearch()
		}		
	})	
	
	$scope.searchBlur = function(){
		if ( event.keyCode === 27 && ($scope.search == "" || $scope.search == undefined ) ){
			$('#search').blur()
		}
	}

	var getBillList = function(){
		console.log("i am here")
		console.log($stateParams)
		return new Promise(function(resolve,reject){
			if ( $stateParams.showLoading ){
				toast.setMsg("LOADING")
				showLoading();
			}
			$http({
				url : "/allBills",
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
					toast.setMsg("!! ERROR GETTING BILL LIST !!")
					reject ("ERROR1") 
				}
			},function(err){
				if( $stateParams.showLoading ){
					hideLoading();
				}				
				toast.setMsg("!! ERROR GETTING BILL LIST !!")
				reject ("ERROR2") 
			})
	})		
	}

	var payBillNow = function( ){
		return new Promise(function(resolve,reject){
			if ( $stateParams.showLoading ){
				toast.setMsg("LOADING")
				showLoading();
			}
			$http({
				url : "/payBill",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "billId="+$rootScope.bill.billId+"&paid="+$scope.paid+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					if(  $stateParams.showLoading  ){
						hideLoading();
					}
					toast.setMsg("!! PAYMENT DETAILS UPDATED SUCCESSFULLY !!")
					resolve("SXS")
				} else {
					if(  $stateParams.showLoading  ){
						hideLoading();
					}					
					toast.setMsg("!! ERROR UPDATING PAYMENT DETAILS !!")
					reject ("ERROR1") 
				}
			},function(err){
				if(  $stateParams.showLoading  ){
					hideLoading();
				}				
				toast.setMsg("!! ERROR UPDATING PAYMENT DETAILS !!")
				reject ("ERROR2") 
			})
	})		
	}	

	getBillList()
	.then(function(res){
		$scope.billList = res ;
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

	$scope.set= function(inComing,index){
		$rootScope.bill = inComing
		$rootScope.roundedAmount = Math.round($rootScope.bill.remAmount)
	}	

	$scope.check = function(){
		if ( $scope.paid >= 1 && $scope.paid <= $rootScope.roundedAmount )
			return true ;
		else
			return false ;
	}

	$scope.no = function(){
		$('.modal').modal('close')
	}

	$scope.payNow = function(){
		$scope.no() ;
		payBillNow()
		.then(function(res){
			showToast("success")
			// setTimeout(function() {$state.reload();}, 1500);
			$state.go ( $state.current , { showLoading : false } )
			
		},function(err){	
			showToast("error")
		})
	}

})