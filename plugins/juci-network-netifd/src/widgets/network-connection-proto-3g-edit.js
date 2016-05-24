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
.directive("networkConnectionProto3gEdit", function(){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-3g-edit.html", 
		controller: "networkConnectionProto3gEdit", 
		replace: true
	};  
})
.controller("networkConnectionProto3gEdit", function($scope, $network, $modal, $tr, gettext, $rpc){
	$scope.showPass = false;
	$scope.togglePasswd = function(){
		$scope.showPass = !$scope.showPass;
	};
	$rpc.$call("juci.modems", "run", {"method":"list"}).done(function(data){
		$scope.allModemDevices = data.modems.map(function(x){return {label: x, value: x}});
		$scope.$apply();
	});
	$scope.serviceTypes = [
		{ label: $tr(gettext("UMTS/GPRS")),	value: "umts" },
		{ label: $tr(gettext("UMTS only")),	value: "umts_only" },
		{ label: $tr(gettext("GPRS only")),	value: "gprs_only" },
		{ label: $tr(gettext("GPRS only")),	value: "evdo" }
	];
})
.directive("networkConnectionProto3gAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-3g-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
}); 
