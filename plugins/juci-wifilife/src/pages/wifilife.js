JUCI.app.
controller("wifilife", function ($scope, $rpc, $tr, $uci, $wifilife) {

	$scope.rssi_excl = {};

	function populateEntry (section) {
		if (section.priority.value != null)
			section.$statusList.push({ label: $tr(gettext("Priority")), value: section.priority.value })

		if (section.rssi_threshold.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.rssi_threshold.value + " dBm" })

		if (section.bssload_threshold.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.bssload_threshold.value + " %" })

		if (section.threshold_margin.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold Margin")), value: "± " + section.threshold_margin.value + " dB"})

		if (section.hysteresis.value != null)
			section.$statusList.push({ label: $tr(gettext("Hysteresis")), value: section.hysteresis.value})

		if (section.snr_diff.value != null)
			section.$statusList.push({ label: $tr(gettext("SNR Difference")), value: section.snr_diff.value + " dB" })
	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];
		$scope.wiLiInterfaces = $scope.wifilife.ifname.value.map(ifname => ({ label: ifname, value: ifname}));

		$scope.$apply();
		$scope.steer = $uci.wifilife["@steer"][0];
		$scope.params = [];

		$scope.excluded = $scope.steer.exclude.value.map(mac => ({ label: mac, value: mac }));

		$uci.wifilife["@steer-param"].forEach(section => {
			section.$statusList = [];
			$scope[section[".name"]] = section;

			populateEntry(section);
			$scope.params.push(section);
		});
	}).then(function() {
		$rpc.$call("wifix", "stas").done(function (vifs) {
			let unexcluded = [];

			for (vif in vifs) {
				unexcluded = unexcluded.concat(
					vifs[vif].filter(client =>
						!$scope.steer.exclude.value.some(mac =>
							client.macaddr.indexOf(mac) >= 0)
					)
				)
			}

			$scope.unexcluded = unexcluded.map(client =>
				({ label: client.macaddr, value: client.macaddr })
			);
		});
	});

	$scope.onUnexclude = function() {
		$scope.steer.exclude.value = $scope.steer.exclude.value.filter(mac => mac.indexOf($scope.rssi_excl.unexclude) < 0);
		$scope.excluded = $scope.excluded.filter(pair => pair.value.indexOf($scope.rssi_excl.unexclude) < 0);
		$scope.unexcluded.push({ label: $scope.rssi_excl.unexclude, value: $scope.rssi_excl.unexclude })
	};

	$scope.onExclude = function () {

		let excluded = $scope.steer.exclude.value.filter((mac) => mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17); // not sure why we gotta filter it into new array..
		excluded.push($scope.rssi_excl.exclude);
		$scope.steer.exclude.value = excluded;
		$scope.excluded.push({ label: $scope.rssi_excl.exclude, value: $scope.rssi_excl.exclude})
		$scope.unexcluded = $scope.unexcluded.filter(pair => pair.value.indexOf($scope.rssi_excl.exclude) < 0);
	};

});
