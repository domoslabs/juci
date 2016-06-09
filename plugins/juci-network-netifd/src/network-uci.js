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


UCI.validators.IP6PrefixLengthValidator = function(){
	this.validate = function(field){
		var valid_values = ["no"];
		for(var i = 48; i <= 64; i++){
			valid_values.push(String(i));
		}
		if(field.value == "" || valid_values.find(function(x){ return x == field.value}) != undefined) return null;
		return gettext("valid values are: 'no' and 48-64");
	}
};

UCI.validators.MACListValidator = function(){
	this.validate = function(field){
		if(field.value instanceof Array){
			var errors = []; 
			field.value.map(function(value){
				if(!value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/))
					errors.push(gettext("value must be a valid MAC-48 address")+": "+value); 
			}); 
			if(errors.length) return errors.join(", "); 
		}
		return null; 
	}
}; 

UCI.validators.REQPrefixValidator = function(){
	this.validate = function(field){
		if(field.value == "auto" || field.value == "no") return null; // ok string values
		var number = parseInt(field.value);
		if(number < 65 && number > -1) return null;
		return gettext("Valid values are: auto, no, 0-64");
	}
};

UCI.$registerConfig("network"); 
UCI.network.$registerSectionType("interface", {
	"is_lan":				{ dvalue: '', type: Boolean }, // please stop relying on this!
	"auto": 				{ dvalue: '1', type: Boolean }, // bring up on boot
	"ifname":				{ dvalue: '', type: String }, 
	"device":				{ dvalue: '', type: String }, 
	"proto":				{ dvalue: 'none', type: String }, 
	"ipaddr":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"netmask":				{ dvalue: '', type: String, validator: UCI.validators.IP4NetmaskValidator },
	"gateway":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"ip6addr":				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator }, 
	"ip6gw": 				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },
	"ip6prefix":			{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator }, 
	"ip6gateway":			{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },  
	"ip6assign":			{ dvalue: '', type: Number, validator: UCI.validators.NumberLimitValidator(48, 64) },
	"ip6hint": 				{ dvalue: '', type: String, validator: UCI.validators.IP6HintValidator },
	"clientid": 			{ dvalue: "", type: String },
	"type":					{ dvalue: '', type: String }, 
	"defaultroute":			{ dvalue: true, type: Boolean },	
	"bridge_instance": 		{ dvalue: '', type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"ipv6":					{ dvalue: '', type: Boolean },
	"dns": 					{ dvalue: [], type: Array }, 
	"macaddr":				{ dvalue: "", type: String, validator: UCI.validators.MACAddressValidator }, 
	"mtu":					{ dvalue: "", type: Number },
	"enabled": 				{ dvalue: true, type: Boolean }, 
	//dhcp settings
	"reqopts":				{ dvalue: "", type: String },
	"metric":				{ dvalue: '', type: Number },
	"iface6rd":				{ dvalue: "", type: String },
	"broadcast": 			{ dvalue: '', type: Boolean }, 
	"hostname": 			{ dvalue: "", type: String }, 
	"peerdns": 				{ dvalue: '', type: Boolean }, 
	//ipv6 settings
	"tunlink":				{ dvalue: "", type: String },
	"ip6prefixlen":			{ dvalue: "", type: String, validator: UCI.validators.IP6PrefixLengthValidator },
	"ip4prefixlen":			{ dvalue: "", type: Number },
	"reqprefix":			{ dvalue: "", type: String, validator: UCI.validators.REQPrefixValidator },
	"reqaddress":			{ dvalue: "", type: String },
	// authentication 
	"auth": 				{ dvalue: "", type: String }, 
	"username": 			{ dvalue: "", type: String }, 
	"password": 			{ dvalue: "", type: String }, 
	// ppp settings
	"tunnelid":				{ dvalie: "", type: Number },
	"_update":				{ dvalue: '', type: Boolean },
	"peeraddr":				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"server":				{ dvalue: "", type: String },
	"_keepalive_failure":	{ dvalue: "", type: Number },
	"_keepalive_interval":	{ dvalue: "", type: Number },
	"demand":				{ dvalue: "", type: Number },
	// pppoe settings
	"ac":					{ dvalue: "", type: String },
	// 3g and dongles
	"modem":				{ dvalue: "", type: String },
	"service":				{ dvalue: "", type: String },
	"maxwait":				{ dvalue: "", type: Number },
	"apn": 					{ dvalue: "", type: String }, 
	"pincode": 				{ dvalue: "", type: String },
	"comdev":				{ dvalue: "", type: String },
	"ttl":					{ dvalue: "", type: Number }
}, function(section){
	var name = gettext("Network interface ") + (section[".name"] || section.name || gettext("Unnamed interface"));
	var noPhysical = name + gettext(" has protocol: ") + section.proto.value + gettext(" it needs a physical interface");
	if(!section.proto || !section.proto.value || section.proto.value == "") 
		return name + gettext(" MUST have  a protocol set");
	var errors = [];
	switch (section.proto.value){
		case "none":
			if(section.type.value != "bridge")
				errors.push(name + gettext("is an unmanaged network and need to be setup as a bridge"));
			if(section.ifname.value == "")
				errors.push(name + gettext("is an unmanaged networks and need to have at least one device in bridge"));
			break;
		case "static":
			if(section.ipaddr.value && section.netmask.value){
				var ip = section.ipaddr.value.split("."); 
				if(ip[ip.length - 1] == "0") errors.push(name + gettext(" has an invalid IP address. It can not be a range address (can not end with 0s)!"));
				if(ip[0] == "0") errors.push(name + gettext(" has an invalid IP address it can not start with a '0'!"));
			}
			if((section.ipaddr.value == "" || section.netmask.value == "") && section.ip6addr.value == "")
				errors.push(name + gettext(" needs either ipv4 or ipv6 address"));
			break;
		case "dhcp":
			if(section.ifname.value == "")
				errors.push(noPysical);
			break;
		case "dhcpv6":
			if(section.ifname.value == "")
				errors.push(noPhysical);
			break;
		case "ppp":
			if(section.device.value == "")
				errors.push(noPhysical);
			break;
		case "pppoe":
			if(section.ifname.value == "")
				errors.push(noPhysical);
			break;
		case "pppoa":
			if(section.ifname.value == "")
				errors.push(noPhysical);
			break;
		case "3g":
			if(section.device.value == "")
				errors.push(name + gettext(" has protocol 3G and needs a Modem device"));
			if(section.service.value != "umts" && section.service.value != "umts_only" && section.service.value != "gprs_only" && section.service.value != "evdo")
				errors.push(name + gettext(" has protocol 3G and needs a Service type"));
			if(section.apn.value == "")
				errors.push(name + gettext(" has protocol 3G and needs APN"));
			break;
		case "4g":
			if(section.modem.value == "")
				errors.push(name + gettext(" has protocol 4G and it needs a Device"));
			break;
		case "pptp":
			if(section.server.value == "")
				errors.push(name + gettext(" has protocol Point-to-Point tunnel and needs a VPN Server"));
			break;
		case "6in4":
			if(section.peeraddr.value == "")
				errors.push(name + gettext(" has protocol 6in4 and need a Remote IPv4 address"));
			if(section.ip6addr.value == "")
				errors.push(name + gettext(" has protocol 6in4 and need Local IPv6 address"));
			break;
		case "6to4":
			//no required values for 6to4 interface
			break;
		case "6rd":
			if(section.peeraddr.value == "")
				errors.push(name + gettext(" has protocol IPv6 rapid deployment and it needs a Remote IPv4 address"));
			if(section.ip6prefix.value == "")
				errors.push(name + gettext(" has protocol IPv6 rapid deployment and it needs an IPv6 prefix"));
			if(section.ip6prefixlen.value == "")
				errors.push(name + gettext(" has protocol IPv6 rapid deployment and it needs a IPv6 prefix length"));
			break;
		case "dslite":
			if(section.peeraddr.value == "")
				errors.push(name + gettext(" has protocol DS lite and it needs a DS-Lite AFTR address"));
			break;
		case "l2tp":
			if(section.server.value == "")
				errors.push(name + gettext(" has protcol PPP over L2TP and it needs a L2TP server"));
			if(section.username.value != "" && section.password.value == "")
				errors.push(gettext("Username is set but not password on ") + name);
			break;
		default: 
			errors.push(gettext("Unsupported protocol: ") + section.proto.value);
	}
	if(errors.length > 0) return errors
	return null;
}); 

