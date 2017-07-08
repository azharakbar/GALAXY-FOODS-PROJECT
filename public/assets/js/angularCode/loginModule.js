angular.module('loginModule', ['serviceModule','serviceModule2'])
    .controller('loginCtrl',function( $scope , $rootScope , $http , $location , user , toast){
        $scope.login = function(){
            var username = $scope.username ;
            var password = $scope.password ;

            $http({
                url : '/login',
                method : 'POST' ,
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                },
                data : 'username='+username+'&password='+password
            })
            .then(function(response){
                console.log(response.data)
                if ( response.data.status === "authDone" ){
                    user.saveData( response.data )
                    toast.setMsg("!! LOGGED IN !!")
                    showToast("success")
                    $location.path('/dashboard')
                }else{
                    if ( $rootScope.error != undefined ){
                        $scope.error = $rootScope.error
                        $rootScope.error = undefined ;
                    }
                    else
                        $scope.error = "INVALID LOGIN CREDENTIALS"
                }
            })
        }
    })