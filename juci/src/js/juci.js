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
						deferred.reject("missing juci.system");
						return;
					}
					next();
				}).fail(function(e){
					console.error("UBUS failed to initialize: this means that no rpc calls will be available. You may get errors if other parts of the application assume a valid RPC connection! " + JSON.stringify(e));
					deferred.reject(e);
					return;
				});
			},
			function(next){
				var sid_in = decodeURIComponent(window.location.hash).match(/sid=[^&]+/);
				if(sid_in){
					window.location.hash = "";
					var sid = String(sid_in).substring(4).replace(/"/g, "").length;
					if(sid === 32)
						$rpc.$sid(String(sid_in).substring(4).replace(/"/g, ""));
				}
				//try to login. if it works continue init process otherwise go to login
				$rpc.$authenticate().done(function(){
					next();
				}).fail(function(e){
					deferred.resolve("not logged in");
				});
			},
			function(next){
				$uci.$init().done(function(){
					next();
				}).fail(function(e){
					deferred.reject("UCI failed to initialize! er: " + JSON.stringify(e));
				});
			},
			function(next){
				$juci.config.$init().done(function(){
					next();
				}).fail(function(e){
					deferred.reject("CONFIG failed to initialize! " + JSON.stringify(e));
				});
			},
			function(next){
				// get the menu navigation
				// retrieve session acls map
				var acls = {};
				if(UBUS.$session && UBUS.$session.acls && UBUS.$session.acls["access-group"]){
					acls = UBUS.$session.acls["access-group"];
				}
				async.eachSeries($uci.juci["@menu"], function(menu, done){
					// only include menu items that are marked as accessible based on our rights and the box capabilities (others will simply be broken because of restricted access)
					if(menu.acls.value.length && menu.acls.value.find(function(x){
						return !acls[x];
					})){
						done();
						return;
					}
					if(menu.require.value.length){
						var ok = true;
						async.eachSeries(menu.require.value, function(item, n){
							if(!item || !item.split(":").length || item.split(":").length !== 2){
								addMenuItem("invalid require: " + item);
								done();
								return;
							}
							var type = item.split(":")[0];
							var value = item.split(":")[1];
							switch(type){
								case "file":
									$rpc.$call("file", "stat", {"path":value || ""}).fail(function(){
										ok = false;
									}).always(function(){n();});
									break;
								case "ubus":
									var split = value.split("->").filter(function(item){return item !== ""});
									if(split.length === 1)
										ok = $rpc.$has(split[0]);
									else if(split.length === 2)
										ok = $rpc.$has(split[0], split[1]);
									else
										console.log("invalid require ubus with value: " + value);
									n();
									break;
								default:
									console.log("error: list require " + type + ':' + value + " is not supported");
									n();
							}
						}, function(){
							if(ok)
								addMenuItem(menu)
								done();
						});
					}else{
						addMenuItem(menu);
						done();
					}
				}, function(){next();});
				function addMenuItem(menu){
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
				}
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
					onEnter: function($uci, $window, $rootScope, $tr){
						
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
						JUCI.interval.$clearAll();
						$events.removeAll();
						$rpc.$authenticate().done(function(){
							/*if($uci.$hasChanges()){
								if(confirm($tr(gettext("You have unsaved changes. Do you want to save them before leaving this page?"))))
									$uci.$save();
								else
									$uci.$clearCache();
							}*/
						}).fail(function(){
							$juci.redirect("login");
						}).always(function(){
							// clear all juci intervals when leaving a page
						});
					}
				};
				
				$stateProvider.state(name, state);
			});
		});

		app.run(function($templateCache, $uci, $events, $rpc, $rootScope){
			var self = scope.JUCI;
			// add capability lookup to root scope so that it can be used inside html ng-show directly
			$rootScope.has_capability = function(cap_name){
				if(!$rpc.$session || !$rpc.$session.acls.juci || !$rpc.$session.acls.juci.capabilities || !($rpc.$session.acls.juci.capabilities instanceof Array)) {
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
		"modes": 			{ dvalue: [], type: Array },
		"require":			{ dvalue: [], type: Array },
	});
	UCI.juci.$registerSectionType("widget", {
		"name":		{ dvalue: [], type: Array },
		"link":		{ dvalue: "", type: String },
		"require":	{ dvalue: [], type: Array },
		"modes":	{ dvalue: [], type: Array }
	});
	UCI.juci.$registerSectionType("wiki", {
		"server":	{ dvalue: "http://docs.intenogroup.com", type: String },
		"version":	{ dvalue: "v39", type: String },
		"language": { dvalue: "en", type: String },
		"visible":	{ dvalue: false, type: Boolean }
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
})(typeof exports === 'undefined'? this : exports);

/*---Just some code for browsers that does not support RequestAnimationFrame ---*/
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
