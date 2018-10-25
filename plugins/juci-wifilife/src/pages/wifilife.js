JUCI.app.
controller("wifilife", function ($scope, $rpc, $tr, $uci) {

	$scope.rssiExcl = {};
	$scope.assocExcl = {};
	$scope.victims = [];
	$scope.showRpt = false;
	$scope.showRptAssoc = false;

	function reloadLists() {
		let repeaters = [];

		$rpc.$call("topology", "tree").done(function (tree) {
			repeaters = tree.nodes.filter(node => node.node_type.indexOf("repeater") >= 0);
		}).then(function() {
			$rpc.$call("wifix", "stas").done(function (vifs) {
				let rssiUnexcluded = [];
				let assocUnexcluded = [];

				console.log($scope.showRpt, $scope.showRptAssoc);
				console.log("repeaters", repeaters);

				for (vif in vifs) {
					rssiUnexcluded = rssiUnexcluded.concat(
						vifs[vif].filter(client =>
							!$scope.steer.exclude.value.some(mac =>
								client.macaddr.indexOf(mac) >= 0)
						)
					)

					rssiUnexcluded = rssiUnexcluded.filter(client => ($scope.showRpt || !repeaters.some(rpt => client.macaddr.indexOf(rpt.mac) >= 0)));

					assocUnexcluded = assocUnexcluded.concat(
						vifs[vif].filter(client =>
							!$scope.assocCtrl.stas.value.some(mac =>
								client.macaddr.indexOf(mac) >= 0)
						)
					)

					assocUnexcluded = assocUnexcluded.filter(client => ($scope.showRptAssoc || !repeaters.some(rpt => client.macaddr.indexOf(rpt.mac) >= 0)));
				}

				$scope.rssiExcl.unexcluded = rssiUnexcluded.map(client => ({ label: client.macaddr, value: client.macaddr }));
				$scope.assocExcl.unexcluded = assocUnexcluded.map(client => ({ label: client.macaddr, value: client.macaddr }));

				console.log($scope.rssiExcl.unexcluded);
				console.log($scope.rssiExcl.excluded);
				console.log($scope.assocExcl.unexcluded);
				console.log($scope.assocExcl.excluded);
				$scope.$apply();
			})

		});
	}

	function getTitle(title) {
		return title.split("_").map(elem => elem.charAt(0).toUpperCase() + elem.substr(1)).join(" ");
	}

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

		if (section.params.value != null)
			section.params.value.forEach((param, i) => section.$statusList.push({ label: $tr(gettext("Param " + (i+1))), value: getTitle(param) }))
	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];
		$scope.wiLiInterfaces = $scope.wifilife.ifname.value.map(ifname => ({ label: ifname, value: ifname}));

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
			console.log(section.params.value);
		});
	}).then(function() {
		console.log($scope.bssload.victims.value)

		reloadLists();
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

	$scope.onExclude = function (section, option, container, mac) {
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

		let excluded = $scope[section][option].value.filter(validMac); // not sure why we gotta filter it into new array..
		excluded.push(mac);
		$scope[section][option].value = excluded;
		$scope[container].excluded.push({ label: mac, value: mac })
		$scope[container].unexcluded = $scope[container].unexcluded.filter(pair => pair.value.indexOf(mac) < 0);
		$scope[container].exclude = null;
		$scope[container].error
		console.log(excluded, "\n", $scope[container].excluded, "\n", $scope[container].unexcluded)
	};

	$scope.toggleShowRpt = function () {
		$scope.showRpt = !$scope.showRpt;
		reloadLists();
	}

	$scope.toggleShowRptAssoc = function () {
		$scope.showRptAssoc = !$scope.showRptAssoc;
		reloadLists();
	}

});
