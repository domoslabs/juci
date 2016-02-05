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
.directive("uciFirewallRuleEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/uci.firewall.rule.edit.html", 
		scope: {
			ngModel: "=ngModel"
		}, 
		controller: "uciFirewallRuleEdit", 
		replace: true
	 };  
}).controller("uciFirewallRuleEdit", function($scope, $uci, $rpc, $network, $log, $tr, gettext){
	$scope.$watch("ngModel", function(value){
		if(!value) return; 
		var ngModel = value; 
		if(ngModel && ngModel.src_dport && ngModel.dest_port && ngModel.src_dport.value && ngModel.dest_port.value){
			$scope.portIsRange = (ngModel.src_dport.value.indexOf("-") != -1) || (ngModel.dest_port.value.indexOf("-") != -1); 
		}
	}); 
	$scope.protocolChoices = [
		{ label: $tr(gettext("UDP")), value: "udp" }, 
		{ label: $tr(gettext("TCP")), value: "tcp" }, 
		{ label: $tr(gettext("TCP + UDP")), value: "tcpudp" }
	]; 
	$scope.rangeTypes = [
		[false, $tr(gettext('Port'))], 
		[true, $tr(gettext('Port range'))]
	]; 
	
	$scope.deviceChoices = [];
	$network.getConnectedClients().done(function(clients){
		var choices = []; 
		clients.map(function(c) {
			choices.push({
				label: (c.hostname && c.hostname.length)?c.hostname:c.ipaddr, 
				value: c.ipaddr
			}); 
		}); 
		$scope.deviceChoices = choices; 
		$scope.$apply(); 
	});
	$scope.onPortRangeClick = function(value){
		$scope.portIsRange = value;  
	}
}); 
