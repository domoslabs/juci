/*global gettext:false*/
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

JUCI.app
.factory("$firewall", function($uci, $network, gettext){
	var firewall = 0; 
	function sync(){
		var deferred = $.Deferred(); 
		if(firewall) setTimeout(function(){ deferred.resolve(); }, 0); 
		else {
			$uci.$sync("firewall").done(function(){
				firewall = $uci.firewall; 
				deferred.resolve(); 
			}); 
		}
		return deferred.promise(); 
	}
	return {
		getZones: function(){
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"]); 
			}); 
			return deferred.promise(); 
		}, 
		getRules: function(opts){
			var deferred = $.Deferred(); 
			if(!opts) opts = {}; 
			sync().done(function(){
				var rules;
				if(opts.from_zone){
					rules = $uci.firewall["@rule"].filter(function(rule){
						return rule.src == opts.from_zone; 
					});
					deferred.resolve(rules); 
				} if(opts.to_zone){
					rules = $uci.firewall["@rule"].filter(function(rule){
						return rule.dest == opts.to_zone; 
					});
					deferred.resolve(rules); 
				} else { 
					deferred.resolve($uci.firewall["@rule"]); 
				}
			}); 
			return deferred.promise(); 
		},

		//! Returns uci network objects that are members of a zone. 
		//! opts argument is passed to the getNetworks method of $network so it can be used to specify additional filtering. 
		getZoneNetworks: function(zone, opts){
			if(!opts) opts = {}; 
			var def = $.Deferred();  
			sync().done(function(){
				$network.getNetworks({ filter: opts.filter }).done(function(nets){
					var selected_zone;
					if(zone == "lan"){
						selected_zone = $uci.firewall["@zone"].filter(function(x){ return x.masq.value == false; });
					}else if(zone == "wan"){
						selected_zone = $uci.firewall["@zone"].filter(function(x){ return x.masq.value == true; });
					}else{
						selected_zone = [$uci.firewall["@zone"].find(function(x){ return x.name.value == zone; }) ];
					}
					if(selected_zone.length < 1) {
						def.reject({error: "Zone does not exist!"}); 
						return; 
					}
					var zone_nets = nets.filter(function(x){
						return selected_zone.find(function(zone){
							return zone.network.value.indexOf(x[".name"]) != -1;
						});
					}); 
					def.resolve(zone_nets); 
				}); 
			}); 
			return def.promise(); 
		}, 
		getZoneClients: function(zone){
			var def = $.Deferred();
			var networks = [];
			var selected_zone = null;
			var clients = [];
			async.series([
				function(next){
					sync().always(function(){
						if(zone == "lan"){
							selected_zone = $uci.firewall["@zone"].filter(function(x){ return x.masq.value == false;});
						}else if(zone == "wan"){
							selected_zone = $uci.firewall["@zone"].filter(function(x){ return x.masq.value == true;});
						}else{
							selected_zone = [$uci.firewall["@zone"].filter(function(x){ return x.name.value == zone;})];
						}
						if(selected_zone.length < 1) {
							def.reject({error: gettext("Zone does not exist!")}); 
							return; 
						}
						next();
					});
				},
				function(next){
					$network.getNetworks().done(function(nets){
						networks = nets;
					}).always(function(){ next();});
				},
				function(next){
					$network.getConnectedClients().done(function(con_clients){
						clients = con_clients;
					}).always(function(){next();});
				}
			], function(){
				//filter out networks by the selected zone
				var zone_networks = networks.filter(function(net){
					return selected_zone.find(function(zone){
						return zone.network.value.find(function(zone_net){ return zone_net == net[".name"]; }) !== undefined;
					}) !== undefined;
				});
				if(zone_networks.length == 0){
					def.reject({ error: "Found no networks in zone" });
					return;
				}
				// TODO: this may already be fixed but sometimes clients is not an array and this causes a crash. If error is never printed then it is probably safe now. 
				if(!clients.filter){
					console.error("Clients is not an array. Please fix your code!"); 
					def.resolve([]); 
					return; 
				}
				var zone_clients = clients.filter(function(client){
					return zone_networks.find(function(net){
						return net.$info.device == client.device;
					});
				});
				def.resolve(zone_clients || []);
			});
			return def.promise();
		},
		// we determine what networks are wan/lan/guest based on zones. This is currently hardcoded,
		// but probably should not be in the future. This will break if the user has different zone names!
		getLanZones: function(){ 
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"].filter(function(x){ return x.masq.value == false; })); 
			}); 
			return deferred.promise(); 
		},
		
		getGuestZone: function(){ 
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"].find(function(x){ return x.name.value == "guest"; })); 
			}); 
			return deferred.promise(); 
		},
		
		getWanZones: function(){ 
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"].filter(function(x){ return x.masq.value == true; })); 
			}); 
			return deferred.promise(); 
		}, 
	
		// TODO: this is meaningless stuff that was added earlier. Remove or replace with something that actually works. 
		nat: {
			enable: function(value){
				$uci.$sync("firewall").done(function(){
					$uci.firewall.settings.nat_enabled.value = value; 
					$uci.firewall["@redirect"].map(function(rule){
						rule.enabled.value = value; 
					}); 
				}); 
			}, 
			isEnabled: function(){
				var def = $.Deferred(); 
				$uci.$sync("firewall").done(function(){
					var enabled = $uci.firewall["@redirect"].find(function(rule){
						return rule.enabled.value; 
					}); 
					if(enabled) {
						$uci.firewall.settings.nat_enabled.value = true; // currently a workaround
					}
					def.resolve($uci.firewall.settings.nat_enabled.value); 
				}); 
				return def.promise(); 
			}
		}
	}; 
}); 

