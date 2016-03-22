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
.directive("uciWirelessDeviceEdit", function(){
	return {
		templateUrl: "/widgets/uci.wireless.device.edit.html", 
		scope: {
			device: "=ngModel"
		}, 
		controller: "WifiDeviceEditController", 
		replace: true, 
		require: "^ngModel"
	};  
}).controller("WifiDeviceEditController", function($scope, $config, $rpc, $tr){
	$scope.showExpert = $config.local.mode == "expert";
	$scope.$watch("device", function(device){
		if(!device) return; 

		$rpc.juci.wireless.radios().done(function(result){
			if(device[".name"] in result){
				var settings = result[device[".name"]]; 
				$scope.allChannels = settings.channels.map(function(x){ return { label: x, value: x }; }); 
				$scope.allModes = settings.hwmodes.map(function(x){ return { label: $tr(x), value: x }; });
				$scope.allBandwidths = settings.bwcaps.map(function(x){ return { label: x, value: x }; });
			} 
			$scope.$apply(); 
		}); 
	}); 
	
}); 
