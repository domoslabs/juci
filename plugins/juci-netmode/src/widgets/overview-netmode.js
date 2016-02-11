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
.directive("overviewStatusWidget99Netmode", function(){
	return {
		templateUrl: "widgets/overview-netmode-small.html", 
		controller: "overviewWidgetNetmode", 
		replace: true
	 };  
})
.directive("overviewWidget99Netmode", function(){
	return {
		templateUrl: "widgets/overview-netmode.html", 
		controller: "overviewWidgetNetmode", 
		replace: true
	 };  
})
.controller("overviewWidgetNetmode", function($scope, $tr, gettext, $uci, $rpc, $netmode, $netmodePicker){
	$scope.done = 1;  
		
	$netmode.getCurrentMode().done(function(current_mode){
		if(!current_mode) return; 
		$scope.currentNetmode = current_mode; 
		$netmode.list().done(function(modes){
			$scope.allNetmodes = modes.map(function(x){
				return { label: $tr(x.desc.value), value: x }; 
			}); 
			$scope.currentNetmode = modes.find(function(x){ return x[".name"] == current_mode[".name"]; }); 
			$scope.$apply(); 
		}); 
	}); 

	$scope.onChangeMode = function(){
		var current_mode = $scope.currentNetmode; 
		if(!current_mode) return; 
		$netmodePicker.show({ selected: current_mode[".name"] }).done(function(selected){
			if(!selected) return; 
			$netmode.select(selected[".name"]).done(function(){
				console.log("Netmode set to "+selected['.name']); 
				window.location = "/reboot.html"; 
			}); 
		}); 
	}

	$scope.onApplyNetmode = function(){
		if(!$scope.currentNetmode) return; 
		$netmode.select($scope.currentNetmode[".name"]).done(function(){
			console.log("Netmode set to "+$scope.currentNetmode['.name']); 
			window.location = "/reboot.html"; 
		}); 
	}

	$scope.onChangeModeConfirm = function(){
		if(confirm($tr(gettext("Changing netmode will reset your configuration completely to match that netmode. Do you want to continue?")))){
			$scope.onApplyNetmode(); 
		}
	}
}); 
