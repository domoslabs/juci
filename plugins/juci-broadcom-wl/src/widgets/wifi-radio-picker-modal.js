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
.controller("WiFiRadioPickerModal", function($scope, $modalInstance, $wireless, interfaces, $tr, gettext){
	$scope.data = {}; 
	$scope.interfaces = interfaces; 
	
	$scope.allModes = [
		{ label: $tr(gettext("Access Point (AP)")), value: "ap" }, 
		{ label: $tr(gettext("Client (STA)")), value: "sta" }
	]; 
	
	$wireless.getInterfaces().done(function(interfaces){
		$wireless.getDevices().done(function(devices){
			var fullRadios = devices.filter(function(dev){ 
				var radiotyppe = interfaces.filter(function(intf){ return intf.device.value == dev[".name"]; });
				if(radiotyppe.length > 3) return true;
				return false
			}).map(function(x){ return x[".frequency"]; });
			$scope.allRadios = devices.filter(function(dev){
				return fullRadios.find(function(radio){ return radio == dev[".frequency"] }) == undefined;
			}).map(function(x){
				return { label: x[".frequency"] + " (" + x[".name"] + ")", value: x[".name"] };
			});
			if($scope.allRadios.length){
				$scope.data.radio = $scope.allRadios[0].value;
			}
			$scope.$apply();
		});
	}); 
  $scope.ok = function () {
		$scope.errors = []; 
		if(($scope.interfaces.find(function(x){ return x.ssid.value == $scope.data.ssid && x.device.value == $scope.data.radio; }) && !confirm($tr(gettext("Are you sure you want to create a new SSID with the same name and on the same radio? This may result in undefined behaviour!"))))){
			return;
		} 
		if(!$scope.data.radio){
			$scope.errors.push("Please select a radio!"); 
		} 
		if(!$scope.data.ssid || $scope.data.ssid == ""){
			$scope.errors.push("SSID can not be empty!"); 
		}
		if(!$scope.errors.length) {
			$modalInstance.close($scope.data);
		}
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
