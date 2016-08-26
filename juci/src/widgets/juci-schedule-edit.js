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
}).controller("juciScheduleEdit", function($scope, $tr, gettext, $uci){
	$scope.data = {
		selectedTimeFrame: ""
	};
	
	var dayTranslation = {
		"everyday": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
		"workday": ["mon", "tue", "wed", "thu", "fri"],
		"weekend": ["sat", "sun"]
	};
	
	$scope.allTimeFrames = [
		{ label: $tr(gettext("Individual Days")), value: "individual" },
		{ label: $tr(gettext("Every Day")), value: "everyday" },
		{ label: $tr(gettext("Every Workday")), value: "workday" },
		{ label: $tr(gettext("All Weekend")), value: "weekend" }
	];
	$scope.allDayNames = [
		{ label: $tr(gettext("Monday")), value: "mon" },
		{ label: $tr(gettext("Tuesday")), value: "tue" },
		{ label: $tr(gettext("Wednesday")), value: "wed" },
		{ label: $tr(gettext("Thursday")), value: "thu" },
		{ label: $tr(gettext("Friday")), value: "fri" },
		{ label: $tr(gettext("Saturday")), value: "sat" },
		{ label: $tr(gettext("Sunday")), value: "sun" }
	];
	
	$scope.$watch("allDayNames", function(){
		if(!$scope.schedule) return;
		$scope.schedule.days = $scope.allDayNames.map(function(day){
			if(day.checked) return day.value;
			else return null;
		}).filter(function(d){return d !== null; });
	}, true);

	$scope.validateTime = function(time){
		return (new UCI.validators.TimeValidator()).validate({ value: time });
	}
	$scope.validateTimespan = function(time){
		return (new UCI.validators.TimespanValidator()).validate({ value: time });
	}

	$scope.$watch("schedule", function(value){
		if(!value) return;
		if(!value.days) value.days = [];
		Object.keys(dayTranslation).map(function(dt){
		$scope.data.selectedTimeFrame = "individual";
			if(eq(dayTranslation[dt], value.days)){
				$scope.data.selectedTimeFrame = dt;
			}
		});
		$scope.allDayNames.map(function(day){
			if(value.days.find(function(d){ return d === day.value; })){
				day.checked = true;
			}else{
				day.checked = false;
			}
		});
	}, false);
	
	//$scope.onChangeDays = function(value){
	$scope.$watch("data.selectedTimeFrame", function(value){
		if(!value) return;
		if(dayTranslation[value]){
			$scope.allDayNames.map(function(day){
				if(dayTranslation[value].find(function(d){
					return d === day.value;
				})) day.checked = true;
				else day.checked = false;
			});
		}
	}, false);
	function eq(ar1, ar2){
		if(ar1.length !== ar2.length) return false;
		for(var i = 0; i < ar1.length; i++){
			if(ar1[i] !== ar2[i]) return false;
		}
		return true;
		}
});
