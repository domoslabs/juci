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
.directive("juciBrightness", function(){
	return {
		// accepted parameters for this tag
		scope: { 
			model: "=ngModel", 
			min: "@", 
			max: "@", 
			ngChange: "&"
		}, 
		templateUrl: "/widgets/juci.brightness.html", 
		replace: true, 
		controller: "juciBrightness"
	}; 
})
.controller("juciBrightness", function($scope){
	$scope.bars = []; 
	
	//if($scope.model == undefined) $scope.model = new Number(0); 
	if($scope.min == undefined) $scope.min = 0; 
	if($scope.max == undefined) $scope.max = 100; 
	var min = $scope.min; var max = $scope.max; 
	var total = (max - min); 
	var step = total / 5; 
	var base_color = "ff";  
	var last_value = $scope.model; 
	
	function update(){
		var bars = []; 
		if($scope.model < min) $scope.model = min; 
		if($scope.model > max) $scope.model = max; 
		for(var i = step; i <= total; i += step){
			var bar = {color: "f00", value: i}; 
			if(i <= $scope.model) 
				bar.color = base_color+("0000"+Math.round(65535 - 65535*((i) / total)).toString(16)).slice(-4); 
			else 
				bar.color = "eee"; 
			//console.log("value: "+$scope.model+" "+bar.color); 
			bars.push(bar); 
		}
		setTimeout(function(){
			if($scope.model !== last_value && $scope.ngChange) {
				last_value = $scope.model;
				$scope.ngChange();  
			}
		}, 0); 
		$scope.bars = bars; 
	} update(); 
	
	$scope.$watch("model", function(value){
		update(); 
	}); 
	
	$scope.onDecrease = function(){
		$scope.model -= step; 
		update(); 
	}
	
	$scope.onIncrease = function(){
		$scope.model += step; 
		update(); 
	}
	$scope.onBarClick = function(bar){
		$scope.model = bar.value; 
		update(); 
		console.log("Changed value to "+bar.value); 
	}
}); 
