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
.directive("networkConnectionCreateSettings", function(){
	return {
		templateUrl: "/widgets/network-connection-create-settings.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "networkConnectionCreateModalSettingsCtrl"
	}
})
.controller("networkConnectionCreateModalSettingsCtrl", function($scope, $tr, gettext, $network, $firewall){
	$scope.allInterfaceTypes = [
		{ label: $tr(gettext("Standalone")), value: "" },
		{ label: $tr(gettext("Anywan")), value: "anywan" },
		{ label: $tr(gettext("Bridge")), value: "bridge" }
	];
	$scope.$watch("model", function(){
		if($scope.model.iface.proto.value === "none"){
			// do nothing you can't add to zone
		}else if($scope.model.iface.proto.value === "static"){
			$firewall.getLanZones().done(function(zones){
				$scope.AllZones = zones.map(function(zone){ return { label: String(zone.name.value).toUpperCase(), value: zone.name.value }; });
				$scope.$apply();
			});
		}else{
			$firewall.getWanZones().done(function(zones){
				$scope.AllZones = zones.map(function(zone){ return { label: String(zone.name.value).toUpperCase(), value: zone.name.value }; });
				$scope.$apply();
			});
		}
		$scope.allProtocolTypes = $network.getProtocolTypes();
		$rpc.$call("juci.network", "protocols", {}).done(function(data){
			$scope.allProtocols = $scope.allProtocolTypes.filter(function(x){
				if(x.value == "static" || x.value == "none") return false; //should never be there
				return data.protocols.find(function(p){ return p == x.value }) != undefined;
			});
		});
		$scope.model.type = "";
		$scope.model.protocol = "none";
		$scope.$watch("model.iface.proto.value", function(proto){
			if(!proto) return;
			$scope.interfaceTypes = [];
			var protocol = $scope.allProtocolTypes.find(function(p){ return p.value === proto; });
			if(!protocol) return;
			$scope.interfaceTypes = $scope.allInterfaceTypes.filter(function(pr){
				return protocol.physical.find(function(ph){ return ph === pr.value;}) !== undefined;
			});
			if($scope.interfaceTypes.length){
				$scope.model.iface.type.value = $scope.interfaceTypes[0].value;
			}
		}, false);

		$scope.showType = function(){
			var pr = $scope.model.iface.proto.value;
			if(pr === "static" || pr === "none") return true;
			if(!$scope.allProtocols) return false;
			var type = $scope.allProtocols.find(function(p){
				return p.value == $scope.model.iface.proto.value;
			});
			if(!type) return false;
			if(!type.physical.length) {
				return false;
			}
			if(type.value == "pppoe" || type.value == "pppoa"){
				$scope.model.type = "";
				return false;
			}
			return true;
		};
	}, false);
})
