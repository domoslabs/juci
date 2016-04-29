/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */

// a few functions for string conversions
String.prototype.toDash = function(){
	return this.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
};
String.prototype.toCamel = function(){
	return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

$.jsonRPC.setup({
  endPoint: '/ubus',
  namespace: 'juci'
});

window.$ = $; 

require.config({
    baseUrl: '/',
    urlArgs: 'v=1.0'
});

JUCI.app.config(function ($stateProvider, $locationProvider, $compileProvider, $urlRouterProvider, $controllerProvider, $templateCacheProvider, $provide) {
	console.log("CONF"); 
	//$locationProvider.otherwise({ redirectTo: "/" });
	$locationProvider.hashPrefix('!');
	$locationProvider.html5Mode(false); 
	
	$juci.controller = $controllerProvider.register; 
	$juci.directive = $compileProvider.directive; 
	$juci.state = $stateProvider.state; 
	$juci.decorator = function(name, func){
		return $provide.decorator(name, func); 
	}
	$juci.$config = angular.module("juci").config; 
	$juci.$stateProvider = $stateProvider; 

	$juci.$urlRouterProvider = $urlRouterProvider; 
	$juci.redirect = function(page){
		window.location.href = "#!/"+page; 
	}
	$urlRouterProvider.otherwise("404"); 
})
.run(function($templateCache){
	var _get = $templateCache.get; 
	var _put = $templateCache.put; 
	$templateCache.get = function(name){
		name = name.replace(/\/\//g, "/").replace(/^\//, ""); 
		//console.log("Get template '"+name+"'"); 
		return _get.call($templateCache, name); 
	}
	$templateCache.put = function(name, value){
		name = name.replace(/\/\//g, "/").replace(/^\//, ""); 
		//console.log("Put template '"+name+"'"); 
		return _put.call($templateCache, name, value); 
	}
})
.run(function($rootScope, $state, gettextCatalog, $tr, gettext, $rpc, $config, $location, $navigation, $templateCache, $languages){
	console.log("juci: angular init"); 
	
	// TODO: maybe use some other way to gather errors than root scope? 
	$rootScope.errors = []; 
	
	// register a global error handler so we can show all errors
	window.onerror = function(err){
		$rootScope.errors.push({ message: err+":\n\n"+(err.stack||"") });
		alert(err);  
	}
	$rootScope.$on("error", function(ev, data){
		$rootScope.errors.push({message: data}); 
		//console.log("ERROR: "+ev.name+": "+JSON.stringify(Object.keys(ev.currentScope))); 
	}); 
	$rootScope.$on("errors", function(ev, errors){
		if(errors && (errors instanceof Array)){
			$rootScope.errors.concat(errors.map(function(x){ return { message: x }; })); 
		} else {
			$rootScope.errors.length = 0; 
		}
	}); 
	$rootScope.$on("errors_begin", function(ev){
		$rootScope.errors.splice(0, $rootScope.errors.length); 
	}); 

	if($config.settings && $config.settings.juci) gettextCatalog.debug = $config.settings.juci.default_language.value;
	if($config.settings && $config.settings.juci) gettextCatalog.debug = $config.settings.juci.language_debug.value;
	var home = ($config.settings && $config.settings.juci)?$config.settings.juci.homepage.value: "";
	
	var path = $location.path().replace(/\//g, ""); 
	// load the right page from the start
	if($rpc.$isLoggedIn()){
		$juci.redirect(path|| home || "overview"); 
	} else {
		$juci.redirect("login");
	}
	
	// setup automatic session "pinging" and redirect to login page if the user session can not be accessed
	setInterval(function(){
		$rpc.$authenticate().fail(function(){
			// TODO: this also redirects to login without notice if box reboots, or rpcd crashes. 
			// Determine whether this behavior can be improved because it can be annoying (of course the most annoying part is that rpcd crashes in the first place..) 
			$juci.redirect("login");
		});
	}, 10000); 
}) 
.directive('ngOnload', [function(){
	return {
		scope: {
				callBack: '&ngOnload'
		},
		link: function(scope, element, attrs){
				element.on('load', function(){
						return scope.callBack();
				})
		}
}}]); 

// make autofocus directive work as expected
JUCI.app.directive('autofocus', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
      });
    }
  }
}]);

// This ensures that we have control over the initialization order (base system first, then angular). 
angular.element(document).ready(function() {
	//the init process will try for 1 sec to initialize and if it fails it will go to init fale page
	starting = Date.now();
	(function init(){
		JUCI.$init().done(function(){
			angular.bootstrap(document, ["juci"]);
		}).fail(function(){
			if(starting + 1000 > Date.now()){
				setTimeout(function(){init();},50);
			}else{
				window.location = "/initfail.html";
			}
		});
	})();
});

