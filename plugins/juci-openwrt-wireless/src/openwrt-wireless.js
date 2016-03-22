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

JUCI.app.run(function($network, $uci, $wireless){
	$network.subsystem(function(){
		return {
			annotateClients: function(clients){
				var def = $.Deferred(); 
				$wireless.getConnectedClients().done(function(wclients){
					clients.map(function(cl){
						var wcl = wclients.find(function(wc){ return String(wc.macaddr).toLowerCase() == String(cl.macaddr).toLowerCase(); }); 
						if(wcl) { 
							cl._display_widget = "wireless-client-lan-display-widget"; 
							cl._wireless = wcl; 
						} 
					}); 
					def.resolve(); 
				}).fail(function(){
					def.reject(); 
				}); 
				return def.promise(); 
			} 
		}
	}); 
}); 

JUCI.app.factory("$wireless", function($uci, $rpc, $network, gettext){
	
	function Wireless(){
		this.scheduleStatusText = gettext("off"); 
		this.wpsStatusText = gettext("off"); 
	}
	
	Wireless.prototype.annotateAdapters = function(adapters){
		var def = $.Deferred(); 
		var self = this; 
		self.getInterfaces().done(function(list){
			var devices = {}; 
			list.map(function(x){ devices[x.ifname.value] = x; }); 
			adapters.map(function(dev){
				if(dev.device in devices){
					dev.name = devices[dev.device].ssid.value + "@" + dev.device; 
					delete devices[dev.device]; 
				}
			});
			Object.keys(devices).map(function(k){
				var device = devices[k]; 
				adapters.push({
					name: device.ssid.value, 
					device: device.ifname.value, 
					type: "wireless", 
					state: "DOWN"
				}); 
			}); 
			def.resolve(); 
		}).fail(function(){
			def.reject(); 
		}); 
		return def.promise(); 
	}

	Wireless.prototype.getConnectedClients = function(){
		var def = $.Deferred(); 
		$rpc.juci.wireless.clients().done(function(clients){
			if(clients && clients.clients) {
				clients.clients.map(function(cl){
					if(cl.rssi && cl.noise && cl.noise > 0)
						cl.snr = Math.floor(1 - (cl.rssi / cl.noise)); 
				}); 
				def.resolve(clients.clients); 
			}
			else def.reject(); 
		}); 
		return def.promise(); 
	}
	
	Wireless.prototype.getDevices = function(){
		var deferred = $.Deferred(); 
		$uci.$sync("wireless").done(function(){
			$uci.wireless["@wifi-device"].map(function(x){
				// TODO: this should be a uci "displayname" or something
				// TODO: actually this should be based on wireless ubus call field
				if(x.band.value == "a") x[".frequency"] = gettext("5GHz"); 
				else if(x.band.value == "b") x[".frequency"] = gettext("2.4GHz"); 
			}); 
			deferred.resolve($uci.wireless["@wifi-device"]); 
		}); 
		return deferred.promise(); 
	}
	
	Wireless.prototype.getInterfaces = function(){
		var deferred = $.Deferred(); 
		$uci.$sync("wireless").done(function(){
			var ifs = $uci.wireless["@wifi-iface"]; 
			// TODO: this is an ugly hack to automatically calculate wifi device name
			// it is not guaranteed to be exact and should be replaced by a change to 
			// how openwrt handles wireless device by adding an ifname field to wireless 
			// interface configuration which will be used to create the ethernet device.  
			/*
			var counters = {}; 
			ifs.map(function(i){
				if(i.ifname.value == ""){
					if(!counters[i.device.value]) counters[i.device.value] = 0; 
					if(counters[i.device.value] == 0)
						i.ifname.value = i.device.value; 
					else
						i.ifname.value = i.device.value + "." + counters[i.device.value]; 
					counters[i.device.value]++; 
				}
			});*/ 
			deferred.resolve(ifs); 
		}); 
		return deferred.promise(); 
	}
	
	Wireless.prototype.getDefaults = function(){
		var deferred = $.Deferred(); 
		$rpc.juci.wireless.defaults().done(function(result){
			if(!result) {
				deferred.reject(); 
				return; 
			}
			
			deferred.resolve(result); 
		}).fail(function(){
			deferred.reject(); 
		});  
		return deferred.promise(); 
	}
/*	
	Wireless.prototype.scan = function(){
		var deferred = $.Deferred(); 
		$rpc.juci.broadcom.wld.scan().done(function(result){
			
		}).always(function(){
			deferred.resolve(); 
		});  
		return deferred.promise(); 
	}
	
	Wireless.prototype.getScanResults = function(){
		var deferred = $.Deferred(); 
		$rpc.juci.broadcom.wld.scanresults().done(function(result){
			deferred.resolve(result.list); 
		}); 
		return deferred.promise(); 
	}
*/	
	return new Wireless(); 
}); 

JUCI.app.run(function($ethernet, $wireless, $uci){
	$ethernet.addSubsystem($wireless); 
	// make sure we create status section if it does not exist. 
	$uci.$sync("wireless").done(function(){
		if(!$uci.wireless.status) {
			$uci.wireless.$create({
				".type": "wifi-status", 
				".name": "status"
			}).done(function(){
				$uci.$save();
			});  
		} 
		$uci.$save(); 
	}); 
}); 

