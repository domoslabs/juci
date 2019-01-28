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
		controller: "WiFiDeviceEditController", 
		replace: true, 
		require: "^ngModel"
	};  
}).controller("WiFiDeviceEditController", function($scope, $localStorage, $rpc, $tr, gettext, $wireless){

	$scope.showExpert = $localStorage.getItem("mode") == "expert";
	$wireless.getUplinkType().done(function(res){
		$scope.netmodes = res;
	});

	function updateChannels() {
		$rpc.$call("juci.wireless", "get_channels",{
			radio:$scope.device[".name"],
			bandwidth:$scope.device.bandwidth.value,
			dfsc:$scope.device.dfsc.value
		}).done(function(result) {
			$scope.allChannels = [{ label:$tr(gettext("Auto")), value: "auto" }].concat(result.channels.map(function(x){ return { label: x, value: x }; })); 

			var maxValue = $scope.allChannels[$scope.allChannels.length-1].value;
			var currentValue = $scope.device.channel.value;

			if(currentValue > maxValue) {
				$scope.device.channel.value = maxValue;
			}

			$scope.$apply();
		}).fail(function(error) {
			console.log("Could not get access to juci.wireless get_channels: "+error)
		});
	}

	$scope.$watch("device", function(device){
		if(!device) return;

		updateChannels();

		$rpc.$call("router.wireless", "radios").done(function(result){
			if(device[".name"] in result){
				var settings = result[device[".name"]]; 
				if(settings.channels) $scope.allChannels = [{ label:$tr(gettext("Auto")), value: "auto" }].concat(settings.channels.map(function(x){ return { label: x, value: x }; })); 
				if(settings.hwmodes) $scope.allModes = [{ label:$tr(gettext("Auto")), value: "auto" }].concat(settings.hwmodes.map(function(x){ return { label: $tr(x), value: x }; }));
				if(settings.bwcaps) $scope.allBandwidths = settings.bwcaps.map(function(x){ return { label: x, value: x }; });
			}
			$scope.$apply(); 
		});

		$scope.$watchGroup(['device.bandwidth.value', 'device.dfsc.value'], function() {
			if(!$scope.device) return;
				updateChannels();
		});
	}); 
	//make these available for translation
	gettext("11a"); // $tr anslated above
	gettext("11ac"); // $tr anslated above
	gettext("11b"); // $tr anslated above
	gettext("11bg"); // $tr anslated above
	gettext("11g"); // $tr anslated above
	gettext("11n"); // $tr anslated above
}); 
