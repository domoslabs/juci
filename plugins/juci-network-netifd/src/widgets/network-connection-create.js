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
.directive("networkConnectionCreate", function(){
	return {
		templateUrl: "/widgets/network-connection-create.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "networkConnectionCreateModalCtrl"
	}
})
.controller("networkConnectionCreateModalCtrl", function($scope, $tr, gettext, $network){
	$scope.interfaceTypes = [
		{ label: $tr(gettext("Standalone")), value: "" },
		{ label: $tr(gettext("AnyWAN")), value: "anywan"}, 
		{ label: $tr(gettext("Bridge")), value: "bridge"}
	]; 
	$scope.allProtocols = $network.getProtocolTypes();
	$scope.model.type = "";
	$scope.model.protocol = "none";
	$scope.showType = function(){
		if(!$scope.allProtocols) return false;
		var type = $scope.allProtocols.find(function(p){
			return p.value == $scope.model.protocol;
		});
		if(type.physical == false) {
			$scope.model.type = "-";
			return false;
		}
		if(type.value == "none"){
			$scope.model.type = "bridge";
			return false; // unmanaged network is always in bridge
		}
		if(type.value == "pppoe" || type.value == "pppoa"){
			$scope.model.type = "";
			return false;
		}
		return true;
	};
})