UCI.network.$registerSectionType("route", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String, validator: UCI.validators.IP4AddressValidator }, 
	"netmask": 				{ dvalue: "", type: String, validator: UCI.validators.IP4AddressValidator }, 
	"gateway": 				{ dvalue: "", type: String, validator: UCI.validators.IP4AddressValidator },
	"metric": 				{ dvalue: 0, type: Number },
	"mtu": 					{ dvalue: "", type: Number }
}, function(section){
	if(!section) return;
	var errors = [];
	if(section.interface.value == "") errors.push(gettext("IPv4 Routes needs an interface"));
	if(section.target.value == "") errors.push(gettext("IPv4 Routes needs a Target"));
	//if(section.netmask.value == "") errors.push(gettext("IPv4 Routes needs a Netmask"));
	//if(section.gateway.value == "") errors.push(gettext("IPv4 Routes needs a Gateway"));
	if(errors.length > 0) return errors;
	return null;
});

UCI.network.$registerSectionType("route6", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String, validator: UCI.validators.IP6AddressValidator }, 
	"gateway": 				{ dvalue: "", type: String, validator: UCI.validators.IP6AddressValidator },
	"metric": 				{ dvalue: 0, type: Number },
	"mtu": 					{ dvalue: "", type: Number }
}, function(section){
	if(!section) return;
	var errors = [];
	if(section.interface.value == "") errors.push(gettext("IPv6 Routes needs an interface"));
	if(section.target.value == "") errors.push(gettext("IPv6 Routes needs a Target"));
	//if(section.gateway.value == "") errors.push(gettext("IPv6 Routes needs a Gateway"));
	if(errors.length > 0) return errors;
	return null;
}); 

