UCI.$registerConfig("mwan3");
UCI.mwan3.$registerSectionType("interface", {
	"enabled":	{ dvalue: null, type: Boolean },
	"track_ip":	{ dvalue: [], type: Array },
	"reliability":	{ dvalue: 1, type: Number },
	"count":	{ dvalue: 1, type: Number },
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
	"src_ip":	{ dvalue: "any", type: String },
	"src_port":	{ dvalue: "any", type: String },
	"proto":	{ dvalue: "all", type: String },
	"dest_ip":	{ dvalue: "any", type: String },
	"dest_port":	{ dvalue: "any", type: String }
	//"ipset":	{ dvalue: "", type: String },
	//"sticky":	{ dvalue: 0, type: Boolean },
	//"timeout":	{ dvalue: 600, type: Number }
});
