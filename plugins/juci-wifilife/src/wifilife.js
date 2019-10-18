UCI.$registerConfig("wifilife");
UCI.$registerConfig("owsd");

UCI.owsd.$registerSectionType("ubusproxy", {
	"enable": { dvalue: false, type: Boolean },
});

UCI.wifilife.$registerSectionType("wifilife", {
	"enabled": { dvalue: false, type: Boolean },
	"runfreq": { dvalue: "auto", type: String }
});

UCI.wifilife.$registerSectionType("fh-iface", {
	"ifname": { dvalue: undefined, type: String },
	"steer": { dvalue: [], type: Array },
	"exclude": { dvalue: [], type: Array },
	"exclude_btm": { dvalue: [], type: Array },
	"restrict": { dvalue: [], type: Array },
	"btm_ret": { dvalue: 3, type: Number, validator: UCI.validators.NumberLimitValidator(0, undefined) },
	"btm_ret_secs": { dvalue: 180, type: Number, validator: UCI.validators.NumberLimitValidator(5, undefined) },
	"fallback_legacy": { dvalue: 0, type: Number },
	"steer_legacy_reassoc_secs": { dvalue: 30, type: Number },
	"steer_legacy_retry_secs": { dvalue: 3600, type: Number },
});

UCI.wifilife.$registerSectionType("bk-iface", {
	"ifname": { dvalue: undefined, type: String },
	"disabled": { dvalue: true, type: Boolean }
});

UCI.wifilife.$registerSectionType("steer-param", {
	"type": {dvalue: undefined, type: String },
	"priority": { dvalue: 0, type: Number },
	"rssi_threshold": { dvalue: -68, type: Number, validator: UCI.validators.NumberLimitValidator(-100, -30) },
	"bssload_threshold": { dvalue: 80, type: Number, validator: UCI.validators.NumberLimitValidator(0, 100) },
	"margin": { dvalue: 3, type: Number, validator: UCI.validators.NumberLimitValidator(0, 30) },
	"hysteresis": { dvalue: 5, type: Number, validator: UCI.validators.NumberLimitValidator(0, 500) },
	"diffsnr": { dvalue: 8, type: Number, validator: UCI.validators.NumberLimitValidator(0, 50) },
	"victims": { dvalue: undefined, type: Array },
	"params": { dvalue: undefined, type: Array },
});

/*  --- To be implemented --- */
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
/* --- */

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
