angular.module('viewRefundsModule',['cfp.hotkeys','serviceModule','serviceModule2'])
.controller('viewRefundCtrl' , function($rootScope , $scope , hotkeys , $http , $state , $stateParams , user , toast ){
	hotkeys.bindTo($scope)
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
    
    let getRefundList = () => {
        return new Promise( (resolve,reject) => {
			if ( $stateParams.showLoading ){
				toast.setMsg("LOADING")
                showLoading();
            }
			$http({
				url : `/refund/list`,
                method : 'GET',
                params: {token: user.getToken()}
			})
			.then(function(response){
				if ( response.data.status === "SXS" ){
					if( $stateParams.showLoading ){
						hideLoading();
					}
					resolve(response.data.result)
				} else if ( response.data.status === "AUTH_ERROR" ){
					if( $stateParams.showLoading ){
						hideLoading();
					}					
					toast.setMsg("** AUTHENTICATION ERROR **")
					reject("authErr")
				} else {
					if( $stateParams.showLoading ){
						hideLoading();
					}					
					toast.setMsg("!! ERROR GETTING REFUND LIST !!")
					reject ("ERROR1") 
				}
			},function(err){
				if( $stateParams.showLoading ){
					hideLoading();
                }				
				toast.setMsg("!! ERROR GETTING REFUND LIST !!")
				reject ("ERROR2") 
			})                        
        })
    }

    let refundNow = () => {
        return new Promise( (resolve,reject) => {
			if ( $stateParams.showLoading ){
				toast.setMsg("LOADING")
				showLoading();
            }
            $http({
				url : "/refund/pay",
				method : 'POST',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				data : `billId=${$rootScope.refund.refundId}&token=${user.getToken()}`
			})
			.then(function(response){
                hideLoading();
				if ( response.data.status === "SXS" ){
					toast.setMsg("!! REFUND COMPLETED SUCCESSFULLY !!")
					resolve("SXS")
				} else if ( response.data.status === "AUTH_ERROR" ){			
					toast.setMsg("** AUTHENTICATION ERROR **")
					reject("authErr")
				} else {
					toast.setMsg("!! ERROR UPDATING REFUND DETAILS !!")
					reject ("ERROR1") 
				}
			},function(err){
                hideLoading()	
				toast.setMsg("!! ERROR UPDATING REFUND DETAILS !!")
				reject ("ERROR2") 
			})                        
        })
    }

	getRefundList()
	.then(function(res){
		$scope.refundList = res ;
		$scope.$apply() ;
	},function(err){
		showToast("error")
		if ( err == "authErr" ){
			$state.go('logout')
		}
	})

})

