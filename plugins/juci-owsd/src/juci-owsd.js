//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("owsd"); 
UCI.owsd.$registerSectionType("owsd-listen", {
	"port":			{ dvalue: "", type: Number, validator: UCI.validators.PortValidator }, 
	"interface":	{ dvalue: "", type: String },
	"ipv6":			{ dvalue: "off", type: Boolean },
	"ipv6only":		{ dvalue: "off", type: Boolean },
	"whitelist_interface_as_origin":{ dvalue: "off", type: Boolean },
	"origin":		{ dvalue: [], type: Array },
	"cert":			{ dvalue: "", type: String },
	"key":			{ dvalue: "", type: String }
}); 
