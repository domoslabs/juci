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
.directive("uciWirelessInterfaceMacfilterEdit", function(){
	return {
		templateUrl: "/widgets/uci.wireless.interface.macfilter.edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "uciWirelessInterfaceMacfilterEditController", 
		replace: true, 
		require: "^ngModel"
	}; 
}).controller("uciWirelessInterfaceMacfilterEditController", function($scope, $uci, $wireless){
	$scope.maclist = []; 
	$scope.$watch("interface", function(i){
		if(i.maclist && i.maclist.value){
			i.maclist.value.map(function(addr){
				$scope.maclist.push({macaddr:addr});
			});
		}
	});

	$scope.$watch("maclist", function(maclist){
		if(maclist.length == 0){ return; }

		var validMACs = $scope.maclist.filter(isValidMACAddress);
		maclist.map(function(mac){ mac.error = null; }); //TODO: BUGG? Should be validMACs instead of maclist?
		validMACs.map(function(mac){ mac.error = "Valid MAC Address"; });

		if(isUnAddedMAC(validMACs)){
			addrs = validMACs.map(function(mac){ return mac.macaddr; });
			$scope.interface.maclist.value = addrs;
		}
	},true);

	function isUnAddedMAC(lst){
		for(var i=0; i<lst.length; i++){
			if($scope.interface.maclist.value.indexOf(lst[i].macaddr) == -1){
				return true;
			}
		}
		return false;
	}

	function isValidMACAddress(mac){
		if(mac.macaddr.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) === null){ return false; }
		if(mac.macaddr.length>17){ return false; }
		return true;
	}

	function isInMaclist(mac){
		for(var i=0; i<$scope.maclist.length; i++){
			if($scope.maclist[i].macaddr == mac.macaddr){ return true; }
		}
		return false;
	}
	
	$scope.onDeleteHost = function(host){
		$scope.maclist = ($scope.maclist||[]).filter(function(x) { 
			return x.macaddr != host.macaddr; 
		}); 
		$scope.interface.maclist.value = 
			$scope.interface.maclist.value.filter(function(x) { 
				return x != host.macaddr; 
			}); 
	}
	
	$scope.onAddClients = function(){
		$wireless.getConnectedClients().done(function(clients){
			$scope.client_list = clients.map(function(x){ 
				return {
					checked: $scope.interface.maclist.value.indexOf(x.macaddr)==-1 ? false:true,
					client: { hostname: x.hostname, macaddr: x.macaddr }
				}
			});
			$scope.$apply(); 
		}); 
		$scope.showModal = 1; 
	}
	
	$scope.onAddNewClient = function(){
		$scope.maclist.push({ macaddr: "" }); 
	}
	
	$scope.onAcceptModal = function(){
		if($scope.client_list && $scope.maclist) {
			$scope.client_list.map(function(x){
				if(x.checked){ 
					if(isInMaclist(x.client) == false){
						$scope.maclist.push(x.client);
					}
				}
				else{
					$scope.onDeleteHost(x.client);
				}
			}); 
		}
		$scope.showModal = 0; 
	}
	
	$scope.onDismissModal = function(){
		$scope.showModal = 0; 
	}
}); 
