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
.directive("juciSelect", function($parse, gettext){
	return {
		restrict: 'E', 
		scope: {
			ngModel: "=", 
			ngItems: "=", 
			editable: "@",
			checkbox: "@",
			enabled: "=",
			onChange: "&", 
			onClick: "&", 
			placeholder: "@"
		}, 
		require: ["^ngModel", "?placeholder"], 
		templateUrl: "/widgets/juci-select.html", 
		controller: function($scope, $attrs, $parse, gettext, $tr){
			var ngModel = $parse($attrs.ngModel);
			if(!$scope.placeholder) $scope.placeholder = $tr(gettext("-- Select One --"));
			$scope.select = function(item){
				if($scope.onChange({$item: item, $value: item.value, $oldvalue: ngModel($scope.$parent)}) === false) return;
				ngModel.assign($scope.$parent, item.value); 
				$scope.selected = item; 
			}

			$scope.$watch("ngItems", function(){
				if($scope.ngItems == undefined || $scope.ngModel == undefined) return; 
				$scope.selected = $scope.ngItems.find(function(x){ return x.value == ngModel($scope.$parent); }); 
			}); 

			$scope.$watch("ngModel", function(value){
				if(value == undefined || $scope.ngItems == undefined) return; 
				$scope.selected = $scope.ngItems.find(function(x){ return x.value == ngModel($scope.$parent); }); 
			});
		}
	}; 
}); 
