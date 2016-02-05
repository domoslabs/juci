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

UCI.$registerConfig("mcpd"); 
UCI.mcpd.$registerSectionType("mcpd", {
	"igmp_proxy_interfaces": 			{ dvalue: "", type: String }, 
	"igmp_default_version": 			{ type: Number }, 
	"igmp_query_interval": 				{ type: Number },
	"igmp_query_response_interval":		{ type: Number },
	"igmp_last_member_query_interval":	{ type: Number },
	"igmp_robustness_value":			{ type: Number },
	"igmp_max_groups":					{ type: Number },
	"igmp_max_sources":					{ type: Number },
	"igmp_max_members":					{ type: Number },
	"igmp_fast_leave":					{ type: Boolean },
	"igmp_proxy_enable":				{ type: Number },
	"igmp_ssm_range_ignore":			{ dvalue: false, type: Boolean },
	"igmp_snooping_enable":				{ type: Number },
	"igmp_snooping_interfaces":			{ dvalue: "", type: String },
	"igmp_dscp_mark":					{ dvalue: "", type: String },
	"igmp_lan_to_lan_multicast":		{ type: Boolean },
	"igmp_join_immediate":				{ type: Boolean }
});
