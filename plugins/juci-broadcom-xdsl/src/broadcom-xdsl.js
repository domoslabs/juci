//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("layer2_interface");
UCI["layer2_interface"].$registerSectionType("dslsettings", {
	"GDmt":		{ dvalue: false, type: Boolean },
	"Glite":	{ dvalue: false, type: Boolean },
	"T1413":	{ dvalue: false, type: Boolean },
	"VDSL2":	{ dvalue: false, type: Boolean },
	"8a":		{ dvalue: false, type: Boolean },
	"8b":		{ dvalue: false, type: Boolean },
	"8c":		{ dvalue: false, type: Boolean },
	"8d":		{ dvalue: false, type: Boolean },
	"12a":		{ dvalue: false, type: Boolean },
	"12b":		{ dvalue: false, type: Boolean },
	"17a":		{ dvalue: false, type: Boolean },
	"30a":		{ dvalue: false, type: Boolean },
	"US0":		{ dvalue: false, type: Boolean },
	"bitswap":	{ dvalue: false, type: Boolean },
	"sra":		{ dvalue: false, type: Boolean },
	"ADSL2":	{ dvalue: false, type: Boolean },
	"AnnexL":	{ dvalue: false, type: Boolean },
	"ADSL2plus":{ dvalue: false, type: Boolean },
	"AnnexM":	{ dvalue: false, type: Boolean }
});
