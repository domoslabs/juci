UCI.$registerConfig("wifilife");

UCI.wifilife.$registerSectionType("wifilife", {
	"enabled": { dvalue: true, type: Boolean },
	"ifname": { dvalue: "wl0", type: String }
});

UCI.wifilife.$registerSectionType("steer", {
	"enabled": { dvalue: true, type: Boolean },
	"ifname": { dvalue: "wl0", type: String },
	"exclude": { dvalue: [], type: Array },
	"param": { dvalue: "rssi", type: String }
});

UCI.wifilife.$registerSectionType("assoc_control", {
	"enabled": { dvalue: true, type: Boolean },
	"ifname": { dvalue: "wl0", type: String },
	"stas": { dvalue: [], type: Array},
	"duration": { dvalue: 0, type: Number, validator: UCI.validators.NumberLimitValidator(0, undefined) }
});

UCI.wifilife.$registerSectionType("steer-param", {
	"priority": { dvalue: undefined, type: Number },
	"rssi_threshold": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(-100, -30) },
	"bssload_threshold": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 100) },
	"threshold_margin": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 30) },
	"hysteresis": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 500) },
	"snr_diff": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 50) },
	"victims": { dvalue: undefined, type: Array},
	"params": { dvalue: undefined, type: Array },
});

JUCI.app.factory("$wifilife", function($uci, $rpc, $tr){
	return {

		validMac: function (mac) {
			return mac.length != null && mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17;
		},

		onUnexclude: function (section, option, container, mac) {
			if (mac == null)
				return;

			$scope[section][option].value = $scope[section][option].value.filter(exl_mac => exl_mac.indexOf(mac) < 0);
			$scope[container].excluded = $scope[container].excluded.filter(pair => pair.value.indexOf(mac) < 0);
			$scope[container].unexcluded.push({ label: mac, value: mac })
		},

		onExclude: function (section, option, container, mac) {
			if (mac == null)
				return;

			let excluded = $scope[section][option].value.filter(validMac); // not sure why we gotta filter it into new array..
			excluded.push(mac);
			$scope[section][option].value = excluded;
			$scope[container].excluded.push({ label: mac, value: mac })
			$scope[container].unexcluded = $scope[container].unexcluded.filter(pair => pair.value.indexOf(mac) < 0);
		},

		onExcludeMan: function (section, option, container, mac) {
			if (!mac || mac.length == 0) {
				$scope[container].error = $tr(gettext("Please enter a MAC"));
				return;
			}

			if (!validMac(mac)) {
				$scope[container].error = $tr(gettext("Invalid MAC, please give in the format aa:bb:cc:dd:ee:ff"));
				return;
			}

			if ($scope[section][option].value.some(excluded => mac.indexOf(excluded) >= 0)) {
				$scope[container].error = $tr(gettext("The MAC is already excluded!"));
				return;
			}

			$scope[container].error = null;
			this.onExclude(section, option, container, mac);
		}
	}
});
