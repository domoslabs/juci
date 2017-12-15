//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("omcproxy"); 
UCI.omcproxy.$registerSectionType("proxy", {
	"downlink":		{ dvalue: [], type: Array },
	"uplink":		{ dvalue: "", type: String },
	"scope":		{ dvalue: "global", type: String }
}); 
