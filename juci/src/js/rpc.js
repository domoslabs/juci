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
	var RPC_USER = scope.localStorage.getItem("user") || "";
	var RPC_DEFAULT_SESSION_ID = "00000000000000000000000000000000";
	var RPC_SESSION_ID = scope.localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID;
	var RPC_CACHE = {};
	var METHODS = {};
	var EVENT_HANDLER;
	var RPC_QUERY_IDS = {};
	var rpc_query_id = 1;
	var ws;
	
	var gettext = function(text){ return text; };
	
	var default_calls = [
		"session.list",
		"session.login"
	];
	
	// type = "sonrpc mehod parameter (i.e. call, list, ...
	// object = ubus object
	// method = ubus method
	// data = ubus parameters
	//
	// {jsonrpc..., method: type, [ RPC_SESSION_D , namespace, method, { ... data ...  } }
	function rejectCalls(){
		Object.keys(RPC_QUERY_IDS).map(function(key){
			if(RPC_QUERY_IDS[key] && RPC_QUERY_IDS[key].deferred && RPC_QUERY_IDS[key].deferred.state() === "pending"){
				RPC_QUERY_IDS[key].deferred.reject();
			}
		});
		RPC_CACHE = {};
		RPC_QUERY_IDS = {};
	}
	function rpc_request(type, object, method, data){
		if(DEBUG_MODE > 1)console.log("UBUS " + type + " " + object + " " + method);
		if(ws === null) return $.Deferred().reject();

		// remove completed requests from cache
		var retain = {};
		Object.keys(RPC_CACHE).map(function(k){
			if(RPC_CACHE[k].deferred && RPC_CACHE[k].deferred.state() === "pending"){
				retain[k] = RPC_CACHE[k];
			}
		});
		RPC_CACHE = retain;

		// check if the request has been made only recently with same parameters
		var key = type+" "+object+" "+method+" "+JSON.stringify(data);
		if(!RPC_CACHE[key]){
			RPC_CACHE[key] = {};
		}
		// if this request with same parameters is already in progress then just return the existing promise
		if(RPC_CACHE[key].deferred && RPC_CACHE[key].deferred.state() === "pending"){
			return RPC_CACHE[key].deferred.promise();
		} else {
			RPC_CACHE[key].deferred = $.Deferred();
		}

		var jsonrpc_obj = {
			jsonrpc: "2.0",
			method: type,
			params: [
				RPC_SESSION_ID,
				object,
				method,
				data
			].filter(function(param){ return param !== undefined; }),
			id: rpc_query_id++
		};

		RPC_QUERY_IDS[jsonrpc_obj.id] = RPC_CACHE[key];

		function num2str(key,val){
			if(typeof val === "number"){ return val.toString(); }
			//if(val instanceof Array){ return val.map(num2str); } // if val is array with numbers
			return val;
		}
		function formatter(key,val){
			if(object === "uci"){ return num2str(key,val); }
			return val;
		}

		if(ws && ws.readyState === 1){
			ws.send(JSON.stringify(jsonrpc_obj,formatter));
			return RPC_CACHE[key].deferred.promise();
		}else{
			return RPC_QUERY_IDS[jsonrpc_obj.id].deferred.reject();
		}
	}
	
	var rpc = {
		$sid: function(sid){
			if(sid) {
				RPC_SESSION_ID = sid;
				scope.localStorage.setItem("sid", sid);
			}
			else return RPC_SESSION_ID;
		},
		$user: function(){
			return RPC_USER;
		},
		$isLoggedIn: function(){
			return RPC_SESSION_ID !== RPC_DEFAULT_SESSION_ID;
		},
		$authenticate: function(){
			var self = this;
			var deferred  = $.Deferred();
			
			if(!METHODS.session){
				self.$clearSession().always(function(){
					deferred.reject("ubus session object is missing");
				});
				return deferred.promise();
			}

			METHODS.session.list().done(function(result){
        		if(!("username" in (result.data||{}))) {
					self.$clearSession().always(function(){
						deferred.reject("no active sessions");
					});
				} else {
					self.$session = result;
					if(!("data" in self.$session)) self.$session.data = {};
					deferred.resolve(result);
				}
			}).fail(function err(result){
				deferred.reject(result || "no result");
			});
			return deferred.promise();
		},
		$login: function(opts){
			var self = this;
			var deferred = $.Deferred();
			self.$clearSession().done(function(){

				if(!METHODS.session) {
					setTimeout(function(){ deferred.reject(); }, 0);
					return deferred.promise();
				}

				METHODS.session.login({
					"username": opts.username,
					"password": opts.password
				}).done(function(result){
					RPC_USER = opts.username;
					RPC_SESSION_ID = result.ubus_rpc_session;
					scope.localStorage.setItem("sid", RPC_SESSION_ID);
					scope.localStorage.setItem("user", RPC_USER);
					self.$session = result;
					deferred.resolve(self.sid);
				}).fail(function(result){
					deferred.reject(result);
				});
			}).fail(function(msg){
				deferred.reject(msg);
			});
			return deferred.promise();
		},
		$clearSession: function(){
			if(DEBUG_MODE) console.log("clearing session");
			var deferred = $.Deferred();
			var self = this;
			if(!self.$isLoggedIn())
				return deferred.resolve();
			rejectCalls();
			RPC_USER = "";
			RPC_SESSION_ID = RPC_DEFAULT_SESSION_ID;
			scope.localStorage.setItem("user", RPC_USER);
			scope.localStorage.setItem("sid", RPC_SESSION_ID);

			ws.close();

			self.$init_websocket().done(function(ws_result) {
				ws = ws_result;
				deferred.resolve();
			}).fail(function(emsg) {
				ws = null;
				if(DEBUG_MODE)console.log("ws failed " + emsg);
				deferred.reject(emsg);
			});
			return deferred.promise();
		},
		$logout: function(){
			var deferred = $.Deferred();
			var self = this;

			METHODS.session.destroy().done(function(){
				self.$clearSession().done(function(){
					deferred.resolve();
				}).fail(function(msg){
					deferred.reject(msg);
				});
			}).fail(function(){
				deferred.reject();
			});
			return deferred.promise();
		},
		$registerEventHandler: function(func){
			EVENT_HANDLER = func;
		},
		$register: function(object, method){
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
		$registerEvent: function(evtype){
			// {"jsonrpc":"2.0","id":234, "method":"subscribe", "params": [ "SESSION_ID", "foo.*"]}
			return rpc_request("subscribe", evtype);
		},
		$unregisterEvent: function(evtype){
			// {"jsonrpc":"2.0","id":234, "method":"unsubscribe", "params": [ "SESSION_ID", "foo.*"]}
			return rpc_request("unsubscribe", evtype);
		},
		$list: function(){
			// {"jsonrpc":"2.0","id":234, "method":"list", "params": [ <ignored>, "pattern*" ]} -> ubus list pattern*
			// {"jsonrpc":"2.0","id":234, "method":"list", "params": [ <ignored> ]} -> ubus list
			return rpc_request("list", "*");
		},
		$isConnected: function(){
			if(DEBUG_MODE) console.log("isConnected called");
			// we do a simple list request. If it fails then we assume we do not have a proper connection to the router
			var self = this;
			var deferred = $.Deferred();
			self.$list().done(function(result){
				deferred.resolve();
			}).fail(function(){
				deferred.reject();
			});
			return deferred.promise();
		},
		$reconnect: function(){
			var self = this;
			var def = $.Deferred();
			if(ws && ws.readyState === 1) return def.reject();
			self.$init_websocket().done(function(res){
				ws = res;
				def.resolve();
			}).fail(function(res){
				ws = null;
				def.reject();
			});
			return def.promise();
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
			if(DEBUG_MODE)console.log("Init UBUS ->");
			var deferred = $.Deferred();
			default_calls.map(function(x){ self.$register(x); });
			// request list of all methods and construct rpc object containing all of the methods in javascript.
			if (!window.location.origin) {
				window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
			}
			self.$init_websocket().done(function(ws_result) {
				ws = ws_result;
				self.$list().done(function(result){
					//alert(JSON.stringify(result));
					Object.keys(result).map(function(obj){
						Object.keys(result[obj]).map(function(method){
							self.$register(obj, method);
						});
					});
					deferred.resolve();
				}).fail(function(e){
					deferred.reject(e);
				});
			}).fail(function(emsg) {
				if(DEBUG_MODE)console.log("ws failed " + emsg);
				deferred.reject(emsg);
			});
			return deferred.promise();
		},
		$init_websocket: function(){
			var host = window.location.origin;
			var self = this;
			var deferred = $.Deferred();
			if(DEBUG_MODE)console.log("Init WS -> "+host);
			if(String(host).match("localhost"))
				host = "ws://192.168.1.1";
			else
				host = String(host).replace(/^http/, 'ws');
			if(DEBUG_MODE)console.log("connecting to " + host);
			try {
				var ws = new WebSocket(host, "ubus-json");
			} catch (exc) {
				return deferred.reject("Exception " + exc.message);
			}

			ws.onopen = function(ev) {
				if(DEBUG_MODE)console.log("Connected " + ws.readyState);
				deferred.resolve(ws);
			};
			// response_should look like this:
			// a) if it's response to a call
			//   { jsonrpc: 2.0, id: 234, result: [retcode, {...data...}], }
			// b) if it's an event
			//   { jsonrpc: 2.0, method:"event",
			//     params {
			//       "type": "network.client",
			//       "data": {...data...},
			//       "subscription":{"pattern":"network.*","id":...sub_id... (deprecated)
			//     }
			//   }
			ws.onmessage = function(response_event) {
				var response_obj;
				try {
					response_obj = JSON.parse(response_event.data);
				} catch (err) {
					console.log("Warning: invalid json response recved: " + response_event.data);
					return;
				}

				if (response_obj.id && !response_obj.method) {
					var query_deferred = RPC_QUERY_IDS[response_obj.id];
					if (query_deferred === undefined) {
						console.log("Warning: result for unknown call");
						console.log(response_obj);
						return;
					}
					delete RPC_QUERY_IDS[response_obj.id];

					if (response_obj.error) {
						query_deferred.deferred.reject(response_event.data);
						return;
					}

					handle_call_result(response_obj.result, query_deferred);
					return;
				} else if (response_obj.method) {
					if (response_obj.method !== "event") {
						console.log("Warning: received json method which is not 'event'");
						console.log(response_obj);
						return;
					}
					if(EVENT_HANDLER && typeof EVENT_HANDLER === "function"){
						EVENT_HANDLER(response_obj.params);
					}
					return;
				}

				function handle_call_result(call_result, query_deferred) {

					if(call_result instanceof Array && call_result[0] != 0) {
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
							default: return gettext("RPC error #")+call_result[0]+": "+call_result[1];
							}
						}
						if(DEBUG_MODE)console.log("RPC succeeded "+ JSON.stringify(call_result) +", but returned error: "+_errstr(call_result[0]));
						query_deferred.deferred.reject({"reason":_errstr(call_result[0]), "data":(call_result.length > 1) ? call_result[1]:{}});
						return;
					}

					query_deferred.time = Date.now();
					// valid rpc response is either [code,{result}]
					// if code == 0 it means success. We already check for errors above)
					if(call_result instanceof Array) {
						query_deferred.data = call_result[1];
						query_deferred.deferred.resolve(call_result[1]);
						return;
					}

					var msg = "Warning: non-array result in JSONRPC response";
					query_deferred.deferred.reject(msg);
					return;
				}
			};

			ws.onerror = function(result){
				console.log("error result: " + JSON.stringify(result));
				if(DEBUG_MODE)console.error("RPC error "+JSON.stringif(result));
				if(deferred.state() === "pending"){
					deferred.reject();
				}
			}
			ws.onclose = function(Event) {
				ws = null;
				rejectCalls();
			};

			return deferred.promise();
		}
	}
	
	scope.UBUS = scope.$rpc = rpc;
	
})(typeof exports === 'undefined'? this : global);

