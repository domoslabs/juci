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
.directive("juciScheduleEdit", function($compile){
	return {
		templateUrl: "/widgets/juci-schedule-edit.html", 
		scope: {
			schedule: "=ngModel"
		}, 
		controller: "juciScheduleEdit", 
		replace: true, 
		require: "^ngModel"
	};  
}).controller("juciScheduleEdit", function($scope, gettext, $uci){
	$scope.data = {}; 
	$scope.time_span = { value: "" }; 
	$scope.days = []; 
	
	var dayTranslation = {
		"everyday": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], 
		"workday": ["mon", "tue", "wed", "thu", "fri"], 
		"weekend": ["sat", "sun"]
	}; 
	
	$scope.allTimeFrames = [
		{ label: gettext("Individual Days"), value: "individual" }, 
		{ label: gettext("Every Day"), value: "everyday" }, 
		{ label: gettext("Every Workday"), value: "workday" }, 
		{ label: gettext("All Weekend"), value: "weekend" }
	]; 
	$scope.allDayNames = [
		{ label: gettext("Monday"), value: "mon" }, 
		{ label: gettext("Tuesday"), value: "tue" }, 
		{ label: gettext("Wednesday"), value: "wed" }, 
		{ label: gettext("Thursday"), value: "thu" }, 
		{ label: gettext("Friday"), value: "fri" }, 
		{ label: gettext("Saturday"), value: "sat" }, 
		{ label: gettext("Sunday"), value: "sun" }
	]; 
	$scope.selectedTimeFrame = $scope.allTimeFrames[0].value; 
	
	$scope.$watch("days", function(){
		if(!$scope.schedule) return; 
		$scope.schedule.days.splice(0, $scope.schedule.days.length); 
		$scope.days.map(function(x){ $scope.schedule.days.push(x); }); 
		$scope.selectedTimeFrame = "individual"; 
		Object.keys(dayTranslation).map(function(x){ 
			var days = dayTranslation[x]; 
			var equal = $scope.days.filter(function(day){
				return dayTranslation[x].indexOf(day) != -1; 
			}).length; 
			if(equal == $scope.days.length && equal == dayTranslation[x].length) $scope.selectedTimeFrame = x; 
		}); 
	}, true); 

	$scope.validateTime = function(time){
		return (new UCI.validators.TimeValidator()).validate({ value: time }); 
	}
	$scope.validateTimespan = function(time){
		return (new UCI.validators.TimespanValidator()).validate({ value: time }); 
	}

	$scope.$watch("schedule", function(value){
		if(!value) return;
		console.log(value);
		value.days.map(function(x){ $scope.days.push(x); }); 
	}, false); 
	
	$scope.onChangeDays = function($value){
		$scope.selectedTimeFrame = $value; 
		$scope.days.splice(0, $scope.schedule.days.length); 
		if(dayTranslation[$value]) 
			dayTranslation[$value].map(function(x){ $scope.days.push(x); });
	}
}); 
