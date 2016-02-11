/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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

UCI.$registerConfig("cwmp");
UCI.cwmp.$registerSectionType("cwmp", {
	"url":						{ dvalue: '', type: String },
	"userid":					{ dvalue: '', type: String },
	"passwd":					{ dvalue: '', type: String },
	"periodic_inform_enable":	{ dvalue: true, type: Boolean },
	"periodic_inform_interval":	{ dvalue: 1800, type: Number },
	"periodic_inform_time":		{ dvalue: 0, type: Number },
	"dhcp_discovery":			{ dvalue: 'enable', type: String },
	"default_wan_interface":	{ dvalue: '', type: String },
	"log_to_console":			{ dvalue: 'disable', type: String },
	"log_to_file":				{ dvalue: 'enable', type: String },
	"log_severity":				{ dvalue: 'INFO', type: String },
	"log_max_size":				{ dvalue: 102400, type: Number },
	"port":						{ dvalue: 7547, type: Number },
	"provisioning_code":		{ dvalue: '', type: String }
});
