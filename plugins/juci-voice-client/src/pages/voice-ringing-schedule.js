//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
/*
 * juci - javascript universal client interface
 *
 * 
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
.controller("PagePhoneRingingSchedule", function($scope, $uci, gettext, $tr){
	$scope.enabledDisabledItems = [
		{ label: $tr(gettext("Enabled")), value: true }, 
		{ label: $tr(gettext("Disabled")), value: false }
	]; 
	
	$uci.$sync(["voice_client"]).done(function(){
		if(!$uci.voice_client.RINGING_STATUS){
			$uci.voice_client.$create({".type": "ringing_status", ".name": "RINGING_STATUS"}).done(function(){
				$scope.settings = $uci.voice_client.RINGING_STATUS; 
				$scope.$apply(); 
			}); 
		} else {
			$scope.settings = $uci.voice_client.RINGING_STATUS;
		} 
		$scope.schedules = $uci.voice_client["@ringing_schedule"]; 
		$scope.allSipAccountsMap = {}; 
		$scope.allSipAccounts = $uci.voice_client["@sip_service_provider"].map(function(x){
			var i = {
				label: x.name.value, 
				value: x[".name"]
			}; 
			$scope.allSipAccountsMap[x[".name"]] = x; 
			return i; 
		}); 

		$scope.getAccountName = function(item){
			var provider = $scope.allSipAccountsMap[item.sip_service_provider.value]; 
			if(provider) return provider.name.value; 
			return ""; 
		}
		$scope.$apply(); 
	});
	function validateTimeSpan(range) { return (new UCI.validators.TimespanValidator()).validate({value: range});} 
	function validateTime(time){ return (new UCI.validators.TimeValidator()).validate({value: time });}

	$scope.onAcceptSchedule = function(){
		var item = $scope.schedule.uci_item; 
		var view = $scope.schedule; 
		$scope.errors = item.$getErrors();
//		if(!view.sip_service_provider){
//			$scope.errors.push($tr(gettext("No Phone number selected")));
//		}
		if(!view.days || view.days.length === 0){
			$scope.errors.push($tr(gettext("No Day selected")));
		}
		var timeErr = validateTime(view.time_start) || validateTime(view.time_end) ||
						validateTimeSpan(view.time_start + "-" + view.time_end);
		if(timeErr && timeErr.length) $scope.errors.concat(timeErr);
		if($scope.errors.length > 0) return;
		if(item[".new"]) { 
			item[".new"] = false; 
		}
		item.sip_service_provider.value = view.sip_service_provider; 
		item.time.value = view.time_start + "-" + view.time_end; 
		item.days.value = view.days; 
		$scope.schedule = null; 
	}
	
	$scope.onDismissSchedule = function(){
		if($scope.schedule.uci_item && $scope.schedule.uci_item[".new"]){
			$scope.schedule.uci_item.$delete().done(function(){
				$scope.$apply(); 
			}); 
		} 
		$scope.schedule = null; 
	}
	
	$scope.onAddSchedule = function(){
		$uci.voice_client.$create({".type": "ringing_schedule"}).done(function(item){
			item[".new"] = true; 
			$scope.schedule = {
				time_start: "", 
				time_end: "", 
				days: [],
				sip_service_provider: "",  
				uci_item: item
			};
			$scope.$apply(); 
			console.log("Added new schedule!"); 
		}).fail(function(){
			console.log("Failed to create schedule!"); 
		});
	}
	
	$scope.onEditSchedule = function(item){
		var time = item.time.value.split("-"); 
		$scope.schedule = {
			time_start: time[0].slice(), 
			time_end: time[1].slice(), 
			days: item.days.value.slice(), 
			sip_service_provider: item.sip_service_provider.value, 
			uci_item: item
		};
	}
	$scope.onDeleteSchedule = function(sched){
		sched.$delete().always(function(){
			$scope.$apply(); 
		}); 
	}
}); 
