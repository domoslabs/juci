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
controller("wifilife", function ($scope, $rpc, $tr, gettext, $uci, $wifilife, $modal, $localStorage, $juciDialog, $wireless) {
	$scope.showExpert = $localStorage.getItem("mode") == "expert";
	$scope.rssiExcl = {};
	$scope.rssiExcl.unexcluded = [];
	$scope.rssiExcl.rssiAll = [];
	$scope.assocExcl = {};
	$scope.victims = [];
	$scope.includeRpt = false;
	$scope.data = {enable: false};
	$wifilife.aps = [];
	$scope.collectionFrequency = [
		{ label: "high", value: "high" },
		{ label: "auto", value: "auto" },
		{ label: "low", value: "low" },
		{ label: "off", value: "off" }
	];

	$rpc.$list().done(function (list) {
		var ipAps = []
		ipAps = Object.keys(list).filter(function (obj) {
			return obj.indexOf("/") > -1;
		}).map(function (obj) {
			return obj.split("/")[0];
		}).filter(function (obj, index, self) {
			return self.indexOf(obj) === index;
		});

		$rpc.$call("router.net", "arp").done(function (table) {
			table.table.forEach(function(entry) {
				if (ipAps.some(function (ip) { return ip.indexOf(entry.ipaddr) > -1; }))
					$wifilife.aps.push(entry.macaddr);
			})
		})
	})

	function reloadLists() {
		$rpc.$call("wifix", "list_neighbor").done(function (vifs) {
			for (vif in vifs) {
				vifs[vif].forEach(function(node) {
					$wifilife.aps.push(node.bssid.toLowerCase());
				})
			}
		}).then(function() {
			$rpc.$call("wifix", "stations").done(function (vifs) {
				var rssiUnexcluded = [];
				var assocUnexcluded = [];

				for (vif in vifs) {
					rssiUnexcluded = rssiUnexcluded.concat(
						vifs[vif].filter(function(client) {
							return !$scope.fhiface.exclude.value.some(function(mac) {
								return client.macaddr.indexOf(mac) >= 0
							})
						})
					)

					rssiUnexcluded = rssiUnexcluded.filter(function(client) { return !$wifilife.aps.some(function(rpt) { return client.macaddr.indexOf(rpt.substr(9)) >= 0 })});

					assocUnexcluded = assocUnexcluded.concat(
						vifs[vif].filter(function(client) {
							return !$scope.fhiface.restrict.value.some(function(mac) {
								return client.macaddr.indexOf(mac) >= 0
							}
						)
					}))

					assocUnexcluded = assocUnexcluded.filter(function(client) { return !$wifilife.aps.some(function(rpt) { return client.macaddr.indexOf(rpt.substr(9)) >= 0 })});
				}
				$scope.rssiExcl.unexcluded = rssiUnexcluded.map(function(client) { return ({ label: client.macaddr, value: client.macaddr })});
				$scope.assocExcl.unexcluded = assocUnexcluded.map(function(client) { return ({ label: client.macaddr, value: client.macaddr })});
				$scope.assocExcl.unexcludedAps = $wifilife.aps.map(function(ap) { return ({ label: ap, value: ap })});
				$scope.rssiExcl.rssiAll = $scope.rssiExcl.excluded.map(function(client) {
					client.switch = true;
					return client;
				})

				$scope.rssiExcl.rssiAll = $scope.rssiExcl.rssiAll.concat($scope.rssiExcl.unexcluded.map(function(client) {
					client.switch = false;
					return client;
				}));

				$scope.rssiExcl.rssiAll = $scope.rssiExcl.rssiAll.filter(function(client) {
					return !$wifilife.aps.some(function (rpt) {
						return client.value.indexOf(rpt.substr(9)) >= 0 }) // duplicate at a lot of places, make func
				})

				$scope.rssiExcl.excludeCpy = $scope.rssiExcl.excluded.slice();
				$scope.$apply();
			})

		});
	}

	function getTitle(title) {
		return title.split("_").map(function(elem) { return elem.charAt(0).toUpperCase() + elem.substr(1)}).join(" ");
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
			$scope.fhiface.exclude.value = $scope.fhiface.exclude.value.filter(function (exl_mac) { return exl_mac.indexOf(mac.value) < 0 });
		else {
			var excluded = $scope.fhiface.exclude.value.filter($wifilife.validMac); // not sure why we gotta filter it into new array..
			excluded.push(mac.value);
			$scope.fhiface.exclude.value = excluded;
		}

		if (hasSameVals($scope.fhiface.exclude.value, $scope.excludeCpy) && hasSameVals($scope.excludeCpy, $scope.fhiface.exclude.value))
			$scope.fhiface.exclude.value = $scope.excludeCpy.slice();
	}

	$scope.nonManualDev = function () {
		;
	}

	$scope.getRuleTitle = function(item) {
		var title = item.action.value.charAt(0).toUpperCase() + item.action.value.substr(1);
		title += " ";
		title += item.sta.value;
		title += (item.action.value === "block" ? " from " : " to ");
		title += item.bss.value;

		return title;
	}

	function populateEntry(section) {
		if (section[".name"] === "bssload") {
			section.$statusList.push({ label: $tr(gettext("Priority")), value: section.priority.value })
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.bssload_threshold.value + " %" })
		} else if (section[".name"] === "rssi") {
			section.$statusList.push({ label: $tr(gettext("Priority")), value: section.priority.value })
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.rssi_threshold.value + " dBm" })
			section.$statusList.push({ label: $tr(gettext("Threshold Margin")), value: "± " + section.margin.value + " dB" })
			section.$statusList.push({ label: $tr(gettext("Hysteresis")), value: section.hysteresis.value })
			section.$statusList.push({ label: $tr(gettext("SNR Difference")), value: section.diffsnr.value + " dB" })
		}
	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];

		$wireless.getInterfaces().done(function(data) {
			$scope.wiLiInterfaces = data.filter(function(iface) {
				return iface[".frequency"] === "5GHz";
			}).map(function(iface) {
				return { label: iface.ifname.value, value: iface.ifname.value };
			})

			$scope.fhiface = $uci.wifilife["@fh-iface"].filter(function(iface) {
				return iface.ifname.value === $scope.wiLiInterfaces[0].value; // Select the first option in the menu as default
			})[0];
			/* create on auto-selection if it does not exist */
			if (!$scope.fhiface) {
				$uci.wifilife.$create({
					".type": "fh-iface",
					"ifname": $scope.wiLiInterfaces[0].value
				}).done(function(data) {
					$scope.fhiface = data;
				})
			}

			$scope.data.ifname = $scope.fhiface.ifname.value;
			if ($scope.fhiface.steer.value.length) // TODO: find for rssi/bssload
				$scope.data.enable = true;
			$scope.excludeCpy = $scope.fhiface.exclude.value.slice();
			$scope.params = [];

			/* To be developed */
			/*
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
			*/

			$scope.rssiExcl.excluded = $scope.fhiface.exclude.value.map(function(mac) { return ({ label: mac, value: mac })});
			$scope.assocExcl.excluded = $scope.fhiface.restrict.value.map(function(mac) { return ({ label: mac, value: mac })});

			$uci.wifilife["@steer-param"].forEach(function(section) {
				section.$statusList = [];
				$scope[section[".name"]] = section;

				populateEntry(section);
				$scope.params.push(section);
			});
			$scope.$apply();

		}).then(function() {
			reloadLists();
		})


		$scope.$apply();
	})

	$uci.$sync("owsd").done(function () {
		$scope.ubusproxy = $uci.owsd.ubusproxy;
	})

	$uci.$sync("wireless").done(function () {
		$scope.wifiIface = $uci.wireless["@wifi-iface"].find(function(iface){
			if(!iface.device) return false;
			var radio = $uci.wireless[iface.device.value];
			return radio && radio.band && radio.band.value === "a";
		});
		if($scope.wifiIface){
			$scope.rrm = !!$scope.wifiIface.rrm.value;
			$scope.has5G = true;
		} else {
			$scope.has5G = false;
		}
	})

	$scope.onRssiUnexclude = function(mac) {
		onUnexclude("fhiface", "exclude", "rssiExcl", "unexcluded", mac);
	};

	$scope.onRssiExclude = function (mac) {
		onExclude("fhiface", "exclude", "rssiExcl", mac)
	};

	$scope.addCustomMac = function (mac) {
		if (mac == null || mac.length == 0) {
			$scope.rssiExcl.error = $tr(gettext("Please enter a MAC"));
			return -1;
		}

		if (!$wifilife.validMac(mac)) {
			$scope.rssiExcl.error = $tr(gettext("Invalid MAC"));
			return -1;
		}

		if ($scope.fhiface.exclude.value.some(function (excluded) { return mac.indexOf(excluded) >= 0 })) {
			$scope.rssiExcl.error = $tr(gettext("The MAC is already excluded!"));
			return -1;
		}
		onExclude("fhiface", "exclude", "rssiExcl", mac)
		$scope.rssiExcl.rssiAll.push({label: mac, value: mac, switch: true});
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

	$scope.update11r = function(val) {
		if (!$scope.wifiIface) return;
		if (!val || ($scope.wifiIface.encryption.value.indexOf("wep") === -1 && $scope.wifiIface.encryption.value !== "none")) return;
		function acknowledge() {
			var deferred = $.Deferred();
			$juciDialog.show(null, {
				title: $tr(gettext("802.11r Encryption")),
				content: $tr(gettext("802.11r cannot be enabled with encryption set to WEP or None. Change this before enabling 802.11r.")),
				buttons: [
					{ label: $tr(gettext("Cancel")), value: "cancel", primary: true },
				],
				on_button: function (btn, inst) {
					inst.close();
					//deferred.resolve("yes");
				}
			});

			return deferred.promise();
		}
		acknowledge();
		$scope.wifiIface.ieee80211r.value = false;
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

	$scope.toggleSteering = function () {
		if ($scope.fhiface.steer.value.length)
			$scope.fhiface.steer.value = [];
		else
			$scope.fhiface.steer.value = ['rssi', 'bssload'];
	}

	$scope.selectFhIface = function(ifname) {
		$scope.fhiface = $uci.wifilife["@fh-iface"].filter(function(iface) {
			return iface.ifname.value === ifname;
		})[0];

		if (!$scope.fhiface) {
			$uci.wifilife.$create({
				".type": "fh-iface",
				"ifname": $scope.wiLiInterfaces[0].value
			}).done(function(data) {
				$scope.fhiface = data;
			})
		}

		if ($scope.fhiface.steer.value.length) // TODO: find for rssi/bssload
			$scope.data.enable = true;
		$scope.excludeCpy = $scope.fhiface.exclude.value.slice();
		$scope.rssiExcl.excluded = $scope.fhiface.exclude.value.map(function(mac) { return ({ label: mac, value: mac })});
		$scope.rssiExcl.excluded = $scope.fhiface.exclude.value.map(function(mac) { return ({ label: mac, value: mac })});
		$scope.assocExcl.excluded = $scope.fhiface.restrict.value.map(function(mac) { return ({ label: mac, value: mac })});
		reloadLists();
	}

	$scope.toggleRrm = function () {
		if(!$scope.has5G) return;
		$scope.rrm = !$scope.rrm;
		$scope.wifiIface.rrm.value = $scope.rrm ? 255 : 0;
	}

});
