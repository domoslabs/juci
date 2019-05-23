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

UCI.$registerConfig("ddns");
UCI.ddns.$registerSectionType("service", {
	"enabled":              { dvalue: false, type: Boolean },
	"interface":            { dvalue: "", type: String },
	"use_syslog":           { dvalue: false, type: Boolean },
	"service_name":         { dvalue: "", type: String },
	"domain":               { dvalue: "", type: String },
	"lookup_host":          { dvalue: "", type: String },
	"username":             { dvalue: "", type: String },
	"password":             { dvalue: "", type: String },
	"use_https": 			{ dvalue: false, type: Boolean },
	"force_interval": 		{ dvalue: 72, type: Number }, 
	"force_unit": 			{ dvalue: "hours", type: String },
	"check_interval": 		{ dvalue: 10, type: Number },
	"check_unit": 			{ dvalue: "minutes", type: String }, 
	"retry_interval": 		{ dvalue: 60, type: Number },
	"retry_unit":			{ dvalue: "seconds", type: String },
	"ip_source": 			{ dvalue: "interface", type: String },
	"ip_network": 			{ dvalue: "", type: String },
	"ip_script": 			{ dvalue: "", type: String },
	"ip_url": 				{ dvalue: "", type: String },
	"update_url": 			{ dvalue: "", type: String },
	"use_ipv6":		{ dvalue: 0, type: Boolean }
});
