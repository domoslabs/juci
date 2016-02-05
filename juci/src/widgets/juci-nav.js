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
.controller("NavCtrl", function($scope, $navigation, $location, $state, $rootScope, $config){
	$scope.showSubMenuItems = false;
	
	$scope.hasChildren = function(menu){
		return Object.keys(menu.children) > 0;
	};

	$scope.isItemActive = function (item) {
		var active_node = $navigation.findNodeByHref($location.path().replace(/\//g, "")); 
		if(!active_node) return false; 
		if(item.href === active_node.href) {
			if(item.children_list && item.children_list.length > 0) {
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

	$scope.isSubItemActive = function (item) {
		var active_node = $navigation.findNodeByHref($location.path().replace(/\//g, "")); 
		if(!active_node) return false; 
		return item.href === active_node.href;
	};

	$scope.itemVisible = function(item){
		if(!item.modes || !item.modes.length) return true; 
		else if(item.modes && item.modes.indexOf($config.local.mode) == -1) {
			return false; 
		} 
		else return true; 
	};

	function activate(){
		var node = $navigation.findNodeByHref($location.path().replace(/\//g, "")); 
		if(node) {
			$scope.tree = $navigation.tree(node.path.split("/")[0]); 
		}
		//var path = $location.path().replace(/^\/+|\/+$/g, '');
		//var subtree = path.split("-")[0];
		//$scope.tree = $navigation.tree(subtree);
	}
	activate();
	
});
