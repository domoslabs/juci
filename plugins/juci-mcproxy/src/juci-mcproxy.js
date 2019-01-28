UCI.$registerConfig("mcproxy"); 
UCI.$registerConfig("network"); 
UCI.mcproxy.$registerSectionType("mcproxy", {
	"disabled":		{ dvalue: true, type: Boolean },
	"protocol":		{ dvalue: "", type: String }
}); 
UCI.mcproxy.$registerSectionType("instance", {
	"disabled":		{ dvalue: true, type: Boolean },
	"name":		{ dvalue: "", type: String },
	"upstream":		{ dvalue: [], type: Array },
	"downstream":		{ dvalue: [], type: Array }
}); 
