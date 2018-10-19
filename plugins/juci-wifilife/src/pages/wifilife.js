JUCI.app.
controller("wifilife", function ($scope, $rpc, $tr, $uci, $wifilife) {

	function populateEntry (section) {
		if (section.priority.value != null)
			section.$statusList.push({ label: $tr(gettext("Priority")), value: section.priority.value })

		if (section.rssi_threshold.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.rssi_threshold.value + " dBm" })

		if (section.bssload_threshold.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold")), value: section.bssload_threshold.value + " %" })

		if (section.threshold_margin.value != null)
			section.$statusList.push({ label: $tr(gettext("Threshold Margin")), value: "± " + section.threshold_margin.value + " db"})

		if (section.hysteresis.value != null)
			section.$statusList.push({ label: $tr(gettext("Hysteresis")), value: section.hysteresis.value})

		if (section.snr_diff.value != null)
			section.$statusList.push({ label: $tr(gettext("SNR Difference")), value: section.snr_diff.value + " db" })
	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];
		$scope.steer = $uci.wifilife["@steer"][0];

		$scope.params = [];

		$uci.wifilife["@steer-param"].forEach(function (section) {
			section.$statusList = [];
			$scope[section[".name"]] = section;

			populateEntry(section);
			$scope.params.push(section);
		});
	});

	console.log("27");
});
