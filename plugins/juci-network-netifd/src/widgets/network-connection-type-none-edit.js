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
.directive("networkConnectionTypeNoneEdit", function(){
	return {
		scope: {
			interface: "=ngModel"
		},
		templateUrl: "/widgets/network-connection-type-none-edit.html",
		controller: "networkConnectionTypeNoneEdit",
		replace: true
	};
})
.controller("networkConnectionTypeNoneEdit", function($rootScope, $scope, $modal, $tr, gettext, $networkHelper, $network){
	$scope.$watch("interface", function(){
		$network.getAdapters().done(function(devs){
			$network.getNetworks().done(function(nets){
				$scope.baseDevices = devs.filter(function(dev){
					return dev.type !== "eth-bridge" && dev.type !== "atm-device" && dev.type !== "ptm-device";
				}).map(function(dev){
					return { label: dev.name + " (" + dev.device + ")", value: dev.device };
				});
				// Add all other interfaces as aliases
				nets.map(function(net){
					if(!net.$can_edit() || net[".name"] === $scope.interface[".name"]) return;
					$scope.baseDevices.push({ label: $tr(gettext("(Alias)")) + " " + net[".name"], value: "@" + net[".name"] });
				});
				$scope.$apply();
			});
		});
		$scope.onChangeDevice = function(value, oldvalue){
			if(value == oldvalue) return false;
			$networkHelper.addDevice($scope.interface, value).done(function(){
				if(oldvalue.match(/^wl.+/) || oldvalue.match(/^ra.+/)){
					$networkHelper.setNetwork(oldvalue, "none").done(function(){
						$scope.$apply();
					});
				}
			});
			return false;
		};
	}, false);
});
