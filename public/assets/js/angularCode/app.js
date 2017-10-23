var app = angular.module('pcApp',['ui.router','cfp.hotkeys','serviceModule','loginModule','logoutModule','dashModule','sideNavModule'
	,'newCustModule','viewCustModule','newItemModule','viewItemModule','updateItemModule','updateCustomerModule',
	'serviceModule2','newOrderModule','newBillModule','viewBillModule','viewOrderModule','reportModule']) ;

app.config(function($stateProvider,$urlRouterProvider,$locationProvider){
	$urlRouterProvider.otherwise('/error') ;

	$stateProvider
	.state('login',{
		url : "/",
		resolve : {
			check : function(user,$state,$location){
				if ( user.isLoggedIn('login') )
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
				if(!user.isLoggedIn('dashboard')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
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
				if(!user.isLoggedIn('new_customer')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
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
				if(!user.isLoggedIn('view_customer')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		params : {
			showLoading : { value : true }
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/customers/view.html" ,
				controller : 'viewCustCtrl'
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
				if(!user.isLoggedIn('update_customer')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
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
				if(!user.isLoggedIn('new_item')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
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
				if(!user.isLoggedIn('view_stock')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		params : {
			showLoading : { value : true }
		},        
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/stocks/view.html" ,
				controller : 'viewItemCtrl'
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
				if(!user.isLoggedIn('update_stock')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
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
				if(!user.isLoggedIn('new_bill')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		params : {
			orderDetails : { value : { orderId : "NOT DEFINED"} }
		},        
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/billing/new.html" ,
				controller : 'newBillCtrl'
			}
		}
	})
	.state('pay_bill',{
		url: "/pay_bill" ,
		resolve : {
			check : function($rootScope,$state,user){
				if(!user.isLoggedIn('pay_bill')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
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
				if(!user.isLoggedIn('view_bill')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		params : {
			showLoading : { value : true }
		},        
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/billing/view.html" ,
				controller : 'viewBillCtrl'
			}
		}
	})
	.state('new_order',{
		url: "/new_order" ,
		resolve : {
			check : function($rootScope,$state,user){
				if(!user.isLoggedIn('new_order')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/orders/new.html" ,
				controller : 'newOrderCtrl'
			}
		}
	})
	.state('view_order',{
		url: "/view_order" ,
		resolve : {
			check : function($rootScope,$state,user){
				if(!user.isLoggedIn('view_order')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		params : {
			showLoading : { value : true }
		},        
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/orders/view.html" ,
				controller : 'viewOrderCtrl'
			}
		}
	})
	.state('update_order',{
		url: "/update_order" ,
		resolve : {
			check : function($rootScope,$state,user){
				if(!user.isLoggedIn('update_order')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/orders/update.html" ,
				controller : ''
			}
		}
	})

	.state('report_central',{
		url: "/report_central" ,
		resolve : {
			check : function($rootScope,$state,user){
				if(!user.isLoggedIn('report_central')){
					$rootScope.error = "YOU ARE NOT LOGGED IN" ;
					$state.go('logout')
				}
			}
		},
		views : {
			'v1' : {
				templateUrl : "./views/navbar.html" ,
				controller : 'sideNavCtrl'
			},
			'v2' : {
				templateUrl : "./views/reports/view.html" ,
				controller : 'reportCtrl'
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

app.controller('indexCtrl',function($scope,$rootScope,$state,$timeout,toast,hotkeys){

	$rootScope.showSideNav = true
	$rootScope.showSideNavFinal = true

	$rootScope.initalLoad = true 

	$rootScope.$watch('showSideNav',function(newVal,oldVal){
		if ( $rootScope.initalLoad ){
			$rootScope.initalLoad = false 
		} else {
			if ( !newVal ){
				$('#view2').animate({
					"margin-left" : "0px" 
				})
				$('#slide-out').animate({
					width : "0px"
				},function(){
					$rootScope.showSideNavFinal = false
					$rootScope.$apply()
				})
			} else {
				$('#view2').animate({
					"margin-left" : "250px" 
				},function(){
					$rootScope.showSideNavFinal = true
					$rootScope.$apply()
				})				
				$('#slide-out').animate({
					width : "250px"
				})				
			}
		}
	})

	hotkeys.add({
		combo: 'ctrl+alt+c',
		description: 'CUSTOMERS CENTRAL',
		callback: function() {
			$state.go('view_customer')
		}
	})
	hotkeys.add({
		combo: 'ctrl+alt+s',
		description: 'STOCKS CENTRAL',
		callback: function() {
			$state.go('view_stock')
		}
	})
	hotkeys.add({
		combo: 'ctrl+alt+b',
		description: 'BILLING CENTRAL',
		callback: function() {
			$state.go('view_bill')
		}
	})
	hotkeys.add({
		combo: 'ctrl+alt+o',
		description: 'ORDERS CENTRAL',
		callback: function() {
			$state.go('view_order')
		}
	})
	hotkeys.add({
		combo: 'ctrl+alt+r',
		description: 'REPORTS CENTRAL',
		callback: function() {
			$state.go('report_central')
		}
	})
	hotkeys.add({
		combo: 'alt+r',
		description: 'RELOAD',
		callback: function() {
			$state.reload()
		}
	})
	hotkeys.add({
		combo: 'alt+l',
		description: 'LOGOUT',
		callback: function() {
			if ( $state.current.name != 'login')
				$state.go('logout')	
		}
	})
	hotkeys.add({
		combo: 'esc',
		description: 'SHOW/SIDE NAVIGATION MENU',
		callback: function() {
			if ( $state.current.name != 'login')
				$rootScope.humburger()
		}
	})

	$rootScope.$watch('msg',function(oldVal,newVal){
		if ( newVal != oldVal ){
			if(oldVal === "LOADING")
				$scope.bar = true ;
			else
				$scope.bar = false ;
			
			$scope.errorMsg = oldVal 
		}
	})
})