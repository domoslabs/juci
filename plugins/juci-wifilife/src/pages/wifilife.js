JUCI.app.
controller("wifilife", function ($scope, $rpc, $tr, $uci) {

	$scope.rssiExcl = {};
	$scope.assocExcl = {};
	$scope.victims = [];

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

		if (section.victims.value != null) {
			section.victims.value.forEach(victim =>	section.$statusList.push({ label: $tr(gettext("Victim")), value: victim}));
			section.victimsList = section.victims.value.map(victim => ({ label: $tr(gettext(victim)), value: victim }));

			$rpc.$call("wifix", "stas").done(function (vifs) {
				let nonVictims = [];

				for (vif in vifs) {
					nonVictims = nonVictims.concat(
						vifs[vif].filter(client =>
							!section.victimsList.some(victim => client.macaddr.indexOf(victim.value) >= 0)
						)
					)
				}

				section.nonVictims = nonVictims.map(client => ({ label: client.macaddr, value: client.macaddr }));
			});
		}
	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];
		$scope.wiLiInterfaces = $scope.wifilife.ifname.value.map(ifname => ({ label: ifname, value: ifname}));

		$scope.$apply();
		$scope.steer = $uci.wifilife["@steer"][0];
		$scope.assocCtrl = $uci.wifilife["@assoc_control"][0];
		$scope.params = [];

		$scope.rssiExcl.excluded = $scope.steer.exclude.value.map(mac => ({ label: mac, value: mac }));
		$scope.assocExcl.excluded = $scope.assocCtrl.stas.value.map(mac => ({ label: mac, value: mac }));

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

			$scope.rssiExcl.unexcluded = rssiUnexcluded.map(client => ({ label: client.macaddr, value: client.macaddr }));
			$scope.assocExcl.unexcluded = assocUnexcluded.map(client => ({ label: client.macaddr, value: client.macaddr }));

			console.log($scope.rssiExcl.unexcluded);
			console.log($scope.rssiExcl.excluded);
			console.log($scope.assocExcl.unexcluded);
			console.log($scope.assocExcl.excluded);
		});
	});

	function validMac(mac) {
		return mac.length != null && mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17;
	}

	$scope.onRssiUnexclude = function(mac) {
		$scope.onUnexclude("steer", "exclude", "rssiExcl", mac);
	};

	$scope.onRssiExcludeMan = function(mac) {
		$scope.onExcludeMan("steer", "exclude", "rssiExcl", mac);
	}

	$scope.onRssiExclude = function (mac) {
		$scope.onExclude("steer", "exclude", "rssiExcl", mac);
	};

	$scope.onAssocUnexclude = function (mac) {
		$scope.onUnexclude("assocCtrl", "stas", "assocExcl", mac);
	};

	$scope.onAssocExcludeMan = function (mac) {

		$scope.onExcludeMan("assocCtrl", "stas", "assocExcl", mac);
	}

	$scope.onAssocExclude = function (mac) {
		$scope.onExclude("assocCtrl", "stas", "assocExcl", mac);
	};

	$scope.onUnexclude = function (section, option, container, mac) {
		if (mac == null)
			return;

		$scope[section][option].value = $scope[section][option].value.filter(exl_mac => exl_mac.indexOf(mac) < 0);
		$scope[container].excluded = $scope[container].excluded.filter(pair => pair.value.indexOf(mac) < 0);
		$scope[container].unexcluded.push({ label: mac, value: mac })
	}

	$scope.onExcludeMan = function (section, option, container, mac) {
		if (!mac || mac.length == 0) {
			$scope[container].error = $tr(gettext("Please enter a MAC"));
			return;
		}

		if (!validMac(mac)) {
			$scope[container].error = $tr(gettext("Invalid MAC"));
			return;
		}

		if ($scope[section][option].value.some(excluded => mac.indexOf(excluded) >= 0)) {
			$scope[container].error = $tr(gettext("The MAC is already excluded!"));
			return;
		}

		$scope[container].error = null;
		$scope.onExclude(section, option, container, mac);
	}

	$scope.onExclude = function (section, option, container, mac) {
		if (mac == null)
			return;

		let excluded = $scope[section][option].value.filter(validMac); // not sure why we gotta filter it into new array..
		excluded.push(mac);
		$scope[section][option].value = excluded;
		$scope[container].excluded.push({ label: mac, value: mac })
		$scope[container].unexcluded = $scope[container].unexcluded.filter(pair => pair.value.indexOf(mac) < 0);
	};

});
