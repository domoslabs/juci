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
.directive("openvpnAddFile", function($modal){
	return {
		templateUrl: 'widgets/openvpn-add-file.html',
		controller: 'openvpnAddFileModel',
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
.controller("openvpnAddFileModel", function($scope){
	$scope.fileChanged = function(){
		$scope.model.file = document.getElementById("configFileSelector");
		$scope.model.config = "";
		$scope.model.error = "";
		$scope.$apply();
	};
	$scope.$watch("model.config", function(m){
		if(!m) return;
		if($scope.model.error) $scope.model.error = "";
	}, false);
})