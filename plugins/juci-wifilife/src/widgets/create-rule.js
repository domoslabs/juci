JUCI.app.
	controller("createRule", function ($scope, $config, $rpc, $tr, gettext, $modalInstance, $uci, $wifilife) {
	$scope.rule = {
		sta: undefined,
		type: undefined,
		bss: undefined,
		//duration: 0,
		options: [{ label: "steer", value: "steer" }, { label: "block", value: "block" }],
		error: undefined
	}

	$scope.ok = function () {
		if ($scope.rule.action == null) {
			$scope.rule.error = $tr(gettext("Please provide rule type."));
			return;
		} else if ($scope.rule.bss == null) {
			$scope.rule.error = $tr(gettext("Please select an access point."));
			return;
		} else if ($scope.rule.sta == null || !$wifilife.validMac($scope.rule.sta)) {
			$scope.rule.error = $tr(gettext("Please provide a valid client MAC address."));
			return;
		}

		$uci.wifilife.$create({
			".type": "rule_custom",
			"action": $scope.rule.action,
			"sta": $scope.rule.sta,
			"bss": $scope.rule.bss,
			//"duration": $scope.rule.duration
		}).done(function (section) {
			section.$statusList = [];
			section.$statusList.push({ label: $tr(gettext("Action")), value: $scope.rule.action })
			section.$statusList.push({ label: $tr(gettext("STA")), value: $scope.rule.sta })
			section.$statusList.push({ label: $tr(gettext("BSS")), value: $scope.rule.bss })
			//section.$statusList.push({ label: $tr(gettext("Duration")), value: $scope.rule.duration })
			$scope.$apply();
			$modalInstance.close(section);
		});
	}

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
