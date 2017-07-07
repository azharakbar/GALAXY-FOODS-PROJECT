var app = angular.module('pcApp',['ui.router','serviceModule','loginModule','logoutModule','dashModule','sideNavModule'
	,'newCustModule','viewCustModule','newItemModule','viewItemModule','updateItemModule','updateCustomerModule']) ;

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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/dashPage.html" ,
                controller : 'dashCtrl'
            }
        }
    })
    .state('logout',{
        url : "/logout" ,
        views : {
            'v1' : {
                controller : 'logoutCtrl'
            }
        }

    })
    .state('new_customer',{
        url: "/new_customer" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/customers/new.html" ,
                controller : 'newCustCtrl'
            }
        }
    })
    .state('view_customer',{
        url: "/view_customer" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/customers/view.html" ,
                controller : 'viewCustCtrl'
            }
        }
    })
    .state('search_customer',{
        url: "/search_customer" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/customers/search.html" ,
                controller : ''
            }
        }
    })
    .state('update_customer',{
        url: "/update_customer" ,
        params : {
        	customer : { value : {name:'NAME NOT DEFINED'} }
        },
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/customers/update.html" ,
                controller : 'updateCustomer'       
            }
        }
    })
    .state('new_item',{
        url: "/new_item" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/stocks/new.html" ,
                controller : 'newItemCtrl'
            }
        }
    })
    .state('view_stock',{
        url: "/view_stock" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/stocks/view.html" ,
                controller : 'viewItemCtrl'
            }
        }
    })
    .state('search_stock',{
        url: "/search_stock" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/stocks/search.html" ,
                controller : ''
            }
        }
    })
    .state('update_stock',{
        url: "/update_stock",
        params : {
        	item : { value : {barCode:'BARCODE NOT DEFINED'} }
        },
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/stocks/update.html" ,
                controller : 'updateItem'
            }
        }
    })
    .state('new_bill',{
        url: "/new_bill" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/billing/new.html" ,
                controller : ''
            }
        }
    })
    .state('pay_bill',{
        url: "/pay_bill" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/billing/pay.html" ,
                controller : ''
            }
        }
    })
    .state('view_bill',{
        url: "/view_bill" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/billing/view.html" ,
                controller : ''
            }
        }
    })
    .state('new_order',{
        url: "/new_order" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/orders/new.html" ,
                controller : ''
            }
        }
    })
    .state('view_order',{
        url: "/view_order" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/orders/view.html" ,
                controller : ''
            }
        }
    })
    .state('search_order',{
        url: "/search_order" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/orders/search.html" ,
                controller : ''
            }
        }
    })
    .state('update_order',{
        url: "/update_order" ,
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
                templateUrl : "./views/navBar.html" ,
                controller : 'sideNavCtrl'
            },
            'v2' : {
                templateUrl : "./views/orders/update.html" ,
                controller : ''
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