JUCI.app.run(function($uci){
	$uci.$sync("firewall").done(function(){
		if(!$uci.firewall.settings) {
			$uci.firewall.$create({
				".type": "settings", 
				".name": "settings"
			}).done(function(){
				$uci.$save(); 
			}); 
		}
	}); 
}); 

UCI.$registerConfig("firewall"); 
UCI.firewall.$registerSectionType("defaults", {
	"syn_flood":		{ dvalue: true, type: Boolean }, 
	"input":			{ dvalue: "ACCEPT", type: String }, 
	"output":			{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }
}); 
UCI.firewall.$registerSectionType("zone", {
	"name":				{ dvalue: "", type: String }, 
	"displayname":		{ dvalue: "", type: String }, // added for displaying zones in different languages
	"input":			{ dvalue: "ACCEPT", type: String }, 
	"output":			{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }, 
	"network": 			{ dvalue: [], type: Array }, 
	"masq":				{ dvalue: false, type: Boolean }, 
	"mtu_fix": 			{ dvalue: false, type: Boolean }
}); 

UCI.firewall.$registerSectionType("forwarding", {
	"src":				{ dvalue: "", type: String }, 
	"dest":				{ dvalue: "", type: String }
}); 

UCI.firewall.$registerSectionType("redirect", {
	"name":				{ dvalue: "", type: String }, 
	"enabled":			{ dvalue: true, type: Boolean }, 
	"src":				{ dvalue: "", type: String }, 
	"dest":				{ dvalue: "", type: String }, 
	"target": 			{ dvalue: "", type: String },
	"src_ip":			{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"src_dport":		{ dvalue: "", type: String, validator: UCI.validators.PortOrRangeValidator },
	"proto":			{ dvalue: "tcp", type: String }, 
	"dest_ip":			{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"dest_port":		{ dvalue: "", type: String, validator: UCI.validators.PortOrRangeValidator },
	"reflection": 		{ dvalue: false, type: Boolean }
}, function(section){
	if(!section.src_dport.value) return gettext("Source port can not be empty!"); 
	return null; 
}); 

UCI.firewall.$registerSectionType("include", {
	"path": 			{ dvalue: "", type: String }, 
	"type": 			{ dvalue: "", type: String }, 
	"family": 			{ dvalue: "", type: String }, 
	"reload": 			{ dvalue: true, type: Boolean }
}); 

UCI.firewall.$registerSectionType("dmz", {
	"enabled": 			{ dvalue: false, type: Boolean }, 
	"host": 			{ dvalue: "", type: String }, // TODO: change to ip address
	"ip6addr":			{ dvalue: "", type: String, validator: UCI.validators.IP6AddressValidator }
}); 

UCI.firewall.$registerSectionType("rule", {
	"type": 			{ dvalue: "generic", type: String }, 
	"name":				{ dvalue: "", type: String }, 
	"src":				{ dvalue: "", type: String }, 
	"src_ip":			{ dvalue: [], type: Array }, // needs to be extended type of ip address/mask
	"src_mac": 			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }, 
	"src_port":			{ dvalue: "", type: String, validator:  UCI.validators.PortRangeValidator }, // can be a range
	"dest":				{ dvalue: "", type: String }, 
	"dest_ip":			{ dvalue: [], type: Array }, // needs to be extended type of ip address/mask
	"dest_mac":			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator },
	"dest_port":		{ dvalue: "", type: String, validator: UCI.validators.PortRangeValidator }, // can be a range
	"proto":			{ dvalue: "any", type: String }, 
	"target":			{ dvalue: "REJECT", type: String }, 
	"family": 			{ dvalue: "ipv4", type: String }, 
	"icmp_type": 		{ dvalue: [], type: Array },
	"enabled": 			{ dvalue: true, type: Boolean },
	"hidden": 			{ dvalue: false, type: Boolean }, 
	"limit":			{ dvalue: "", type: String }, 
	// scheduling
	"parental": 		{ dvalue: false, type: String }, 
	"start_date":		{ dvalue: "", type: String }, 
	"stop_date":		{ dvalue: "", type: String }, 
	"start_time":		{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
	"stop_time":		{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
	"weekdays":			{ dvalue: "", type: String }, 
	"monthdays":		{ dvalue: "", type: String }, 
	"utc_time":			{ dvalue: "", type: Boolean }
});

UCI.firewall.$registerSectionType("settings", {
	"disabled":		{ dvalue: false, type: Boolean },
	"ping_wan":		{ dvalue: false, type: Boolean }, 
	"nat_enabled": 	{ dvalue: true, type: Boolean }
}); 

UCI.firewall.$registerSectionType("urlblock", {
	"enabled":	{ dvalue: false, type: Boolean }, 
	"url": 		{ dvalue: [], type: Array }, 
	"src_mac": 	{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }
}); 
