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

JUCI.app
.directive("firewallRuleEdit", function(){
	return {
		scope: {
			rule: "=ngModel"
		},
		controller: "firewallRuleEdit",
		templateUrl: "/widgets/firewall-rule-edit.html"
	};
})
.controller("firewallRuleEdit", function($rootScope, $scope, $firewall, gettext, $tr, $network, networkHostPicker, $uci){
	$scope.data = {};
	$scope.canHideFirewallRule = $rootScope.has_capability("can-hide-firewall-rules");

	$scope.protocolChoices = [
		{ label: "UDP", value: "udp"},
		{ label: "TCP", value: "tcp"},
		{ label: "ICMP", value: "icmp"},
		{ label: "TCP + UDP", value: "tcpudp" },
		{ label: "ESP", value: "esp" }
	];

	$scope.familyChoices = [
		{ label: "Any", value: "any" },
		{ label: "IPv4", value: "ipv4"},
		{ label: "IPv6", value: "ipv6"}
	];
	$scope.targetChoices = [
		{ label: $tr(gettext("ACCEPT")), value: "ACCEPT" },
		{ label: $tr(gettext("REJECT")), value: "REJECT" },
		{ label: $tr(gettext("FORWARD")), value: "FORWARD" },
		{ label: $tr(gettext("DROP")), value: "DROP" }
	];

	$firewall.getZones().done(function(zones){
		$scope.allZones = [];
		$scope.allZones.push({ label: $tr(gettext("Device")), value: "" });
		$scope.allZones.push({ label: $tr(gettext("Any")), value: "*" });
		zones.map(function(x){
			$scope.allZones.push({ label: String(x.name.value).toUpperCase(), value: x.name.value });
		});
	});

	$scope.onSelectSrcHost = function(){
		if(!$scope.rule) return;
		networkHostPicker.show({ net: $scope.rule.src.value }).done(function(client){
			if($scope.data.src_ips.find(function(ip){
				return ip.text == client.ipaddr;
			}) != undefined) return;
			if($scope.testIp({text:client.ipaddr})){
				$scope.data.src_ips.push({text:client.ipaddr});
				$scope.rule.src_mac.value = client.macaddr;
			}
		});
	}

	$scope.onSelectDestHost = function(){
		if(!$scope.rule) return;
		networkHostPicker.show({ net: $scope.rule.dest.value }).done(function(client){
			if($scope.data.dest_ips.find(function(ip){
				return ip.text == client.ipaddr;
			}) != undefined) return;
			if($scope.testIp({text:client.ipaddr})){
				$scope.data.dest_ips.push({text:client.ipaddr});
				$scope.rule.dest_mac.value = client.macaddr;
			}
		});
	}

	$scope.$watch("rule", function(rule){
		if(!rule || !rule.constructor || !rule.constructor || rule.constructor.name !== "UCISection") return;
		$scope.data.src_macs = rule.src_mac.value.map(function(x){ return {text:x}; });
		$scope.data.dest_macs = rule.dest_mac.value.map(function(x){ return {text:x}; });
		$scope.data.dest_ips = rule.dest_ip.value.map(function(x){ return {text:x}; });
		$scope.data.src_ips = rule.src_ip.value.map(function(x){ return {text:x}; });

		$uci.$sync("passwords").done(function(){
			$scope.users = {out:[]};
			$scope.$apply();
			$scope.reloadUsers = function(){
				var all = false;
				var sel = true;
				if(rule["_access_r"].value.length === 0) all = true;
				$scope.users.allUsers = $uci.passwords["@usertype"].map(function(x){
					if(!all) sel = (rule["_access_r"].value.find(function(usr){
						return usr === x[".name"];
					}) !== undefined);
					return { label: x[".name"], value: x[".name"], selected: sel};
				});
			}
			$scope.reloadUsers();
			$scope.$watch("users.out", function(out){
				if(!out) return;
				rule["_access_r"].value = out.map(function(usr){ return usr.value; });
			}, false);
			$scope.$apply();
		});
	});
	$scope.$watch("data.dest_ips", function(ips){
		if(!$scope.rule || !ips) return;
		$scope.rule.dest_ip.value = ips.map(function(x){ return x.text;});
	}, true);
	$scope.$watch("data.src_macs", function(mac){
		if(!$scope.rule || !mac) return;
		$scope.rule.src_mac.value = mac.map(function(x){ return x.text;});
	}, true);
	$scope.$watch("data.dest_macs", function(mac){
		if(!$scope.rule || !mac) return;
		$scope.rule.dest_mac.value = mac.map(function(x){ return x.text;});
	}, true);
	$scope.$watch("data.src_ips", function(ips){
		if(!$scope.rule || !ips) return;
		$scope.rule.src_ip.value = ips.map(function(x){ return x.text;});
	}, true);

	var ipv4 = new $uci.validators.IP4AddressValidator;
	var iprange = new $uci.validators.IP4CIDRValidator;
	var ipv6 = new $uci.validators.IP6AddressValidator;
	var ip6range = new $uci.validators.IP6CIDRValidator;
	var mac = new $uci.validators.MACAddressValidator;

	$scope.testIp = function($tag, target){
		var er = [ipv4.validate({value:$tag.text}), iprange.validate({value:$tag.text}),
			ipv6.validate({value:$tag.text}), ip6range.validate({value:$tag.text})].filter(function(x){ return x !== null; });
		if(er.length === 4){
			if(target === "src") $scope.srcIpErr = $tr(gettext("IP must be ether a valid IPv4 or a valid IPv6 Address"));
			if(target === "dst") $scope.dstIpErr = $tr(gettext("IP must be ether a valid IPv4 or a valid IPv6 Address"));
			return false;
		}
		if(target === "src") $scope.srcIpErr = null;
		if(target === "dst") $scope.dstIpErr = null;
		return true;
	};
	$scope.testMac = function($tag, target){
		var er = mac.validate({value:$tag.text});
		if(er !== null){
			if(target === "src") $scope.srcMacErr = er;
			if(target === "dst") $scope.dstMacErr = er;
			return false;
		}
		if(target === "src") $scope.srcMacErr = null;
		if(target === "dst") $scope.dstMacErr = null;
		return true;
	};
});
