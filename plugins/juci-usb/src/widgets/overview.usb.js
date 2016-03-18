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
.directive("overviewWidget20USB", function(){
	return {
		templateUrl: "widgets/overview.usb.html", 
		controller: "overviewWidget20USBCtrl", 
		replace: true
	 };  
})
.directive("overviewStatusWidget20USB", function(){
	return {
		templateUrl: "widgets/overview.usb.small.html", 
		controller: "overviewWidget20USBCtrl", 
		replace: true
	 };  
})
.controller("overviewWidget20USBCtrl", function($scope, $uci, $usb, $events){
	$events.subscribe("hotplug.usb", function(res){
		if(res.data && res.data.action && (res.data.action == "add" || res.data.action == "remove")){
			update();
		}
	});
	function update(){
		$usb.getDevices().done(function(devices){
			$scope.devices = devices || [];
			$scope.$apply(); 
		}); 
	}update();
}); 
