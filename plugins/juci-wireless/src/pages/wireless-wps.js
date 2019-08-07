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
	$scope.wifiIfaces = [];

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

			var device = $scope.devices.find(function(dev) {
					return dev[".name"] == iface.device.value;
				});

			if (iface.wps.value && device.$info.isup)
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
		if(!$scope.wifiIfaces || !$scope.wifiIfaces.length)
			$scope.showWps = 0;

		//setTimeout is needed because ng-change is run before value has changed
		setTimeout(function () {
			var highest = 0;

			$scope.wifiIfaces.forEach(function (iface) {
				if (iface.wps.value && !iface.wps.is_dirty)
					highest = 2;
				else if (iface.wps.value && iface.wps.is_dirty && highest != 2)
					highest = 1;
			});
			$scope.showWps = highest;
			$scope.$apply();
		}, 0);

		if (!iface)
			return

	}

	$scope.data = {
		userPIN: "",
		valid_wps_pin: ""
	}
	$scope.progress = 0;

	$scope.radioAvailable = function() {
		return $scope.devices.filter(function(dev) {
			return dev.$info.isup;
		}).filter(function(dev) {
			var iface = $scope.wifiIfaces.find(function(i) {
				return i.device.value === dev[".name"];
			});

			if (iface && iface.wps && iface.wps.value)
				return iface.wps.value

			return false;
		}).length;
	}

	$scope.wpsUnlocked = function(interface){
		return ["none", "wep-open", "wep-shared"].indexOf(interface.encryption.value) === -1 &&
				interface.hidden.value === false &&
				$scope.devices.find(function(device) {
					return device[".name"] === interface.ifname.value;
				}).$info.isup
	}

	$wireless.getDevices().done(function(devices){
		$scope.devices = devices;
	})

	$wireless.getInterfaces().done(function(ifaces){
		$scope.wifiIfaces = ifaces;

		$scope.updateWps();
		var activeIface = getActiveIface();
		if (!activeIface) {
			$scope.$apply();
			return null;
		}

		$rpc.$call("wifix.wps", "showpin", { vif: activeIface.ifname.value }).done(function (data) {
			$scope.generatedPIN = data.pin;
		});

		refresh();
		$scope.$apply();
	}).fail(function(err){
		console.log("failed to sync config: "+err);
	});

	$events.subscribe("wps", function(){refresh();});
	$events.subscribe("wifi.wps", function(){refresh();});
	function refresh() {
		var activeIface = getActiveIface();
		if (!activeIface)
			return;

		$rpc.$call("wifix.wps", "status", { vif: activeIface.ifname.value }).done(function(result){
			$scope.progress = result.code;
			$scope.text_status = wps_status_strings[result.code]||$tr(gettext("Unknown"));
			$scope.$apply();
		});
	};


	var longPress = false;
	var timeout;
	$scope.wpsButtonColor = "default"
	$scope.mouseDown = function() {
		timeout = setTimeout(function(){longPress = true; $scope.wpsButtonColor = "success"; $scope.$apply();}, 5000);
	}
	$scope.mouseUp = function() {
		var activeIface = getActiveIface();
		if (!activeIface)
			return;

		if(!longPress){
			$rpc.$call("wifix.wps", "pbc", { vif: activeIface.ifname.value });
			clearTimeout(timeout);
		}else{
			$rpc.$call("wifix.wps", "pbc_client", { vif: activeIface.ifname.value });
			$scope.progress = 8;
			$scope.text_status = wps_status_strings[8];
			longPress = false;
			$scope.wpsButtonColor = "default";
		}
	}
	$scope.onPairUserPIN = function(){
		var activeIface = getActiveIface();
		if (!activeIface)
			return;
		if (!$scope.data.userPIN)
			return;

		var pin = $scope.data.userPIN.replace("-", "").replace(" ", "").match(/\d+/g).join("");
		$rpc.$call("wifix.wps", "checkpin", {pin:pin }).done(function(value){
			if(!value) return;
			if(!value.valid){
				alert($tr(gettext("Invalid WPS PIN")));
				return;
			}

			$rpc.$call("wifix.wps", "stapin", { pin: pin, vif: activeIface.ifname.value});
		});
	}

	$scope.validPin = function(){
		var pin = $scope.data.userPIN;
		if(pin.match(/^[0-9]{4}([- ]?[0-9]{4})?$/)){
			$scope.data.valid_wps_pin = true;
			$scope.data.pin_error = null;
		} else {
			$scope.data.valid_wps_pin = false;
			$scope.data.pin_error = $tr(gettext("Invalid format! WPS PIN must be ether 4 or 8 digits alternatively 8 digits with a space or dash in the middle"));
		}
	};

	$scope.onGeneratePIN = function(){
		var activeIface = getActiveIface();
		if (!activeIface)
			return;

		$rpc.$call("wifix.wps", "genpin").done(function(data){
			//$scope.generatedPIN = data.pin;
			if(!data || data.pin == "") return;
			$rpc.$call("wifix.wps", "setpin", {pin: data.pin, vif: activeIface.ifname.value}).done(function(){
				$scope.generatedPIN = data.pin;
				$scope.$apply();
			});
		});
	};

	$scope.onRegisterPIN = function () {
		var activeIface = getActiveIface();
		if (!activeIface)
			return;

		$rpc.$call("wifix.wps", "setpin", { pin: $scope.generatedPIN, vif: activeIface.ifname.value });
	};

	$scope.onCancelWPS = function(){
		$rpc.$call("wifix.wps", "stop");
		$scope.progress = 0;
	}
});
