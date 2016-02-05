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
.directive("uciWirelessDeviceEdit", function($compile){
	return {
		templateUrl: "/widgets/uci.wireless.device.edit.html", 
		scope: {
			device: "=ngModel"
		}, 
		controller: "WifiDeviceEditController", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("WifiDeviceEditController", function($scope, $rpc, $tr, gettext){
	$scope.$watch("device", function(device){
		if(!device) return; 
		
		$rpc.juci.wireless.radios().done(function(result){
			if(device[".name"] in result){
				var settings = result[device[".name"]]; 
				$scope.allChannels = [{ label: $tr(gettext("Auto")), value: "auto" }].concat(settings.channels).map(function(x){ return { label: x, value: x }; }); 
				$scope.allModes = [{ label: $tr(gettext("Auto")), value: "auto" }].concat(settings.hwmodes).map(function(x){ return { label: $tr(x), value: x }; }); ; 
				$scope.allBandwidths = settings.bwcaps.map(function(x){ return { label: x, value: x }; }); ; 
			} 
			$scope.$apply(); 
		}); 
		
		$rpc.juci.wireless.htmodelist({ device: $scope.device.ifname.value }).done(function(result){
			if(!result || !result.htmodes) return; 
			$scope.allBandwidthModes = Object.keys(result.htmodes).filter(function(k){ return result.htmodes[k]; }).map(function(x){
				return { label: x, value: x }; 
			}); 
			$scope.$apply(); 
		}); 
		
		$rpc.juci.wireless.freqlist({ device: $scope.device.ifname.value }).done(function(result){
			if(!result || !result.channels) return; 
			$scope.allChannels = result.channels.map(function(ch){
				return { label: $tr(gettext("Channel")) + " " + ch.channel + " (" + (ch.mhz / 1000) + "Ghz)", value: ch.channel }; 
			}); 
			$scope.$apply(); 
		}); 

		$rpc.juci.wireless.countrylist({ device: $scope.device.ifname.value }).done(function(result){
			$scope.regChoices = result.countries.sort(function(a, b){
				if(a.name < b.name) return -1; 
				else if(a.name > b.name) return 1; 
				return 0; 
			}).map(function(x){
				return { label: x.name, value: x.ccode }; 
			}); 
			$scope.$apply(); 
		}); 

	}); 
	
}); 
