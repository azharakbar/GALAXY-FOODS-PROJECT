angular.module('viewItemModule',['ngTable','cfp.hotkeys','serviceModule','serviceModule2'])
.controller('viewItemCtrl',function($scope,$rootScope,hotkeys,$http,$state,$stateParams,$location,user,toast,NgTableParams){
	$('.modal').modal({}) ;
	$('#buttonSet').hide(); 	

	$rootScope.delAllowed = false ;

	hotkeys.bindTo($scope)
	.add({
		combo : 'n' ,
		description : 'NEW ITEM' ,
		callback : function(){
			$state.go('new_item')
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
			url : "/item/total",
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
					url : "/item/list",
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
						$scope.itemTable = new NgTableParams({count : 100 },{ dataset: response.data.result });
					} else if ( response.data.status === "AUTH_ERROR" ){
						toast.setMsg("** AUTHENTICATION ERROR **")
						showToast("error")
						$state.go('logout')
					}
				},function(err){
					$scope.total = "ERROR"	
				})
			} else if ( response.data.status === "AUTH_ERROR" ){
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

	var getPossessionDetails = function(){
		return new Promise(function(resolve,reject){
			// if ( showLoad || $stateParams.showLoading ){
				toast.setMsg("LOADING")
				showLoading();
			// }
			$http({
				url : "/item/details/"+$rootScope.item.barCode,
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					// if( showLoad || $stateParams.showLoading ){
						hideLoading();
					// }
					resolve(response.data.result)
				} else if ( response.data.status === "AUTH_ERROR" ){
					hideLoading()
					toast.setMsg("** AUTHENTICATION ERROR **")
					reject("authErr")
				} else {
					// if( showLoad || $stateParams.showLoading ){
						hideLoading();
					// }					
					toast.setMsg("!! ERROR GETTING STOCK DETAILS !!")
					reject ("ERROR1") 
				}
			},function(err){
				// if( showLoad || $stateParams.showLoading ){
					hideLoading();
				// }				
				toast.setMsg("!! ERROR GETTING STOCK DETAILS !!")
				reject ("ERROR2") 
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

	$scope.update = function(){
		$('.modal').modal('close')
		$state.go('update_stock',{'item':$rootScope.item})
	}

	$scope.delConfirm = function(){
		// $('.modal').modal('close')
		if($rootScope.item.rentedStock === 0){
			$rootScope.delAllowed = true ;
			$('#stockViewModal').modal('close')
			$('#delConfirm').modal('open');
		} else {
			$('#stockViewModal').modal('close')
			$rootScope.delAllowed = false ;
			toast.setMsg("!! ITEMS WITH RENTED STOCK CANT BE DELETED !!")
			showToast("error")
		}		
	}

	$scope.delete = function(){
		$('#delConfirm').modal('close');
		toast.setMsg("LOADING")
		showLoading();
		var data = "token=" + user.getToken()
		deleteItem( data )
		.then(function(res){
			$('#buttonSet').fadeOut();
			showToast("success");
			$('#row'+$rootScope.index).addClass('animated fadeOutRight')
			setTimeout( function(){ getCount( false ) } , 500 )
		},function(err){
			showToast("error")
			if ( err == "authErr" ){
				$state.go('logout')
			}
		})
		$rootScope.delAllowed = false ;
	}
	$scope.set = function(inComing,index){
		$rootScope.item = inComing
		$rootScope.index = index ;
		getPossessionDetails()
		.then(function(res){
			$('#stockViewModal').modal('open');
			var resLength = res.length
			var newHeight = 0 
			if ( resLength >= 1 )
				newHeight = 440 + ( 60 * ( resLength - 1 ) )
			else 
				newHeight = 230 
/*			if ( resLength == 1 )
				newHeight = 440
			else 
				newHeight = 440 + ( 60 * ( resLength-1 ) )*/
			$('#contentsModal').css('height' , newHeight )
			$scope.posDetails = res ;
			$scope.$apply() ;
		},function(err){
			showToast("error")
			if ( err == "authErr" ){
				$state.go('logout')
			}
		})
	}
	$scope.noDel = function(){
		$rootScope.delAllowed = false ;
		$('#delConfirm').modal('close');
		$('#stockViewModal').modal('open');
	}

	$scope.$watch('total',function(newVal,oldVal){
		if ( newVal != oldVal ){
		}
	})

	var deleteItem = function( dataObj ){
		return new Promise(function(resolve,reject){
			$http({
				url : "/item/delete/"+$rootScope.item.barCode,
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
				} else if ( response.data.status === "AUTH_ERROR" ){
					toast.setMsg("** AUTHENTICATION ERROR **")
					reject("authErr")
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