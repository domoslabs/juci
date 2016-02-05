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

$juci.app.directive("juciInputTimespan", function () {
	return {
		templateUrl: "/widgets/juci-input-timespan.html",
		restrict: 'E',
		replace: true,
		scope: {
			model: "=ngModel"
		}, 
		controller: "juciInputTimespan"
	};
}).controller("juciInputTimespan", function($scope){
	$scope.data = {
		from: "", to: ""
	}; 
	$scope.validateTime = function(time){
		return (new UCI.validators.TimeValidator()).validate({ value: time }); 
	}
	$scope.validateTimespan = function(time){
		return (new UCI.validators.TimespanValidator()).validate({ value: time }); 
	}
	$scope.$watch("model", function(model){
		if(model && model.value && model.value.split){
			var value = model.value; 
			var parts = value.split("-"); 
			if(parts.length == 2){
				$scope.data.from = parts[0]||""; 
				$scope.data.to = parts[1]||""; 
			} else {
				$scope.data.from = value; 
			}
		} else {
			$scope.data.to = $scope.data.from = ""; 
		}
	}, true); 
	
	(function(){
		function updateTime(value){
			if($scope.model){
				$scope.model.start_time = $scope.data.from; 
				$scope.model.end_time = $scope.data.to; 
				$scope.model.value = ($scope.data.from||"") + "-"+($scope.data.to||""); 
			}
		}
		$scope.$watch("data.from", updateTime); 
		$scope.$watch("data.to", updateTime); 
	})(); 
}); 
