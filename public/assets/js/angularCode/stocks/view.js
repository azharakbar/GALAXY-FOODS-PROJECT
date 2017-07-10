angular.module('viewItemModule',['ngTable','serviceModule','serviceModule2'])
.controller('viewItemCtrl',function($scope,$rootScope,$http,$state,$stateParams,$location,user,toast,NgTableParams){
	$rootScope.delAllowed = false ;
	var getCount = function( showLoad ){
		if ( showLoad || $stateParams.showLoading ){
			toast.setMsg("LOADING")
			showLoading();
		}		
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
					if( showLoad || $stateParams.showLoading ){
						hideLoading();
					}
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

	$scope.delConfirm = function(){
		if($rootScope.item.rentedStock === 0){
			$rootScope.delAllowed = true ;
			$('#delConfirm').modal('open');
		} else {
			$rootScope.delAllowed = false ;
			console.log("U R NOT ALLOWED TO DELETE")
			toast.setMsg("!! ITEMS WITH RENTED STOCK CANT BE DELETED !!")
			showToast("error")
		}		
	}

	$scope.delete = function(){
		console.log("GOING TO DELETE "+$rootScope.item.barCode)
		$('#delConfirm').modal('close');
		toast.setMsg("LOADING")
		showLoading();
		var data = "token=" + user.getToken()
		console.log(data)
		deleteItem( data )
		.then(function(res){
			$('#buttonSet').fadeOut();
			showToast("success");
			$('#row'+$rootScope.index).addClass('animated fadeOutRight')
			setTimeout( function(){ getCount( false ) } , 500 )
		},function(err){
			console.log("from main err= "+err)
			showToast("error");
		})
		$rootScope.delAllowed = false ;
	}
	$scope.set= function(inComing,index){
		$rootScope.item = inComing
		$rootScope.index = index ;
		console.log("INDEX IS :"+$rootScope.index)
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



	getCount( true ) ;
	// setInterval(getCount,2000)
})