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
.controller("wirelessWPSPage", function($scope, $uci, $rpc, $interval, $router, gettext, $tr){
	var wps_status_strings = {
		"-1": $tr(gettext("wps.status.disabled")),
		0: $tr(gettext("wps.status.init")),
		1: $tr(gettext("wps.status.processing")),
		2: $tr(gettext("wps.status.success")),
		3: $tr(gettext("wps.status.fail")),
		4: $tr(gettext("wps.status.timeout")),
		7: $tr(gettext("wps.status.msgdone")),
		8: $tr(gettext("wps.status.overlap"))
	}; 
	
	$scope.router = $router;
	
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
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
	JUCI.interval.repeat("wifi.wps.retry", 1000, function(next){
		$rpc.juci.wireless.wps.status().done(function(result){
			$scope.progress = result.code; 
			$scope.text_status = wps_status_strings[result.code]||gettext("wps.status.unknown"); 
			$scope.$apply();	
			next();
		}); 
	}); 
	
	$rpc.juci.wireless.wps.showpin().done(function(data){
		$scope.generatedPIN = data.pin; 
	}); 
	
	$scope.onPairPBC = function(){
		$rpc.juci.wireless.wps.pbc();
	}
	$scope.onPairUserPIN = function(){
		var pin = $scope.data.userPIN.replace("-", "").replace(" ", "").match(/\d+/g).join("");
		$rpc.juci.wireless.wps.checkpin({pin:pin }).done(function(value){
			if(!value) return;
			if(!value.valid){
				console.log("invalid wps pin");
				alert($tr(gettext("Invalid WPS PIN")));
				return;
			}
			$rpc.juci.wireless.wps.stapin({ pin: pin });
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
		$rpc.juci.wireless.wps.genpin().done(function(data){
			if(!data || data.pin == "") return;
			$rpc.juci.wireless.wps.setpin({pin: data.pin}).done(function(){
				$scope.generatedPIN = data.pin; 
				$scope.$apply(); 
			}); 
		}); 
	}
	
	$scope.onCancelWPS = function(){
		$rpc.juci.wireless.wps.stop(); 
	} 
}); 
