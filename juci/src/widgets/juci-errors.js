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
.directive("juciErrors", function(){
	return {
		// accepted parameters for this tag
		scope: {
			ngModel: "="
		}, 
		templateUrl: "/widgets/juci-errors.html", 
		replace: true, 
		controller: "juciErrors"
	}; 
})
.controller("juciErrors", function($scope, $rootScope, $localStorage){
	$scope.$watch("ngModel", function(value){
		if(value) $scope.errors = $scope.ngModel; 
		else $scope.errors = $rootScope.errors; 
	}); 
}); 

JUCI.app
.directive("juciError", function(){
	return {
		// accepted parameters for this tag
		scope: {
			value: "="
		}, 
		template: '<div ng-show="value" class="alert-danger" style="margin-top: 10px; font-size: 0.8em; padding: 5px; border-radius: 5px">{{value}}</div>', 
		replace: true
	}; 
}); 
