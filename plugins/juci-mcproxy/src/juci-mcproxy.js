UCI.$registerConfig("mcproxy"); 
UCI.$registerConfig("network"); 
UCI.mcproxy.$registerSectionType("mcproxy", {
	"disabled":						{ dvalue: true, type: Boolean },
	"protocol":						{ dvalue: "IGMPv2", type: String },
	"query_interval":				{ dvalue: 125, type: Number, validator: UCI.validators.NumberLimitValidator(0, undefined) },
	"query_response_interval":		{ dvalue: 10, type: Number, validator: UCI.validators.NumberLimitValidator(0, undefined) },
	"last_member_query_interval":	{ dvalue: 1, type: Number, validator: UCI.validators.NumberLimitValidator(0, undefined) },
	"robustness_value":				{ dvalue: 2, type: Number },
	"max_groups":					{ dvalue: "", type: Number, validator: UCI.validators.NumberLimitValidator(0, undefined) },
	"max_sources":					{ dvalue: "", type: Number, validator: UCI.validators.NumberLimitValidator(0, undefined) }
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
