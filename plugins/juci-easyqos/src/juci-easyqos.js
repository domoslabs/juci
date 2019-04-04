UCI.$registerConfig("easy_qos"); 
UCI.easy_qos.$registerSectionType("rule", {
	"priority":		{ dvalue: "normal", type: String },
	"macaddr":		{ dvalue: "", type: String },
	"proto":		{ dvalue: "all", type: String },
	"port": 		{ dvalue: [], type: Array },
	"comment":		{ dvalue: "NA", type: String }
});
