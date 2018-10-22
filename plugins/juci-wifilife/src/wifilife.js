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
	"ifname": { dvalue: "wl0", type: String }
});

UCI.wifilife.$registerSectionType("steer-param", {
	"priority": { dvalue: undefined, type: Number },
	"rssi_threshold": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(-100, -30) },
	"bssload_threshold": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 100) },
	"threshold_margin": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 30) },
	"hysteresis": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 500) },
	"snr_diff": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 50) },
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
