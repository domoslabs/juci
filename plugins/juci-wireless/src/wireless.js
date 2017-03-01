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
						var wcl = wclients.find(function(wc){ return String(wc.macaddr).toLowerCase() === String(cl.macaddr).toLowerCase(); });
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

JUCI.app.factory("$wireless", function($uci, $rpc, $network, gettext, $tr){
	function Wireless(){
		this.scheduleStatusText = $tr(gettext("off"));
		this.wpsStatusText = $tr(gettext("off"));
	}

	Wireless.prototype.annotateAdapters = function(adapters){
		var def = $.Deferred();
		var self = this;
		self.getInterfaces().done(function(list){
			var devices = {};
			list.map(function(x){ devices[x.ifname.value] = x; });
			adapters.map(function(dev){
				if(dev.device in devices){
					dev.name = devices[dev.device].ssid.value;
					dev.type = "wireless";
					delete devices[dev.device];
				}
			});
			// add any devices that are not in the list of adapters (ones that are down for instance)
			Object.keys(devices).map(function(k){
				var device = devices[k];
				adapters.push({
					name: device.ssid.value,
					device: device.ifname.value,
					type: "wireless"
				});
			});
			// set type to wireless for devices having names starting with wl (Broadcom) or ra (Mediatek)
			adapters.forEach(function(dev){
				if(dev.device && (dev.device.indexOf("wl") == 0 || dev.device.indexOf("ra") == 0)) dev.type = "wireless";
			});
			def.resolve();
		}).fail(function(){
			def.reject();
		});
		return def.promise();
	}

	Wireless.prototype.getConnectedClients = function(){
		var def = $.Deferred();
		$rpc.$call("router.wireless", "stas").done(function(clients){
			$rpc.$call("router.network", "clients", {"family":6}).done(function(cl6){
				var wlclients = Object.keys(clients).map(function(c){return clients[c];}).map(function(client){
					Object.keys(cl6).map(function(c6){return cl6[c6];}).map(function(client6){
						if(client.macaddr === client6.macaddr){
							client.ip6addr = client6.ip6addr;
						}
					});
					return client;
				});
				def.resolve(wlclients);
			}).fail(function(){
				def.reject();
			});
		}).fail(function(){
			def.reject();
		});
		return def.promise();
	}

	// returns radio devices
	Wireless.prototype.getDevices = function(){
		var deferred = $.Deferred();
		$uci.$sync("wireless").done(function(){
			$rpc.$call("router.wireless", "radios").done(function(radios){
				var devices = $uci.wireless["@wifi-device"].map(function(dev){
					var radio = radios[dev[".name"]];
					if(radio){
						dev.$info = radio;
						dev[".frequency"] = radio.frequency || ((dev.band.value === 'a') ? $tr(gettext("5GHz")) : $tr(gettext("2.4GHz")));
					}else{
						dev[".frequency"] = (dev.band.value === 'a') ? $tr(gettext("5GHz")) : $tr(gettext("2.4GHz"));
					}
					return dev;
				});
				deferred.resolve(devices);
			}).fail(function(){
				deferred.reject("ubus call router.wireless radios was not found");
			});
		}).fail(function(){
			deferred.reject("could not read uci wireless config");
		});
		return deferred.promise();
	}

	//! returns virtual interfaces that are configured
	Wireless.prototype.getInterfaces = function(){
		var deferred = $.Deferred();
		var self = this;
		$uci.$sync("wireless").done(function(){
			var ifs = $uci.wireless["@wifi-iface"];
			var er = [];
			async.eachSeries(ifs, function(iface, next){
				if(iface.ifname.value === "" && $uci.wireless.$getWriteRequests().length === 0){
					$uci.wireless.$mark_for_reload(); //sometime ifname is not adde fast enough
				}
				$rpc.$call("router.wireless", "status", {"vif": iface.ifname.value}).done(function(data){
					iface[".frequency"] = ((data.frequency && data.frequency === 5)?'5GHz':'2.4GHz');
					iface.$info = data;
				}).fail(function(e){ er.push(e);})
				.always(function(){next();});
			},
			function(){
				//if(er.length) we still want to continue deferred.reject(er);
				deferred.resolve(ifs);
			});
		});
		return deferred.promise();
	}

	Wireless.prototype.getDefaults = function(){
		var deferred = $.Deferred();
		$rpc.$call("router.system", "info", {}).done(function(result){
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

	Wireless.prototype.scan = function(opts){
		var deferred = $.Deferred();
		$rpc.$call("router.wireless", "scan", opts).always(function(){
			deferred.resolve();
		});
		return deferred.promise();
	}

	Wireless.prototype.getScanResults = function(opts){
		var deferred = $.Deferred();
		$rpc.$call("router.wireless", "scanresults", opts).done(function(result){
			deferred.resolve(result.access_points);
		});
		return deferred.promise();
	}

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

(function(){
	UCI.$registerConfig("wireless");
	UCI.wireless.$registerSectionType("wifi-status", {
		"wlan":		{ dvalue: true, type: Boolean },
		"wps":		{ dvalue: true, type: Boolean },
		"schedule":	{ dvalue: false, type: Boolean },
		"sched_status":	{ dvalue: false, type: Boolean }
	});
	UCI.wireless.$registerSectionType("bandsteering", {
		"enabled":	{ dvalue: false, type: Boolean },
		"policy":	{ dvalue: 0, type: Number },
		"rssi_threshold":{ dvalue: -75, type: Number },
		"bw_util":	{ dvalue: 60, type: Number }
	});
	UCI.wireless.$registerSectionType("wifi-schedule", {
		"days":		{ dvalue: [], type: Array, allow: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], validator: UCI.validators.WeekDayListValidator},
		"time":		{ dvalue: "", type: String, validator: UCI.validators.TimespanValidator }
	}, function validator(section){
		if(section.days.value.length == 0){
			return JUCI.$tr(gettext("Wifi Schedule: please pick at least one day to schedule on"));
		}
		return null;
	});
	UCI.wireless.$registerSectionType("wifi-device", {
		"type": 		{ dvalue: "", type: String },
		"country": 		{ dvalue: "EU/13", type: String},
		"band": 		{ dvalue: "b", type: String, allow: [ "a", "b" ] },
		"bandwidth": 	{ dvalue: 80, type: String, allow: [ "20", "40", "80" ] },
		"channel":		{ dvalue: "auto", type: String, allow: [ "auto", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 36, 40, 44, 48 ] },
		"obss_coex":	{ dvalue: true, type: Boolean },
		"scantimer":	{ dvalue: 0, type: Number },
		"wmm":			{ dvalue: true, type: Boolean },
		"wmm_noack":	{ dvalue: false, type: Boolean },
		"wmm_apsd":		{ dvalue: true, type: Boolean },
		"txpower":		{ dvalue: 100, type: Number },
		"rateset":		{ dvalue: "default", type: String, allow: [ "default" ] },
		"frag":			{ dvalue: 2346, type: Number },
		"rts":			{ dvalue: 2347, type: Number },
		"dtim_period":	{ dvalue: 1, type: Number },
		"beacon_int":	{ dvalue: 100, type: Number },
		"rxchainps":	{ dvalue: true, type: Boolean },
		"rxchainps_qt":	{ dvalue: 10, type: Number },
		"rxchainps_pps":{ dvalue: 10, type: Number },
		"rifs":			{ dvalue: false, type: Boolean },
		"rifs_advert":	{ dvalue: true, type: Boolean },
		"maxassoc":		{ dvalue: 32, type: Number },
		"dfsc":			{ dvalue: true, type: Boolean }, // ?
		"hwmode":		{ dvalue: "auto", type: String },
		"disabled":		{ dvalue: false, type: Boolean },
		"frameburst": 	{ dvalue: false, type: Boolean },
		"beamforming": 	{ dvalue: true, type: Boolean },
		"atf": 		{ dvalue: false, type: Boolean }
	});
	UCI.wireless.$registerSectionType("wifi-iface", {
		"device": 			{ dvalue: "", type: String },
		"ifname": 			{ dvalue: "", type: String }, // name of the created device
		"network":			{ dvalue: "", type: String },
		"mode":				{ dvalue: "ap", type: String },
		"ssid":				{ dvalue: "", type: String },
		"encryption":		{ dvalue: "none", type: String },
		"cipher":			{ dvalue: "auto", type: String },
		"key":				{ dvalue: "", type: String, validator: UCI.validators.WPAKeyValidator("#%&'()*,/:;<=>?|[]\"\\") },
		"key_index": 		{ dvalue: 1, type: Number },
		"key1":				{ dvalue: "", type: String, validator: UCI.validators.WEPKeyValidator },
		"key2":				{ dvalue: "", type: String, validator: UCI.validators.WEPKeyValidator },
		"key3":				{ dvalue: "", type: String, validator: UCI.validators.WEPKeyValidator },
		"key4":				{ dvalue: "", type: String, validator: UCI.validators.WEPKeyValidator },
		"radius_server":	{ dvalue: "", type: String, validator: UCI.validators.ASCIIValidator },
		"radius_port":		{ dvalue: "", type: String, validator: UCI.validators.PortValidator },
		"radius_secret":	{ dvalue: "", type: String, validator: UCI.validators.ASCIIValidator },
		"gtk_rekey":		{ dvalue: 3600, type: Number },
		"net_reauth":		{ dvalue: 36000, type: Number },
		"wps_pbc":			{ dvalue: false, type: Boolean },
		"wmf_bss_enable":	{ dvalue: false, type: Boolean },
		"bss_max":			{ dvalue: 32, type: Number, validator: UCI.validators.NumberLimitValidator(0, 128) },
		"closed":			{ dvalue: false, type: Boolean },
		"disabled":			{ dvalue: false, type: Boolean },
		"macfilter":			{ dvalue: 0, type: Number },
		"maclist":			{ dvalue: [], type: Array } // match_each: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/ }
	}, function validator(section){
		if(section.disabled.value !== false){ return null; }
		var eList = [];
// validate ssid
		if(section.ssid.value.length >= 32)
			eList.push(JUCI.$tr(gettext("Invalid SSID: ")) + (section.ssid.value || JUCI.$tr(gettext("no SSID"))) + JUCI.$tr(gettext(". SSID can not be more than 32 characters long!")));
		if(section.ssid.value.length === 0)
			eList.push(JUCI.$tr(gettext("One of the wireless interface(s) does not have SSID")));
// validate keys
		switch(section.encryption.value){
			case "wep-open":
			case "wep": {
				var WEPValidator = new UCI.validators.WEPKeyValidator();
				var err = null;
				for(var i = 1; i <= 4; i++){
					err = WEPValidator.validate(section["key"+i]);
					if(err !== null) eList.push(JUCI.$tr(gettext("Wireless interface ")) + (section.ssid.value || JUCI.$tr(gettext("no SSID"))) + JUCI.$tr(gettext(" has invalid key #")) + i + JUCI.$tr(gettext(" error: ")) + err);
				}
				if(section["key"+section.key_index.value].value === ""){
					eList.push(JUCI.$tr(gettext("Wireless interface ")) + (section.ssid.value || JUCI.$tr(gettext("no SSID"))) + JUCI.$tr(gettext(" must have key #")) + section.key_index.value + JUCI.$tr(gettext(" set!")));
				}
			} break;
			//case "psk":
			case "psk2":
			case "mixed-psk":
				if((!section.key.value) && section.mode.value === "ap"){
					eList.push(JUCI.$tr(gettext("Wireless interface ")) + (section.ssid.value || JUCI.$tr(gettext("no SSID"))) + JUCI.$tr(gettext(". WPA key must be 8-63 printable ASCII characters long!")));
				}
				break;
			case "wpa-mixed":
			case "wpa2":
			default:
				break;
		}
		if(eList && eList.length > 0) return eList;
		return null;
	});
})();
