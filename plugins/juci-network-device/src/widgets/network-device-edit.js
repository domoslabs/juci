/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
.directive("networkDeviceEdit", function(){
	return {
		templateUrl: "/widgets/network-device-edit.html",
		scope: {
			device: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "networkDeviceEditCtrl"
	};
}).controller("networkDeviceEditCtrl", function($scope, $tr, gettext, $uci){
	$scope.conf = {
		manual_name: false
	};
	$scope.$watch("device", function(dev){
		if(!$scope.device)
			return;
		$scope.conf.manual_name = !(dev.name.value === (dev.ifname.value + "." + dev.vid.value));
		$scope.conf.untagged = dev.type.value === "untagged";
	});
	$scope.types = [
		{ label: $tr(gettext("Untagged")), value: "untagged" },
		{ label: $tr(gettext("802.1 Q")), value: "8021q" },
		{ label: $tr(gettext("802.1 AD")), value: "8021ad" }
	];
	//TODO: dont do this here ask $device for it instead
	$uci.$sync(["ports"/*, "dsl"*/]).done(function(){
		$scope.interfaces = [];
		$uci.ports["@ethport"].forEach(function(port){
			if(port.uplink.value)
				$scope.interfaces.push({label: port.name.value, value: port.ifname.value });
			$scope.$apply();
		});
	});
	$scope.$watchGroup(["device.ifname.value", "device.vid.value"], function(){
		if(!$scope.device || $scope.conf.manual_name)
			return;
		$scope.device.name.value = $scope.device.ifname.value + "." + $scope.device.vid.value;
	});
	$scope.$watch("device.type.value", function(){
		if(!$scope.device)
			return;
		if($scope.device.type.value === "untagged")
			$scope.conf.untagged = true;
		else
			$scope.conf.untagged = false;
	});
}).filter("uppercase", function(string){
	return String(string).toUpperCase();
});
