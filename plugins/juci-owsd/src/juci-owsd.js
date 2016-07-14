//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("owsd"); 
UCI.owsd.$registerSectionType("owsd-listen", {
	"port":			{ dvalue: "", type: Number, validator: UCI.validators.PortValidator }, 
	"interface":	{ dvalue: "", type: String },
	"ipv6":			{ dvalue: false type: Boolean },
	"device":		{ dvalue: "", type: String },
	"interface":	{ dvalue: "", type: String }
}); 
