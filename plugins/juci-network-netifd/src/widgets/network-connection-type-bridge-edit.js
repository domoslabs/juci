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
.directive("networkConnectionTypeBridgeEdit", function(){
	return {
		scope: {
			connection: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-type-bridge-edit.html", 
		controller: "networkConnectionTypeBridgeEdit", 
		replace: true
	};
})
.controller("networkConnectionTypeBridgeEdit", function($rootScope, $scope, $network, $modal, $tr, gettext, $uci, $networkHelper, $juciConfirm){
	$scope.getItemTitle = function(dev){
		return dev.name + " ("+dev.device+")"; 
	}
	function updateDevices(net){
		if(!net) return;
		$network.getAdapters().done(function(adapters){
			var filtered = adapters.filter(function(ad){ return ad.type !== "eth-bridge" && ad.device;});
			var aptmap = {};
			if(net.is_lan && net.is_lan.value){
				filtered = filtered.filter(function(dev){
					return dev.direction !== "Up";
				});
			}
			filtered.map(function(apt){ aptmap[apt.device] = apt; });
			net.$addedDevices = ((net.ifname.value != "")?net.ifname.value.split(" "):[])
				.filter(function(x){return x && x != "" && aptmap[x]; })
				.map(function(x){ 
					// return device and delete it from map so the only ones left are the ones that can be added
					var a = aptmap[x];
					delete aptmap[x]; 
					return { name: a.name, device: a.device, adapter: a }; 
				}); 
			net.$addableBridgeDevices = Object.keys(aptmap).map(function(k){ return aptmap[k]; }); 
			$scope.$apply(); 
		}); 
	}
	updateDevices($scope.connection); 
	
	$scope.$watch("connection", function(value){
		if(!value) return; 
		updateDevices(value); 	
	});
	
	$scope.onAddBridgeDevice = function(){
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'widgets/bridge-device-picker.html',
			controller: 'bridgeDevicePicker',
			resolve: {
				devices: function () {
					return $scope.connection.$addableBridgeDevices.map(function(x){
						return { label: x.name + " (" + x.device + ")", value: x.device };
					}); 
				}
			}
		});

		modalInstance.result.then(function (device) {
			console.log("Added device: "+JSON.stringify(device)); 
			$networkHelper.addDevice($scope.connection, device).done(function(){
				updateDevices($scope.connection);
			});
		}, function () {
			//console.log('Modal dismissed at: ' + new Date());
		});
	}
	
	$scope.onDeleteBridgeDevice = function(adapter){
		if(!adapter) alert($tr(gettext("Please select a device in the list!")));
		$juciConfirm.show($tr(gettext("Are you sure you want to delete this device from bridge?"))).done(function(){
			if(adapter.device && (adapter.device.match(/^wl.+/) || adapter.device.match(/^ra.+/))){
				$uci.$sync("wireless").done(function(){
					var wliface = $uci.wireless["@wifi-iface"].find(function(iface){
						return iface.ifname.value == adapter.device;
					});
					if(wliface){
						wliface.network.value = "none"; 
					}
					$scope.$apply();
				});
			}
			$scope.connection.ifname.value = $scope.connection.ifname.value.split(" ").filter(function(name){
				return name != adapter.device; 
			}).join(" "); 
			updateDevices($scope.connection); 
		});
	}
}); 