UCI.network.$registerSectionType("switch", {
	"name": 	{ dvalue: "", type: String },
	"reset":	{ dvalue: undefined, type: Boolean }, 
	"enable_vlan": { dvalue: true, type: Boolean },
	"enable": 	{ dvalue: false, type: Boolean }
}); 

UCI.network.$registerSectionType("switch_vlan", {
	"displayname": { dvalue: "", type: String },
	"vlan":		{ dvalue: 0, type: Number }, 
	"device": 	{ dvalue: "", type: String },
	"ports": 	{ dvalue: "", type: String }
}); 

UCI.network.$registerSectionType("switch_port_label", {
	"name": 	{ dvalue: "", type: String }, 
	"id": 		{ dvalue: undefined, type: Number }
}); 

UCI.network.$registerSectionType("switch_port", {
	"port": 	{ dvalue: 0, type: Number }, 
	"pvid": 	{ dvalue: 0, type: Number }
}); 

UCI.$registerConfig("hosts");
UCI.hosts.$registerSectionType("host", {
	"device":            { dvalue: "", type: String },
	"ipaddr":               { dvalue: "", type: String },
	"name":             { dvalue: "", type: String },
	"manufacturer":             { dvalue: "", type: String },
	"hostname":		{ dvalue: "", type: String, required: true}, 
	"macaddr":		{ dvalue: "", type: String, match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, required: true}
});

UCI.juci.$registerSectionType("network", {
	"wan4_interface": 	{ dvalue: "wan", type: String }, // default wan4 interface name 
	"wan6_interface": 	{ dvalue: "wan6", type: String }, // default wan6 interface name 
	"voice_interface": 	{ dvalue: "wan", type: String }, 
	"iptv_interface": 	{ dvalue: "wan", type: String }
}); 
