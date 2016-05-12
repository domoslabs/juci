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

!function(){
	// add control dependency 
	JUCI.app.requires.push("dropdown-multi-select");

	JUCI.app.factory("$network", function($rpc, $uci, $ethernet, $tr, gettext){
		var sync_hosts = $uci.$sync("hosts"); 
		function _refreshClients(self){
			var deferred = $.Deferred(); 
			$rpc.$call("router", "clients").done(function(res){
				sync_hosts.done(function(){
					if(res){
						var clients = Object.keys(res).map(function(x){return res[x];}).map(function(cl){
							// update clients with some extra information from hosts database
							var key = cl.macaddr.replace(/:/g, "_"); 
							if($uci.hosts[key]) {
								var host = $uci.hosts[key]; 
								console.log("Found host for "+key); 
								cl.manufacturer = host.manufacturer.value; 
								if(host.name) cl.name = host.name.value; 
							}
							return cl; 
						}); 
						deferred.resolve(clients);
					} else {
						deferred.reject(); 
					}
				}); 
			}).fail(function(){ deferred.reject(); });
			return deferred.promise(); 
		}
		
		function NetworkBackend() {
			this.clients = []; 
			this._subsystems = []; 
			this._devices = null; 
		}
		
		NetworkBackend.prototype.subsystem = function(proc){
			if(!proc || !(proc instanceof Function)) throw new Error("Subsystem argument must be a function returning a subsystem object!"); 
			var subsys = proc(); 
			if(!subsys.annotateClients) throw new Error("Subsystem must implement annotateClients()"); 
			this._subsystems.push(subsys); 
		}
		
		NetworkBackend.prototype.getDevice = function(){
			alert("$network.getDevice has been removed. No alternative. "); 
		}; 
		
		NetworkBackend.prototype.getDevices = function(){
			alert("$network.getDevices has been removed. Use $ethernet.getDevices instead!"); 
		}
		NetworkBackend.prototype.getProtocolTypes = function(){
			return [
				{ label: $tr(gettext("Unmanaged")),								value: "none",		physical: true },
				{ label: $tr(gettext("Static Address")), 						value: "static",	physical: true }, 
				{ label: $tr(gettext("DHCP v4")), 								value: "dhcp",		physical: true }, 
				{ label: $tr(gettext("DHCP v6")), 								value: "dhcpv6",	physical: true }, 
				{ label: $tr(gettext("PPP")), 									value: "ppp",		physical: false }, 
				{ label: $tr(gettext("PPP over Ethernet")), 					value: "pppoe", 	physical: true }, 
				{ label: $tr(gettext("PPP over ATM")), 							value: "pppoa", 	physical: true }, 
				{ label: $tr(gettext("3G (ppp over GPRS/EvDO/CDMA or UTMS)")), 	value: "3g", 		physical: false }, 
				{ label: $tr(gettext("4G (LTE/HSPA+)")), 						value: "4g", 		physical: false }, 
				//{ label: $tr(gettext("QMI (USB modem)")), 						value: "qmi", 		physical: true }, 
				//{ label: $tr(gettext("NCM (USB modem)")), 						value: "ncm", 		physical: true }, 
				//{ label: $tr(gettext("HNET (self-managing home network)")), 	value: "hnet", 		physical: true }, 
				{ label: $tr(gettext("Point-to-Point Tunnel")), 				value: "pptp", 		physical: false }, 
				{ label: $tr(gettext("IPv6 tunnel in IPv4 (6in4)")), 			value: "6in4", 		physical: false }, 
				{ label: $tr(gettext("IPv6 tunnel in IPv4 (6to4)")), 			value: "6to4", 		physical: false }, 
				//{ label: $tr(gettext("Automatic IPv6 Connectivity Client")),	value: "aiccu", 	physical: false }, 
				{ label: $tr(gettext("IPv6 rapid deployment")), 				value: "6rd", 		physical: false }, 
				{ label: $tr(gettext("Dual-Stack Lite")), 						value: "dslite", 	physical: false }, 
				{ label: $tr(gettext("PPP over L2TP")), 						value: "l2tp", 		physical: false }//, 
				//{ label: $tr(gettext("Relayd Pseudo Bridge")),					value: "relay", 	physical: true }, 
				//{ label: $tr(gettext("GRE Tunnel over IPv4")), 					value: "gre", 		physical: true }, 
				//{ label: $tr(gettext("Ethernet GRE over IPv4")), 				value: "gretap", 	physical: true }, 
				//{ label: $tr(gettext("GRE Tunnel over IPv6")), 					value: "grev6", 	physical: true }, 
				//{ label: $tr(gettext("Ethernet GRE over IPv6")), 				value: "grev6tap", 	physical: true },
			]; 
		};
		
		// should be renamed to getInterfaces for NETWORK (!) interfaces. 
		NetworkBackend.prototype.getNetworks = function(opts){
			var deferred = $.Deferred(); 
			var networks = []; 
			if(!opts) opts = {}; 
			var filter = opts.filter || {};
			var info = {};
			async.series([
				function(next){
					$uci.$sync("network").done(function(){
						$uci.network["@interface"].map(function(i){
							i.ifname.value = i.ifname.value.split(" ").filter(function(name){
								return name && name != ""; 
							}).join(" "); 
							if(i[".name"] == "loopback") return; 
							if(filter.no_aliases && i[".name"].indexOf("@") == 0 || i.type.value == "alias") return; 
							networks.push(i); 
						}); 
					}).always(function(){
						next(); 
					}); 
				}, function(next){
					$rpc.$call("network.interface", "dump").done(function(result){
						if(result && result.interface) {
							info = result.interface;
						}
					}).always(function(){
						next();
					}); 
				}
			], function(){
				networks = networks.map(function(x){
					// set $info to the information gathered from network.interface.dump() or undefined
					if(info && info.find)
						x.$info = info.find(function(y){ return x[".name"] == y.interface; });
					return x;
				});
				deferred.resolve(networks); 
			}); 
			
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getConnectedClients = function(){
			var deferred = $.Deferred(); 
			var self = this; 
			
			_refreshClients(self).done(function(clients){
				async.each(self._subsystems, function(sys, next){
					if(sys.annotateClients) {
						sys.annotateClients(clients).always(function(){ next(); }); 
					} else {
						next(); 
					}
				}, function(){
					clients.map(function(cl){
						if(!cl._display_widget) cl._display_widget = "network-client-lan-display-widget"; 
					}); 
					deferred.resolve(clients); 
				});
			}).fail(function(){
				deferred.reject(); 
			});  
			
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getNameServers = function(){
			var deferred = $.Deferred(); 
			$rpc.$call("juci.network", "run", {"method":"nameservers"}).done(function(result){
				if(result && result.nameservers) deferred.resolve(result.nameservers); 
				else deferred.reject(); 
			}); 
			
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getNetworkLoad = function(){
			var def = $.Deferred(); 
			
			$rpc.$call("juci.network", "run", {"method":"load"}).done(function(res){
				def.resolve(res); 
			});
			
			return def.promise(); 
		}
		
		NetworkBackend.prototype.getNatTable = function(){
			var def = $.Deferred(); 
			
			$rpc.$call("juci.network", "run", {"method":"nat_table"}).done(function(result){
				if(result && result.table){
					def.resolve(result.table); 
				} else {
					def.reject(); 
				}
			}); 
			return def.promise(); 
		}
		
		NetworkBackend.prototype.getLanNetworks = function(){
			var deferred = $.Deferred(); 
			this.getNetworks().done(function(nets){
				deferred.resolve(nets.filter(function(x){ return x.is_lan.value == 1; })); 
			}); 
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getWanNetworks = function(){
			var deferred = $.Deferred(); 
			console.log("$network.getWanNetworks() is deprecated. You should list firewall zone wan to get whole list"); 
			this.getNetworks().done(function(nets){
				deferred.resolve(nets.filter(function(x){ return !x.is_lan.value; })); 
			}); 
			return deferred.promise(); 
		}
		
		// returns list of config sections belong to devices that are configured as default routes along with their runtime info in $info field
		NetworkBackend.prototype.getDefaultRouteNetworks = function(){
			var def = $.Deferred(); 
	
			$uci.$sync("network").done(function(){
				$rpc.$call("network.interface", "dump").done(function(result){
					if(result && result.interface) {
						var wanifs = []; 
						result.interface.map(function(i){
							if(i.route && i.route.length && i.route.find(function(r){ return r.target == "0.0.0.0" || r.target == "::"; })){
								// lookup the config section for this device 
								var conf = $uci.network["@interface"].find(function(x){ return x[".name"] == i.interface; }); 
								if(conf) {	
									conf.$info = i; 
									wanifs.push(conf); 
								}
							}
						}); 
						def.resolve(wanifs); 
					} else {
						def.reject(); 
					}
				}).fail(function(){
					def.reject(); 
				}); 
			}).fail(function(){
				def.reject(); 
			}); 

			return def.promise(); 
		}	

		NetworkBackend.prototype.getServices = function(){
			var def = $.Deferred(); 
			$rpc.$call("juci.network", "run", {"method":"services"}).done(function(result){
				if(result && result.list) def.resolve(result.list); 
				else def.reject(); 
			}); 
			return def.promise(); 
		}
		
		return new NetworkBackend(); 
	}); 

}(); 

JUCI.app.factory("$networkHelper", function($uci, $tr, gettext, $network){
	return {
		setNetwork: function(dev, network){
			var deferred = $.Deferred();
			if(!dev || !network) return deferred.reject($tr(gettext("no device or network given")));
			$uci.$sync("wireless").done(function(){
				var wliface = $uci.wireless["@wifi-iface"].find(function(iface){
					return iface.ifname.value == dev;
				});
				if(wliface && wliface.network){
					wliface.network.value = network;
				}
				deferred.resolve();
			}).fail(function(){deferred.reject("failed");});
			return deferred;
		},
		addDevice: function(interface, device){
			var deferred = $.Deferred();
			if(!device || typeof device != "string") return deferred.reject("No Device given");
			if(!interface || !interface.type) return deferred.reject("Invalid interface");
			var type = "unknown";
			if(interface.type.value == "bridge") type = "Bridge";
			if(interface.type.value == "") type = "Standalone Connection";
			if(interface.type.value == "anywan") type = "Any-wan";
			if(device.match(/^wl.+/) || interface.type.value == "bridge"){
				$network.getNetworks().done(function(nets){ 
					var filtered = nets.filter(function(net){ return net[".name"] != interface[".name"];});
					var keep_device = false;
					if(!device.match(/^wl.+/)) filtered = filtered.filter(function(net){ return net.type.value == "bridge" });
					filtered.map(function(net){
						net.ifname.value = net.ifname.value.split(" ").filter(function(dev){
							if(dev == device && !confirm($tr(gettext("Are you sure you want to remove device "+dev+" from network "+net[".name"]+" and use it in this "+type)))){
								keep_device = true;
								return true;
							}else if(dev == device) return false;
							return true;
						}).join(" ");
					});
					if(!keep_device){
						if(interface.type.value == ""){
							interface.ifname.value = device;
						}else{
							interface.ifname.value += " " + device;
						}
						if(device.match(/^wl.+/)){
							$uci.$sync("wireless").done(function(){
								var wliface = $uci.wireless["@wifi-iface"].find(function(iface){
									return iface.ifname.value == device;
								});
								if(wliface && wliface.network){
									wliface.network.value = interface[".name"];
								}
								deferred.resolve();
							});
						}else{
							deferred.resolve();
						}
					}else{
						deferred.reject();
					}
				});
			}else{
				if(interface.type.value == ""){
					interface.ifname.value = device;
				}else{
					interface.ifname.value += " " + device;
				}
				deferred.resolve();
			}
			return deferred;
		}
	}
});
	