UCI.$registerConfig("wireless"); 
UCI.wireless.$registerSectionType("wifi-status", {
	"wlan":		{ dvalue: true, type: Boolean }, 
	"wps":		{ dvalue: true, type: Boolean },
	"schedule":	{ dvalue: false, type: Boolean },
	"sched_status":	{ dvalue: false, type: Boolean }
}); 
UCI.wireless.$registerSectionType("wifi-schedule", {
	"days":		{ dvalue: [], type: Array, 
		allow: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], 
		alidator: UCI.validators.WeekDayListValidator},
	"time":		{ dvalue: "", type: String, validator: UCI.validators.TimespanValidator }
}, function validator(section){
	if(section.days.value.length == 0){
		return gettext("please pick at least one day to schedule on"); 
	}
	return null; 
}); 
UCI.wireless.$registerSectionType("wifi-device", {
	"type": 			{ dvalue: "", type: String },
	"country": 			{ dvalue: "", type: String},
	"ifname":			{ dvalue: "", type: String }, // primary device of the radio in order to get countrylist from iwinfo
	"band": 			{ dvalue: "none", type: String },
	"bandwidth": 		{ dvalue: 0, type: String },
	"htmode": 			{ dvalue: "", type: String },
	"channel":			{ dvalue: "auto", type: String },
	"scantimer":		{ dvalue: 0, type: Number },
	"wmm":				{ dvalue: false, type: Boolean },
	"wmm_noack":		{ dvalue: false, type: Boolean },
	"wmm_apsd":			{ dvalue: false, type: Boolean },
	"txpower":			{ dvalue: 0, type: Number },
	"rateset":			{ dvalue: "default", type: String, allow: [ "default" ] },
	"frag":				{ dvalue: 0, type: Number },
	"rts":				{ dvalue: 0, type: Number },
	"dtim_period":		{ dvalue: 0, type: Number },
	"beacon_int":		{ dvalue: 0, type: Number },
	"rxchainps":		{ dvalue: false, type: Boolean },
	"rxchainps_qt":		{ dvalue: 0, type: Number },
	"rxchainps_pps":	{ dvalue: 0, type: Number },
	"rifs":				{ dvalue: false, type: Boolean },
	"rifs_advert":		{ dvalue: false, type: Boolean },
	"maxassoc":			{ dvalue: 0, type: Number },
	"doth":				{ dvalue: 0, type: Boolean },
	"dfsc":				{ dvalue: 0, type: Boolean }, // ? 
	"hwmode":			{ dvalue: "auto", type: String },
	"disabled":			{ dvalue: false, type: Boolean },
	"frameburst": 		{ dvalue: false, type: Boolean },
	"obss_coex": 		{ dvalue: false, type: Boolean }, 
	"beamforming": 		{ dvalue: false, type: Boolean }
}); 
UCI.wireless.$registerSectionType("wifi-iface", {
	"device": 			{ dvalue: "", type: String },
	"ifname": 			{ dvalue: "", type: String }, // name of the created device 
	"network":			{ dvalue: "", type: String },
	"mode":				{ dvalue: "ap", type: String },
	"ssid":				{ dvalue: "", type: String },
	"encryption":		{ dvalue: "mixed-psk", type: String },
	"cipher":			{ dvalue: "auto", type: String },
	"key":				{ dvalue: "", type: String },
	"key_index": 		{ dvalue: 1, type: Number }, 
	"key1":				{ dvalue: "", type: String },
	"key2":				{ dvalue: "", type: String },
	"key3":				{ dvalue: "", type: String },
	"key4":				{ dvalue: "", type: String },
	"radius_server":	{ dvalue: "", type: String },
	"radius_port":		{ dvalue: "", type: String },
	"radius_secret":	{ dvalue: "", type: String },
	"gtk_rekey":		{ dvalue: false, type: Boolean },
	"net_rekey":		{ dvalue: 0, type: Number },
	"wps_pbc":			{ dvalue: false, type: Boolean },
	"wmf_bss_enable":	{ dvalue: false, type: Boolean },
	"bss_max":			{ dvalue: 0, type: Number },
	"instance":			{ dvalue: 0, type: Number },
	"up":				{ dvalue: false, type: Boolean },
	"hidden":			{ dvalue: false, type: Boolean },
	"disabled":			{ dvalue: false, type: Boolean },
	"macmode":			{ dvalue: 1, type: Number },
	"macfilter":		{ dvalue: false, type: Boolean },
	"maclist":			{ dvalue: [], type: Array } // match_each: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/ }
}, function validator(section){
	// validate ssid
	if(section.ssid.value.length >= 32) 
		return gettext("SSID string can be at most 32 characters long!"); 
	// validate keys
	if(section.encryption.value.indexOf("wep") == 0){
		for(var id = 1; id <= 4; id++){
			var key = section["key"+id]; 
			if(key && key.value != "" && !key.value.match(/[a-f0-9A-F]{10,26}/)) 
				return gettext("WEP encryption key #"+id+" must be 10-26 hexadecimal characters!"); 
		}
	} else if(section.encryption.value.indexOf("psk2") == 0 || section.encryption.value.indexOf("psk") == 0 || section.encryption.value.indexOf("mixed-psk") == 0 ){
		if(!section.key.value || !(section.key.value.length >= 8 && section.key.value.length < 64))
			return gettext("WPA key must be 8-63 characters long!"); 
	}
	return null; 
});

UCI.juci.$registerSectionType("wireless", {
	"cryptochoices": 			{ dvalue: ["none", "psk2", "psk-mixed"], type: Array }
}); 
UCI.juci.$insertDefaults("wireless"); 

