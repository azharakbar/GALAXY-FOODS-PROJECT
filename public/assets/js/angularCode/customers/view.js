angular.module('viewCustModule',['ngTable','cfp.hotkeys','serviceModule','serviceModule'])
.controller('viewCustCtrl',function($scope,$rootScope,hotkeys,$http,$state,$stateParams,$location,user,toast,NgTableParams){
	$rootScope.delAllowed = false ;
	hotkeys.bindTo($scope)
	.add({
		combo : 'n' ,
		description : 'NEW CUSTOMER' ,
		callback : function(){
			$state.go('new_customer')
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

	var getCount = function( showLoad ){
		if ( $stateParams.showLoading ){
			toast.setMsg("LOADING")
			showLoading();
		}
		$http({
			url : "/customer/total",
			method : 'POST',
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			data : 'token='+user.getToken()
		})
		.then(function(response){
			if ( response.data.status === "SXS" ){
				$scope.total = response.data.count 
				$http({
					url : "/customer/list",
					method : 'POST',
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					},
					data : 'token='+user.getToken()
				})
				.then(function(response){
					if( $stateParams.showLoading ){
						hideLoading();
					}
					if ( response.data.status == "SXS" ){
						$scope.custTable = new NgTableParams({count : 100 },{ dataset: response.data.result });
					} else if ( response.data.status == "AUTH_ERROR" ){
						toast.setMsg("** AUTHENTICATION ERROR **")
						showToast("error")
						$state.go('logout')
					}
				},function(err){
					$scope.total = "ERROR"
				})
			} else if( response.data.status == "AUTH_ERROR" ){
				toast.setMsg("** AUTHENTICATION ERROR **")
				showToast("error")
				$state.go('logout')
			} else {
				$scope.total = "ERROR"
			}
		},function(err){
			$scope.total = "ERROR"
		})
	}

	var getList = function(){

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

	$scope.update = function(){
		$state.go('update_customer',{'customer':$rootScope.customer})
	}

	$scope.delConfirm = function(){
		if($rootScope.customer.orders === 0 && $rootScope.customer.credit === 0){
			$rootScope.delAllowed = true ;
			$('#delConfirm').modal('open');
		} else {
			$rootScope.delAllowed = false ;
			toast.setMsg("!! CUSTOMERS WITH OUTSTANDING ORDERS AND CREDIT CANT BE DELETED !!")
			showToast("error")
		}		
	}

	$scope.delete = function(){
		$('#delConfirm').modal('close');
		toast.setMsg("LOADING")
		showLoading();
		var data = "token=" + user.getToken()
		deleteCustomer( data )
		.then(function(res){
			$('#buttonSet').fadeOut();
			showToast("success");
			$('#'+$rootScope.index).addClass('animated fadeOutRight')
			setTimeout( function(){ getCount( false ) } , 500 )
		},function(err){
			showToast("error")
			if ( err == "authErr" ){
				$state.go('logout')
			}
		})
		$rootScope.delAllowed = false ;
	}
	$scope.set= function(inComing,index){
		$rootScope.customer = inComing
		$rootScope.index = index ;
	}
	$scope.noDel = function(){
		$rootScope.delAllowed = false ;
		$('#delConfirm').modal('close');
	}

	$scope.$watch('total',function(newVal,oldVal){
	})

	var deleteCustomer = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/customer/delete/"+$rootScope.customer.contact,
				method : 'DELETE',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : dataObj
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("CUSTOMER SUCCESSFULLY DELETED")
					resolve("SUCCESS")
				} else if ( response.data.status === "AUTH_ERROR" ){
					toast.setMsg("** AUTHENTICATION ERROR **")
					reject("authErr")
				} else {
					toast.setMsg("!! ERROR DELETING CUSTOMER !!")
					reject ("ERROR1") 
				}
			},function(err){
				toast.setMsg("!! ERROR DELETING CUSTOMER !!")
				reject ("ERROR2") 
			})
	})
	}

	getCount( true ) ;
	// setInterval(getCount,2000)
})