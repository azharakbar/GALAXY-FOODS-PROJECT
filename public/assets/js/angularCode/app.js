var app = angular.module('pcApp',['ui.router','serviceModule','loginModule','dashModule']) ;

app.config(function($stateProvider,$urlRouterProvider,$locationProvider){
    $urlRouterProvider.otherwise('/error') ;

    $stateProvider
    .state('login',{
        url : "/",
        resolve : {
            check : function(user,$state){
                if ( user.isLoggedIn() )
                    $state.go('dashboard')
            }
        },
        views : {
            'v1' : {
                templateUrl : "./views/loginPage.html",
                controller : "loginCtrl"
            }
        }
    })
    .state('dashboard',{
        url : "/dashboard" ,
        resolve : {
            check : function($rootScope,$state,user){
                if(!user.isLoggedIn()){
                    $rootScope.error = "U R NOT LOGGED IN" ;
                    $state.go('login')
                }
            }
        },
        views : {
            'v1' : {
                templateUrl : "./views/dashPage.html" ,
                controller : 'dashCtrl'
            }
        }
    })
    .state('logout',{
        url : "/logout" ,
        resolve : {
            deadResolve : function($state,$location,$rootScope,user){
                user.clear() ;
                $rootScope.error = "LOGGED OUT" ;
                $state.go('login')
            }
        }
    })
    .state('notfound',{
        url : "/error",
        views : {
            'v1' : {
                templateUrl : "./views/404.html"
            }
        }
    })

    $locationProvider.html5Mode(true).hashPrefix('!');
})