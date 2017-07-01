/**
*  Module
*
* Description
*/
angular.module('serviceModule', [])
	.service( 'user' , function(){
	    var username ;
	    var token ;
	    var loggedIn = false ;

	    this.getName = function(){
	        return username ;
	    }
	    this.getToken = function(){
	        return token
	    }
	    this.isLoggedIn = function(){
	        if ( localStorage.getItem('login') ){
	            loggedIn = true ;
	            var data = JSON.parse(localStorage.getItem('login')) ;
	            username = data.username ;
	            token = data.token ;
	        }
	        return loggedIn ;
	    }
	    this.saveData = function(data){
	        username = data.username ;
	        token = data.token ;
	        loggedIn = true ;
	        localStorage.setItem('login',JSON.stringify({
	            username : username ,
	            token : token 
	        }))
	    }
	    this.clear = function(){
	        username = '' ;
	        token = ''; 
	        loggedIn = false ;
	        localStorage.removeItem('login');
	    }
	})