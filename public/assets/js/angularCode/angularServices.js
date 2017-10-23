angular.module('serviceModule', ['ui.router'])
	.service( 'user' , function($rootScope,$state,$http){
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
	    this.isLoggedIn = function( frmState ){
	    	$rootScope.fS = frmState
	    	if ( sessionStorage.getItem ('login')){
				var data = JSON.parse(sessionStorage.getItem('login')) ;
				if ( data.time+900000 <= Date.now() ){
					this.clear()
					loggedIn = false
					$state.go('logout')
				}else{
					loggedIn = true ;
					$rootScope.loggedIn = true ;
					username = data.username ;
					token = data.token ;
					role = data.role ;
					data.time = Date.now()
					sessionStorage.setItem('login',JSON.stringify(data))
				}
	    	} else {
	    		loggedIn = false 
	    	}
	        return loggedIn ;
	    }
	    this.saveData = function(data){
	        username = data.username ;
	        token = data.token ;
	        role = data.role ;
	        loggedIn = true ;
	        $rootScope.loggedIn = true ;
	        sessionStorage.setItem('login',JSON.stringify({
	            username : username ,
	            token : token ,
	            role : role , 
	            time : Date.now()
	        }))
	    }
	    this.clear = function(){
	        username = '' ;
	        token = ''; 
	        loggedIn = false ;
	        $rootScope.loggedIn = false ;
	        sessionStorage.removeItem('login');
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