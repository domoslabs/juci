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

// this control gets pointer to network connection and looks up proper dhcp server entry for it. 

JUCI.app
.directive("networkConnectionDhcpServerSettings", function(){
	return {
		scope: {
			connection: "=ngConnection"
		}, 
		templateUrl: "/widgets/network-connection-dhcp-server-settings.html", 
		controller: "networkConnectionDhcpServerSettings"
	};  
})
.controller("networkConnectionDhcpServerSettings", function($scope, $network, $uci, $tr, gettext){
	$scope.data = {};
	$scope.data.dhcpEnabled = false; 

	function calculatePoolSize(){
		if(!$scope.connection || !$scope.connection.netmask || $scope.connection.netmask.error !== null) return 254;
		var parts = $scope.connection.netmask.value.split(".");
		var total = (((parts[0] << 24)>>>0) + ((parts[1] << 16)>>>0) + ((parts[2] << 8)>>> 0) + (parts[3] >>> 0)>>> 0);
		return (4294967295 - total - 1) >>> 0;
	}

	$scope.$watch("connection.netmask.value", function(value){
		if(!value || !$scope.dhcp) return;
		if($scope.dhcp.start.validator) delete $scope.dhcp.start.validator;
		$scope.dhcp.start.validator = new ( $uci.validators.NumberLimitValidator(1, calculatePoolSize() ) )();
		if($scope.dhcp.limit.validator) delete $scope.dhcp.limit.validator;
		$scope.dhcp.limit.validator = new ( $uci.validators.NumberLimitValidator(1, ( calculatePoolSize() - ($scope.dhcp.start.value - 1) || 0) ) )();
	}, false);

	$scope.$watch("dhcp.start.value", function(value){
		if(!value) return;
		if($scope.dhcp.limit.validator) delete $scope.dhcp.limit.validator;
		$scope.dhcp.limit.validator = new ( $uci.validators.NumberLimitValidator(1, ( calculatePoolSize() - ($scope.dhcp.start.value - 1) || 0) ) )();
	},false);


	$scope.$watch("connection", function(value){
		if(!value) return; 
		$uci.$sync("dhcp").done(function(){
			$scope.dhcp = $uci.dhcp["@dhcp"].find(function(x){
				return x.interface.value == value[".name"] || x[".name"] == value[".name"]; 
			}); 
			$scope.data.dhcpEnabled = $scope.dhcp && !$scope.dhcp.ignore.value; 
			if($scope.dhcp){
				if($scope.dhcp.start.validator) delete $scope.dhcp.start.validator;
				$scope.dhcp.start.validator = new ( $uci.validators.NumberLimitValidator(1, calculatePoolSize() ) )();
				if($scope.dhcp.limit.validator) delete $scope.dhcp.limit.validator;
				$scope.dhcp.limit.validator = new ( $uci.validators.NumberLimitValidator(1, ( calculatePoolSize() - ($scope.dhcp.start.value - 1) || 0) ) )();
			}
			$scope.$apply(); 
		}); 
	}); 
	$scope.$watch("data.dhcpEnabled", function(value){
		if(!$scope.connection || !$scope.connection.proto || $scope.connection.proto.value != "static") return;
		if($scope.dhcp == undefined) {
			console.log("Added new DHCP section");
			if($scope.connection){
				$uci.dhcp.$create({
					".type": "dhcp", 
					".name": $scope.connection[".name"],
					"interface": $scope.connection[".name"],
					"ignore": !value
				}).done(function(dhcp){
					$scope.dhcp = dhcp; 
					if($scope.dhcp.start.validator) delete $scope.dhcp.start.validator;
					$scope.dhcp.start.validator = new ( $uci.validators.NumberLimitValidator(1, calculatePoolSize() ) )();
					if($scope.dhcp.limit.validator) delete $scope.dhcp.limit.validator;
					$scope.dhcp.limit.validator = new ( $uci.validators.NumberLimitValidator(1, ( calculatePoolSize() - ($scope.dhcp.start.value - 1) || 0) ) )();
					$scope.$apply(); 
				}); 
			}
		} else {
			$scope.dhcp.ignore.value = !value; 
		}
	}); 
}); 
