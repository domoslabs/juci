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

UCI.$registerConfig("dhcp"); 
UCI.dhcp.$registerSectionType("dnsmasq", {
	"domainneeded":		{ dvalue: true, type: Boolean },
	"dhcpleasemax":		{ dvalue: undefined, type: Number },
	"boguspriv":		{ dvalue: true, type: Boolean },
	"localise_queries":	{ dvalue: true, type: Boolean },
	"rebind_protection":{ dvalue: false, type: Boolean },
	"rebind_localhost":	{ dvalue: false, type: Boolean },
	"dnsforwardmax":	{ dvalue: undefined, type: Number },
	"rebind_domain":	{ dvalue: [], type: Array },
	"ednspacket_max":	{ dvalue: undefined, type: Number },
	"local":			{ dvalue: "", type: String, required: true},
	"port":				{ dvalue: 53, type: Number },
	"domain":			{ dvalue: "", type: String, required: true},
	"logqueries":		{ dvalue: false, type: Boolean },
	"filterwin2k":		{ dvalue: false, type: Boolean },
	"queryport":		{ dvalue: undefined, type: Number },
	"addnhosts":		{ dvalue: [], type: Array },
	"bogusnxdomain":	{ dvalue: [], type: Array },
	"server":			{ dvalue: [], type: Array },
	"noresolv":			{ dvalue: false, type: Boolean },
	"nonegcache":		{ dvalue: false, type: Boolean },
	"strictorder":		{ dvalue: false, type: Boolean },
	"expandhosts":		{ dvalue: true, type: Boolean },
	"authoritative":	{ dvalue: true, type: Boolean },
	"readethers":		{ dvalue: true, type: Boolean },
	"leasefile":		{ dvalue: "/tmp/dhcp.leases", type: String },
	"resolvfile":		{ dvalue: "/tmp/resolv.conf.auto", type: String }
});
UCI.dhcp.$registerSectionType("dhcp", {
	//"interface":		{ dvalue: "", type: String, required: true},
	//"start":		{ dvalue: 100, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	//"limit":		{ dvalue: 150, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	//"leasetime":		{ dvalue: "12h", type: String, required: true},
	//"ignore":		{ dvalue: false, type: Boolean },


//	"dhcp_option": 		{ dvalue: "", type: String },
	"dhcp_option": 		{ dvalue: [], type: Array },
	"dynamicdhcp":		{ dvalue: true, type: Boolean },
	"force":		{ dvalue: false, type: Boolean },
	"ignore":		{ dvalue: false, type: Boolean },
	"dhcpv6":		{ dvalue: "", type: String },
	"ra":			{ dvalue: "", type: String },
	"ndp":			{ dvalue: "", type: String },
	"master":		{ dvalue: false, type: Boolean },
	"interface":		{ dvalue: "", type: String, required: true },
	"leasetime":		{ dvalue: "12h", type: String, required: true },
	"limit":		{ dvalue: 150, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	"networkid":		{ dvalue: "", type: String },
	"start":		{ dvalue: 100, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) }
});
UCI.dhcp.$registerSectionType("domain", {
	"name":		{ dvalue: [], type: Array },
	"ip":		{ dvalue: "", type: String },  // TODO: change to ip address
	"family":	{ dvalue: "ipv4", type: String, required: true },
	"network":	{ dvalue: "", type: String}
});
UCI.dhcp.$registerSectionType("host", {
	"name":		{ dvalue: "", type: String },
	"dhcp":		{ dvalue: "", type: String },
	"network":	{ dvalue: "lan", type: String }, 
	"mac":		{ dvalue: "", type: String, required: true, validator: UCI.validators.MACAddressValidator },
	"ip":		{ dvalue: "", type: String, required: true, validator: UCI.validators.IPAddressValidator },  // TODO: change to ip address
	"duid": 	{ dvalue: "", type: String }, 
	"hostid": 	{ dvalue: "", type: String }
}); 

JUCI.app.factory("lanIpFactory", function($firewall, $tr, gettext){
	return {
		getIp: function(network){
			var deferred = $.Deferred();
			if(!network){
				return deferred.reject("no network given");
			}
			var res = { ipv6:"LAN does not have IPv6 configured", ipv4:"LAN does not have IPv4 configured"};
			$firewall.getZoneNetworks(network).done(function(networks){
				if(networks.length == 0 || !networks[0].$info) return;
				if(networks[0].$info["ipv4-address"].length != 0 && networks[0].$info["ipv4-address"][0].address){
					res.ipv4 = networks[0].$info["ipv4-address"][0].address;
				}
				if(networks[0].$info["ipv6-address"].length == 0 || !networks[0].$info["ipv6-address"][0].address){
					if(networks[0].$info["ipv6-prefix-assignment"].length != 0 && networks[0].$info["ipv6-prefix-assignment"][0].address){
						res.ipv6 = networks[0].$info["ipv6-prefix-assignment"][0].address + "1";
					}else{ 
						res.ipv6 = $tr(gettext("LAN does not have IPv6 configured"));
					}
				}else{
					res.ipv6 = networks[0].$info["ipv4-address"][0].address;
				}
				deferred.resolve(res);
			});
			return deferred;
		}
	}
});
	
