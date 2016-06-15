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
.controller("wirelessWPSPage", function($scope, $config, $uci, $rpc, gettext, $tr, $events){
	$scope.showExpert = $config.local.mode == "expert";
	var wps_status_strings = {
		"-1": $tr(gettext("Disabled")),
		0: $tr(gettext("Initializing")),
		1: $tr(gettext("Processing")),
		2: $tr(gettext("Done!")),
		3: $tr(gettext("Failed")),
		4: $tr(gettext("Timed out")),
		7: $tr(gettext("Done!")),
		8: $tr(gettext("Switching to repeater mode")),
		9: $tr(gettext("Overlap"))
	}; 
	
	$scope.data = {
		userPIN: "",
		valid_wps_pin: ""
	}
	$scope.progress = 0; 
	
	$scope.wpsUnlocked = function(interface){
		return ["wpa", "mixed-wpa"].indexOf(interface.encryption.value) == -1 && interface.closed.value != true; 
	}
	
	$uci.$sync(["wireless"]).done(function(){
		$scope.wireless = $uci.wireless; 
		$scope.getFrequensy = function(dev){
			if($scope.wireless[dev] && $scope.wireless[dev].band){
				if($scope.wireless[dev].band.value == "b") return "2.4GHz";
				if($scope.wireless[dev].band.value == "a") return "5GHz";
			}
			return "";
		};
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
	$events.subscribe("wps", function(){refresh();});
	function refresh() {
		$rpc.$call("wps", "status").done(function(result){
			$scope.progress = result.code; 
			$scope.text_status = wps_status_strings[result.code]||gettext("Unknown"); 
			$scope.$apply();	
		}); 
	}refresh(); 
	
	$rpc.$call("wps", "showpin").done(function(data){
		$scope.generatedPIN = data.pin; 
	}); 
		
	var longPress = false;
	var timeout;
	$scope.wpsButtonColor = "default"
	$scope.mouseDown = function() {
		timeout = setTimeout(function(){longPress = true; $scope.wpsButtonColor = "success"; $scope.$apply();}, 5000);
	}
	$scope.mouseUp = function() {
		if(!longPress){
			$rpc.$call("wps", "pbc");
			clearTimeout(timeout);
		}else{
			$rpc.$call("wps", "pbc_client");
			$scope.progress = 8;
			$scope.text_status = wps_status_strings[8];
			longPress = false;
			$scope.wpsButtonColor = "default";
		}
	}
	$scope.onPairUserPIN = function(){
		var pin = $scope.data.userPIN.replace("-", "").replace(" ", "").match(/\d+/g).join("");
		$rpc.$call("wps", "checkpin", {pin:pin }).done(function(value){
			if(!value) return;
			if(!value.valid){
				console.log("invalid wps pin");
				alert($tr(gettext("Invalid WPS PIN")));
				return;
			}
			$rpc.$call("wps", "stapin", { pin: pin });
		});
	}
	
	$scope.validPin = function(){
		var pin = $scope.data.userPIN;
		if(pin.match(/^[0-9]{4}([- ]?[0-9]{4})?$/)){
			$scope.data.valid_wps_pin = true;
			$scope.data.pin_error = null;
		}else{
			$scope.data.valid_wps_pin = false;
			$scope.data.pin_error = $tr(gettext("Invalid format! WPS PIN must be ether 4 or 8 digits alternatively 8 digits with a space or dash in the middle"));
		}
	};
		
	$scope.onGeneratePIN = function(){
		$rpc.$call("wps", "genpin").done(function(data){
			if(!data || data.pin == "") return;
			$rpc.$call("wps", "setpin", {pin: data.pin}).done(function(){
				$scope.generatedPIN = data.pin; 
				$scope.$apply(); 
			}); 
		}); 
	}
	
	$scope.onCancelWPS = function(){
		$rpc.$call("wps", "stop"); 
	} 
}); 
