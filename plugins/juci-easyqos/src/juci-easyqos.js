UCI.$registerConfig("easy_qos"); 
UCI.easy_qos.$registerSectionType("rule", {
	"priority":		{ dvalue: "", type: String },
	"macaddr":		{ dvalue: "", type: String },
	"proto":		{ dvalue: "", type: String },
	"port":		{ dvalue: [], type: Array },
	"comment":		{ dvalue: "NA", type: String }
}); 
