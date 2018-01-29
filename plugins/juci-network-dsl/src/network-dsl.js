/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Martin K. Schröder <mkschreder.uk@gmail.com>
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

if (!UCI.dsl)
	UCI.$registerConfig("dsl");

UCI.dsl.$registerSectionType("dsl-line", {
	"mode":		{ dvalue: [], type: Array },
	"profile":	{ dvalue: [], type: Array },
	"bitswap":	{ dvalue: true, type: Boolean },
	"sra":		{ dvalue: true, type: Boolean },
	// "trellis":	{ dvalue: true, type: Boolean },
	// "sesdrop":	{ dvalue: true, type: Boolean },
	"usb0":		{ dvalue: true, type: Boolean }
}, function(section){
	return null;
});

UCI.dsl.$registerSectionType("atm-device", {
	"name":		{ dvalue: "ATM", type: String },
	"vpi":		{ dvalue: 8, type: Number },
	"vci":		{ dvalue: 35, type: Number },
	"device":	{ dvalue: "atm0", type: String },
	"link_type":	{ dvalue: "eoa", type: String },
	"encapsulation":{ dvalue: "llc", type: String },
	"qos_class":	{ dvalue: "ubr", type: String },
	"pcr":		{ dvalue: "", type: Number },
	"scr":		{ dvalue: "", type: Number },
	"mbs":		{ dvalue: "", type: Number }
}, function(section){
	return null;
});

UCI.dsl.$registerSectionType("ptm-device", {
	"name":		{ dvalue: "PTM", type: String },
	"device":	{ dvalue: "ptm0", type: String },
	"priority":	{ dvalue: 1, type: Number },
	"portid": 	{ dvalue: 1, type: Number }
}, function(section){
	return null;
});
