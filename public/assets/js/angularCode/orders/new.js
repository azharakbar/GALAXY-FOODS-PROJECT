angular.module('newOrderModule',['pickadate','serviceModule','serviceModule2'])
.controller('newOrderCtrl',function( $rootScope , $scope , $http , user , toast ){
	
	var monthNames = ["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"];
	var orderedItem = {} ;

	$scope.todayDate = new Date();
	$scope.returnDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) ;

	$scope.orderedList = [] ;

	var getCustomerList = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/allCustomers',
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

	var getItemList = function(){
		return new Promise( function( resolve , reject ){
			$http({
				url : '/allItemsNew',
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

	$scope.searchFocus = function(){
		$('#buttonSet').fadeOut()
		$('.tableRow').animate({'height':48})
	}

	$scope.set= function(inComing,index){
		$rootScope.customer = inComing
		$rootScope.index = index ;
		$('#orderConfirm').modal('open')
		console.log("INDEX IS :"+$rootScope.index)
	}
	
	$scope.setItem= function(inComing,index){
		$rootScope.item = inComing
		$rootScope.index = index ;
		$('#orderItemConfirm').modal('open')
		console.log("INDEX IS :"+$rootScope.index)
	}
	
	$scope.noOrder = function(){
		$('#orderConfirm').modal('close');
	}	
	$scope.cancelItem = function(){
		$('#orderItemConfirm').modal('close');
	}		

	$scope.enrollItem = function(){
		console.log("I AM HERE" + $scope.qty + ' ' + $rootScope.item.availableStock )
		if ( $scope.qty > $rootScope.item.availableStock || $scope.qty === undefined ){
			console.log("I AM INSEIDE IF")
			$('#maxVal').removeClass('shake')
			$('#maxVal').addClass('shake')
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

	var nextStep = function(){
		$('#nextContent').removeClass('hide')
		$('#nextContent').removeClass('flipOutX')
		$('#nextContent').show()
		$('#nextContent').addClass('flipInX')
		$('#searchContainer').addClass('rollOut')
		// $scope.titleMsg = "PICK THE ITEMS TO PLACE ORDER"
		$scope.titleMsg = "ENTER EVENT & RETURN DETAILS"
		// $scope.list = response
		$scope.$apply()
	}

	var itemStep = function(){
		$('#itemContent').removeClass('hide')
		$('#itemContent').removeClass('flipOutX')
		$('#itemContent').removeClass('hide')
		$('#itemContent').show()
		$('#itemContent').addClass('flipInX')
		$scope.titleMsg = "PICK THE ITEMS TO PLACE ORDER"
		$scope.$apply()
		$('#searchContainer').removeClass('rollOut')
		$('#searchContainer').addClass('rollIn')

		getItemList()
		.then(function(response){
			console.log("SXS RESPONSE")
			$scope.itemList = response
			$scope.$apply()
		},function(err){
			showToast("error")
		})	

	}	

	$scope.orderProceed= function(){
		$('#orderConfirm').modal('close');
		$('#custList').removeClass('flipInX');
		$('#custList').addClass('flipOutX');
		setTimeout( function(){ $('#custList').hide(); nextStep(); }, 500);
	}


	getCustomerList()
	.then(function(response){
		console.log("SXS RESPONSE")
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
		$rootScope.formattedDate = $rootScope.returnDate.getDate() + ' ' + monthNames[$rootScope.returnDate.getMonth()] + ', ' + ($rootScope.returnDate.getYear()+1900)
		$rootScope.evePurpose = $scope.evePurpose ;
		$rootScope.eveLoxn = $scope.eveLoxn ;

		if ( $rootScope.returnDate >= $rootScope.todayDate ){
			toast.setMsg(":: EVERYTHING OK ::")
			$('#nextContentForm').removeClass('flipInX');
			$('#nextContentForm').addClass('flipOutX');
			setTimeout( function(){ $('#nextContentForm').hide(); itemStep(); }, 500);
		} else  {
			toast.setMsg("** RETURN DATE HAS TO BE ON OR AFTER TODAY **")
			showToast("error")
		}
	}	
	$scope.back = function(){
		$('#nextContent').removeClass('flipInX')
		$('#nextContent').addClass('flipOutX')
		setTimeout( function(){ 
			$('#nextContent').addClass('hide'); 
			$('#custList').removeClass('flipOutX');
			$('#custList').show();
			$('#custList').addClass('flipInX');
			$('#searchContainer').removeClass('rollOut')
			$('#searchContainer').addClass('rollIn')
		}, 500);
	}
})