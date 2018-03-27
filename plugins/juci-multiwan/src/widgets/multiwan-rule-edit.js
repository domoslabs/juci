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

JUCI.app.directive("multiwanRuleEdit", function(){
	return {
		scope: {
			model: "=ngModel"
		},
		templateUrl: "/widgets/multiwan-rule-edit.html",
		controller: "multiwanRuleEdit",
		replace: "true",
		require: "^ngModel"
	}
}).controller("multiwanRuleEdit", function($scope, $uci, $tr, gettext, $network, $firewall){

	$uci.$sync("multiwan").done(function(){
		$scope.multiwan = $uci.multiwan;
		$scope.allInterfaces = $uci.multiwan["@interface"].map(function(x){
			return { label: x[".name"], value: x[".name"] };
		});
		$scope.allInterfaces.push({ label: "Load Balancer (Best Compatibility)", value: "balancer" });
		$scope.allInterfaces.push({ label: "Fast Balancer (Best Distribution)", value: "fastbalancer" });
		$scope.wan_uplink = $scope.allInterfaces
		$scope.$apply();
	});

	$firewall.getZoneClients("lan").always(function(clients){
		if(!clients.length) {
			$scope.addresses = [];
			return;
		}
		$scope.addresses = clients.map(function(client){ 
			var name = (!client.hostname || client.hostname == "") ? "" : " (" + client.hostname + ")";
			return { label: client.ipaddr + name, value: client.ipaddr }});
	});
	$scope.addresses = [];
	$scope.protocols = [
		{ label: $tr(gettext("UDP")),	value: "udp" },
		{ label: $tr(gettext("TCP")),	value: "tcp" },
		{ label: $tr(gettext("ICMP")),	value: "icmp" }
	];
	var first = true;
	$scope.$watch("model", function(){
		if(!$scope.model || !first) return;
		if($scope.model.src.value != '')$scope.addresses.push({ label: $scope.model.src.value, value: $scope.model.src.value });
		first = false;
	}, false);
});
