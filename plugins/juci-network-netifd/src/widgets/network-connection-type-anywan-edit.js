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
.directive("networkConnectionTypeAnywanEdit", function($compile){
	return {
		scope: {
			connection: "=ngModel"
		}, 
		controller: "networkConnectionTypeAnywanEdit", 
		templateUrl: "/widgets/network-connection-type-anywan-edit.html", 
		replace: true
	 };  
})
.controller("networkConnectionTypeAnywanEdit", function($scope, $network, $ethernet, $modal, $tr, gettext){
	$scope.getItemTitle = function(dev){
	
		return dev.name + " ("+dev.device+")"; 
	}
	function updateDevices(net){
		if(!net) return;
		$ethernet.getAdapters().done(function(adapters){
			var filtered = adapters.filter(function(dev){
				return !dev.flags || !dev.flags.split(",").find(function(f){ return f == "NOARP"; });
			})
			var wan = filtered.find(function(dev){ return dev.device.match(/^eth[\d]+\.[\d]+$/); });
			if(wan){
				filtered = filtered.filter(function(dev){return wan.device.split(".")[0] != dev.device; });
			}
			var aptmap = {};
			filtered.map(function(apt){ aptmap[apt.device] = apt; });
			net.$addedDevices = ((net.ifname.value != "")?net.ifname.value.split(" "):[])
				.filter(function(x){return x && x != "" && aptmap[x]; })
				.map(function(x){ 
					// return device and delete it from map so the only ones left are the ones that can be added
					var a = aptmap[x];
					delete aptmap[x]; 
					return { name: a.name, device: a.device, adapter: a }; 
				}); 
			net.$addableDevices = Object.keys(aptmap).map(function(k){ return aptmap[k]; }); 
			$scope.$apply(); 
		}); 
	}; updateDevices($scope.connection); 
	
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
					return $scope.connection.$addableDevices.map(function(x){
						return { label: x.name + " (" + x.device + ")", value: x.device };
					}); 
				}
			}
		});

		modalInstance.result.then(function (device) {
			console.log("Added device: "+JSON.stringify(device)); 
			var keep_device = false; 
			// remove the device from any other interface that may be using it right now (important!); 
			$network.getNetworks().done(function(nets){
				$ethernet.getAdapters().done(function(adapters){
					nets.filter(function(net){ return net.type.value == "anywan"; }).map(function(net){
						net.ifname.value = net.ifname.value.split(" ").filter(function(dev){ 
							if(dev == device && !confirm($tr(gettext("Are you sure you want to remove device "+dev+" from network "+net['.name']+" and use it in this bridge?")))) {
								keep_device = true; 
								return true; 
							}
							else if(dev == device) return false; 
							return true; 
						}).join(" ");
					}); 
					
					if(keep_device) return; 
					
					$scope.connection.ifname.value += " " + device; 
					$scope.connection.ifname.value.split(" ")
						.filter(function(x){ return x != ""; })
						.map(function(dev_name){
							var dev = adapters.find(function(d){ return d.device == dev_name; }); 
						}); 
					updateDevices($scope.connection);
				}); 
			}); 
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}
	
	$scope.onDeleteBridgeDevice = function(adapter){
		if(!adapter) alert(gettext("Please select a device in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device from bridge?"))){
			$scope.connection.ifname.value = $scope.connection.ifname.value.split(" ").filter(function(name){
				return name != adapter.device; 
			}).join(" "); 
			updateDevices($scope.connection); 
		}
	}
}); 
