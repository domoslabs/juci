JUCI.app
.directive("interfaceEdit", function() {
	return {
		templateUrl: "/widgets/interface-edit.html",
		scope: {
			wiLiInterfaces: "=ngModel"
		},
		controller: "interfaceEdit",
		replace: true,
		require: "^ngModel"
	};
})
.controller("interfaceEdit", function ($scope, $wifilife) {

	$scope.toggleSteering = function () {
		if ($scope.wiLiInterfaces.fhiface.steer.value.length)
			$scope.wiLiInterfaces.fhiface.steer.value = [];
		else
			$scope.wiLiInterfaces.fhiface.steer.value = ['rssi', 'bssload'];
	}

	$scope.addCustomMac = function (mac) {
		if (mac == null || mac.length == 0) {
			$scope.wiLiInterfaces.rssiExcl.error = $tr(gettext("Please enter a MAC"));
			return -1;
		}

		if (!$wifilife.validMac(mac)) {
			$scope.wiLiInterfaces.rssiExcl.error = $tr(gettext("Invalid MAC"));
			return -1;
		}

		if ($scope.wiLiInterfaces.fhiface.exclude.value.some(function (excluded) { return mac.indexOf(excluded) >= 0 })) {
			$scope.wiLiInterfaces.rssiExcl.error = $tr(gettext("The MAC is already excluded!"));
			return -1;
		}
		onExclude("fhiface", "exclude", "rssiExcl", mac)
		$scope.wiLiInterfaces.rssiExcl.rssiAll.push({label: mac, value: mac, switch: true});
	};

	$scope.onRssiUnexclude = function(mac) {
		onUnexclude("fhiface", "exclude", "rssiExcl", "unexcluded", mac);
	};

	$scope.onRssiExclude = function (mac) {
		onExclude("fhiface", "exclude", "rssiExcl", mac)
	};

	function onExclude(section, option, container, mac) {
		if (mac == null || mac.length == 0) {
			$scope.wiLiInterfaces[container].error = $tr(gettext("Please enter a MAC"));
			return -1;
		}

		if (!$wifilife.validMac(mac)) {
			$scope.wiLiInterfaces[container].error = $tr(gettext("Invalid MAC"));
			return -1;
		}

		if ($scope.wiLiInterfaces[section][option].value.some(function (excluded) { return mac.indexOf(excluded) >= 0})) {
			$scope.wiLiInterfaces[container].error = $tr(gettext("The MAC is already excluded!"));
			return -1;
		}

		var excluded = $scope.wiLiInterfaces[section][option].value.filter($wifilife.validMac); // not sure why we gotta filter it into new array..
		excluded.push(mac);
		$scope.wiLiInterfaces[section][option].value = excluded;
		$scope.wiLiInterfaces[container].excluded.push({ label: mac, value: mac })
		$scope.wiLiInterfaces[container].unexcluded = $scope.wiLiInterfaces[container].unexcluded.filter(function(pair) { return pair.value.indexOf(mac) < 0});
		$scope.wiLiInterfaces[container].error = null;
		$scope.wiLiInterfaces[container].exclude = null;
	};

	function onUnexclude(section, option, container, unexclude, mac) {
		if (mac == null)
			return;

		if ($wifilife.aps.filter(function(entry) { return entry.indexOf(mac) >= 0}).length > 0)
			unexclude += "Aps"

		$scope[section][option].value = $scope[section][option].value.filter(function(exl_mac) { return exl_mac.indexOf(mac) < 0});
		$scope[container].excluded = $scope[container].excluded.filter(function(pair) { return pair.value.indexOf(mac) < 0});
		$scope[container][unexclude].push({ label: mac, value: mac })
	}

	function hasSameVals(x, y) {
		return x.filter(function(client) {
			return !!(y.filter(function(client2) {
				return client == client2;
			}).length)
		}).length == x.length;
	}

	$scope.switchExclude = function (mac) {
		if (mac.switch)
			$scope.wiLiInterfaces.fhiface.exclude.value = $scope.wiLiInterfaces.fhiface.exclude.value.filter(function (exl_mac) { return exl_mac.indexOf(mac.value) < 0 });
		else {
			var excluded = $scope.wiLiInterfaces.fhiface.exclude.value.filter($wifilife.validMac);
			excluded.push(mac.value);
			$scope.wiLiInterfaces.fhiface.exclude.value = excluded;
		}

		if (hasSameVals($scope.wiLiInterfaces.fhiface.exclude.value, $scope.wiLiInterfaces.fhiface.excludeCpy) && hasSameVals($scope.wiLiInterfaces.fhiface.excludeCpy, $scope.wiLiInterfaces.fhiface.exclude.value))
			$scope.wiLiInterfaces.fhiface.exclude.value = $scope.wiLiInterfaces.fhiface.excludeCpy.slice();
	}

	$scope.updateSteer = function (option) {
		if (!$scope.wiLiInterfaces.steerOpts[option])
			$scope.wiLiInterfaces.fhiface.steer.value = $scope.wiLiInterfaces.fhiface.steer.value.filter(function(opt) { return !(opt === option)})
		else
			$scope.wiLiInterfaces.fhiface.steer.value = $scope.wiLiInterfaces.fhiface.steer.value.push(option)

		/* some issues with is_dirty when original is empty array */
		if (hasSameVals($scope.wiLiInterfaces.fhiface.steer.value, $scope.wiLiInterfaces.fhiface.steerCpy) && hasSameVals($scope.wiLiInterfaces.fhiface.steerCpy, $scope.wiLiInterfaces.fhiface.steer.value)) {
			$scope.wiLiInterfaces.fhiface.steer.value = $scope.wiLiInterfaces.fhiface.steerCpy.slice();
			$scope.wiLiInterfaces.fhiface.steer.is_dirty = false;
		} else
			$scope.wiLiInterfaces.fhiface.steer.is_dirty = true;
	}

});
