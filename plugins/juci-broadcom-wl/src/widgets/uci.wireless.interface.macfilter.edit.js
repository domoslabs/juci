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
			i.maclist.value.map(function(macaddr){
				$scope.maclist.push({macaddr:macaddr});
			});
		}
	});

	$scope.$watch("maclist", function(maclist){
		if(maclist.length == 0){ return; }

		var validMACs = $scope.maclist.filter(isValidMACAddress);
		maclist.map(function(mac){ mac.error = null; });
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

/*	
	// watch for model change
	$scope.$watch("interface", function(i){
		$scope.maclist = []; 
		console.log("Syncing interface.."); 
		if(i.maclist && i.maclist.value){
			i.maclist.value.map(function(mac){
				var added = { hostname: "", macaddr: mac}; 
				$uci.hosts["@all"].map(function(host){
					console.log("testing host "+host.hostname.value); 
					if(host.macaddr.value == mac){
						added = { hostname: host.hostname.value, macaddr: mac}; 
					}
				}); 
				added.maclist = i.maclist; 
				$scope.maclist.push(added); 
			});
			//$scope.$apply();  
		}
	}); 

	$scope.$watch("maclist", function(){
		if(!$scope.maclist){ return; }
		alert("MACLIST");
		console.log($scope);

	},true);
	
	// watch maclist for changes by the user
	$scope.rebuildMacList = function(){
		if($scope.interface){
			var newlist = $scope.maclist.map(function(x){
				var found = false; 
				console.log("Looking for mac "+x.macaddr); 
				$uci.hosts["@host"].map(function(host){
					if(host.macaddr.value == x.macaddr) {
						console.log("Setting hostname "+x.hostname+" on "+x.macaddr); 
						host.hostname.value = x.hostname; 
						found = true; 
					}
				}); 
				if(!found){
					$uci.hosts.$create({ 
						".type": "host", 
						hostname: x.hostname, 
						macaddr: x.macaddr
					}).done(function(host){
						console.log("Added new host to database: "+host.macaddr.value); 
					}); 
				}
				return x.macaddr || "";  
			}); 
			$scope.interface.maclist.value = newlist;  
		}
	}; 
	*/
	
	
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
					checked: false, 
					client: { hostname: x.hostname, macaddr: x.macaddr }
				}
			});
			$scope.$apply(); 
			console.log($scope.client_list);
		}); 
		// reset all checkboxes 
		//if($scope.client_list){
		//	$scope.client_list.map(function(x){ x.checked = false; }); 
		//}
		$scope.showModal = 1; 
	}
	
	$scope.onAddNewClient = function(){
		$scope.maclist.push({ macaddr: "" }); 
	}
	
	$scope.onAcceptModal = function(){
		if($scope.client_list && $scope.maclist) {
			$scope.client_list.map(function(x){
				$scope.maclist.push(x.client);
				//if(x.checked) {
				//	if($scope.maclist.filter(function(a) { return a.macaddr == x.client.macaddr; }).length == 0){
				//		$scope.maclist.push({ macaddr: x.client.macaddr }); 
				//		$scope.rebuildMacList(); 
				//	} else {
				//		console.log("MAC address "+x.client.macaddr+" is already in the list!"); 
				//	}
				//}
			}); 
		}
		$scope.showModal = 0; 
	}
	
	$scope.onDismissModal = function(){
		$scope.showModal = 0; 
	}
}); 
