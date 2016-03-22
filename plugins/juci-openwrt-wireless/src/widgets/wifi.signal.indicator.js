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
.directive("wifiSignalIndicator", function(){
	return {
		templateUrl: "/widgets/wifi.signal.indicator.html", 
		scope: {
			value: "=ngModel"
		}, 
		controller: "wifiSignalIndicator", 
		replace: true, 
		require: "^ngModel"
	};
}).controller("wifiSignalIndicator", function($scope){
	$scope.bars = [false, false, false, false]; 
	$scope.$watch("value", function(value){
		var q = value / 20; 
		$scope.bars[0] = $scope.bars[1] = $scope.bars[2] = $scope.bars[3] = false; 
		if(q > 1) $scope.bars[0] = true; 
		if(q > 2) $scope.bars[1] = true; 
		if(q > 3) $scope.bars[2] = true; 
		if(q > 4) $scope.bars[3] = true; 
	}); 
	$scope.barStyle = function(idx, active){
		var height = 5 + ((idx) * 5); 
		var top = 20 - height; 
		return {
			"position": "absolute", 
			"width": "6px", 
			"height": ""+height+"px", 
			"background-color": (active)?"#5CB85C":"#d5d5d5",
			"top": ""+top+"px", 
			"left": ""+(idx * 8)+"px"
		}; 
	}
}); 
