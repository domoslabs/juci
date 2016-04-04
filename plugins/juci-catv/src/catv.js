//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("catv");
UCI.catv.$registerSectionType("service", {
	"enable":	{ dvalue: "off", type: Boolean },
	"filter": 	{ dvalue: "3", type: String }
});
