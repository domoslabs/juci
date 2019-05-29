/*
 * Copyright (C) 2019 iopsys Software Solutions AB. All rights reserved.
 *
 * Author: Vivek Dutta <v.dutta@gxgroup.eu>
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
