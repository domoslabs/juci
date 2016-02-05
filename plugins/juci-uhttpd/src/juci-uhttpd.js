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

UCI.$registerConfig("uhttpd"); 
UCI.uhttpd.$registerSectionType("uhttpd", {
	"home":				{ dvalue: "/www", type: String }, 
	"max_requests":		{ dvalue: false, type: Number }, 
	"max_connections":	{ dvalue: false, type: Number }, 
	"ubus_prefix":		{ dvalue: true, type: String } 
}); 
UCI.uhttpd.$registerSectionType("logopts", {
	"ubus_status":		{ dvalue: [], type: Array },
	"ubus_method": 		{ dvalue: [], type: Array }
});
UCI.uhttpd.$insertDefaults("logopts");
