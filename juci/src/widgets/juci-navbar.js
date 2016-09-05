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
.directive("juciNavbar", function($location, $rootScope, $navigation){
	return {
		restrict: 'E',
		templateUrl: "/widgets/juci-navbar.html",
		controller: "NavigationCtrl",
		replace: true
	};
})
.controller("NavigationCtrl", function($scope, $location, $localStorage, $navigation, $rootScope, $config, $rpc, $events, $rootScope, $wiki){
	$scope.tree = $navigation.tree();
	$scope.log_events = [];
	$scope.mode = $localStorage.getItem("mode") || "expert";
	
	$scope.getHref = function(item){
		return $navigation.getHrefByNode(item);
	}
	$scope.hasChildren = function(menu){
		return menu.children.length > 0;
	}
	$scope.itemVisible = function(item){
		if(!item.modes || !item.modes.length) return true;
		else if(item.modes && item.modes.indexOf($config.local.mode) == -1) {
			return false;
		}
		else return true;
	};
	
	$scope.onLogout = function(){
		$rpc.$logout().always(function(){
			window.location.href="/";
		});
	}

	$scope.isActive = function (path) {
		var item = $navigation.findNodeByPage($location.path().replace(/\//g, ""));
		if(!item) return;
		if(path) return item.path.split("/").filter(function(p){return p})[0] === path;
	};

	/* $scope.showLogButton = false; //
	 *
	 * $events.subscribe("logread.msg", function(ev){
		$scope.log_events.push(ev);
		setTimeout(function(){ $scope.$apply(); }, 0);
	}); */
});
