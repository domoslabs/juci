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
.directive("firewallMaclistEdit", function($compile){
	return {
		templateUrl: "/widgets/firewall-maclist-edit.html", 
		scope: {
			macList: "=ngModel"
		}, 
		controller: "firewallMaclistEdit", 
		replace: true
	 };  
})
.controller("firewallMaclistEdit", function($scope, $config, $uci, $rpc, $network, $localStorage, $state, gettext){ 
	$network.getConnectedClients().done(function(clients){
		$scope.connectedHosts = clients.map(function(client){
			return { 
				label: (client.hostname)?(client.hostname +" ("+client.ipaddr+")"):client.ipaddr, 
				value: client.macaddr 
			}; 
		}); 
		$scope.$apply(); 
	});
	
	$scope.validateMAC = function(mac){ 
		return (new UCI.validators.MACAddressValidator()).validate({ value: mac }); 
	}
	$scope.onAddMAC = function(){
		$scope.macList.push({mac: ""}); 
	}
	
	$scope.onDeleteMAC = function(mac){
		$scope.macList.find(function(x, i){
			if(x.mac == mac) {
				$scope.macList.splice(i, 1); 
				return true; 
			} 
			return false; 
		});  
	}
	
	$scope.onSelectExistingMAC = function(value){
		if(!$scope.macList.find(function(x){ return x.mac == value}))
			$scope.macList.push({mac: value}); 
		$scope.selectedMAC = ""; 
	}
}); 


			
