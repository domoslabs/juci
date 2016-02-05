/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
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
.directive("juciInputPort", function () {
	return {
		templateUrl: "/widgets/juci-input-port.html",
		restrict: 'E',
		replace: true,
		scope: {
			ngModel: "=ngModel", 
			portRange: "="
		},
		require: "ngModel", 
		controller: "juciInputPort"
	};
})
.controller("juciInputPort", function($scope, $log, $parse, $attrs) {
	$scope.startPort = ""; 
	$scope.endPort = ""; 
	$scope.port = ""; 
	
	var ngModel = $parse($attrs.ngModel); 

	$scope.$watch("ngModel", function(value){
		if(value == undefined) return; 
		if($scope.portRange && value && value.split){
			var parts = value.split("-"); 
			$scope.startPort = parts[0]||""; 
			$scope.endPort = parts[1]||""; 
		} else {
			$scope.port = value; 
		}
	}); 
	(function(){
		function updateModel(value){
			// IMPORTANT: in angular, if model is null then doing ngModel.assign($scope.$parent.. ) will corrupt parent model!!!
			// so always check if model is not null before updating model!
			if($scope.ngModel == undefined) return; 
			if($scope.portRange) {
				ngModel.assign($scope.$parent, $scope.startPort + "-" + $scope.endPort); 
				$scope.port = $scope.startPort; 
			} else {
				// filter out anything that is not a number
				ngModel.assign($scope.$parent, $scope.port); 
				$scope.endPort = ""; 
				$scope.startPort = $scope.port; 
			}
		}
		$scope.$watch("startPort", updateModel); 
		$scope.$watch("endPort", updateModel); 
		$scope.$watch("port", updateModel); 
	})(); 
});
