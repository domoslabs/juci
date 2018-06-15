/*
 * Copyright (C) 2017 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Alex Oprea <alex.oprea@inteno.se>
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

UCI.$registerConfig("openvpn");
UCI.openvpn.$registerSectionType("openvpn", {
	"enabled":	{ dvalue: false, type: Boolean },
	"auth_user":	{ dvalue: "", type: String },
	"auth_pass":	{ dvalue: "", type: String },
	"config":	{ dvalue: "", type: String }

	/*"client":	{ dvalue: true, type: Boolean },
	"dev":		{ dvalue: "tun", type: String },
	"proto":	{ dvalue: "udp", type: String },
	//"remote":	{ dvalue:  '217.27.188.82 1194', type: x }, //LIST
	"auth":		{ dvalue: "SHA1", type: String },
	"cipher":	{ dvalue: "BF-CBC", type: String },
	"nobind":	{ dvalue: true, type: Boolean },
	"persist_tun":	{ dvalue: "persist-tun", type: String },
	"persist_key":	{ dvalue: "persist-key", type: String },
	"verb":		{ dvalue: "1", type: String },
	"mute":		{ dvalue: "20", type: Number },
	"mute_replay_warnings":	{ dvalue: true, type: Boolean },
	"ns_cert_type":	{ dvalue: "", type: String },
	"comp_lzo":	{ dvalue: "adaptive", type: String },
	"resolv_retry":	{ dvalue: "infinite", type: String },
	"ca":		{ dvalue: "/var/etc/openvpn-ca.crt", type: String },
	"cert":		{ dvalue: "/var/etc/openvpn-client.crt", type: String },
	"key":		{ dvalue: "/var/etc/openvpn-client.key", type: String }
	*/
});
