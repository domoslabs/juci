JUCI.app.directive("createRule", function () {
	return {
		templateUrl: "/widgets/create-rule.html",
		controller: "createRule",
		replace: true,
		restrict: 'E'
	};
}).
directive('basicPage', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: "/widgets/basic-page.html",
	};
}).
directive('expertPage', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: "/widgets/expert-page.html",
	};
}).
directive('rssiSteering', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: "/widgets/rssi-steering.html",
	};
}).
directive('cntlrPage', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: "/widgets/cntlr-page.html",
	};
}).
controller("wifilife", function ($scope, $rpc, $tr, $uci, $wifilife, $modal, $localStorage) {
	$scope.showExpert = $localStorage.getItem("mode") == "expert";
	$scope.rssiExcl = {};
	$scope.assocExcl = {};
	$scope.victims = [];
	$scope.includeRpt = false;
	$scope.collectionFrequency = [
		{ label: "high", value: "high" },
		{ label: "auto", value: "auto" },
		{ label: "low", value: "low" },
		{ label: "off", value: "off" }
	];

	function reloadLists() {
		//var repeaters = [];
		$wifilife.aps = [];
		$rpc.$call("wifix", "list_neighbor").done(function (vifs) {
			for (vif in vifs) {
				vifs[vif].forEach(function(node) {
					$wifilife.aps.push(node.bssid.toLowerCase());
				})
			}
			//$wifilife.repeaters = tree.nodes.filter(function(node) { return node.node_type.indexOf("repeater") >= 0 });
			//$wifilife.aps = repeaters.concat(tree.nodes.filter(function(node) { return node.node_type.indexOf("extender") >= 0 }));
		}).then(function() {
			$rpc.$call("wifix", "stas").done(function (vifs) {
				var rssiUnexcluded = [];
				var assocUnexcluded = [];


				for (vif in vifs) {
					rssiUnexcluded = rssiUnexcluded.concat(
						vifs[vif].filter(function(client) {
							return !$scope.steer.exclude.value.some(function(mac) {
								return client.macaddr.indexOf(mac) >= 0
							})
						})
					)

					rssiUnexcluded = rssiUnexcluded.filter(function(client) { return !$wifilife.aps.some(function(rpt) { return client.macaddr.indexOf(rpt.substr(9)) >= 0 })});

					assocUnexcluded = assocUnexcluded.concat(
						vifs[vif].filter(function(client) {
							return !$scope.assocCtrl.stas.value.some(function(mac) {
								return client.macaddr.indexOf(mac) >= 0
							}
						)
					}))

					assocUnexcluded = assocUnexcluded.filter(function(client) { return !$wifilife.aps.some(function(rpt) { return client.macaddr.indexOf(rpt.substr(9)) >= 0 })});
				}

				$scope.rssiExcl.unexcluded = rssiUnexcluded.map(function(client) { return ({ label: client.macaddr, value: client.macaddr })});
				$scope.assocExcl.unexcluded = assocUnexcluded.map(function(client) { return ({ label: client.macaddr, value: client.macaddr })});
				$scope.assocExcl.unexcludedAps = $wifilife.aps.map(function(ap) { return ({ label: ap, value: ap })});

				$scope.$apply();
			})

		});
	}

	function getTitle(title) {
		return title.split("_").map(function(elem) { return elem.charAt(0).toUpperCase() + elem.substr(1)}).join(" ");
	}

	$scope.getRuleTitle = function(item) {
		var title = item.action.value.charAt(0).toUpperCase() + item.action.value.substr(1);
		title += " ";
		title += item.sta.value;
		title += (item.action.value === "block" ? " from " : " to ");
		title += item.bss.value;

		return title;
	}

	function populateEntry (section) {
		if (section.priority.value != null)
			section.$statusList.push({ label: $tr(gettext("Priority")), value: section.priority.value })

		if (section.rssi_threshold.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.rssi_threshold.value + " dBm" })

		if (section.bssload_threshold.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.bssload_threshold.value + " %" })

		if (section.margin.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold Margin")), value: "± " + section.margin.value + " dB"})

		if (section.hysteresis.value != null)
			section.$statusList.push({ label: $tr(gettext("Hysteresis")), value: section.hysteresis.value})

		if (section.diffsnr.value != null)
			section.$statusList.push({ label: $tr(gettext("SNR Difference")), value: section.diffsnr.value + " dB" })

		if (section.params.value != null)
			section.params.value.forEach(function (param, i) { section.$statusList.push({ label: $tr(gettext("Param " + (i+1))), value: getTitle(param) })})
	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];
		$scope.wiLiInterfaces = $scope.wifilife.ifname.value.map(function(ifname) { return ({ label: ifname, value: ifname})});

		$scope.steer = $uci.wifilife["@steer"][0];
		$scope.assocCtrl = $uci.wifilife["@assoc_control"][0];
		$scope.params = [];
		$scope.cntlr = $uci.wifilife["@cntlr"][0];
		$scope.steerDefault = $uci.wifilife["@steer_default"][0];
		$scope.steerCustom = $uci.wifilife["@steer_custom"][0];
		$scope.customRules = $uci.wifilife["@rule_custom"];
		$scope.customRules.forEach(function(rule) {
			rule.$statusList = []
			rule.$statusList.push({ label: $tr(gettext("Action")), value: rule.action.value })
			rule.$statusList.push({ label: $tr(gettext("STA")), value: rule.sta.value })
			rule.$statusList.push({ label: $tr(gettext("BSS")), value: rule.bss.value })
		})

		$scope.rssiExcl.excluded = $scope.steer.exclude.value.map(function(mac) { return ({ label: mac, value: mac })});
		$scope.assocExcl.excluded = $scope.assocCtrl.stas.value.map(function(mac) { return ({ label: mac, value: mac })});

		$uci.wifilife["@steer-param"].forEach(function(section) {
			section.$statusList = [];
			$scope[section[".name"]] = section;

			populateEntry(section);
			$scope.params.push(section);
		});
	}).then(function() {
		reloadLists();
	});

	$uci.$sync("owsd").done(function () {
		$scope.ubusproxy = $uci.owsd.ubusproxy;
	})

	$uci.$sync("wireless").done(function () {
		$scope.wifiIface = $uci.wireless["@wifi-iface"][0];
		$scope.rrm = !!$scope.wifiIface.rrm.value;
	})

	$scope.onRssiUnexclude = function(mac) {
		onUnexclude("steer", "exclude", "rssiExcl", "unexcluded", mac);
	};

	$scope.onRssiExclude = function (mac) {
		onExclude("steer", "exclude", "rssiExcl", mac)
	};

	$scope.onAssocUnexclude = function (mac) {
		onUnexclude("assocCtrl", "stas", "assocExcl", "unexcluded", mac);
	};

	$scope.onAssocExclude = function (mac) {
		onExclude("assocCtrl", "stas", "assocExcl", mac)
	};

	$scope.onAssocApnExclude = function (mac) {
		onExcludeAp("assocCtrl", "stas", "assocExcl", mac);
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

	function onExclude(section, option, container, mac) {

		if (mac == null || mac.length == 0) {
			$scope[container].error = $tr(gettext("Please enter a MAC"));
			return -1;
		}

		if (!$wifilife.validMac(mac)) {
			$scope[container].error = $tr(gettext("Invalid MAC"));
			return -1;
		}

		if ($scope[section][option].value.some(function (excluded) { return mac.indexOf(excluded) >= 0})) {
			$scope[container].error = $tr(gettext("The MAC is already excluded!"));
			return -1;
		}

		var excluded = $scope[section][option].value.filter($wifilife.validMac); // not sure why we gotta filter it into new array..
		excluded.push(mac);
		$scope[section][option].value = excluded;
		$scope[container].excluded.push({ label: mac, value: mac })
		$scope[container].unexcluded = $scope[container].unexcluded.filter(function(pair) { return pair.value.indexOf(mac) < 0});
		$scope[container].error = null;
		$scope[container].exclude = null;
	};

	function onExcludeAp(section, option, container, mac) {

		if (mac == null || mac.length == 0)
			return -1;

		var excluded = $scope[section][option].value.filter($wifilife.validMac); // not sure why we gotta filter it into new array..
		excluded.push(mac);
		$scope[section][option].value = excluded;
		$scope[container].excluded.push({ label: mac, value: mac })
		$scope[container].unexcludedAps = $scope[container].unexcludedAps.filter(function(pair) { return pair.value.indexOf(mac) < 0});
	};

	$scope.onAddRule = function () {

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'widgets/create-rule.html',
			controller: 'createRule',
			scope: $scope
		});

		modalInstance.result.then(function (section) {
			;
		}, function () {
			;
		});
	}

	$scope.onDeleteRule = function (item) {
		item.$delete().done(function () {
			$scope.$apply();
		});
	}

	$scope.toggleRrm = function () {
		$scope.rrm = !$scope.rrm;
		$scope.wifiIface.rrm.value = $scope.rrm ? 2 : 0;
	}

});
