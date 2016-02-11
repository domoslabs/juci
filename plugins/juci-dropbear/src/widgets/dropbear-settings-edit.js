/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Stefan Nygren <stefan.nygren@hiq.se>
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
.directive("dropbearSettingsEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/dropbear-settings-edit.html",
		scope: {
			dropbear: "=ngModel"
		},
		replace: true,
		controller: "dropbearSettingsEdit",
		require: "^ngModel"
	};
}).controller("dropbearSettingsEdit", function($scope, $rpc, $network){
	$network.getNetworks().done(function(res) {
		$scope.interfaces = res.map(function(x) { return {label:x[".name"].toUpperCase(),value:x[".name"]};});
		$scope.interfaces.push({label:"LOOPBACK",value:"loopback"});
		$scope.interfaces.push({label:"ANY",value:""});
		$scope.$apply();
	});
});

