angular.module('newOrderModule',['pickadate','serviceModule','serviceModule2'])
.controller('newOrderCtrl',function( $rootScope , $scope , $http , user , toast ){
	
	var monthNames = ["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"];
	
	$scope.todayDate = new Date();
	$scope.returnDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) ;

	var getList = function(){
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

	$scope.set= function(inComing,index,len){
		$rootScope.customer = inComing
		$rootScope.index = index ;
		$('#orderConfirm').modal('open')
		console.log("INDEX IS :"+$rootScope.index)
	}
	$scope.noOrder = function(){
		$('#orderConfirm').modal('close');
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
		$('#itemContent').show()
		$('#itemContent').addClass('flipInX')
		$scope.titleMsg = "PICK THE ITEMS TO PLACE ORDER"
		$scope.$apply()
		$('#searchContainer').removeClass('rollOut')
		$('#searchContainer').addClass('rollIn')
	}	

	$scope.orderProceed= function(){
		$('#orderConfirm').modal('close');
		$('.table').removeClass('flipInX');
		$('.table').addClass('flipOutX');
		setTimeout( function(){ $('.table').hide(); nextStep(); }, 500);
	}


	getList()
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
			$('.table').removeClass('flipOutX');
			$('.table').show();
			$('.table').addClass('flipInX');
			$('#searchContainer').removeClass('rollOut')
			$('#searchContainer').addClass('rollIn')
		}, 500);
	}
})