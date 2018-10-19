JUCI.app.
controller("wifilife", function ($scope, $rpc, $tr, $uci, $wifilife) {

	function populateEntry (section) {
		if (section.priority.value != null) {
			section.$statusList.push({ label: $tr(gettext("Priority")), value: section.priority.value })
		}
		if (section.rssi_threshold.value != null) {
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.rssi_threshold.value + " dBm" })
		}
		if (section.bssload_threshold.value != null) {
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.bssload_threshold.value + " %" })
		}
		if (section.threshold_margin.value != null) {
			section.$statusList.push({ label: $tr(gettext("Threshold Margin")), value: "± " + section.threshold_margin.value + " db"})
		}
		if (section.hysteresis.value != null) {
			section.$statusList.push({ label: $tr(gettext("Hysteresis")), value: section.hysteresis.value})
		}
		if (section.snr_diff.value != null) {
			section.$statusList.push({ label: $tr(gettext("SNR Difference")), value: section.snr_diff.value + " db" })
		}
	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];
		$scope.steer = $uci.wifilife["@steer"][0];
		//$scope.$wifilife
		console.log("481");

		$scope.params = [];

		$uci.wifilife["@steer-param"].forEach(function (section) {
			section.$statusList = [];
			$scope[section[".name"]] = section;

			populateEntry(section);
			$scope.params.push(section);
			/*for (let key in section) {
				console.log("14", key, ", ",  section[key]);
				if (key.charAt(0).toUpperCase() === key.charAt(0).toLowerCase())
					continue;
				console.log(key);
				if (section[key].value == null)
					continue;
				section.$statusList.push({ label: $tr(gettext(key.charAt(0).toUpperCase() + key.substr(1))), value: section[key].value});
			}
			$scope.params.push(section);
			console.log(section);*/
		});
	});

	console.log("27");
});
