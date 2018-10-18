UCI.$registerConfig("wifilife");

UCI.wifilife.$registerSectionType("wifilife", {
	"enabled": { dvalue: true, type: Boolean },
	"ifname": { dvalue: "wl0", type: String }
});

UCI.wifilife.$registerSectionType("steer", {
	"enabled": { dvalue: true, type: Boolean },
	"ifname": { dvalue: "wl0", type: String },
	"param": { dvalue: "rssi", type: String }
});

UCI.wifilife.$registerSectionType("assoc_control", {
	"ifname": { dvalue: "wl0", type: String }
});

UCI.wifilife.$registerSectionType("steer-param", {
	"priority": { dvalue: -65, type: Number },
	"threshold": { dvalue: 80, type: Number }
});

JUCI.app.factory("$wifilife", function($uci, $rpc, $tr){
	return {

		getLifeStatus: function () {
			var def = $.Deferred();

			$uci.$sync("wifilife").done(function() {
				def.resolve(!!$uci.wifilife["@wifilife"][0].enabled.ovalue);
			})

			return def.promise();
		},

		getSteerParams: function() {
			var def = $.Deferred();

			$uci.$sync("wifilife").done(function() {
				var rv = {}

				$uci.wifilife["@steer-param"].forEach(function (section) {
					rv[section[".name"]] = { "priority": section.priority.ovalue, "threshold": section.threshold.ovalue}
				});

				def.resolve(rv);
			})

			return def.promise();
		}

	}
});

	/*
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
					dev.frequency = devices[dev.device][".frequency"];
					delete devices[dev.device];
				}
			});
			// add any devices that are not in the list of adapters (ones that are down for instance)
			Object.keys(devices).map(function(k){
				var device = devices[k];
				adapters.push({
					name: device.ssid.value,
					device: device.ifname.value,
					frequency: devices[".frequency"],
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
*/


