angular.module('reportModule' , ['pickadate','serviceModule','serviceModule2'] )
.controller('reportCtrl', function( $rootScope, $scope, $sce, $http, $state, $stateParams, user, toast ){
	$scope.startDate = new Date()
	$scope.endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
	$scope.generate = function(){
		// console.log( $scope.startDate )
		// console.log( $scope.endDate )
		if ( convertDate ( $scope.startDate ) === convertDate ( $scope.endDate ) ){
			toast.setMsg("!! START AND END DATES SHOULD NOT BE SAME !!")
			showToast("error")
		} else if (($scope.startDate > $scope.endDate) && $scope.startDate != null && $scope.endDate != null ){
			toast.setMsg("!! INVALID START AND END DATES !!")
			showToast("error")
		} else {
			var loxn = "http://localhost:2016/report?" ;
			var dataObj = {
				startDate : $scope.startDate ,
				endDate   : $scope.endDate
			};
			if ( $scope.reportOpt == "stkReport" ){
				loxn += "shortid=B1yDqRVwW&type=1&data=" ;
			}
			else{
				loxn += "shortid=H1e0jWYdZ&type=2&data=" ;
			}
			loxn += JSON.stringify(dataObj) ;
			var win = window.open(loxn);
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