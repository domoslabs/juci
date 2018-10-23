JUCI.app.
controller("wifilife", function ($scope, $rpc, $tr, $uci, $wifilife) {

	$scope.rssi_excl = {};
	$scope.assoc_excl = {};

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
		$scope.assocCtrl = $uci.wifilife["@assoc_control"][0];
		$scope.params = [];

		$scope.rssi_excl.excluded = $scope.steer.exclude.value.map(mac => ({ label: mac, value: mac }));
		$scope.assoc_excl.excluded = $scope.assocCtrl.stas.value.map(mac => ({ label: mac, value: mac }));

		$uci.wifilife["@steer-param"].forEach(section => {
			section.$statusList = [];
			$scope[section[".name"]] = section;

			populateEntry(section);
			$scope.params.push(section);
		});
	}).then(function() {
		$rpc.$call("wifix", "stas").done(function (vifs) {
			let rssiUnexcluded = [];
			let assocUnexcluded = [];

			for (vif in vifs) {
				rssiUnexcluded = rssiUnexcluded.concat(
					vifs[vif].filter(client =>
						!$scope.steer.exclude.value.some(mac =>
							client.macaddr.indexOf(mac) >= 0)
					)
				)

				assocUnexcluded = assocUnexcluded.concat(
					vifs[vif].filter(client =>
						!$scope.assocCtrl.stas.value.some(mac =>
							client.macaddr.indexOf(mac) >= 0)
					)
				)
			}

			$scope.rssi_excl.unexcluded = rssiUnexcluded.map(client =>
				({ label: client.macaddr, value: client.macaddr })
			);

			$scope.assoc_excl.unexcluded = assocUnexcluded.map(client =>
				({ label: client.macaddr, value: client.macaddr })
			);
			console.log($scope.assoc_excl.unexcluded);
		});
	});

	function validMac(mac) {
		return mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17;
	}

	$scope.onUnexclude = function() {
		console.log($scope.rssi_excl.unexclude);
		$scope.steer.exclude.value = $scope.steer.exclude.value.filter(mac => mac.indexOf($scope.rssi_excl.unexclude) < 0);
		$scope.rssi_excl.excluded = $scope.rssi_excl.excluded.filter(pair => pair.value.indexOf($scope.rssi_excl.unexclude) < 0);
		$scope.rssi_excl.unexcluded.push({ label: $scope.rssi_excl.unexclude, value: $scope.rssi_excl.unexclude })
	};

	$scope.onExcludeMan = function(mac) {
		if (!mac || mac.length == 0) {
			$scope.rssi_excl.error = $tr(gettext("Please enter a MAC"));
			return;
		}

		if (!validMac(mac)) {
			$scope.rssi_excl.error = $tr(gettext("Invalid MAC, please give in the format aa:bb:cc:dd:ee:ff"));
			return;
		}

		if ($scope.steer.exclude.value.some(excluded => mac.indexOf(excluded) >= 0)) {
			$scope.rssi_excl.error = $tr(gettext("The MAC is already excluded!"));
			return;
		}

		$scope.rssi_excl.error = null;
		$scope.onExclude(mac);
	}

	$scope.onExclude = function (mac) {
		let excluded = $scope.steer.exclude.value.filter(validMac); // not sure why we gotta filter it into new array..
		excluded.push(mac);
		$scope.steer.exclude.value = excluded;
		$scope.rssi_excl.excluded.push({ label: mac, value: mac })
		$scope.unexcluded = $scope.rssi_excl.unexcluded.filter(pair => pair.value.indexOf(mac) < 0);
	};

	$scope.onAssocUnexclude = function () {
		$scope.assocCtrl.stas.value = $scope.assocCtrl.stas.value.filter(mac => mac.indexOf($scope.assoc_excl.unexclude) < 0);
		$scope.assoc_excl.excluded = $scope.assoc_excl.excluded.filter(pair => pair.value.indexOf($scope.assoc_excl.unexclude) < 0);
		$scope.assoc_excl.unexcluded.push({ label: $scope.assoc_excl.unexclude, value: $scope.assoc_excl.unexclude })
	};

	$scope.onAssocExcludeMan = function (mac) {
		if (!mac || mac.length == 0) {
			$scope.assoc_excl.error = $tr(gettext("Please enter a MAC"));
			return;
		}

		if (!validMac(mac)) {
			$scope.assoc_excl.error = $tr(gettext("Invalid MAC, please give in the format aa:bb:cc:dd:ee:ff"));
			return;
		}

		if ($scope.assocCtrl.stas.value.some(excluded => mac.indexOf(excluded) >= 0)) {
			$scope.assoc_excl.error = $tr(gettext("The MAC is already excluded!"));
			return;
		}

		$scope.assoc_excl.error = null;
		$scope.onExclude(mac);
	}

	$scope.onAssocExclude = function (mac) {
		let excluded = $scope.assocCtrl.stas.value.filter(validMac); // not sure why we gotta filter it into new array..
		excluded.push(mac);
		$scope.assocCtrl.stas.value = excluded;
		$scope.assoc_excl.excluded.push({ label: mac, value: mac })
		$scope.assoc_excl.unexcluded = $scope.assoc_excl.unexcluded.filter(pair => pair.value.indexOf(mac) < 0);
	};

});
