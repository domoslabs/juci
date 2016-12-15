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

JUCI.app.factory("$ethernet", function($rpc){
	function Ethernet() {
		this._adapters = [];
		this._subsystems = [];
	}

	Ethernet.prototype.addSubsystem = function(subsys){
		if(subsys)
			this._subsystems.push(subsys);
	}
	
	Ethernet.prototype.getAdapters = function(){
		var def = $.Deferred();
		var self = this;
		$rpc.$call("network.device", "status").done(function(result){
			$rpc.$call("router.port", "status").done(function(ports){
				var res = Object.keys(result).map(function(name){
					var port = Object.keys(ports).find(function(p){
						return p == name;
					});
					if(port){
						Object.keys(ports[port]).map(function(k){
							result[name][k] = ports[port][k];
						});
					}else if(result[name].type !== "Bridge")
						return null;
					result[name].device = name;
					return result[name];
				}).filter(function(x){return x !== null;});
				if(res) {
					// pipe all adapters though all subsystems and annotate them
					async.each(self._subsystems, function(sys, next){
						if(sys.annotateAdapters && sys.annotateAdapters instanceof Function){
							sys.annotateAdapters(res).always(function(){
								next();
							});
						} else {
							next();
						}
					}, function(){
						res = res.filter(function(x){ return x.device && x.device !== "lo"; });
						def.resolve(res);
					});
				} else def.reject();
			}).fail(function(e){console.log("error calling router.port status" + JSON.stringify(e));def.reject();});
		}).fail(function(){ def.reject(); }); 	
		return def.promise();
	}

	return new Ethernet();
});
