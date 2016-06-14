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

(function(scope){
	var $uci = scope.UCI; 
	var $rpc = scope.UBUS; 
	
	function JUCIMain(){
		this.plugins = {}; 
		this.templates = {}; 
		this.pages = {}; 
	}
	
	JUCIMain.prototype.style = function(style){
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = style.css;
		document.body.appendChild(css);
	}

	JUCIMain.prototype.page = function(name, template, redirect){
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
		async.series([
			function(next){
				$rpc.$init().done(function(){
					if(!$rpc.$has("juci", "system") || !$rpc.$has("uci")){
						deferred.reject(); 
						return; 
					} 
					next();
				}).fail(function(){
					console.error("UBUS failed to initialize: this means that no rpc calls will be available. You may get errors if other parts of the application assume a valid RPC connection!"); 
					deferred.reject(); 
					return;
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
				$uci.$init().done(function(){
					next(); 
				}).fail(function(){
					console.error("UCI failed to initialize!"); 
					deferred.reject(); 
				}); 
			}, 
			function(next){
				$juci.config.$init().done(function(){
					next(); 
				}).fail(function(){
					console.error("CONFIG failed to initialize!"); 
					next(); 
				}); 
			}, 
			function(next){
				// get the menu navigation
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
					var obj = {
						path: menu.path.value, 
						href: page, 
						redirect: redirect,
						modes: menu.modes.value || [ ], 
						text: "menu-"+(menu.page.value || menu.path.value.replace(/\//g, "-"))+"-title" 
					}; 
					$juci.navigation.register(obj); 
					JUCI.page(page, "pages/"+page+".html", redirect); 
				}); 
				next(); 
			}, 
			function(next){
				$juci.config.mode = localStorage.getItem("mode") || "basic"; 
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
					// this function will run upon load of every page in the gui
					onEnter: function($uci, $window, $rootScope, $tr, gettext){
						if(page.redirect) {
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
						
						document.title = $tr(name+"-title"); 

						// scroll to top
						$window.scrollTo(0, 0); 
					}, 
					onExit: function($uci, $tr, gettext, $events){
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
				//This is causing issues in IE11
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
				$templateCache.put(k, self.templates[k]); 
			}); 
			// subscribe to uci change events and notify uci object
			$events.subscribe("uci.commit", function(ev){
				var data = ev.data; 
				if(data && $uci[data.config]){
					$uci[data.config].$reload().done(function(){ 
						// reload all gui 
						$rootScope.$apply(); 
					}); 
				}
			}); 
		}); 

		app.factory('$rpc', function(){
			return scope.UBUS; 
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

	UCI.juci.$registerSectionType("login", {
		"showusername":		{ dvalue: true, type: Boolean }, // whether to show or hide the username on login page 
		"defaultuser":		{ dvalue: "user", type: String } // default user to display on login page or to use when username is hidden 
	}); 

	UCI.juci.$registerSectionType("localization", {
		"default_language":		{ dvalue: "en", type: String }, // language used when user first visits the page 
		"languages":			{ dvalue: [], type: Array } // list of languages available (use name of po file without .po extension and in lower case: se, en etc..)
	});  
	// register default localization localization section so that we don't need to worry about it not existing
	JUCI.app.run(function($uci){
		$uci.$sync("juci").done(function(){
			if(!$uci.juci.juci){
				$uci.juci.$create({
					".type":"juci",
					".name":"juci"
				});
			}
			if(!$uci.juci.login){
				$uci.juci.$create({
					".type":"login",
					".name":"login"
				});
			}
			if(!$uci.juci.localization){
				$uci.juci.$create({
					".type":"localization",
					".name":"localization"
				});
			}
		});
	 });

})(typeof exports === 'undefined'? this : exports); 
