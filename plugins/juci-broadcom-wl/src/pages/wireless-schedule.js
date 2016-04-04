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
.controller("wirelessSchedulePage", function($scope, $uci, gettext){
	$scope.statusItems = [
		{ label: gettext("Enabled"), value: true },
		{ label: gettext("Disabled"), value: false }
	]; 
	$scope.timeSpan = { }; 
	
	$uci.$sync(["wireless"]).done(function(){
		console.log("Got status"); 
		$scope.status = $uci.wireless.status; 
		$scope.schedules = $uci.wireless["@wifi-schedule"]; 
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
	$scope.onAcceptSchedule = function(){
		var item = $scope.schedule.uci_item; 
		var view = $scope.schedule; 
		
		item.time.value = view.time_start + "-" + view.time_end; 
		item.days.value = view.days; 
		$scope.errors = item.$getErrors(); 
		
		if($scope.errors && $scope.errors.length)
			return; 
		
		$scope.schedule = null; 
		if(item[".new"]) { 
			item[".new"] = false; 
		}
	}
	
	$scope.onDismissSchedule = function(){
		if($scope.schedule && $scope.schedule.uci_item ){
			if($scope.schedule.uci_item[".new"]){
				$scope.schedule.uci_item.$delete().done(function(){
					$scope.$apply(); 
				}); 
			} else {
				$scope.schedule.uci_item.$reset(); 
			}
		} 
		$scope.schedule = null; 
	}
	
	$scope.onAddSchedule = function(){
		$uci.wireless.$create({".type": "wifi-schedule"}).done(function(item){
			item[".new"] = true; 
			var time = item.time.value.split("-"); 
			$scope.schedule = {
				time_start: time[0], 
				time_end: time[1], 
				days: item.days.value, 
				uci_item: item
			};
			$scope.$apply(); 
			console.log("Added new schedule!"); 
		}).fail(function(){
			console.log("Failed to create schedule!"); 
		});
	}
	
	$scope.onEditSchedule = function(item){
		console.log("Editing: "+item[".name"]); 
		var time = item.time.value.split("-"); 
		$scope.schedule = {
			time_start: time[0], 
			time_end: time[1], 
			days: item.days.value, 
			uci_item: item
		};
	}
	$scope.onDeleteSchedule = function(sched){
		sched.$delete().always(function(){
			$scope.$apply(); 
		}); 
	}
}); 
