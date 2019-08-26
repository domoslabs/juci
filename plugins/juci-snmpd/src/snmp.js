/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */

UCI.$registerConfig("snmpd"); 
UCI.snmpd.$registerSectionType("snmpd", {
	"enabled":	{ dvalue: false, type: Boolean }
});
UCI.snmpd.$registerSectionType("system", {
	"sysLocation":	{ dvalue: "", type: String },
	"sysContact":	{ dvalue: "", type: String }, 	
	"sysName":		{ dvalue: "", type: String }, 	
	"sysServices":	{ dvalue: "", type: String }, 	
	"sysDescr": 	{ dvalue: "", type: String },
	"sysObjectID": 	{ dvalue: "", type: String } 
}); 
UCI.snmpd.$registerSectionType("agent", {
	"agentaddress": { dvalue: "", type: String }
});
UCI.snmpd.$registerSectionType("com2sec", {
	"secname":	{ dvalue: "", type: String },
	"source":	{ dvalue: "", type: String },
	"community":{ dvalue: "", type: String }
});
UCI.snmpd.$registerSectionType("com2sec6", {
	"secname":	{ dvalue: "", type: String },
	"source":	{ dvalue: "", type: String },
	"community":{ dvalue: "", type: String }
});
UCI.snmpd.$registerSectionType("group", {
	"group":	{ dvalue: "", type: String },
	"version":	{ dvalue: "", type: String },
	"secname":	{ dvalue: "", type: String }
});
UCI.snmpd.$registerSectionType("view", {
	"viewname":	{ dvalue: "", type: String },
	"type":		{ dvalue: "", type: String },
	"oid":		{ dvalue: "", type: String },
	"mask":		{ dvalue: "", type: String }
});
UCI.snmpd.$registerSectionType("access", {
	"group":	{ dvalue: "", type: String },
	"context":	{ dvalue: "", type: String },
	"version":	{ dvalue: "", type: String },
	"level":	{ dvalue: "", type: String },
	"prefix":	{ dvalue: "", type: String },
	"read":		{ dvalue: "", type: String },
	"write":	{ dvalue: "", type: String },
	"notify":	{ dvalue: "", type: String }
});
UCI.snmpd.$registerSectionType("pass", {
	"persist":	{ dvalue: false, type: Boolean },
	"priority":	{ dvalue: "", type: String },
	"miboid":	{ dvalue: "", type: String },
	"program":	{ dvalue: "", type: String }
});
