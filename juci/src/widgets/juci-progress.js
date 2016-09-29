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
.directive("juciProgress", function(){
	return {
		// accepted parameters for this tag
		scope: {
			value: "=", 
			total: "=", 
			units: "&"
		}, 
		templateUrl: "/widgets/juci-progress.html", 
		replace: true, 
		controller: "juciProgressControl",
		link: function(scope, element, attributes){
			// make sure we interpret the units as string
			scope.units = attributes.units; 
		}
	}; 
})
.controller("juciProgressControl", function($scope, $navigation){
	function update(){
		if($scope.value && Number($scope.value) != 0)
			$scope.width = Math.round((Number($scope.value||0) / Number($scope.total||0)) * 100); 
		else
			$scope.width = 0; 
	}
	$scope.$watch("value", update);
	$scope.$watch("total", update); 
}); 
