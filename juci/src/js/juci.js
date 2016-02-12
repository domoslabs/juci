/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

(function(scope){
	var $uci = scope.UCI; 
	var $rpc = scope.UBUS; 
	
	function JUCIMain(){
		this.plugins = {}; 
		this.templates = {}; 
		this.pages = {}; 
	}
	
	JUCIMain.prototype.module = function(name, root, data){
		console.error("WARNING: JUCI.module() is deprecated! ["+name+"]"); 
		/*var self = this; 
		if(data){
			data.plugin_root = root; 
			self.plugins[name] = data; 
		}
		var plugin = self.plugins[name]; 
		var juci = self; 
		return {
			plugin_root: "", //((plugin||{}).plugin_root||"plugins/"+name+"/"), 
			directive: function(name, fn){
				return angular.module("juci").directive(name, fn);
			}, 
			controller: function(name, fn){
				return angular.module("juci").controller(name, fn); 
			}, 
			state: function(name, obj){
				if(obj.templateUrl && plugin.plugin_root) obj.templateUrl = plugin.plugin_root + "/" + obj.templateUrl; 
				if(obj.views) Object.keys(obj.views).map(function(k){
					var v = obj.views[k]; 
					if(v.templateUrl && plugin.plugin_root) v.templateUrl = plugin.plugin_root + "/" + v.templateUrl; 
				}); 
				$juci.$stateProvider.state(name, obj); 
				return this; 
			}
		}*/
	}; 

	JUCIMain.prototype.style = function(style){
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = style.css;
		document.body.appendChild(css);
	}

	JUCIMain.prototype.page = function(name, template, redirect){
		//console.log("Registering page "+name+": "+template); 
		var page = {
			template: template, 
			url: name
		}; 
		if(redirect) page.redirect = redirect; 
		this.pages[name] = page; 
	}
	
	JUCIMain.prototype.template = function(name, code){
		var self = this; 
		self.templates[name] = code; 
	}
	
	JUCIMain.prototype.$init = function(){
		var scripts = []; 
		var deferred = $.Deferred(); 
		var $rpc = scope.UBUS; 
		// TODO: maybe rewrite the init sequence
		async.series([
			function(next){
				scope.UBUS.$init().done(function(){
					if(!scope.UBUS.juci || !scope.UBUS.juci.system || !scope.UBUS.juci.system.info){
						// TODO: make this prettier. 
						//alert("Can not establish ubus connection to router. If the router is rebooting then please wait a few minutes and try again."); 
						//return; 
						deferred.reject(); 
						return; 
					} 
					next();
				}).fail(function(){
					console.error("UBUS failed to initialize: this means that no rpc calls will be available. You may get errors if other parts of the application assume a valid RPC connection!"); 
					deferred.reject(); 
					//next(); 
				}); 
			},  
			function(next){
				$uci.$init().done(function(){
					next(); 
				}).fail(function(){
					console.error("UCI failed to initialize!"); 
					next(); 
					//deferred.reject(); 
				}); 
			}, 
			function(next){
				$juci.config.$init().done(function(){
					next(); 
				}).fail(function(){
					console.error("CONFIG failed to initialize!"); 
					next(); 
					//deferred.reject(); 
				}); 
			}, 
			function(next){
				$rpc.$authenticate().done(function(){
					next(); 
				}).fail(function(){
					console.log("Failed to verify session."); 
					next(); 
				}); 
			},
			function(next){
				// get the menu navigation
				if(!$rpc.juci){
					console.log("skipping menu init");  
					next(); 
					return; 
				}
				
				// retrieve session acls map
				var acls = {}; 
				if(UBUS.$session && UBUS.$session.acls && UBUS.$session.acls["access-group"]){
					acls = UBUS.$session.acls["access-group"]; 
				}
				console.log("juci: loading menu from server.."); 
				$uci.juci["@menu"].map(function(menu){
					// only include menu items that are marked as accessible based on our rights (others will simply be broken because of restricted access)
					if(menu.acls.value.length && menu.acls.value.find(function(x){
						return !acls[x]; 
					})) return; 

					var redirect = menu.redirect.value; 
					var page = menu.page.value; 
					if(page == "") page = undefined; 
					if(redirect == "") redirect = undefined; 
					page = redirect || page; 
					var obj = {
						path: menu.path.value, 
						href: page, 
						modes: menu.modes.value || [ ], 
						text: "menu-"+(menu.page.value || menu.path.value.replace(/\//g, "-"))+"-title" 
					}; 
					$juci.navigation.register(obj); 
					JUCI.page(page, "pages/"+page+".html", redirect); 
				}); 
				next(); 
				/*$rpc.juci.ui.menu().done(function(data){
					//console.log(JSON.stringify(data)); 
					// get menu keys and sort them so that parent elements will come before their children
					// this will automatically happen using normal sort because parent element paths are always shorter than their childrens. 
					//var keys = Object.keys(data.menu).sort(function (a, b) { 
					//	return a.localeCompare(b) ; 
					//}); 
					var keys = Object.keys(data.menu); 
					
					keys.map(function(key){
						var menu = data.menu[key]; 
						var view = menu.view; 
						var redirect = menu.redirect; 
						var path = key; 
						//console.log("MENU: "+path); 
						var obj = {
							path: path, 
							href: menu.page || path.replace(/\//g, "-").replace(/_/g, "-"), 
							modes: menu.modes || [ ], 
							text: menu.title 
						}; 
						$juci.navigation.register(obj); 
						if(redirect) redirect = redirect.replace(/\//g, "-").replace(/_/g, "-"); 
						// NOTE: all juci page templates currently have form word<dot>word<dot>..html
						// And their names correspond to the structure of the menu we get from the box.
						// - This makes it easy to find the right page file and simplifies managing a lot of pages.
						// - This also allows plugins to override existing pages simply by supplying their own versions of the page templates
						// - Conclusion: this is one of the things that should almost never be rewritten without providing 
						//   a fallback mechanism for supporting the old (this) way because all plugins depend on this.  
						// JUCI.page(obj.href, "pages/"+obj.path.replace(/\//g, ".")+".html", redirect); 
						JUCI.page(obj.href, "pages/"+obj.href+".html", redirect); 
					}); 
					//console.log("NAV: "+JSON.stringify($navigation.tree())); 
					//$rootScope.$apply(); 
					next(); 
				}).fail(function(){
					next();
				});*/ 
			}, 
			function(next){
				// set various gui settings such as mode (and maybe theme) here
				// TODO: fix this. (mode will not be set automatically for now when we load the page. Need to decide where to put this one) 
				//$juci.config.mode = localStorage.getItem("mode") || "basic"; 
				next(); 
			}
		], function(){
			deferred.resolve(); 
		}); 
		return deferred.promise(); 
	}
	
	scope.JUCI = scope.$juci = new JUCIMain(); 
	if(typeof angular !== "undefined"){
		// TODO: this list should eventually be split out into plugins.
		// we should in fact use JUCI.app.depends.push("...") for this then
		// otherwise this list of things that are always included in juci will become quite big..
		var app = scope.JUCI.app = angular.module("juci", [
			"ui.bootstrap",
			"ui.router", 
			'ui.select',
			"ui.bootstrap.carousel", 
			'angularModalService', 
			"uiSwitch",
			"ngAnimate", 
			"gettext", 
			"dndLists", 
			"cgPrompt", 
			"checklist-model",
			"ngTagsInput"
		]); 
		app.config(function($stateProvider, $animateProvider){
			// turn off angular animations on spinners (they have their own animation) 
			$animateProvider.classNameFilter(/^((?!(fa-spinner)).)*$/); 	
			Object.keys(scope.JUCI.pages).map(function(name){
				var page = scope.JUCI.pages[name];
				var state = {
					url: "/"+page.url,
					views: {
						"content": {
							templateUrl: (page.redirect)?"pages/default.html":page.template
						}
					},
					// Perfect! This loads our controllers on demand! :) 
					// Leave this code here because it serves as a valuable example
					// of how this can be done. 
					/*resolve: {
						deps : function ($q, $rootScope) {
							var deferred = $q.defer();
							require([plugin_root + "/" + page.view + ".js"], function (tt) {
								$rootScope.$apply(function () {
										deferred.resolve();
								});
								deferred.resolve()
							});
							return deferred.promise;
						}
					},*/
					// this function will run upon load of every page in the gui
					onEnter: function($uci, $window, $rootScope, $tr, gettext){
						if(page.redirect) {
							//alert("page redirect to "+page.redirect); 
							$juci.redirect(page.redirect); 
							return; 
						}
						
						$rootScope.errors.splice(0, $rootScope.errors.length); 
						
						// this will touch the session so that it does not expire
						$rpc.$authenticate().done(function(){
							$uci.$rollback(); 
						}).fail(function(){
							$juci.redirect("login");
						});
						
						// document.title = $tr(name.replace(/\//g, ".").replace(/-/g, ".")+".title")+" - "+$tr(gettext("application.name")); 
						document.title = $tr(name+"-title"); 

						// scroll to top
						$window.scrollTo(0, 0); 
					}, 
					onExit: function($uci, $tr, gettext, $interval, $events){
						if($uci.$hasChanges()){
							if(confirm($tr(gettext("You have unsaved changes. Do you want to save them before leaving this page?"))))
								$uci.$save(); 
							else
								$uci.$clearCache(); 
						}
						// clear all juci intervals when leaving a page
						JUCI.interval.$clearAll(); 
						$events.removeAll();
					}
				};  
				
				$stateProvider.state(name, state);
			}); 
		}); 
		
		// override default handler and throw the error out of angular to 
		// the global error handler
		app.factory('$exceptionHandler', function() {
			return function(exception) {
				throw exception; 
				//throw exception+": \n\n"+exception.stack;
			};
		});

		app.run(function($templateCache, $uci, $events, $rpc, $rootScope){
			var self = scope.JUCI;
			// add capability lookup to root scope so that it can be used inside html ng-show directly 
			$rootScope.has_capability = function(cap_name){
				if(!$rpc.$session || !$rpc.$session.acls.juci || !$rpc.$session.acls.juci.capabilities || !($rpc.$session.acls.juci.capabilities instanceof Array)) {
					console.log("capabilities not enabled!"); 
					return false; 
				}
				return $rpc.$session.acls.juci.capabilities.indexOf(cap_name) != -1; 
			}
			// register all templates 
			Object.keys(self.templates).map(function(k){
				//console.log("Registering template "+k); 
				$templateCache.put(k, self.templates[k]); 
			}); 
			// subscribe to uci change events and notify uci object
			$events.subscribe("uci.commit", function(ev){
				var data = ev.data; 
				if(data && $uci[data.config]){
					console.log("reloading config "+data.config); 
					$uci[data.config].$reload().done(function(){ 
						// reload all gui 
						$rootScope.$apply(); 
					}); 
				}
				console.log("commit: "+JSON.stringify(data)); 
			}); 
		}); 

		app.factory('$rpc', function(){
			return scope.UBUS; 
		});

		app.factory('$rpc2', function(){
			return scope.UBUS2; 
		});

		app.factory('$uci', function(){
			return scope.UCI; 
		});

		app.factory('$localStorage', function() {
			return scope.localStorage; 
		});
	}

	UCI.$registerConfig("juci"); 
		
	UCI.juci.$registerSectionType("menu", {
		"path": 			{ dvalue: undefined, type: String }, 
		"page": 			{ dvalue: undefined, type: String }, 
		"redirect":			{ dvalue: undefined, type: String }, 
		"acls":				{ dvalue: [], type: Array }, 
		"modes": 			{ dvalue: [], type: Array }
	}); 
	
	UCI.juci.$registerSectionType("juci", {
		"homepage": 		{ dvalue: "overview", type: String },
		"language_debug":	{ dvalue: false, type: String },
		"default_language": { dvalue: "en", type: String }
	}); 
	UCI.juci.$insertDefaults("juci"); 

	UCI.juci.$registerSectionType("login", {
		"showusername":		{ dvalue: true, type: Boolean }, // whether to show or hide the username on login page 
		"defaultuser":		{ dvalue: "admin", type: String } // default user to display on login page or to use when username is hidden 
	}); 
	UCI.juci.$insertDefaults("login"); 

	UCI.juci.$registerSectionType("localization", {
		"default_language":		{ dvalue: "en", type: String }, // language used when user first visits the page 
		"languages":			{ dvalue: [], type: Array } // list of languages available (use name of po file without .po extension and in lower case: se, en etc..)
	});  
	// register default localization localization section so that we don't need to worry about it not existing
	UCI.juci.$insertDefaults("localization"); 

})(typeof exports === 'undefined'? this : exports); 
