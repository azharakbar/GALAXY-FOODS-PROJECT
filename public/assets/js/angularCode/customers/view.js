angular.module('viewCustModule',['ngTable','serviceModule'])
.controller('viewCustCtrl',function($scope,$http,user,NgTableParams){
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


	$scope.getInfo= function(t){
		console.log("here")
		console.log(t)
	}

	$scope.$watch('total',function(newVal,oldVal){
		if ( newVal != oldVal ){
			console.log('changed from '+oldVal+' to '+newVal)
		}
	})
	getCount() ;
	// setInterval(getCount,2000)
})