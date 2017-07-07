angular.module('viewItemModule',['ngTable','serviceModule','serviceModule2'])
.controller('viewItemCtrl',function($scope,$rootScope,$http,$state,$stateParams,$location,user,toast,NgTableParams){
	$rootScope.delAllowed = false ;

	var getCount = function(){
		$http({
			url : "/totalItems",
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
					url : "/allItems",
					method : 'POST',
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					},
					data : 'token='+user.getToken()
				})
				.then(function(response){
					console.log(response.data);
					$scope.itemTable = new NgTableParams({count : 100 },{ dataset: response.data.result });
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
		console.log("GOING TO UPDATE "+$rootScope.item.barCode)
		$state.go('update_stock',{'item':$rootScope.item})
	}

	$scope.delete = function(){
		console.log("GOING TO DELETE "+$rootScope.item.barCode)
		if ( $rootScope.delAllowed == false ){
			if($rootScope.item.rentedStock === 0){
				$rootScope.delAllowed = true ;
				$('#delConfirm').modal('open');
			} else {
				console.log("U R NOT ALLOWED TO DELETE")
				toast.setMsg("!! ITEMS WITH RENTED STOCK CANT BE DELETED !!")
				showToast("error")
			}
		} else { 
			$('#delConfirm').modal('close');
			console.log("i m here*+9+*+")
			toast.setMsg("LOADING")
			showLoading();
			var data = "token=" + user.getToken()
			console.log(data)
			deleteItem( data )
			.then(function(res){
				showToast("success");
				$state.reload();
				// setTimeout(function() { $state.reload(); }, 1500);
			},function(err){
				console.log("from main err= "+err)
				showToast("error");
			})
			$rootScope.delAllowed = false ;
		}

	}
	$scope.set= function(inComing){
		$rootScope.item = inComing
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

	var deleteItem = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/deleteItem/"+$rootScope.item.barCode,
				method : 'DELETE',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : dataObj
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					toast.setMsg("ITEM SUCCESSFULLY DELETED")
					resolve("SUCCESS")
				} else {
					toast.setMsg("!! ERROR DELETING ITEM !!")
					reject ("ERROR1") 
				}
			},function(err){
				toast.setMsg("!! ERROR DELETING ITEM !!")
				reject ("ERROR2") 
			})
	})
	}



	getCount() ;
	// setInterval(getCount,2000)
})