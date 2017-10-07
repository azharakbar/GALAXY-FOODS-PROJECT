angular.module('reportModule' , ['pickadate','serviceModule','serviceModule2'] )
.controller('reportCtrl', function( $rootScope, $scope, $sce, $http, $state, $stateParams, user, toast ){
	$scope.startDate = new Date()
	$scope.endDate = new Date()
	$scope.generate = function(){
		if (($scope.startDate > $scope.endDate) && $scope.startDate != null && $scope.endDate != null ){
			toast.setMsg("!! INVALID START AND END DATES !!")
			showToast("error")
		} else {
			var loxn = "http://"+window.host+":"+window.port+"/report" ;
			var dataObj = {
				startDate : $scope.startDate ,
				endDate   : $scope.endDate
			};
			if ( $scope.reportOpt == "stkReport" ){
				loxn += "/stockReport?token="+user.getToken()+"data=" ;
			}
			else{
				loxn += "/transactionReport?token="+user.getToken()+"data=" ;
			}
			loxn += JSON.stringify(dataObj) ;
			var win = window.open(loxn,"_blank","width=700,height=700");
		}
	}
})

function convertDate(string){
	var mnth = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December' ] ;
	convertedDate = '' 
	convertedDate = string.getDate() 
	convertedDate += ' '
	convertedDate += mnth[string.getMonth()]
	convertedDate += ' '
	convertedDate += string.getFullYear()		
	return convertedDate 
}