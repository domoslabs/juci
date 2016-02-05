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
UCI.snmpd.$registerSectionType("mini_snmpd", {
	"enabled":			{ dvalue: false, type: Boolean }, 	
	"community":		{ dvalue: "", type: String }, 	
	"location":			{ dvalue: "", type: String }, 	
	"contact":			{ dvalue: "", type: String }, 	
	"disks":			{ dvalue: "", type: String }, 	
	"interfaces":		{ dvalue: "", type: String }, 	
	"manager_ip":		{ dvalue: "", type: String }, 	
	"name":				{ dvalue: "", type: String }, 	
	"read_community": 	{ dvalue: "", type: String }, 	
	"set_community": 	{ dvalue: "", type: String }
}); 

UCI.snmpd.$registerSectionType("system", {
	"enabled":			{ dvalue: "", type: String },
	"contact":			{ dvalue: "", type: String }, 	
	"manager_ip":		{ dvalue: "", type: String }, 	
	"read_community": 	{ dvalue: "", type: String }, 	
	"set_community": 	{ dvalue: "", type: String },
	"sysLocation": 		{ dvalue: "", type: String }, 
	"sysName":	 		{ dvalue: "", type: String }, 
	"sysContact": 		{ dvalue: "", type: String }, 
	"sysDescr": 		{ dvalue: "", type: String } 
}); 

