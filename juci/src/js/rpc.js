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
	var DEBUG_MODE = 0;
	var retries = 3;
	var RPC_HOST = ""; //(($config.rpc.host)?$config.rpc.host:"")
	var RPC_DEFAULT_SESSION_ID = "00000000000000000000000000000000"; 
	var RPC_SESSION_ID = scope.localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID; 
	var RPC_CACHE = {}; 
	var METHODS = {};
	var RPC_QUERY_IDS = {};
	var rpc_query_id = 1;
	var ws;
	
	var gettext = function(text){ return text; }; 
	
	var default_calls = [
		"session.access", 
		"session.login", 
		"local.features", 
		"local.set_rpc_host"
	]; 
	
	// type = "sonrpc mehod parameter (i.e. call, list, ...
	// object = ubus object
	// method = ubus method
	// data = ubus parameters
	//
	// {jsonrpc..., method: type, [ RPC_SESSION_D , namespace, method, { ... data ...  } }
	function rpc_request(type, object, method, data){
		if(DEBUG_MODE > 1)console.log("UBUS " + type + " " + object + " " + method);
		var sid = ""; 
		
		// check if the request has been made only recently with same parameters
		var key = object+method+JSON.stringify(data);
		if(!RPC_CACHE[key]){
			RPC_CACHE[key] = {}; 
		}
		// if this request with same parameters is already in progress then just return the existing promise 
		if(RPC_CACHE[key].deferred && RPC_CACHE[key].deferred.state() === "pending"){
			return RPC_CACHE[key].deferred.promise(); 
		} else {
			RPC_CACHE[key].deferred = $.Deferred(); 
		} 

		// remove completed requests from cache
		var retain = {}; 
		Object.keys(RPC_CACHE).map(function(k){
			if(RPC_CACHE[k].deferred && RPC_CACHE[k].deferred.state() === "pending"){
				retain[k] = RPC_CACHE[k]; 
			}
		}); 
		RPC_CACHE = retain; 

		var jsonrrpc_obj = {
			jsonrpc: "2.0",
			method: type,
			params: [
				RPC_SESSION_ID,
				object,
				method,
				data
			],
			id: rpc_query_id++
		};

		RPC_QUERY_IDS[jsonrrpc_obj.id] = RPC_CACHE[key];

		ws.send(JSON.stringify(jsonrrpc_obj));

		return RPC_CACHE[key].deferred.promise(); 
	}
	
	var rpc = {
		$sid: function(sid){
			if(sid) RPC_SESSION_ID = sid; 
			else return RPC_SESSION_ID; 
		}, 
		$isLoggedIn: function(){
			return RPC_SESSION_ID !== RPC_DEFAULT_SESSION_ID; 
		}, 
		$authenticate: function(){
			var self = this; 
			var deferred  = $.Deferred(); 
			
			if(!METHODS.session){
				setTimeout(function(){ deferred.reject(); }, 0); 
				return deferred.promise(); 
			}

			METHODS.session.access({
				"scope": "ubus" 
			}).done(function(result){
        		if(!("username" in (result.data||{}))) {
					// username must be returned in the response. If it is not returned then rpcd is of wrong version. 
					//alert(gettext("You have been logged out due to inactivity")); 
					RPC_SESSION_ID = RPC_DEFAULT_SESSION_ID; // reset sid to 000..
					scope.localStorage.setItem("sid", RPC_SESSION_ID); 
					deferred.reject(); 
				} else {
					self.$session = result; 
					if(!("data" in self.$session)) self.$session.data = {}; 
					//console.log("Session: Loggedin! "); 
					deferred.resolve(result); 
				}  
			}).fail(function err(result){
				if(retries === 0){
					RPC_SESSION_ID = RPC_DEFAULT_SESSION_ID; 
					if(DEBUG_MODE) console.error("Session access call failed: you will be logged out!"); 
					retries = 3;
				}
				retries --;	
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}, 
		$login: function(opts){
			var self = this; 
			var deferred  = $.Deferred(); 
			
			if(!METHODS.session) {
				setTimeout(function(){ deferred.reject(); }, 0);  
				return deferred.promise(); 
			}

			METHODS.session.login({
				"username": opts.username, 
				"password": opts.password
			}).done(function(result){
				RPC_SESSION_ID = result.ubus_rpc_session;
				scope.localStorage.setItem("sid", RPC_SESSION_ID); 
				self.$session = result; 
				//JUCI.localStorage.setItem("sid", self.sid); 
				//if(result && result.acls && result.acls.ubus) setupUbusRPC(result.acls.ubus); 
				deferred.resolve(self.sid); 
			}).fail(function(result){
				deferred.reject(result); 
			}); 
			return deferred.promise(); 
		},
		$logout: function(){
			var deferred = $.Deferred(); 
			var self = this; 

			if(!METHODS.session) {
				setTimeout(function(){ deferred.reject(); }, 0);  
				return deferred.promise(); ; 
			}

			METHODS.session.destroy().done(function(){
				RPC_SESSION_ID = RPC_DEFAULT_SESSION_ID; // reset sid to 000..
				scope.localStorage.setItem("sid", RPC_SESSION_ID); 
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		},
		$register: function(object, method){
			// console.log("registering: "+object+", method: "+method); 
			if(!object || !method) return; 
			var self = this; 
			function _find(path, method, obj){
				if(!obj.hasOwnProperty(path[0])){
					obj[path[0]] = {}; 
				}
				if(!path.length) {
					(function(object, method){
						// create the rpc method
						obj[method] = function(data){
							if(!data) data = { }; 
							return rpc_request("call", object, method, data); 
						}
					})(object, method); 
				} else {
					var child = path[0]; 
					path.shift(); 
					_find(path, method, obj[child]); 
				}
			}
			// support new slash paths /foo/bar..
			var npath = object; 
			if(object.startsWith("/")) npath = object.substring(1); 
			_find(npath.split(/[\.\/]/), method, METHODS); 
		}, 
		$list: function(){
			return rpc_request("list", "*", "", {}); 
		},
		$isConnected: function(){
			// we do a simple list request. If it fails then we assume we do not have a proper connection to the router
			var self = this; 
			var deferred = $.Deferred(); 
			rpc_request("list", "*", "", {}).done(function(result){
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}, 
		$has: function(obj, method){
			var path = obj.replace(/^\//, '').replace(/\//, '.').split(".");
			if(method) path.push(method);
			function _exist(arr, obj){
				if(!obj.hasOwnProperty(arr[0])) return false;
				var child = arr.shift();
				if(!arr.length) return true;
				return _exist(arr, obj[child]);
			}
			return _exist(path, METHODS);
		},
		$call: function(obj, method, args){
			var def = $.Deferred();
			var path = obj.replace(/^\//, '').replace(/\//, '.').split(".");
			path.push(method);
			function _exist(arr, obj){
				if(!obj.hasOwnProperty(arr[0])) return false;
				var child = arr.shift();
				if(!arr.length) return obj[child];
				return _exist(arr, obj[child]);
			}
			var f = _exist(path, METHODS);
			if(f && typeof f === "function") return f(args);
			setTimeout(function(){def.reject("method does not exist");},0);
			return def.promise();
		},
		$init: function(host){
			var self = this; 
			if(host) {
				if(host.host) RPC_HOST = host.host;
			} 
			if(DEBUG_MODE)console.log("Init UBUS ->");
			var deferred = $.Deferred(); 
			default_calls.map(function(x){ self.$register(x); }); 
			// request list of all methods and construct rpc object containing all of the methods in javascript.
			self.$init_websocket(window.location.origin).done(function(ws_result) {
				ws = ws_result;
				rpc_request("list", "*", "", {}).done(function(result){
					//alert(JSON.stringify(result));
					Object.keys(result).map(function(obj){
						Object.keys(result[obj]).map(function(method){
							self.$register(obj, method);
						});
					});
					deferred.resolve();
				}).fail(function(){
					console.log("ubus list failed");
					deferred.reject();
				});
			}).fail(function(emsg) {
				console.log("ws failed " + emsg);
				deferred.reject(emsg);
			});
			return deferred.promise();
		},
		$init_websocket: function(host){
			var self = this;
			var deferred = $.Deferred();
			if(DEBUG_MODE)console.log("Init WS -> "+host);
			host = host.replace(/^http/, 'ws');
			console.log("connecting to " + host);
			try {
				var ws = new WebSocket(host, "ubus-json");
			} catch (exc) {
				return deferred.reject("Exception " + exc.message);
			}

			ws.onopen = function(ev) {
				console.log("Connected " + ws.readyState);
				deferred.resolve(ws);
			};
			// response_should look like this
			// { jsonrpc: 2.0, id: 234, result: [retcode, {...data...}], }
			ws.onmessage = function(response_event) {
				var response_obj;
				var query_deferred;
				try {
					response_obj = JSON.parse(response_event.data);
					query_deferred = RPC_QUERY_IDS[response_obj.id];
					if (query_deferred === undefined) {
						throw { message: "no id" };
					}
				} catch (err) {
					console.log("Warning: invalid json response recved");
					return;
				}

				console.log(response_obj);

				delete RPC_QUERY_IDS[response_obj.id];

				if(response_obj.result instanceof Array && response_obj.result[0] != 0) {
					function _errstr(error){
						switch(error){
						case 0: return gettext("OK");
						case 1: return gettext("Invalid command");
						case 2: return gettext("Invalid parameters");
						case 3: return gettext("Method not found");
						case 4: return gettext("Object not found");
						case 5: return gettext("No data");
						case 6: return gettext("Access denied");
						case 7: return gettext("Timed out");
						case 8: return gettext("Not supported");
						case 9: return gettext("Unknown error");
						case 10: return gettext("Connection failed");
						default: return gettext("RPC error #")+response_obj.result[0]+": "+response_obj.result[1];
						}
					}
					if(DEBUG_MODE)console.log("RPC succeeded ("+object+"."+method+"), but returned error: "+JSON.stringify(response_obj)+": "+_errstr(response_obj.result[0]));
					query_deferred.deferred.reject(_errstr(response_obj.result[0]));
					return;
				}

				//console.log("SID: "+sid + " :: "+ JSON.stringify(response_obj));
				query_deferred.time = Date.now();
				// valid rpc response is either [code,{result}]
				// if code == 0 it means success. We already check for errors above)
				if(response_obj.result instanceof Array) {
					query_deferred.data = response_obj.result[1];
					query_deferred.deferred.resolve(response_obj.result[1]);
					return;
				}

				var msg = "Warning: non-array result in JSONRPC response";
				console.log(msg);
				query_deferred.deferred.reject(msg);
				return;
			};

			ws.onerror = function(result){
				if(DEBUG_MODE)console.error("RPC error ("+object+"."+method+"): "+JSON.stringify(result));
				if(result && result.error){
					RPC_CACHE[key].deferred.reject(result.error);
				}
			}
			ws.onclose = function(e) {
				console.log( "Close(" + e.reason + ")");
				// TODO reinit everything, reload, ...
			};

			return deferred.promise();
		}
	}
	
	scope.UBUS = scope.$rpc = rpc; 
	
})(typeof exports === 'undefined'? this : global); 

