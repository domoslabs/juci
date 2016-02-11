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
.directive("juciExpandable", function(){
	return {
		templateUrl: "/widgets/juci-expandable.html", 
		replace: true, 
		scope: {
			title: "@", 
			status: "=",
			open: "="
		}, 
		transclude: true,
		controller: "juciExpandableCtrl"
	};  
}).controller("juciExpandableCtrl", function($scope){
	$scope.data = { open: true }; 
	console.log($scope.open);
	if($scope.open != undefined) $scope.data.open = $scope.open;
	$scope.toggle_open = function(){
		$scope.data.open = !$scope.data.open;
	};
});
