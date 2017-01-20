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
	$scope.icon = "";
	$scope.color= "";
	$scope.$watch("value", function(value){
		if(!value) return;
		if(String(value).match(/^-[0-9]{1,2}$/)){
			var v = parseInt(String(value).substring(1,3));
			if(v < 65){ $scope.icon = "juci juci-wifi-high"; $scope.color = "#5cb85c"; }
			else if(v < 82){ $scope.icon = "juci juci-wifi-mid"; $scope.color = "#F1C100"; }
			else{ $scope.icon = "juci juci-wifi-low"; $scope.color = "#d9534f"; }
		}
	}); 
}); 
