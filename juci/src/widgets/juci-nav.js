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
.directive("juciNav", function(){
	return {
		// accepted parameters for this tag
		scope: {
		},
		templateUrl: "/widgets/juci-nav.html",
		replace: true,
		controller: "NavCtrl",
		controllerAs: "ctrl"
	};
})
.controller("NavCtrl", function($scope, $navigation, $location, $state, $rootScope, $localStorage){
	$scope.showSubMenuItems = false;
	var node = $navigation.findNodeByPage($location.path().replace(/\//g, ""));
	if(node) {
		$scope.tree = $navigation.tree(node.path.split("/")[0]);
	}
	
	$scope.hasChildren = function(menu){
		return Object.keys(menu.children) > 0;
	};
	$scope.getHref = function(item){
		return $navigation.getHrefByNode(item);
	}

	$scope.isItemActive = function (item) {
		var active_node = $navigation.findNodeByPage($location.path().replace(/\//g, ""));
		if(!active_node) return false;
		if(item.page === active_node.page) {
			if(item.children && item.children.length) {
				$scope.showSubMenuItems = true;
			} else {
				$scope.showSubMenuItems = false;
			}
			return true;
		} else if (active_node.path.indexOf(item.path) === 0){
			$scope.showSubMenuItems = true;
		} else {
			$scope.showSubMenuItems = false;
		}
		return false;
	};

	$scope.itemVisible = function(item){
		if(!item.modes || !item.modes.length) return true;
		else if(item.modes && item.modes.indexOf($localStorage.getItem("mode")) == -1) {
			return false;
		}
		else return true;
	};
});
