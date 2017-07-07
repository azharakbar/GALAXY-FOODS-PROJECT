angular.module('serviceModule', [])
	.service( 'user' , function($rootScope){
	    var username ;
	    var token ;
	    var loggedIn = false ;
	    var role ;

	    this.getName = function(){
	        return username ;
	    }
	    this.getToken = function(){
	        return token
	    }
	    this.getRole = function(){
	    	return role ;
	    }
	    this.isLoggedIn = function(){
	        if ( localStorage.getItem('login') ){
	            loggedIn = true ;
	            $rootScope.loggedIn = true ;
	            var data = JSON.parse(localStorage.getItem('login')) ;
	            username = data.username ;
	            token = data.token ;
	            role = data.role ;
	        }
	        return loggedIn ;
	    }
	    this.saveData = function(data){
	        username = data.username ;
	        token = data.token ;
	        role = data.role ;
	        loggedIn = true ;
	        $rootScope.loggedIn = true ;
	        localStorage.setItem('login',JSON.stringify({
	            username : username ,
	            token : token ,
	            role : role
	        }))
	    }
	    this.clear = function(){
	        username = '' ;
	        token = ''; 
	        loggedIn = false ;
	        $rootScope.loggedIn = false ;
	        localStorage.removeItem('login');
	    }
	})

angular.module('serviceModule2', [])
	.service('toast',function($rootScope){
		this.setMsg = function( text ){
			$rootScope.msg = text ;
		}
		this.getMsg = function(){
			return $rootScope.msg ;
		}
	})