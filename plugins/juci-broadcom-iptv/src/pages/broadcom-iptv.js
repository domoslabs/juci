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


JUCI.app
.controller("PageBroadcomIptv", function($scope, $tr, $uci, gettext, $network){
	var arrayEquals = function (a1, a2) {
		var i = a1.length;
		if (i != a2.length)
			return false;
		while (i--) {
			if (a1[i] !== a2[i]) return false;
		}
		return true
	}

	$scope.networks = {
		selected_wan: [],
		selected_lan: []
	};
	var ecopy = [];
	$uci.$sync("mcpd").done(function(){
		$scope.loaded = true; 
		if(!$uci.mcpd.mcpd) {
			$scope.$apply(); 
			return; 
		}
		$scope.mcpd = $uci.mcpd.mcpd;
		ecopy = $scope.mcpd.igmp_mcast_snoop_exceptions.value.filter(function () { return true; });
		var proxy_interfaces = $scope.mcpd.igmp_proxy_interfaces.value.split(" ");
		var snooping_interfaces = $scope.mcpd.igmp_snooping_interfaces.value.split(" ");
		$network.getAdapters().done(function(devs){
			$scope.networks.lan = devs.map(function(dev){
				return {
					name:dev.device,
					ticked: (snooping_interfaces.indexOf(dev.device) > -1)
				}
			}).filter(function(dev){ return (!dev.name || !dev.name.match(/^[eap]t[mh]\d\.\d+$/));});
			$scope.$apply();
		});
		$network.getNetworks().done(function(nets){
			$scope.networks.wan = nets.map(function(net){
				return { 
					name:net[".name"], 
					ticked: (proxy_interfaces.indexOf(net[".name"]) > -1)
				}
			});
			$scope.$apply(); 
		});
	}); 
	$scope.$watch('networks', function(){
		if(!$scope.networks.selected_wan || !$scope.networks.selected_lan || !$scope.mcpd) return;
		$scope.mcpd.igmp_proxy_interfaces.value = $scope.networks.selected_wan.map(function(x){return x.name}).join(" ");	
		$scope.mcpd.igmp_snooping_interfaces.value = $scope.networks.selected_lan.map(function(x){return x.name}).join(" ");
	}, true);
	$scope.DSCP = [
		{ label: $tr(gettext("No DSCP")),									value: "" },
		{ label: $tr(gettext("Standard (CS0)")),							value: "CS0" },
		{ label: $tr(gettext("Low-Priority Data")),							value: "CS1" },
		{ label: $tr(gettext("High-Throughput Data")) + " (AF11)",			value: "AF11" },
		{ label: $tr(gettext("High-Throughput Data")) + " (AF12)",			value: "AF12" },
		{ label: $tr(gettext("High-Throughput Data")) + " (AF13)",			value: "AF13" },
		{ label: $tr(gettext("Operation, Administration and Maintenance")),	value: "CS2" },
		{ label: $tr(gettext("Low-Latency Data")) + " (AF21)",				value: "AF21" },
		{ label: $tr(gettext("Low-Latency Data")) + " (AF22)",				value: "AF22" },
		{ label: $tr(gettext("Low-Latency Data")) + " (AF23)",				value: "AF23" },
		{ label: $tr(gettext("Broadcast Video")),							value: "CS3" },
		{ label: $tr(gettext("Multimedia Streamingi")) + " (AF31)",			value: "AF31" },
		{ label: $tr(gettext("Multimedia Streamingi")) + " (AF32)",			value: "AF32" },
		{ label: $tr(gettext("Multimedia Streamingi")) + " (AF33)",			value: "AF33" },
		{ label: $tr(gettext("Realtime Interactive")),						value: "CS4" },
		{ label: $tr(gettext("Multimedia Conferencing")) + " (AF41)",		value: "AF41" },
		{ label: $tr(gettext("Multimedia Conferencing")) + " (AF42)",		value: "AF42" },
		{ label: $tr(gettext("Multimedia Conferencing")) + " (AF43)",		value: "AF43" },
		{ label: $tr(gettext("Signaling")),									value: "CS5" },
		{ label: $tr(gettext("Telephony")),									value: "EF" },
		{ label: $tr(gettext("Network Control")),							value: "CS6" }
	];
	$scope.default_version = [1,2,3].map(function(x){ return { label: $tr(gettext("IGMP version ")) +x, value: x }; });  
	$scope.snooping_mode = [
		{ label: $tr(gettext("Disabled")),	value:0 },
		{ label: $tr(gettext("Standard")),	value:1 },
		{ label: $tr(gettext("Blocking")),	value:2 }
	];

	var mcast = new $uci.validators.IP4MulticastAddressValidator;
	var ip4range = new UCI.validators.IP4MulticastCIDRValidator;
	var ipv6 = new $uci.validators.IP6AddressValidator;
	var ip6range = new $uci.validators.IP6CIDRValidator;

	$scope.onAddIp = function (ip, index) {
		if (!ip)
			return;

		var er = [mcast.validate({ value: ip }), ipv6.validate({ value: ip }), ip6range.validate({ value: ip }), ip4range.validate({ value: ip })].filter(function (x) { return x !== null; })

		if ($scope.mcpd.igmp_mcast_snoop_exceptions.value.includes(ip)) {
			$scope.McastIpErr = $tr(gettext("Address has already been added!"));
			return;
		}

		if (er.length === 4) {
			$scope.McastIpErr = $tr(gettext("Invalid multicast addresses!"));
			return;
		}

		$scope.mcpd.igmp_mcast_snoop_exceptions.value.push(ip);

		$scope.McastIpErr = null;
		$scope.mcpd.igmp_mcast_snoop_exceptions.is_dirty = !arrayEquals($scope.mcpd.igmp_mcast_snoop_exceptions.value, ecopy);
	}

	$scope.onRemoveIp = function (item, index) {
		if (!item) return;
		console.log("item", item);
		$scope.mcpd.igmp_mcast_snoop_exceptions.value = $scope.mcpd.igmp_mcast_snoop_exceptions.value.filter(function(exception) {console.log("exception", exception);return item !== exception })
		$scope.mcpd.igmp_mcast_snoop_exceptions.is_dirty = !arrayEquals($scope.mcpd.igmp_mcast_snoop_exceptions.value, ecopy);
	}


}); 
