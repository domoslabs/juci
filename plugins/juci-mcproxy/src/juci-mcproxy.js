UCI.$registerConfig("mcproxy"); 
UCI.$registerConfig("network"); 
UCI.mcproxy.$registerSectionType("mcproxy", {
	"disabled":		{ dvalue: true, type: Boolean },
	"protocol":		{ dvalue: "", type: String },
	"qi":		{ dvalue: '', type: Number },
	"qri":		{ dvalue: '', type: Number },
	"lmqi":		{ dvalue: '', type: Number },
	"rv":		{ dvalue: '', type: Number },
	"maxgroup":		{ dvalue: '', type: Number },
	"maxsources":		{ dvalue: '', type: Number }
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
