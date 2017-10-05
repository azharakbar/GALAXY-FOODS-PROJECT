angular.module('newOrderModule',['cfp.hotkeys','pickadate','serviceModule','serviceModule2'])
.controller('newOrderCtrl',function( $rootScope , $scope , hotkeys , $state , $http , $timeout , user , toast ){

	$('.modal').modal();
	$('.datepicker').css('font-size','19px')
	
	hotkeys.bindTo($scope)
	.add({
		combo : 'alt+s' ,
		description : 'SEARCH' ,
		callback : function(){
			$scope.expandSearch()
		}		
	})

	var monthNames = ["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"];
	var orderedItem = {} ;

	$scope.todayDate = new Date();
	$scope.returnDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) ;
	$scope.pickupDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) ;

	$scope.orderedList = [] ;

	var getCustomerList = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/customer/list',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" )
					resolve(response.data.result)
				else{
					toast.setMsg("** ERROR IN GETTING CUSTOMER LIST **")
					reject("ERROR1")
				}
			},function(err){
				reject("ERROR2")
			})
		})
	}

	var getOrderCount = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/order/total',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" )
					resolve(response.data.count+1)
				else{
					toast.setMsg("** ERROR IN GETTING ORDER ID **")
					reject("ERROR1")
				}
			},function(err){
				reject("ERROR2")
			})
		})
	}	

	var getItemList = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/item/forecastList',
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : "pickupDate="+$scope.pickupDate+"&returnDate="+$scope.returnDate+"&token="+user.getToken()
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					resolve(response.data)
				}
				else{
					toast.setMsg("** ERROR IN GETTING ITEM LIST **")
					reject("ERROR1")
				}
			},function(err){
				reject("ERROR2")
			})
		})
	}	

	$scope.toUpper = function(modelName){
		if ( modelName === "evePurpose"){
			$scope.evePurpose = $scope.evePurpose.toUpperCase() ;
		} else if ( modelName === "eveLoxn" ){
			$scope.eveLoxn = $scope.eveLoxn.toUpperCase() ;
		}
	}

	$scope.expandSearch = function(){
			$('#search').animate( { width:"250px" } )
			$('#search').focus()
	}

	$scope.compressSearch = function(){
		$('#search').animate( { width:"0px" } )
	}

	$scope.searchBlur = function(){
		if ( event.keyCode === 27 && ($scope.search == "" || $scope.search == undefined ) ){
			$('#search').blur()
		}
	}

	$scope.searchFocus = function(){
		$('#buttonSet').fadeOut()
		$('.tableRow').animate({'height':48})
	}

	$scope.set= function(inComing,index){
		$rootScope.customer = inComing
		$rootScope.index = index ;
		$('#orderConfirm').modal('open')
	}
	
	$scope.setItem= function(inComing,index){
		$rootScope.item = inComing
		$rootScope.index = index ;
		$('#orderItemConfirm').modal('open')
	}
	
	$scope.noOrder = function(){
		$('#orderConfirm').modal('close');
	}	
	$scope.cancelItem = function(){
		$('#orderItemConfirm').modal('close');
	}		

	$scope.enrollItem = function(){
		if ( $scope.qty > $rootScope.item.totalStock || $scope.qty === undefined ){
			$('#maxVal').addClass('shake')
			$timeout(function(){
				$('#maxVal').removeClass('shake')
			},1000);			
		} else {
			orderedItem.barCode = $rootScope.item.barCode
			orderedItem.name = $rootScope.item.name
			orderedItem.price = $rootScope.item.price 
			orderedItem.qty = $scope.qty 

			var flag = 0 ;
			for ( var i = 0 ; i < $scope.orderedList.length ; ++i ){
				if ( $scope.orderedList[i].barCode === orderedItem.barCode ){
					$scope.orderedList[i].qty = $scope.qty
					flag = 1 ;
					break ;
				}
			}
			if ( !flag )
				$scope.orderedList.push( orderedItem )
			flag = 0 ;
			orderedItem = {} ;
			$scope.qty = 1 ;
			$('#orderItemConfirm').modal('close')
		}

	}

	$scope.delThisItem = function( index ){
		$('#item'+index).removeClass('fadeInLeft')
		$('#item'+index).addClass('fadeOutRight')
		setTimeout(function() { $scope.orderedList.splice(index,1); $scope.$apply(); }, 750 );
	}

	$scope.checkout = function(){
		var orderTotal = 0 ; 
		for ( var i = 0 ; i < $scope.orderedList.length ; ++i ){
			orderTotal += ( $scope.orderedList[i].price * $scope.orderedList[i].qty )
		}

		var orderObj = {
			customer : $rootScope.customer,
			dates : {
				issueDate : $rootScope.todayDate ,
				pickupDate : $rootScope.pickupDate ,
				returnDate : $rootScope.returnDate
			},
			event : {
				evePurpose : $rootScope.evePurpose ,
				eveLoxn : $rootScope.eveLoxn
			},
			orderId : $scope.orderId , 
			orders : $scope.orderedList ,
			orderTotal : orderTotal
		}	
		$state.go('new_bill',{ orderDetails : orderObj } )
	}

	var nextStep = function(){
		$scope.showDetails = false ;
		$('#nextContent').removeClass('hide')
		$('#nextContent').removeClass('fadeOut')
		$('#nextContent').show()
		$('#nextContent').addClass('fadeIn')
		$('#searchContainer').addClass('rollOut')
		$scope.titleMsg = "ENTER EVENT & RETURN DETAILS"
		$scope.$apply()
		getOrderCount()
		.then(function(response){
			$scope.orderId = pad( response )
			$scope.$apply()
		},function(err){
			showToast("error")
		})

	}


	var pad = function( num ){
		while ( num.toString().length < 5 )
			num = "0" + num ; 
		return num ;
	}

	var itemStep = function(){
		$('#itemContent').removeClass('hide')
		$('#itemContent').removeClass('fadeOut')
		$('#itemContent').removeClass('hide')
		$('#itemContent').show()
		$('#itemContent').addClass('fadeIn')
		$scope.showDetails = true ;
		$scope.titleMsg = "PICK THE ITEMS TO PLACE ORDER"
		$scope.$apply()
		$('#searchContainer').removeClass('rollOut')
		$('#searchContainer').addClass('rollIn')

		getItemList()
		.then(function(response){
			$scope.itemList = response.result.items
			$scope.forecastAvailability = response.result.forecastAvailability
			$scope.$apply()
		},function(err){
			showToast("error")
		})	

	}	



	$scope.orderProceed= function(){
		$('#orderConfirm').modal('close');
		$('#custList').removeClass('fadeIn');
		$('#custList').addClass('fadeOut');
		setTimeout( function(){ $('#custList').hide(); nextStep(); }, 500);
	}


	getCustomerList()
	.then(function(response){
		$scope.titleMsg = "PICK THE CUSTOMER TO PLACE ORDER"
		$scope.list = response
		$scope.$apply()
	},function(err){
		showToast("error")
	})	

	$scope.proceed = function(){
		if ( $scope.evePurpose === undefined )
			$scope.evePurpose = ''
		if ( $scope.eveLoxn === undefined )
			$scope.eveLoxn = ''
		$rootScope.todayDate = $scope.todayDate ;
		$rootScope.returnDate = $scope.returnDate ;
		$rootScope.pickupDate = $scope.pickupDate ;
		$rootScope.formattedReturnDate = $rootScope.returnDate.getDate() + ' ' + monthNames[$rootScope.returnDate.getMonth()] + ', ' + ($rootScope.returnDate.getYear()+1900)
		$rootScope.formattedPickupDate = $rootScope.pickupDate.getDate() + ' ' + monthNames[$rootScope.pickupDate.getMonth()] + ', ' + ($rootScope.pickupDate.getYear()+1900)
		$rootScope.evePurpose = $scope.evePurpose ;
		$rootScope.eveLoxn = $scope.eveLoxn ;

		if ( $rootScope.returnDate >= $rootScope.todayDate && $rootScope.pickupDate >= $rootScope.todayDate && $rootScope.returnDate >= $rootScope.pickupDate ){
/*			toast.setMsg(":: EVERYTHING OK ::")
			showToast("success")*/
			$('#nextContentForm').removeClass('fadeIn');
			$('#nextContentForm').addClass('fadeOut');
			setTimeout( function(){ $('#nextContentForm').hide(); itemStep(); }, 500);
		} else  {
			if ( $rootScope.returnDate >= $rootScope.todayDate ){
				toast.setMsg("** RETURN DATE HAS TO BE ON OR AFTER TODAY **")
			} else if ( $rootScope.pickupDate >= $rootScope.todayDate ) {
				toast.setMsg("** PICKUP DATE HAS TO BE ON OR AFTER TODAY **")
			} else {
				toast.setMsg("** RETURN DATE HAS TO BE ON OR AFTER PICKUP DATE **")
			}
			showToast("error")
		}
	}	
	$scope.back = function( Type ){
		$scope.showDetails = false ;
		if ( Type == 1 ){
			$('#nextContent').removeClass('fadeIn')
			$('#nextContent').addClass('fadeOut')
			setTimeout( function(){ 
				$('#nextContent').addClass('hide'); 
				$('#custList').removeClass('fadeOut');
				$scope.titleMsg = "PICK THE CUSTOMER TO PLACE ORDER"
				$scope.eveLoxn = ''
				$scope.evePurpose = ''
				$scope.$apply();
				$('#custList').show();
				$('#custList').addClass('fadeIn');
				$('#searchContainer').removeClass('rollOut')
				$('#searchContainer').addClass('rollIn')
			}, 500);			
		} else if ( Type == 2 ) {
			$('#itemContent').removeClass('fadeIn')
			$('#itemContent').addClass('fadeOut')
			setTimeout(function(){
				$('#itemContent').hide()
				$('#itemContent').addClass('hide')
				$scope.titleMsg = "ENTER EVENT & RETURN DETAILS"
				$scope.$apply();
				$('#nextContentForm').removeClass('fadeOut');
				$('#nextContentForm').show();
				$('#nextContentForm').addClass('fadeIn');
				$('#searchContainer').removeClass('rollIn')
				$('#searchContainer').addClass('rollOut')
			}, 500);
		}

	}
})