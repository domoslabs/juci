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
.directive("dhcpStaticHostsEdit", function($compile){
	return {
		scope: {
			dhcp: "=ngModel"
		}, 
		templateUrl: "/widgets/dhcp-static-hosts-edit.html", 
		controller: "dhcpStaticHostsEdit", 
		replace: true
	};  
})
.controller("dhcpStaticHostsEdit", function($scope, $network, $uci){
	$scope.$watch("dhcp", function(dhcp){
		if(!dhcp) return; 
		
		$network.getConnectedClients().done(function(clients){
			// we do not sync uci here because we only use this control inside dhcp pages that do that already
			dhcp.staticHosts = $uci.dhcp["@host"].filter(function(host){
				return host.dhcp.value == dhcp[".name"] || host.network.value == dhcp[".name"];  
			}); 
			dhcp.connectedHosts = clients.filter(function(cl){
				// filter out only clients that are connected to network that this dhcp entry is servicing
				//return cl.network == dhcp.interface.value; 
				return true; // for now let's include all of them since the new lua based clients listing does not supply us with "network" field. 
			}).map(function(cl){
				return {
					label: cl.hostname || cl.ipaddr || cl.ip6addr, 
					value: cl
				}; 
			}); 
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.onAddStaticDHCP = function(){
		if(!$scope.dhcp) return; 
		var host = $scope.existingHost || { };
		$uci.dhcp.$create({
			".type": "host", 
			dhcp: $scope.dhcp[".name"], 
			network: $scope.dhcp.interface.value, 
			name: host.hostname ,
			mac: host.macaddr, 
			ip: host.ipaddr,
			duid: host.ip6duid
		}).done(function(section){
			console.log("Added new dhcp section"); 
			$scope.dhcp.staticHosts.push(section); 
			$scope.$apply(); 
		}).fail(function(err){
			console.error("Failed to add new static dhcp entry: "+err); 
		}); 
	}
	$scope.onRemoveStaticDHCP = function(host){
		if(!host || !$scope.dhcp) return; 
		host.$delete().done(function(){
			$scope.dhcp.staticHosts = $scope.dhcp.staticHosts.filter(function(x){ return x.mac.value != host.mac.value; }); 
			$scope.$apply(); 
		}); 
	}
}); 
