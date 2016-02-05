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
.directive("juciMultiSelect", function($compile){
	return {
		templateUrl: "/widgets/juci-multi-select.html", 
		controller: "juciMultiSelect", 
		scope: {
			model: "=ngModel",
			items: "=ngItems",
			getItemTitle: "&itemLabel" 
		}, 
		replace: true
	 };  
})
.controller("juciMultiSelect", function($scope, $config, $state, $localStorage, $tr, gettext){
	$scope.data = { 
		input: [], 
		output: []
	};
		
	function update(){
		if(!$scope.items || !$scope.model || !($scope.items instanceof Array) || !($scope.model instanceof Array)) return; 
		$scope.data.input = $scope.items.map(function(i){
			return {
				label: $scope.getItemTitle({ "$item": i }),
				model: i, 
				selected: false
			}; 
		}); 
		$scope.model.forEach(function(x){
			var item = {
				label: $scope.getItemTitle({ "$item": x }),
				model: x, 
				selected: true
			}; 
			//console.log($scope.getItemTitle({ "$item": x })); 
			//$scope.data.input.push(item); 
			$scope.data.input.push(item); 
		}); 
	}
	
	$scope.onItemClick = function(item){
		if(!$scope.items || !$scope.model || !($scope.items instanceof Array) || !($scope.model instanceof Array)) return; 
		if(item.selected) $scope.model.push(item.model);
		else {
			$scope.model.splice($scope.model.indexOf(item.model), 1); 
		}
	}

	$scope.$watch("model", function(model){
		update();
	}); 

	$scope.$watch("items", function(items){
		update();
	});
}); 
