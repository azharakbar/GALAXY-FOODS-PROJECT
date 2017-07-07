angular.module('viewCustModule',['ngTable','serviceModule'])
.controller('viewCustCtrl',function($scope,$rootScope,$http,$state,$stateParams,$location,user,NgTableParams){
	$rootScope.delAllowed = false ;
	var getCount = function(){
		$http({
			url : "/totalCustomers",
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
					url : "/allCustomers",
					method : 'POST',
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					},
					data : 'token='+user.getToken()
				})
				.then(function(response){
					console.log(response.data);
					$scope.custTable = new NgTableParams({count : 100 },{ dataset: response.data.result });
				},function(err){
					console.log("ERROR");
				})
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
		console.log("GOING TO UPDATE "+$rootScope.customer.contact)
		$state.go('update_customer',{'customer':$rootScope.customer})
	}

	$scope.delete = function(){
		console.log("GOING TO DELETE "+$rootScope.customer.contact)
		if ( $rootScope.delAllowed == false ){
			if($rootScope.customer.orders === 0){
				$rootScope.delAllowed = true ;
				$('#delConfirm').modal('open');
			} else {
				console.log("U R NOT ALLOWED TO DELETE")
				$scope.errorMsg = "!! CUSTOMERS WITH OUTSTANDING ORDERS CANT BE DELETED !!"
				showToast("error")
			}
		} else { 
			$('#delConfirm').modal('close');
			console.log("i m here*+9+*+")
			$scope.errorMsg = "LOADING"
			showLoading();
			var data = "token=" + user.getToken()
			console.log(data)
			deleteCustomer( data )
			.then(function(res){
				showToast("success");
				setTimeout(function() { $state.reload(); }, 1500);
			},function(err){
				console.log("from main err= "+err)
				showToast("error");
			})
			$rootScope.delAllowed = false ;
		}

	}
	$scope.set= function(inComing){
		$rootScope.customer = inComing
	}
	$scope.noDel = function(){
		$rootScope.delAllowed = false ;
		$('#delConfirm').modal('close');
	}

	$scope.$watch('total',function(newVal,oldVal){
		if ( newVal != oldVal ){
			console.log('changed from '+oldVal+' to '+newVal)
		}
	})

	var deleteCustomer = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/deleteCustomer/"+$rootScope.customer.contact,
				method : 'DELETE',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : dataObj
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					$scope.errorMsg = "CUSTOMER SUCCESSFULLY DELETED"
					resolve("SUCCESS")
				} else {
					$scope.errorMsg = "!! ERROR DELETING CUSTOMER !!"
					reject ("ERROR1") 
				}
			},function(err){
				$scope.errorMsg = "!! ERROR DELETING CUSTOMER !!"
				reject ("ERROR2") 
			})
	})
	}

	getCount() ;
	// setInterval(getCount,2000)
})