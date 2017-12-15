UCI.$registerConfig("mwan3");
UCI.mwan3.$registerSectionType("interface", {
	"enabled":	{ dvalue: 0, type: Boolean },
	"track_ip":	{ dvalue: [], type: Array },
	"track_type":	{ dvalue: "ip", type: String },
	"reliability":	{ dvalue: 1, type: Number },
	"count":	{ dvalue: 1, type: Number },
	"family":	{ dvalue: "ipv4", type: String },
	"timeout":	{ dvalue: 4, type: Number },
	"interval":	{ dvalue: 10, type: Number },
	"up":		{ dvalue: 5, type: Number },
	"down":		{ dvalue: 5, type: Number }
});
UCI.mwan3.$registerSectionType("member", {
	"interface":	{ dvalue: "", type: String },
	"metric":	{ dvalue: 1, type: Number },
	"weight":	{ dvalue: 1, type: Number }
});
UCI.mwan3.$registerSectionType("policy", {
	"use_member":	{ dvalue: [], type: Array }
});
UCI.mwan3.$registerSectionType("rule", {
	"use_policy":	{ dvalue: "", type: String },
	"src_ip":	{ dvalue: "0.0.0.0/0", type: String, validator: UCI.validators.IP4AddressValidator },
	"src_port":	{ dvalue: "0:65535", type: String, validator:  UCI.validators.PortsOrRangeValidator() },
	"proto":	{ dvalue: "all", type: String },
	"dest_ip":	{ dvalue: "0.0.0.0/0", type: String, validator: UCI.validators.IP4AddressValidator },
	//"ipset":	{ dvalue: "", type: String },
	//"sticky":	{ dvalue: 0, type: Boolean },
	//"timeout":	{ dvalue: 600, type: Number }
	"dest_port":	{ dvalue: "0:65535", type: String, validator:  UCI.validators.PortsOrRangeValidator() }
});
