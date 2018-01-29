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
.directive("networkDslAtmDeviceEditor", function(){
	return {
		templateUrl: "/widgets/network-dsl-atm-device-editor.html",
		scope: {
			atm: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "networkDslAtmDeviceEditorCtrl"
	};
}).controller("networkDslAtmDeviceEditorCtrl", function($scope, $tr, gettext){
	$scope.link_types = [
		{ label: $tr(gettext("EOA")), value: "eoa" },
		{ label: $tr(gettext("IPOA")), value: "ipoa" },
		{ label: $tr(gettext("PPPOA")), value: "pppoa" }
	];
	$scope.qos_classes = [
		{ label: $tr(gettext("UBR")), value: "ubr" },
		{ label: $tr(gettext("CBR")), value: "cbr" },
		{ label: $tr(gettext("VBR NRT")), value: "vbr-nrt" },
		{ label: $tr(gettext("VBR RT")), value: "vbr-rt" },
		{ label: $tr(gettext("UBR+")), value: "ubr+" }
	];

	$scope.encapsulations = [
		{ label: $tr(gettext("LLC")), value: "llc" },
		{ label: $tr(gettext("VC MUX")), value: "vcmux" }
	];

	$scope.$watch("atm", function(atm){
		if(!atm)
			return;

		$scope.showPCR = function(){
			var qos_class = $scope.atm.qos_class.value;
			return qos_class === "ubr+" || qos_class === "cbr" ||
				qos_class === "vbr-nrt" || qos_class === "vbr-rt";
		}

		$scope.showSCR = function(){ return $scope.atm.qos_class.value === "vbr-nrt" || $scope.atm.qos_class.value === "vbr-rt"; }
		$scope.showMBS = function(){ return $scope.atm.qos_class.value === "vbr-nrt" || $scope.atm.qos_class.value === "vbr-rt"; }
	});
});
