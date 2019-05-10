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
.controller("wirelessWPSPage", function($scope, $localStorage, $wireless, $rpc, gettext, $tr, $events, $uci){
	$scope.has_setpin = $rpc.$has("wifix.wps", "setpin");
	$scope.has_showpin = $rpc.$has("wifix.wps", "showpin");
	$scope.has_pbc = $rpc.$has("wifix.wps", "pbc");
	$scope.has_stapin = $rpc.$has("wifix.wps", "stapin");
	$scope.showExpert = $localStorage.getItem("mode") == "expert";
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

	getActiveIface = function() {
		var activeIface = null;
		$scope.wifiIfaces.forEach(function (iface) {
			if (iface[".frequency"] === "2.4GHz" && activeIface != null)
				return;

			if (iface[".wps_state"])
				activeIface = iface;
		});

		return activeIface;
	}

	$uci.$sync("wireless").done(function () {
		$scope.wireless = {a: {}, b: {}};
		$uci.wireless["@wifi-device"].forEach(function (dev) {
				$scope.wireless[dev.band.value]["wifi-device"] = dev;
		});

		$uci.wireless["@wifi-iface"].forEach(function (dev) {
			if ($scope.wireless.a["wifi-device"][".name"] === dev.device.value) {
				$scope.wireless.a["wifi-iface"] = dev;
			}
			else if ($scope.wireless.b["wifi-device"][".name"] === dev.device.value) {
				$scope.wireless.b["wifi-iface"] = dev;
			}
		});
	});

	$scope.updateWps = function(iface){
		if(!$scope.wifiIfaces || !$scope.wifiIfaces.length){
			$scope.showWps = false;
		}
		//setTimeout is needed because ng-change is run before value has changed
		setTimeout(function(){
			$scope.showWps = $scope.wifiIfaces.find(function(iface){
				return iface[".wps_state"];
			}) ? true : false;
			$scope.$apply();
		}, 0);

		if (!iface)
			return;

		if (iface[".wps_state"])
			iface.wps_pushbutton.value = iface.wps_label.value = 0;
		else {
			iface.wps_pushbutton.value = 1;
			iface.wps_label.value = 0;
		}
	}
	
	$scope.data = {
		userPIN: "",
		valid_wps_pin: ""
	}
	$scope.progress = 0;
	
	$scope.wpsUnlocked = function(interface){
		return ["none", "wep"].indexOf(interface.encryption.value) === -1 && interface.hidden.value === false;
	}
	
	$wireless.getInterfaces().done(function(ifaces){
		$scope.wifiIfaces = ifaces;

		$scope.wifiIfaces.forEach(function(iface) {
			iface[".wps_state"] = iface.wps_pushbutton.value || iface.wps_label.value
		});

		$scope.updateWps();
		$scope.$apply();
	}).fail(function(err){
		console.log("failed to sync config: "+err);
	});
	
	$events.subscribe("wps", function(){refresh();});
	$events.subscribe("wifix.wps", function(){refresh();});
	function refresh() {
		$rpc.$call("wifix.wps", "status").done(function(result){
			$scope.progress = result.code;
			$scope.text_status = wps_status_strings[result.code]||$tr(gettext("Unknown"));
			$scope.$apply();	
		});
	}refresh();
	
	$rpc.$call("wifix.wps", "showpin").done(function(data){
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
			$rpc.$call("wifix.wps", "pbc");
			clearTimeout(timeout);
			var activeIface = getActiveIface();
			if (!activeIface)
				return;
			activeIface.wps_label.value = 0;
			activeIface.wps_pushbutton.value = 1;
		}else{
			$rpc.$call("wifix.wps", "pbc_client");
			$scope.progress = 8;
			$scope.text_status = wps_status_strings[8];
			longPress = false;
			$scope.wpsButtonColor = "default";
		}
	}
	$scope.onPairUserPIN = function(){
		if (!$scope.data.userPIN)
			return;

		var pin = $scope.data.userPIN.replace("-", "").replace(" ", "").match(/\d+/g).join("");
		$rpc.$call("wifix.wps", "checkpin", {pin:pin }).done(function(value){
			if(!value) return;
			if(!value.valid){
				console.log("invalid wps pin");
				alert($tr(gettext("Invalid WPS PIN")));
				return;
			}

			$rpc.$call("wifix.wps", "stapin", { pin: pin }).done(function() {
				var activeIface = getActiveIface();
				if (!activeIface)
					return;
				activeIface.wps_label.value = 1;
				activeIface.wps_pushbutton.value = 0;
			});
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
		$rpc.$call("wifix.wps", "genpin").done(function(data){
			if(!data || data.pin == "") return;
			$rpc.$call("wifix.wps", "setpin", {pin: data.pin}).done(function(){
				$scope.generatedPIN = data.pin;
				$scope.$apply();
			});
		});
	}
	
	$scope.onCancelWPS = function(){
		$rpc.$call("wifix.wps", "stop");
	}
});
