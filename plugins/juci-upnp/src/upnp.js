//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.factory("$upnp", function($uci){
	return {
		get enabled(){
			if(!$uci.upnpd.config) return false; 
			return $uci.upnpd.config.enable_upnp.value; 
		},
		set enabled(value){
			if(!$uci.upnpd.config) return; 
			$uci.upnpd.config.enable_upnp.value = value; 
		}, 
		getConfig: function(){
			var deferred = $.Deferred(); 
			$uci.$sync("upnpd").done(function(){
				deferred.resolve($uci.upnpd.config); 
			}); 
			return deferred.promise(); 
		}
	}; 
}); 

JUCI.app
.run(function($uci){
	$uci.$sync("upnpd"); 
}); 

UCI.$registerConfig("upnpd"); 
UCI.upnpd.$registerSectionType("upnpd", {
	"enabled":			{ dvalue: false, type: Boolean },
	"enable_natpmp":	{ dvalue: false, type: Boolean }, 
	"enable_upnp":		{ dvalue: false, type: Boolean }, 
	"secure_mode":		{ dvalue: false, type: Boolean }, 
	"log_output":		{ dvalue: true, type: Boolean }, 
	"download":			{ dvalue: 1024, type: Number }, 
	"upload":			{ dvalue: 512, type: Number }, 
	"internal_iface":	{ dvalue: '', type: String }, 
	"external_iface":	{ dvalue: '', type: String },
	"port":				{ dvalue: 5000, type: Number }, 
	"uuid":				{ dvalue: '', type: String },
	"serial_number":	{ dvalue: '', type: String },
	"model":			{ dvalue: '', type: String },
	"notify_interval":	{ dvalue: 30, type: Number },
	"clean_ruleset_threshold": { dvalue: 20, type: Number },
	"clean_ruleset_interval": { dvalue: 600, type: Number },
	"presentation_url":	{ dvalue: '', type: String },
	"upnp_lease_file":	{ dvalue: '', type: String }
}); 

UCI.upnpd.$registerSectionType("perm_rule", {
	"action":		{ dvalue: '', type: String },
	"ext_ports":	{ dvalue: '', type: String },
	"int_addr":		{ dvalue: '', type: String },
	"int_ports":	{ dvalue: '', type: String },
	"comment":		{ dvalue: '', type: String }
});
/*
config perm_rule
	option action		allow
	option ext_ports	1024-65535
	option int_addr		0.0.0.0/0
	option int_ports	1024-65535
	option comment		"Allow high ports"

config perm_rule
	option action		deny
	option ext_ports		0-65535
	option int_addr		0.0.0.0/0
	option int_ports		0-65535
	option comment		"Default deny"
*/
