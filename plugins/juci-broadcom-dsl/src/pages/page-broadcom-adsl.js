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
.controller("PageBroadcomAdsl", function($scope, $uci, $broadcomDsl, gettext){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown"; 
		return dev.name.value + " (" +dev.ifname.value + ")"; 
	}
	$broadcomDsl.getDevices().done(function(devices){
		$scope.adsl_devices = devices.filter(function(dev){
			return dev.type == "adsl"; 
		}).map(function(dev){
			return dev.base; 
		}); 
		$scope.$apply(); 
	}); 
	
	
	$scope.onCreateDevice = function(){
		var baseifname = "atm"; 
		var next_id = 0; 
		// automatically pick an id for the new device
		for(var id = 0; id < 255; id++){ 
			if(!$uci.layer2_interface_adsl["@atm_bridge"].find(function(i){ return String(i.ifname.value).indexOf(baseifname + id) == 0; })){
				next_id = id; 
				break; 
			}
		}
		$uci.layer2_interface_adsl.$create({
			".type": "atm_bridge",
			"name": gettext("New device"), 
			"ifname": baseifname + next_id + ".1", 
			"baseifname": baseifname + next_id
		}).done(function(interface){
			$scope.adsl_devices.push(interface); 
			$scope.$apply(); 
		});
	}
	
	$scope.onDeleteDevice = function(dev){
		if(!dev) alert(gettext("Please select a device in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device?"))){
			dev.$delete().done(function(){
				$scope.adsl_devices = $scope.adsl_devices.filter(function(d){
					return d != dev; 
				}); 
				$scope.$apply(); 
			}); 
		}
	}
}); 
