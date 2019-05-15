/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
	.directive("networkDeviceEdit", function () {
		return {
			templateUrl: "/widgets/network-device-edit.html",
			scope: {
				device: "=ngModel"
			},
			replace: true,
			require: "^ngModel",
			controller: "networkDeviceEditCtrl"
		};
	}).controller("networkDeviceEditCtrl", function ($scope, $tr, gettext, $uci, $network) {
		$scope.conf = {
			manual_name: false
		};

		$scope.$watch("device", function (dev) {
			if (!$scope.device)
				return;
			if (dev.type.value === "untagged") {
				$scope.conf.manual_name = !is_auto_generated_name(dev);
				$scope.conf.untagged = true;
			} else if (dev.type.value === "macvlan") {
				$scope.conf.manual_name = !is_auto_generated_name(dev);
				$scope.conf.untagged = false;
			} else {
				$scope.conf.manual_name = (dev.name.value !== dev.ifname.value + "." + dev.vid.value);
				$scope.conf.untagged = false;
			}
		});

		function set_untagged_device_name(dev) {
			var i = 1;
			while (i < 4096) {
				var name = dev.ifname.value + "." + i;
				var found = $uci.network["@device"].find(function (d) {
					return d != dev && d.name.value == name;
				});
				if (found)
					i++;
				else {
					dev.name.value = name;
					break;
				}
			}
		}

		function set_macvlan_device_name(dev) {
			dev.name.value = dev[".name"];
		}

		function is_auto_generated_name(dev) {
			var re = new RegExp("^" + dev.ifname.value + ".\\d+$");
			return !(dev.name.value.match(re) === null);
		}

		function do_overwrite_device_name(dev) {
			let overWrite = false;

			if (dev === null)
				overWrite = false;
			else if (dev === "")
				overWrite = true;
			else if (dev.includes(".") === true) {
				var tmp = dev.split('.');
				if (tmp.length != 2)
					return;

				if (isNaN(tmp[0]) === true && isNaN(tmp[1]) === false)
					overWrite = true;
			}
			return overWrite;
		}

		$scope.types = [
			{ label: $tr(gettext("Untagged")), value: "untagged" },
			{ label: $tr(gettext("MACVLAN")), value: "macvlan" },
			// { label: $tr(gettext("802.1AD")), value: "8021ad" },
			{ label: $tr(gettext("802.1Q")), value: "8021q" }
		];

		//TODO: dont do this here ask $device for it instead
		$network.getAdapters().done(function (devs) {
			$scope.interfaces = [];
			devs.filter(function (dev) {
				return dev.direction === "up";
			}).forEach(function (dev) {
				$scope.interfaces.push({
					label: dev.name + " (" + dev.device + ")",
					value: dev.device
				});
			});
			$scope.$apply();

		}).fail(function (e) {
			console.log(e);
		});

		$scope.$watchGroup(["device.ifname.value", "device.vid.value"], function (new_val, old_val) {
			if (!$scope.device || $scope.conf.manual_name)
				return;
			if (old_val[0] === undefined && old_val[1] === undefined)
				return;

			if ($scope.device.type.value === "untagged")
				set_untagged_device_name($scope.device);
			else if ($scope.device.type.value === "8021q"){
				if(do_overwrite_device_name($scope.device.name.value))
					$scope.device.name.value = $scope.device.ifname.value + "." + $scope.device.vid.value;
			}
		});

		$scope.$watch("device.type.value", function (new_type) {
			if (!$scope.device)
				return;
			$scope.conf.manual_name = false;
			if (new_type === "untagged") {
				$scope.conf.untagged = true;
				$scope.device.vid.$reset_defaults();
				$scope.device.priority.$reset_defaults();
				set_untagged_device_name($scope.device);
			} else if (new_type === "macvlan") {
				$scope.conf.untagged = false;
				$scope.device.vid.$reset_defaults();
				$scope.device.priority.$reset_defaults();
				set_macvlan_device_name($scope.device);
			} else {

				$scope.conf.untagged = false;
				if(do_overwrite_device_name($scope.device.name.value))
					$scope.device.name.value = $scope.device.ifname.value + "." + $scope.device.vid.value;
			}
		});
	}).filter("uppercase", function (string) {
		return String(string).toUpperCase();
	});
