angular.module('viewBillModule',['serviceModule','serviceModule2'])
.controller('viewBillCtrl',function( $rootScope,$scope,$http,$state,user,toast ){
	$('.modal').modal();

	var getBillList = function( showLoad ){
		return new Promise(function(resolve,reject){
			if ( showLoad || $stateParams.showLoading ){
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
					if( showLoad || $stateParams.showLoading ){
						hideLoading();
					}
					resolve(response.data.result)
				} else {
					if( showLoad || $stateParams.showLoading ){
						hideLoading();
					}					
					toast.setMsg("!! ERROR GETTING BILL LIST !!")
					reject ("ERROR1") 
				}
			},function(err){
				if( showLoad || $stateParams.showLoading ){
					hideLoading();
				}				
				toast.setMsg("!! ERROR GETTING BILL LIST !!")
				reject ("ERROR2") 
			})
	})		
	}

	var payBillNow = function( showLoad = false ){
		return new Promise(function(resolve,reject){
			if ( showLoad ){
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
					if( showLoad ){
						hideLoading();
					}
					toast.setMsg("!! PAYMENT DETAILS UPDATED SUCCESSFULLY !!")
					resolve("SXS")
				} else {
					if( showLoad ){
						hideLoading();
					}					
					toast.setMsg("!! ERROR UPDATING PAYMENT DETAILS !!")
					reject ("ERROR1") 
				}
			},function(err){
				if( showLoad ){
					hideLoading();
				}				
				toast.setMsg("!! ERROR UPDATING PAYMENT DETAILS !!")
				reject ("ERROR2") 
			})
	})		
	}	

	getBillList( true )
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
			setTimeout(function() {$state.reload();}, 1500);
			
		},function(err){	
			showToast("error")
		})
	}

})