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
.controller("firewallRuleEdit", function($scope, $firewall, gettext, $tr, $network, networkHostPicker, $uci){
	$scope.data = {};
	
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
		{ label: gettext("ACCEPT"), value: "ACCEPT" }, 
		{ label: gettext("REJECT"), value: "REJECT" }, 
		{ label: gettext("FORWARD"), value: "FORWARD" },
		{ label: gettext("DROP"), value: "DROP" }
	]; 
	
	$firewall.getZones().done(function(zones){
		$scope.allZones = []; 
		$scope.allZones.push({ label: $tr(gettext("Unspecified")), value: "" }); 
		$scope.allZones.push({ label: $tr(gettext("Any")), value: "*" }); 
		zones.map(function(x){
			$scope.allZones.push({ label: String(x.name.value).toUpperCase(), value: x.name.value }); 
		}); 
	}); 
	
	function update(){
	}
	
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
		if(!rule) return; 
		var rule = $scope.rule; 
		$scope.data.dest_ips = rule.dest_ip.value.map(function(x){ return {text:x}; });
		$scope.data.src_ips = rule.src_ip.value.map(function(x){ return {text:x}; });
	}); 
	$scope.$watch("data.dest_ips", function(ips){
		if(!$scope.rule || !ips) return;
		$scope.rule.dest_ip.value = ips.map(function(x){ return x.text;});;
	}, false);
	$scope.$watch("data.src_ips", function(ips){
		if(!$scope.rule || !ips) return;
		$scope.rule.src_ip.value = ips.map(function(x){ return x.text;});;
	}, false);

	var ipv4 = new $uci.validators.IP4AddressValidator;
	var iprange = new $uci.validators.IP4CIDRValidator;
	var ipv6 = new $uci.validators.IP6AddressValidator;
	var ip6range = new $uci.validators.IP6CIDRValidator;

	$scope.testIp = function($tag){
		if(ipv4.validate({value:$tag.text}) == null || iprange.validate({value:$tag.text}) == null || 
			ipv6.validate({value:$tag.text}) == null || ip6range.validate({value:$tag.text}) == null) return true;
		return false;
	};
			
}); 
