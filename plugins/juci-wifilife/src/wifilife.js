UCI.$registerConfig("wifilife");
UCI.$registerConfig("owsd");
UCI.$registerConfig("wireless");

UCI.owsd.$registerSectionType("ubusproxy", {
	"enable": { dvalue: false, type: Boolean },
});

UCI.wifilife.$registerSectionType("wifilife", {
	"enabled": { dvalue: false, type: Boolean },
	"ifname": { dvalue: undefined, type: String },
	"runfreq": { dvalue: "auto", type: String }
});

UCI.wifilife.$registerSectionType("steer", {
	"enabled": { dvalue: false, type: Boolean },
	"ifname": { dvalue: undefined, type: String },
	"exclude": { dvalue: [], type: Array },
	"param": { dvalue: "", type: String },
	"fallback_legacy": { dvalue: true, type: Boolean }
});

UCI.wifilife.$registerSectionType("assoc_control", {
	"enabled": { dvalue: false, type: Boolean },
	"ifname": { dvalue: "", type: String },
	"stas": { dvalue: [], type: Array },
});

UCI.wifilife.$registerSectionType("steer-param", {
	"priority": { dvalue: undefined, type: Number },
	"rssi_threshold": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(-100, -30) },
	"bssload_threshold": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 100) },
	"margin": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 30) },
	"hysteresis": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 500) },
	"diffsnr": { dvalue: undefined, type: Number, validator: UCI.validators.NumberLimitValidator(0, 50) },
	"victims": { dvalue: undefined, type: Array },
	"params": { dvalue: undefined, type: Array },
});

UCI.wifilife.$registerSectionType("cntlr", {
	"enabled": { dvalue: false, type: Boolean },
	"steer_policy": { dvalue: "", type: String }
});

UCI.wifilife.$registerSectionType("steer_default", {
	"allow_agent_steer": { dvalue: false, type: Boolean },
	"rule": { dvalue: "", type: String },
	"exclude_rpt": { dvalue: false, type: Boolean }
});

UCI.wifilife.$registerSectionType("steer_custom", {
	"allow_agent_steer": { dvalue: false, type: Boolean },
	"rule": { dvalue: "", type: String },
	"exclude_rpt": { dvalue: false, type: Boolean }
});

UCI.wifilife.$registerSectionType("rule_custom", {
	"action": { dvalue: "", type: String },
	"sta": { dvalue: undefined, type: String },
	"bss": { dvalue: undefined, type: String },
});

JUCI.app.factory("$wifilife", function(){
	return {
		validMac: function (mac) {
			return mac.length != null && mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17;
		}
	}
});
