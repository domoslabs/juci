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
controller("wifilife", function ($scope, $rpc, $tr, gettext, $uci, $wifilife, $modal, $localStorage, $juciDialog, $wireless, $juciConfirm) {
	$scope.showExpert = $localStorage.getItem("mode") == "expert";
	$scope.rssiExcl = {};
	$scope.rssiExcl.unexcluded = [];
	$scope.rssiExcl.rssiAll = [];
	$scope.assocExcl = {};
	$scope.victims = [];
	$scope.includeRpt = false;
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

	function reloadList(iface) {
		$rpc.$call("wifix", "list_neighbor").done(function (vifs) {
			for (vif in vifs) {
				vifs[vif].forEach(function(node) {
					$wifilife.aps.push(node.bssid.toLowerCase());
				})
			}
		}).then(function() {
			$rpc.$call("wifix", "stations").done(function (vifs) {
				var rssiUnexcluded = [];

				/* gather all clients which are not excluded */
				rssiUnexcluded = vifs.stations.filter(function(client) {
					return !iface.fhiface.exclude.value.some(function(mac) {
						return client.macaddr.indexOf(mac) >= 0
					})
				})

				/* remove APs from unexcluded list */
				rssiUnexcluded = rssiUnexcluded.filter(function(client) { return !$wifilife.aps.some(function(rpt) { return client.macaddr.indexOf(rpt.substr(9)) >= 0 })});

				iface.rssiExcl.unexcluded = rssiUnexcluded.map(function(client) { return ({ label: client.macaddr, value: client.macaddr })});
				iface.rssiExcl.rssiAll = iface.rssiExcl.excluded.map(function(client) {
					client.switch = true;
					return client;
				})

				iface.rssiExcl.rssiAll = iface.rssiExcl.rssiAll.concat(iface.rssiExcl.unexcluded.map(function(client) {
					client.switch = false;
					return client;
				}));

				iface.rssiExcl.excludeCpy = iface.rssiExcl.excluded.slice();
				$scope.$apply();
			})

		});
	}

	function getTitle(title) {
		return title.split("_").map(function(elem) { return elem.charAt(0).toUpperCase() + elem.substr(1)}).join(" ");
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

	function populateParams(section) {
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

	function populateSteerOpts(iface) {
		iface.$statusList.push({ label: $tr(gettext("RSSI Steering")), value: iface.steerOpts.rssi })
		iface.$statusList.push({ label: $tr(gettext("BSSLOAD Steering")), value: iface.steerOpts.bssload })
	}

	$scope.update = function() {
		$uci.$sync("wifilife").done(function () {
			$scope.wifilife = $uci.wifilife["@wifilife"][0];
			/*$scope.wiLiInterfaces = data.filter(function(iface) {
				return iface[".frequency"] === "5GHz";
			}).map(function(iface) {*/
			$scope.wiLiInterfaces = $uci.wifilife["@fh-iface"].map(function(iface) {
				return { label: iface.ifname.value, value: iface.ifname.value };
			}).map(function(iface) {
				iface.fhiface = $uci.wifilife["@fh-iface"].find(function(fhi) { return fhi.ifname.value === iface.value });
				if (!iface.fhiface) {
					/* TODO: test non-existent interface */
					$uci.wifilife.$create({
						".type": "fh-iface",
						"ifname": iface.value
					}).done(function(data) {
						iface.fhiface = data;
					})
				}

				if (iface.fhiface.steer.value.length) // TODO: find for rssi/bssload
					iface.enable = true;

				iface.fhiface.excludeCpy = iface.fhiface.exclude.value.slice();
				iface.fhiface.steerCpy = iface.fhiface.steer.value.slice();
				iface.rssiExcl = {};
				iface.rssiExcl.excluded = iface.fhiface.exclude.value.map(function(mac) { return ({ label: mac, value: mac })});

				iface.steerOpts = {
					rssi: !!iface.fhiface.steer.value.find(function(opt) { return opt === 'rssi' }),
					bssload: !!iface.fhiface.steer.value.find(function(opt) { return opt === 'bssload' })
				}

				reloadList(iface);
				iface.$statusList = [];
				populateSteerOpts(iface);
				return iface;
			})

			$scope.params = [];
			$uci.wifilife["@steer-param"].forEach(function(section) {
				section.$statusList = [];
				$scope[section[".name"]] = section;

				populateParams(section);
				$scope.params.push(section);
			});

			$scope.$apply();
		})
	}

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
		if(!$scope.has5G) return;
		$scope.rrm = !$scope.rrm;
		$scope.wifiIface.rrm.value = $scope.rrm ? 255 : 0;
	}

	$scope.onCreateSteerIface = function () {
		var ifaces = [];

		$wireless.getInterfaces().done(function(iface) {
			if (iface[".frequency"] === "5GHz")
				ifaces.push({value: iface.ifname.value, label: iface.ifname.value});
		});

		if($scope.wiLiInterfaces.length >= 4){
				alert($tr(gettext("No more than four interfaces may be configured at a time!")));
				return;
		}
		var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'widgets/wifilife-create-steer-iface.html',
				controller: 'wifilifeCreateSteerIface',
				resolve: {
						interfaces: function () {
								return ifaces;
						}
				},
				scope: $scope
		});

		modalInstance.result.then(function (data) {
				$uci.wifilife.$create({
					".type": "fh-iface",
					"ifname": data.interface
				}).done(function(interface){
					$scope.update();
					$scope.$apply();
				});
		}, function () {
				console.log('Modal dismissed at: ' + new Date());
		});
	}

	$scope.onDeleteSteerIface = function(conn){
		if(!conn) alert($tr(gettext("Please select a connection in the list!")));
		$juciConfirm.show($tr(gettext("Are you sure you want to delete this steering interface?"))).done(function(){
				conn.fhiface.$delete().done(function(){
					$scope.update();
					$scope.$apply();
				});
		});
	}

	$scope.update();
});
