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
.controller("networkConnectionCreateModalCtrl", function($scope, $tr, gettext, $network, $firewall){
	$scope.interfaceTypes = [
		{ label: $tr(gettext("Standalone")), value: "" },
		{ label: $tr(gettext("AnyWAN")), value: "anywan"}, 
		{ label: $tr(gettext("Bridge")), value: "bridge"}
	]; 
	$firewall.getZones().done(function(zones){
		$scope.AllZones = zones.map(function(zone){ return { label: String(zone.name.value).toUpperCase(), value: zone.name.value }; });
		$scope.$apply();
	});
	$scope.allProtocolTypes = $network.getProtocolTypes();
	$rpc.$call("juci.network", "run", {"method":"protocols"}).done(function(data){
		$scope.allProtocols = $scope.allProtocolTypes.filter(function(x){
			if(x.value == "static" || x.value == "none") return true; //should allways be there
			return data.protocols.find(function(p){ return p == x.value }) != undefined;
		});
	});
	$scope.model.type = "";
	$scope.model.protocol = "none";
	$scope.evalName = function(){
		if(!$scope.model) return;
		var name = $scope.model.name || "";
		if(name == "") return $tr(gettext("Interface Name is needed"));
		if(!name.match(/^[a-zA-Z0-9]+$/)) return $tr(gettext("Interface names can only contain letters and numbers"));
		if(name.length > 12) return $tr(gettext("Interface name may only be 12 characters long"));
	}
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
