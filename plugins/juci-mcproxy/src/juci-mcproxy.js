UCI.$registerConfig("mcproxy"); 
UCI.$registerConfig("network"); 
UCI.mcproxy.$registerSectionType("mcproxy", {
	"disabled":		{ dvalue: true, type: Boolean },
	"protocol":		{ dvalue: "", type: String },
	"query_interval":		{ dvalue: '', type: Number },
	"query_response_interval":		{ dvalue: '', type: Number },
	"last_member_query_interval":		{ dvalue: '', type: Number },
	"robustness_value":		{ dvalue: '', type: Number },
	"max_groups":		{ dvalue: '', type: Number },
	"max_sources":		{ dvalue: '', type: Number }
}); 
UCI.mcproxy.$registerSectionType("instance", {
	"disabled":		{ dvalue: true, type: Boolean },
	"name":		{ dvalue: "", type: String },
	"upstream":		{ dvalue: [], type: Array },
	"downstream":		{ dvalue: [], type: Array }
}); 
UCI.mcproxy.$registerSectionType("table", {
	"name":		{ dvalue: "", type: String },
	"entries":		{ dvalue: [], type: Array }
});
UCI.mcproxy.$registerSectionType("behaviour", {
	"whitelist":		{ dvalue: false, type: Boolean },
	"instance":		{ dvalue: "", type: String },
	"table":		{ dvalue: "blocked", type: String },
	"section":		{ dvalue: "upstream", type: String },
	"interface":		{ dvalue: "", type: String }
});
