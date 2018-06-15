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

	JUCIMain.prototype.page = function(name, template){
		if(!name) return;
		var page = {
			template: template,
			url: name
		};
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
					$rpc.$clearSession().always(function(){
						deferred.resolve("not logged in");
					});
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
				console.log("juci: loading menu from server..");
				JUCI.navigation.clear();
				async.eachSeries($uci.juci["@menu"], function(menu, n){
					$rpc.$has_access(menu).done(function(ret){
						if(ret === true){
							addMenuItem(menu);
						}
					}).always(function(){n();});
				}, function(){
					$juci.navigation.removeInvalidNodes();
					$juci.navigation.sortNodes();
					next();
				});
				function addMenuItem(menu){
					if(!menu.path || !menu.path.value) return;
					var page;
					if(menu.redirect.value && menu.page.value)
						page = "";
					else
						page = menu.page.value;
					if(!menu.index || !menu.index.value ||
							menu.index.value > 99 || menu.index.value < 1) menu.index.value = 99;
					var obj = {
						path: menu.path.value,
						page: page,
						hidden: menu.hidden.value,
						index: menu.index.value,
						modes: menu.modes.value || [],
						text: menu.external.value ? menu.path.value : "menu-"+(menu.page.value || menu.path.value.replace(/\//g, "-"))+"-title",
						external: menu.external.value
					}
					$juci.navigation.register(obj);
					JUCI.page(menu.page.value || "", "pages/"+(menu.page.value || "default")+".html");
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
							templateUrl: page.template
						}
					},
					// this function will run upon load of every page in the gui
					onEnter: function($uci, $window, $rootScope, $modal, $events, $tr, $juciDialog, $config, $password){
						
						$rootScope.errors.splice(0, $rootScope.errors.length);
						
						// this will touch the session so that it does not expire
						$rpc.$authenticate().done(function(){
							$uci.$rollback();
						}).fail(function(){
							$juci.redirect("login");
						});
						
						document.title = $tr("menu-"+name+"-title");

						// scroll to top
						$window.scrollTo(0, 0);
						// check if the user needs to change password
						var force_passwd_change = $config.get("settings.juci.force_passwd_change.value");
						try {
							var username = $rpc.$session.data.username;
							var model = {
								cur_pass: "",
								new_pass: "",
								rep_pass: "",
								error: []
							};
							if(force_passwd_change){
								$rpc.$call("juci.core", "default_password", {"username":username}).done(function(res){
									if(!res || res.changed)
										return;

									$password.change(false, username)
								}).fail(function(e){
									console.error("ubus call juci.core default_password '{\"username\":\""+username+"\"}' failed", e);
								});
							}
						}catch(e){
							// we dont care why it failed wi just continue
						}
						// setup automatic connection "pinging" and show spinner if you have lost connection
						// if you are connected this will test if you are logged in or redirect you to login page
						var modal;
						var connected = true;
						var i = 1;
						JUCI.interval.repeat("check-connection", 2000, function(next){
							$rpc.$isConnected().fail(function(){
								if($rootScope.uploadFile || $rootScope.downloadFile){
									next();
									console.log(($rootScope.uploadFile ? "uploading" : "downloading") + " file: pausing connectivity test");
									return;
								}
								connected = false;
								modal = $modal.open({
									animation:false,
									backdrop: "static",
									keyboard: false,
									size: "md",
									templateUrl: "widgets/juci-disconnected.html"
								});
								var i = 1;
								function reconnect(){
									if(i < 10) i += 2;
									$rpc.$reconnect().done(function(){
										$events.resubscribe();
										modal.close();
										next();
									}).fail(function(){
										setTimeout(function(){ reconnect();}, 1000*i);
									});
								}
								setTimeout(function(){ reconnect(); }, 1000);
							}).done(function(){
								if($rpc.$isLoggedIn() && ++i > 2){
									i = 0;
									$rpc.$authenticate().fail(function(){
										if($rootScope.uploadFile || $rootScope.downloadFile){
											console.log(($rootScope.uploadFile ? "uploading":"downloading") + " file: authentication paused");
											return;
										}
										$rpc.$clearSession().done(function(){
											setTimeout(function(){$juci.redirect("login");}, 0);
										});
									});
								}
								next();
							});
						});
					},
					onExit: function($uci, $tr, gettext, $events){
						JUCI.interval.$clearAll();
						$events.removeAll();
						$rpc.$authenticate().fail(function(){
							$juci.redirect("login");
						});
					}
				};
				
				$stateProvider.state(name, state);
			});
		});

		app.run(function($templateCache, $uci, $events, $rpc, $rootScope){
			var self = scope.JUCI;
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
		"hidden":		{ dvalue: false, type: Boolean },
		"external":		{ dvalue: false, type: Boolean },
		"path": 		{ dvalue: undefined, type: String },
		"page": 		{ dvalue: undefined, type: String },
		"redirect":		{ dvalue: undefined, type: String },
		"acls":			{ dvalue: [], type: Array },
		"modes": 		{ dvalue: [], type: Array },
		"require":		{ dvalue: [], type: Array },
		"index":		{ dvalue: 99, type: Number },
		"expose":		{ dvalue: [], type: Array }
	});
	UCI.juci.$registerSectionType("widget", {
		"name":		{ dvalue: [], type: Array },
		"link":		{ dvalue: "", type: String },
		"require":	{ dvalue: [], type: Array },
		"acls":		{ dvalue: [], type: Array },
		"modes":	{ dvalue: [], type: Array },
		"expose":	{ dvalue: [], type: Array }
	});
	UCI.juci.$registerSectionType("wiki", {
		"server":	{ dvalue: "http://docs.intenogroup.com", type: String },
		"version":	{ dvalue: "v310", type: String },
		"language": { dvalue: "en", type: String },
		"visible":	{ dvalue: false, type: Boolean }
	});
	
	UCI.juci.$registerSectionType("juci", {
		"homepage": 		{ dvalue: "overview", type: String },
		"language_debug":	{ dvalue: false, type: String },
		"force_passwd_change":	{ dvalue: false, type: Boolean },
		"default_language":	{ dvalue: "en", type: String }
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
