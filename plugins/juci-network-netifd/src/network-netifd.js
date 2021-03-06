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

	JUCI.app.factory("$network", function($rpc, $uci, $tr, gettext){

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

		NetworkBackend.prototype.getProtocolTypes = function(){
			return [
				{ label: $tr(gettext("Unmanaged")),								value: "none",		physical: ["bridge"] },
				{ label: $tr(gettext("Static Address")), 						value: "static",	physical: ["", "bridge", "anywan"] },
				{ label: $tr(gettext("DHCP v4")), 								value: "dhcp",		physical: ["", "bridge", "anywan"] },
				{ label: $tr(gettext("DHCP v6")), 								value: "dhcpv6",	physical: ["", "bridge", "anywan"] },
				{ label: $tr(gettext("PPP")), 									value: "ppp",		physical: [] },
				{ label: $tr(gettext("PPP over Ethernet")), 					value: "pppoe", 	physical: [""] },
				{ label: $tr(gettext("PPP over ATM")), 							value: "pppoa", 	physical: [""] },
				{ label: $tr(gettext("3G (ppp over GPRS/EvDO/CDMA or UTMS)")), 	value: "3g", 		physical: [] },
				{ label: $tr(gettext("4G (LTE/HSPA+)")), 						value: "4g", 		physical: [] },
				{ label: $tr(gettext("WWAN (LTE/HSPA+)")), 						value: "wwan", 		physical: [] },
				//{ label: $tr(gettext("QMI (USB modem)")), 						value: "qmi", 		physical: [""] },
				//{ label: $tr(gettext("NCM (USB modem)")), 						value: "ncm", 		physical: [""] },
				//{ label: $tr(gettext("HNET (self-managing home network)")), 	value: "hnet", 		physical: [""] },
				{ label: $tr(gettext("Point-to-Point Tunnel")), 				value: "pptp", 		physical: [] },
				{ label: $tr(gettext("IPv6 tunnel in IPv4 (6in4)")), 			value: "6in4", 		physical: [] },
				{ label: $tr(gettext("IPv6 tunnel in IPv4 (6to4)")), 			value: "6to4", 		physical: [] },
				//{ label: $tr(gettext("Automatic IPv6 Connectivity Client")),	value: "aiccu", 	physical: [] },
				{ label: $tr(gettext("IPv6 rapid deployment")), 				value: "6rd", 		physical: [] },
				{ label: $tr(gettext("Dual-Stack Lite")), 						value: "dslite", 	physical: [] },
				{ label: $tr(gettext("PPP over L2TP")), 						value: "l2tp", 		physical: [] }//,
				//{ label: $tr(gettext("Relayd Pseudo Bridge")),					value: "relay", 	physical: [?] },
				//{ label: $tr(gettext("GRE Tunnel over IPv4")), 					value: "gre", 		physical: [?] },
				//{ label: $tr(gettext("Ethernet GRE over IPv4")), 				value: "gretap", 	physical: [?] },
				//{ label: $tr(gettext("GRE Tunnel over IPv6")), 					value: "grev6", 	physical: [?] },
				//{ label: $tr(gettext("Ethernet GRE over IPv6")), 				value: "grev6tap", 	physical: [?] },
			];
		};

		// should be renamed to getInterfaces for NETWORK (!) interfaces.
		NetworkBackend.prototype.getNetworks = function(opts){
			var self = this;
			// if it is already running just return the active promise
			if(self.$net_def && self.$net_def.promise instanceof Function)
				return self.$net_def.promise();
			self.$net_def = $.Deferred();
			var networks = [];
			if(!opts) opts = {};
			var filter = opts.filter || {};
			var info = {};
			async.series([
				function(next){
					$uci.$sync("network").done(function(){
						networks = $uci.network["@interface"].map(function(i){
							i.ifname.value = i.ifname.value.split(" ").filter(function(name){
								return name && name !== "";
							}).join(" ");
							if(i[".name"] == "loopback") return;
							if(filter.no_aliases && i[".name"].indexOf("@") == 0 || i.type.value == "alias") return;
							return i;
						}).filter(function(net){ return net; });
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
				networks.map(function(x){
					// set $info to the information gathered from network.interface.dump() or undefined
					if(info && info.find)
						x.$info = info.find(function(y){ return x[".name"] == y.interface; });
				});
				self.$net_def.resolve(networks);
				delete self.$net_def;
			});

			if(self.$net_def && self.$net_def.promise instanceof Function)
				return self.$net_def.promise();
			return $.Deferred().reject();
		}

		NetworkBackend.prototype.getConnectedClients = function(){
			var self = this;
			// if it is already running just return the active promise
			if (self.$cclients_def && self.$cclients_def.promise instanceof Function)
				return self.$cclients_def.promise();
			self.$cclients_def = $.Deferred();

			$rpc.$call("router.network", "clients").done(function(cls){
				var clients = Object.keys(cls).map(function(key){ return cls[key]; });
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
					self.$cclients_def.resolve(clients);
					delete self.$cclients_def;
				});
			}).fail(function(er){
				self.$cclients_def.reject("error calling router.network clients: " + JSON.stringify(er));
				delete self.$cclients_def;
			});

			if (self.$cclients_def && self.$cclients_def.promise instanceof Function)
				return self.$cclients_def.promise();
			return $.Deferred().reject();
		}

		NetworkBackend.prototype.getNameServers = function(){
			var self = this;
			if (self.$ns_def && self.$ns_def.promise instanceof Function)
				return self.$ns_def.promise();
			self.$ns_def = $.Deferred();
			$rpc.$call("juci.network", "nameservers", {}).done(function(result){
				if(result && result.nameservers)
					self.$ns_def.resolve(result.nameservers);
				else
					self.$ns_def.reject();
				delete self.$ns_def;
			});

			if (self.$ns_def && self.$ns_def.promise instanceof Function)
				return self.$ns_def.promise();
			return $.Deferred().reject();
		}

		NetworkBackend.prototype.getNetworkLoad = function(){
			var def = $.Deferred();

			$rpc.$call("juci.network", "load", {}).done(function(res){
				def.resolve(res);
			});

			return def.promise();
		}

		NetworkBackend.prototype.getNatTable = function(){
			var def = $.Deferred();

			$rpc.$call("router.net", "ip_conntrack", {}).done(function(result){
				if(result && result.table){
					def.resolve(result.table);
				} else {
					def.reject();
				}
			});
			return def.promise();
		}

		// returns list of config sections belong to devices that are configured as default routes along with their runtime info in $info field
		NetworkBackend.prototype.getDefaultRouteNetworks = function(){
			var self = this;
			if (self.$drn_def && self.$drn_def.promise instanceof Function)
				return self.$drn_def.promise();
			self.$drn_def = $.Deferred();

			$uci.$sync("network").done(function(){
				$rpc.$call("network.interface", "dump").done(function(result){
					if(result && result.interface) {
						var wanifs = [];
						result.interface.filter(function(iface){
							return $uci.network[iface.interface];
						}).map(function(i){
							if(i.route && i.route.length && i.route.find(function(r){ return r.target == "0.0.0.0" || r.target == "::"; })){
								// lookup the config section for this device
								var conf = $uci.network["@interface"].find(function(x){ return x[".name"] == i.interface; });
								if(conf) {
									conf.$info = i;
									wanifs.push(conf);
								}
							}
						});
						self.$drn_def.resolve(wanifs);
						delete self.$drn_def;
					} else {
						self.$drn_def.reject("incorrect return structure for ubus call network.interface dump");
						delete self.$drn_def;
					}
				}).fail(function(e){
					self.$drn_def.reject("error: ubus call network.interface dump failed: " + JSON.stringify(e));
					delete self.$drn_def;
				});
			}).fail(function(e){
				self.$drn_def.reject("error: couldnt sync network config file: " + JSON.stringify(e));
				delete self.$drn_def;
			});

			if (self.$drn_def && self.$drn_def.promise instanceof Function)
				return self.$drn_def.promise();
			return $.Deferred().reject();
		}

		NetworkBackend.prototype.getServices = function(){
			var def = $.Deferred();
			$rpc.$call("juci.network", "services", {}).done(function(result){
				if(result && result.list) def.resolve(result.list);
				else def.reject();
			});
			return def.promise();
		}

		NetworkBackend.prototype.addSubsystem = function(subsys){
			if(subsys)
				this._subsystems.push(subsys);
		}

		NetworkBackend.prototype.getAdapters = function(){
			var self = this;
			if (self.$adapter_def && self.$adapter_def.promise instanceof Function)
				return self.$adapter_def.promise();
			self.$adapter_def =  $.Deferred();
			$rpc.$call("network.device", "status").done(function(result){
				$rpc.$call("router.port", "status").done(function(ports){
					var res = Object.keys(result).map(function(name){
						if(name === "lo")
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
							self.$adapter_def.resolve(res);
							delete self.$adapter_def
						});
					} else {
						self.$adapter_def.reject();
						delete self.$adapter_def;
					}
				}).fail(function(e){
					self.$adapter_def.reject("error calling router.port status " + JSON.stringify(e));
					delete self.$adapter_def;
				});
			}).fail(function(e){
				self.$adapter_def.reject("error calling network.device status " + JSON.stringify(e));
				delete self.$adapter_def;
			});
			if (self.$adapter_def && self.$adapter_def.promise instanceof Function)
				return self.$adapter_def.promise();
			return $.Deferred().reject();
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
		/* wireless (boolean) argument as a workaround for intel, letting hostapd create bridges */
		addDevice: function(interface, device, wireless){
			var deferred = $.Deferred();
			if(!device || typeof device != "string") return deferred.reject("No Device given");
			if(!interface || !interface.type) return deferred.reject("Invalid interface");
			var type = "unknown";
			if(interface.type.value == "bridge") type = "Bridge";
			if(interface.type.value == "") type = "Standalone Connection";
			if(interface.type.value == "anywan") type = "Any-wan";
			if(device.match(/^wl.+/) || device.match(/^ra.+/) || interface.type.value == "bridge"){
				$network.getNetworks().done(function(nets){
					var filtered = nets.filter(function(net){ return net[".name"] != interface[".name"];});
					var keep_device = false;
					if(!device.match(/^wl.+/) && !device.match(/^ra.+/)) filtered = filtered.filter(function(net){ return net.type.value == "bridge" });
					if (!wireless) {
						filtered.map(function(net){
							net.ifname.value = net.ifname.value.split(" ").filter(function(dev){
								var text = $tr(gettext("Are you sure you want to remove device")) + " " +
											dev + " " + $tr(gettext("from network")) + " " + net[".name"] +
											" " + $tr(gettext("and use it in this")) + " " + type;

								if(dev == device && !confirm(text)){
									keep_device = true;
									return true;
								}else if(dev == device) return false;
								return true;
							}).join(" ");
						});
					}
					if(!keep_device){
						if (!wireless) {
							if(interface.type.value == ""){
								interface.ifname.value = device;
							}else{
								interface.ifname.value += " " + device;
							}
						}
						if(device.match(/^wl.+/) || device.match(/^ra.+/)){
							$uci.$sync("wireless").done(function(){
								var wliface = $uci.wireless["@wifi-iface"].find(function(iface){
									return iface.ifname.value == device;
								});
								if(wliface && wliface.network){
									if (wireless && wliface.network.value !== "none") {
										var text = $tr(gettext("Are you sure you want to remove device")) + " " +
										device + " " + $tr(gettext("from network")) + " " + wliface.network.value +
										" " + $tr(gettext("and use it in this")) + " " + type;
										if(wliface.network.value !== interface[".name"] && !confirm(text))
											keep_device = true;
									}
									if (!keep_device)
										wliface.network.value = interface[".name"];
								}
								keep_device ? deferred.reject() : deferred.resolve();
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

